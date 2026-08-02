import { getToken, clearToken } from './auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function request(path, options = {}) {
  const token = getToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (res.status === 401 && typeof window !== 'undefined') {
    clearToken();
    window.location.href = '/login';
    return null;
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error || `Request failed: ${res.status}`);
  }
  return data;
}

export const api = {
  login: (email, password) =>
    request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  getTickets: (params = {}) =>
    request(`/api/tickets?${new URLSearchParams(params)}`),
  getTicket: (id) => request(`/api/tickets/${id}`),
  createTicket: (payload) =>
    request('/api/tickets', { method: 'POST', body: JSON.stringify(payload) }),
  updateTicket: (id, payload) =>
    request(`/api/tickets/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  getCategories: () => request('/api/categories'),
  getLlmBudget: () => request('/api/status/llm-budget'),
};
