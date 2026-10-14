// Shared API utility - reads JWT token from localStorage and sets Authorization header

const configuredBaseUrl = (import.meta.env.VITE_API_BASE_URL || '/api').trim().replace(/\/+$/, '');
const BASE_URL = configuredBaseUrl === '/api' || configuredBaseUrl.endsWith('/api')
  ? configuredBaseUrl
  : `${configuredBaseUrl || ''}/api`;

class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

function getErrorMessage(body, fallback) {
  if (!body) return fallback;
  if (typeof body === 'string') return body;
  if (body.detail || body.error) return body.detail || body.error;

  const messages = Object.entries(body).flatMap(([field, value]) => {
    const values = Array.isArray(value) ? value : [value];
    return values.map((message) => `${field}: ${message}`);
  });
  return messages.join(', ') || fallback;
}

function getHeaders() {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function apiFetch(path, options = {}) {
  const hadToken = Boolean(localStorage.getItem('access_token'));
  const isFormData = options.body instanceof FormData;
  const headers = { ...getHeaders(), ...(options.headers || {}) };
  if (isFormData) delete headers['Content-Type'];

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401 && hadToken) {
    localStorage.clear();
    window.location.href = '/login';
    throw new ApiError('Unauthorized', 401, null);
  }

  if (!res.ok) {
    let body;
    try {
      body = await res.json();
    } catch {
      body = await res.text().catch(() => null);
    }
    const message = getErrorMessage(body, res.statusText || 'Request failed');
    throw new ApiError(message, res.status, body);
  }

  if (res.status === 204) return null;
  const contentType = res.headers.get('content-type') || '';
  return contentType.includes('application/json') ? res.json() : res.blob();
}

export const api = {
  get: (path) => apiFetch(path),
  post: (path, body) => apiFetch(path, {
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body),
  }),
  put: (path, body) => apiFetch(path, {
    method: 'PUT',
    body: body instanceof FormData ? body : JSON.stringify(body),
  }),
  patch: (path, body) => apiFetch(path, {
    method: 'PATCH',
    body: body instanceof FormData ? body : JSON.stringify(body),
  }),
  delete: (path) => apiFetch(path, { method: 'DELETE' }),
};
