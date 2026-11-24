const configuredApiUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, '');
const apiBase = configuredApiUrl ? `${configuredApiUrl}/api` : '/api';

export const isOrderApiEnabled = import.meta.env.DEV || Boolean(configuredApiUrl);

const request = async (path, { token, ...options } = {}) => {
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'Nie udało się połączyć z serwerem.');
  return body;
};

export const submitOrder = async (order, token) => {
  const { order: savedOrder } = await request('/orders', {
    method: 'POST',
    token,
    body: JSON.stringify(order),
  });
  return savedOrder;
};

export const fetchProducts = async () => {
  const { products } = await request('/products');
  return products;
};

export const registerAccount = (profile) =>
  request('/auth/register', { method: 'POST', body: JSON.stringify(profile) });

export const loginAccount = (email, password) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });

export const fetchCurrentUser = async (token) => {
  const { user } = await request('/auth/me', { token });
  return user;
};

export const logoutAccount = (token) => request('/auth/logout', { method: 'POST', token });

export const fetchAdminOrders = async (token) => {
  const { orders } = await request('/admin/orders', { token });
  return orders;
};

export const fetchMyOrders = async (token) => {
  const { orders } = await request('/account/orders', { token });
  return orders;
};

export const fetchAdminProducts = async (token) => {
  const { products } = await request('/admin/products', { token });
  return products;
};

export const createProduct = async (token, product) => {
  const { product: savedProduct } = await request('/admin/products', {
    method: 'POST',
    token,
    body: JSON.stringify(product),
  });
  return savedProduct;
};

export const updateProduct = async (token, productId, product) => {
  const { product: savedProduct } = await request(`/admin/products/${encodeURIComponent(productId)}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(product),
  });
  return savedProduct;
};

export const updateOrderStatus = async (token, orderId, status) => {
  const { order } = await request(`/admin/orders/${encodeURIComponent(orderId)}/status`, {
    method: 'PATCH',
    token,
    body: JSON.stringify({ status }),
  });
  return order;
};

const reviewStorageKey = (productId) => `bloom-joy-reviews-${productId}`;

export const fetchProductReviews = async (productId) => {
  if (isOrderApiEnabled) {
    const { reviews } = await request(`/products/${encodeURIComponent(productId)}/reviews`);
    return reviews;
  }
  try {
    return JSON.parse(localStorage.getItem(reviewStorageKey(productId)) || '[]');
  } catch {
    return [];
  }
};

export const submitProductReview = async (productId, review) => {
  if (isOrderApiEnabled) {
    const { review: savedReview } = await request(`/products/${encodeURIComponent(productId)}/reviews`, {
      method: 'POST',
      body: JSON.stringify(review),
    });
    return savedReview;
  }
  const savedReview = { ...review, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  const existing = await fetchProductReviews(productId);
  localStorage.setItem(reviewStorageKey(productId), JSON.stringify([savedReview, ...existing]));
  return savedReview;
};

export const submitContactMessage = async (message) => {
  const { message: savedMessage } = await request('/contact', {
    method: 'POST',
    body: JSON.stringify(message),
  });
  return savedMessage;
};

export const fetchAdminMessages = async (token) => {
  const { messages } = await request('/admin/messages', { token });
  return messages;
};

export const markAdminMessageRead = (token, messageId) =>
  request(`/admin/messages/${encodeURIComponent(messageId)}/read`, {
    method: 'PATCH',
    token,
    body: JSON.stringify({ isRead: true }),
  });
