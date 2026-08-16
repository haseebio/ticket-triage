import { getToken, clearToken } from './auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const REQUEST_TIMEOUT_MS = 15000;

async function request(path, options = {}) {
  const token = getToken();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Request timed out — the server took too long to respond.');
    }
    throw new Error('Network error — could not reach the server.');
  } finally {
    clearTimeout(timeout);
  }

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
  retryTriage: (id) => request(`/api/tickets/${id}/retry-triage`, { method: 'POST' }),
  getCategories: () => request('/api/categories'),
  getLlmBudget: () => request('/api/status/llm-budget'),
  getUsers: () => request('/api/users'),
  getRoutingRules: () => request('/api/routing-rules'),
  createRoutingRule: (payload) =>
    request('/api/routing-rules', { method: 'POST', body: JSON.stringify(payload) }),
  updateRoutingRule: (id, payload) =>
    request(`/api/routing-rules/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteRoutingRule: (id) => request(`/api/routing-rules/${id}`, { method: 'DELETE' }),
  getAnalyticsSummary: () => request('/api/analytics/summary'),
};