import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { createServer } from 'node:http';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const loadEnvFile = () => {
  try {
    const lines = readFileSync(resolve(projectRoot, '.env'), 'utf8').split(/\r?\n/);
    for (const line of lines) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (!match || match[1].startsWith('#') || process.env[match[1]] !== undefined) continue;
      process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
};

loadEnvFile();

const adminPassword = process.env.BLOOM_ADMIN_PASSWORD;
if (!adminPassword) {
  console.error('Set BLOOM_ADMIN_PASSWORD in .env before starting the API server.');
  process.exit(1);
}
const adminEmail = (process.env.BLOOM_ADMIN_EMAIL || 'admin@bloom-joy.local').trim().toLowerCase();
const adminName = (process.env.BLOOM_ADMIN_NAME || 'Administrator').trim();

const readJson = (relativePath) =>
  JSON.parse(readFileSync(resolve(projectRoot, relativePath), 'utf8'));

const products = readJson('src/data/products.json');
const events = readJson('src/data/events.json');
const deliveryData = readJson('src/data/delivery.json');
const builderData = readJson('src/data/builderData.json');
const allowedOrigins = new Set(
  (process.env.BLOOM_CORS_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
);

const databasePath = resolve(
  projectRoot,
  process.env.BLOOM_DATABASE_PATH || 'data/bloom-joy.sqlite'
);
mkdirSync(dirname(databasePath), { recursive: true });

const database = new DatabaseSync(databasePath);
database.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    status TEXT NOT NULL,
    customer_json TEXT NOT NULL,
    delivery_json TEXT NOT NULL,
    items_json TEXT NOT NULL,
    event_json TEXT,
    totals_json TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_salt TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('customer', 'admin')),
    created_at TEXT NOT NULL
  );
`);

const passwordRecord = (password) => {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return { salt, hash };
};

const verifyPassword = (password, salt, expectedHash) => {
  const actual = Buffer.from(scryptSync(password, salt, 64).toString('hex'), 'hex');
  const expected = Buffer.from(expectedHash, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
};

const userByEmail = database.prepare('SELECT * FROM users WHERE email = ?');
const insertUser = database.prepare(
  `INSERT INTO users (id, name, email, password_salt, password_hash, role, created_at)
   VALUES (?, ?, ?, ?, ?, ?, ?)`
);
const configuredAdmin = userByEmail.get(adminEmail);
if (configuredAdmin) {
  database.prepare('UPDATE users SET role = ? WHERE id = ?').run('admin', configuredAdmin.id);
} else {
  const credentials = passwordRecord(adminPassword);
  insertUser.run(
    `USR-${randomBytes(8).toString('hex').toUpperCase()}`,
    adminName,
    adminEmail,
    credentials.salt,
    credentials.hash,
    'admin',
    new Date().toISOString()
  );
}

const sessions = new Map();
const loginAttempts = new Map();
const sessionLifetimeMs = 8 * 60 * 60 * 1000;
const maxRequestBytes = 1024 * 1024;
const orderStatuses = new Set([
  'new',
  'confirmed',
  'preparing',
  'out_for_delivery',
  'completed',
  'cancelled',
]);

const sendJson = (response, statusCode, body) => {
  response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
};

const applyCors = (request, response) => {
  response.setHeader('Vary', 'Origin');
  const origin = request.headers.origin;
  if (!origin) return true;
  if (!allowedOrigins.has(origin)) return false;

  response.setHeader('Access-Control-Allow-Origin', origin);
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.setHeader('Access-Control-Max-Age', '600');
  return true;
};

const readRequestJson = (request) =>
  new Promise((resolveBody, rejectBody) => {
    const chunks = [];
    let size = 0;
    let tooLarge = false;

    request.on('data', (chunk) => {
      size += chunk.length;
      if (size > maxRequestBytes) {
        tooLarge = true;
        return;
      }
      chunks.push(chunk);
    });

    request.on('end', () => {
      if (tooLarge) {
        rejectBody(Object.assign(new Error('Request body is too large.'), { statusCode: 413 }));
        return;
      }
      try {
        resolveBody(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        rejectBody(Object.assign(new Error('Invalid JSON request.'), { statusCode: 400 }));
      }
    });

    request.on('error', rejectBody);
  });

const asOrder = (row) => ({
  id: row.id,
  createdAt: row.created_at,
  status: row.status,
  customer: JSON.parse(row.customer_json),
  delivery: JSON.parse(row.delivery_json),
  items: JSON.parse(row.items_json),
  event: row.event_json ? JSON.parse(row.event_json) : null,
  totals: JSON.parse(row.totals_json),
});

const selectOrders = database.prepare('SELECT * FROM orders ORDER BY created_at DESC');
const selectOrder = database.prepare('SELECT * FROM orders WHERE id = ?');

const normalizeItem = (item) => {
  if (!item || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 50) {
    throw Object.assign(new Error('One of the products has an invalid quantity.'), { statusCode: 400 });
  }

  if (typeof item.id === 'string' && item.id.startsWith('custom-')) {
    const composition = item.bouquetConfig;
    const wrapper = builderData.wrappers.find((entry) => entry.id === composition?.wrapperId);
    const selectedFlowers = composition?.flowers;
    if (!wrapper || !selectedFlowers || typeof selectedFlowers !== 'object') {
      throw Object.assign(new Error('Please rebuild the custom bouquet before ordering.'), { statusCode: 400 });
    }

    let flowerCount = 0;
    let price = wrapper.price;
    const lines = [];
    for (const [flowerId, quantity] of Object.entries(selectedFlowers)) {
      const flower = builderData.flowers.find((entry) => entry.id === flowerId);
      if (!flower || !Number.isInteger(quantity) || quantity < 1) {
        throw Object.assign(new Error('The custom bouquet contains an invalid flower.'), { statusCode: 400 });
      }
      flowerCount += quantity;
      price += flower.price * quantity;
      lines.push(`${flower.name} × ${quantity}`);
    }

    if (flowerCount < 1 || flowerCount > builderData.maxFlowers) {
      throw Object.assign(new Error('The custom bouquet has an invalid number of flowers.'), { statusCode: 400 });
    }

    return {
      id: item.id,
      name: 'Bukiet skomponowany przez Ciebie',
      description: [wrapper.name, ...lines].join(', '),
      price,
      image: item.image || '',
      quantity: item.quantity,
      bouquetConfig: { wrapperId: wrapper.id, flowers: selectedFlowers },
    };
  }

  const product = products.find((entry) => entry.id === item?.id);
  if (!product) {
    throw Object.assign(new Error('One of the products is no longer available.'), { statusCode: 400 });
  }

  return { ...product, quantity: item.quantity };
};

const validateText = (value, label, maxLength = 240, required = true) => {
  if (typeof value !== 'string') {
    if (!required && (value === undefined || value === null)) return '';
    throw Object.assign(new Error(`${label} is required.`), { statusCode: 400 });
  }
  const clean = value.trim();
  if ((required && clean.length < 2) || clean.length > maxLength) {
    throw Object.assign(new Error(`${label} is invalid.`), { statusCode: 400 });
  }
  return clean;
};

const createOrder = (payload) => {
  const customer = {
    name: validateText(payload.customer?.name, 'Customer name', 100),
    phone: validateText(payload.customer?.phone, 'Phone number', 32),
    email: validateText(payload.customer?.email, 'Email', 160, false),
  };

  const zone = deliveryData.zones.find((entry) => entry.name === payload.delivery?.zoneName);
  if (!zone) {
    throw Object.assign(new Error('Choose a valid delivery area.'), { statusCode: 400 });
  }

  const date = validateText(payload.delivery?.date, 'Delivery date', 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw Object.assign(new Error('Delivery date is invalid.'), { statusCode: 400 });
  }
  const slot = validateText(payload.delivery?.slot, 'Delivery time', 32);
  if (!deliveryData.slots.includes(slot)) {
    throw Object.assign(new Error('Choose a valid delivery time.'), { statusCode: 400 });
  }

  if (!Array.isArray(payload.items) || payload.items.length === 0 || payload.items.length > 30) {
    throw Object.assign(new Error('Add at least one product to the order.'), { statusCode: 400 });
  }
  const items = payload.items.map(normalizeItem);
  const event = payload.event
    ? events.find((entry) => entry.id === payload.event.id)
    : null;
  if (payload.event && !event) {
    throw Object.assign(new Error('The selected gift is no longer available.'), { statusCode: 400 });
  }

  const subtotal =
    items.reduce((sum, item) => sum + item.price * item.quantity, 0) + (event?.price || 0);
  const isFreeDelivery = subtotal >= deliveryData.freeDeliveryFrom;
  const deliveryPrice = isFreeDelivery ? 0 : zone.price;
  const totals = {
    itemsTotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    eventTotal: event?.price || 0,
    subtotal,
    deliveryPrice,
    isFreeDelivery,
    total: subtotal + deliveryPrice,
  };

  const delivery = {
    recipientName: validateText(payload.delivery?.recipientName, 'Recipient name', 100),
    address: validateText(payload.delivery?.address, 'Delivery address', 240),
    zoneName: zone.name,
    date,
    slot,
    cardText: validateText(payload.delivery?.cardText, 'Card message', 200, false),
  };

  const order = {
    id: `BJ-${new Date().getFullYear()}-${randomBytes(3).toString('hex').toUpperCase()}`,
    createdAt: new Date().toISOString(),
    status: 'new',
    customer,
    delivery,
    items,
    event,
    totals,
  };

  database
    .prepare(
      `INSERT INTO orders
        (id, created_at, status, customer_json, delivery_json, items_json, event_json, totals_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      order.id,
      order.createdAt,
      order.status,
      JSON.stringify(order.customer),
      JSON.stringify(order.delivery),
      JSON.stringify(order.items),
      order.event ? JSON.stringify(order.event) : null,
      JSON.stringify(order.totals)
    );

  return order;
};

const userFromRow = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
  createdAt: row.created_at,
});

const sessionFromRequest = (request) => {
  const match = request.headers.authorization?.match(/^Bearer (.+)$/i);
  if (!match) return null;
  const session = sessions.get(match[1]);
  if (!session || session.expiresAt <= Date.now()) {
    sessions.delete(match[1]);
    return null;
  }
  const user = database.prepare('SELECT * FROM users WHERE id = ?').get(session.userId);
  if (!user) {
    sessions.delete(match[1]);
    return null;
  }
  return { token: match[1], user: userFromRow(user) };
};

const createSession = (row) => {
  const token = randomBytes(32).toString('base64url');
  sessions.set(token, { userId: row.id, expiresAt: Date.now() + sessionLifetimeMs });
  return { token, expiresIn: sessionLifetimeMs, user: userFromRow(row) };
};

const normalizeEmail = (value) => {
  const email = validateText(value, 'Email', 160).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw Object.assign(new Error('Enter a valid email address.'), { statusCode: 400 });
  }
  return email;
};

const validatePassword = (value) => {
  if (typeof value !== 'string' || value.length < 8 || value.length > 128) {
    throw Object.assign(new Error('Password must be between 8 and 128 characters.'), { statusCode: 400 });
  }
  return value;
};

const loginAttempt = (request) => {
  const key = request.socket.remoteAddress || 'unknown';
  const state = loginAttempts.get(key) || { count: 0, blockedUntil: 0 };
  return { key, state };
};

const recordLoginFailure = (key, state) => {
  state.count += 1;
  if (state.count >= 5) {
    state.count = 0;
    state.blockedUntil = Date.now() + 15 * 60 * 1000;
  }
  loginAttempts.set(key, state);
};

const server = createServer(async (request, response) => {
  if (!applyCors(request, response)) {
    sendJson(response, 403, { error: 'This website is not allowed to access the API.' });
    return;
  }

  if (request.method === 'OPTIONS') {
    response.writeHead(204);
    response.end();
    return;
  }

  const url = new URL(request.url, 'http://localhost');
  const path = url.pathname;

  try {
    if (request.method === 'GET' && path === '/api/health') {
      sendJson(response, 200, { ok: true });
      return;
    }

    if (request.method === 'POST' && path === '/api/auth/register') {
      const payload = await readRequestJson(request);
      const name = validateText(payload.name, 'Name', 100);
      const email = normalizeEmail(payload.email);
      const password = validatePassword(payload.password);
      if (userByEmail.get(email)) {
        sendJson(response, 409, { error: 'An account with this email already exists.' });
        return;
      }

      const credentials = passwordRecord(password);
      insertUser.run(
        `USR-${randomBytes(8).toString('hex').toUpperCase()}`,
        name,
        email,
        credentials.salt,
        credentials.hash,
        'customer',
        new Date().toISOString()
      );
      sendJson(response, 201, createSession(userByEmail.get(email)));
      return;
    }

    if (request.method === 'POST' && path === '/api/auth/login') {
      const { key, state } = loginAttempt(request);
      if (state.blockedUntil > Date.now()) {
        sendJson(response, 429, { error: 'Too many attempts. Try again in 15 minutes.' });
        return;
      }

      const payload = await readRequestJson(request);
      const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
      const row = email ? userByEmail.get(email) : null;
      const password =
        typeof payload.password === 'string' && payload.password.length <= 128
          ? payload.password
          : '';
      const fallback = passwordRecord(adminPassword);
      const passwordIsValid = verifyPassword(
        password,
        row?.password_salt || fallback.salt,
        row?.password_hash || fallback.hash
      );
      if (!row || password.length < 8 || !passwordIsValid) {
        recordLoginFailure(key, state);
        sendJson(response, 401, { error: 'Email lub hasło są nieprawidłowe.' });
        return;
      }

      loginAttempts.delete(key);
      sendJson(response, 200, createSession(row));
      return;
    }

    if (request.method === 'GET' && path === '/api/auth/me') {
      const session = sessionFromRequest(request);
      if (!session) {
        sendJson(response, 401, { error: 'Please sign in again.' });
        return;
      }
      sendJson(response, 200, { user: session.user });
      return;
    }

    if (request.method === 'POST' && path === '/api/auth/logout') {
      const session = sessionFromRequest(request);
      if (session) sessions.delete(session.token);
      sendJson(response, 200, { ok: true });
      return;
    }

    if (request.method === 'POST' && path === '/api/orders') {
      const order = createOrder(await readRequestJson(request));
      sendJson(response, 201, { order });
      return;
    }

    if (path.startsWith('/api/admin/')) {
      const session = sessionFromRequest(request);
      if (!session) {
        sendJson(response, 401, { error: 'Sign in to access the administration panel.' });
        return;
      }
      if (session.user.role !== 'admin') {
        sendJson(response, 403, { error: 'Administrator access is required.' });
        return;
      }

      if (request.method === 'GET' && path === '/api/admin/orders') {
        sendJson(response, 200, { orders: selectOrders.all().map(asOrder) });
        return;
      }

      const statusRoute = path.match(/^\/api\/admin\/orders\/([^/]+)\/status$/);
      if (request.method === 'PATCH' && statusRoute) {
        const orderId = decodeURIComponent(statusRoute[1]);
        const { status } = await readRequestJson(request);
        if (!orderStatuses.has(status)) {
          sendJson(response, 400, { error: 'Choose a valid order status.' });
          return;
        }
        database.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, orderId);
        const row = selectOrder.get(orderId);
        if (!row) {
          sendJson(response, 404, { error: 'Order not found.' });
          return;
        }
        sendJson(response, 200, { order: asOrder(row) });
        return;
      }
    }

    sendJson(response, 404, { error: 'Route not found.' });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    if (statusCode >= 500) console.error(error);
    sendJson(response, statusCode, {
      error: statusCode >= 500 ? 'The server could not process the request.' : error.message,
    });
  }
});

const port = Number(process.env.PORT || 3001);
server.listen(port, '0.0.0.0', () => {
  console.log(`Bloom & Joy API is running on http://localhost:${port}`);
  console.log(`SQLite database: ${databasePath}`);
});
