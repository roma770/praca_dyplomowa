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

export const submitOrder = async (order) => {
  const { order: savedOrder } = await request('/orders', {
    method: 'POST',
    body: JSON.stringify(order),
  });
  return savedOrder;
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

export const updateOrderStatus = async (token, orderId, status) => {
  const { order } = await request(`/admin/orders/${encodeURIComponent(orderId)}/status`, {
    method: 'PATCH',
    token,
    body: JSON.stringify({ status }),
  });
  return order;
};
