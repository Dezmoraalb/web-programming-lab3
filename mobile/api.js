export const API_BASE_URL = 'http://192.168.0.101:8001';

async function handle(response) {
  if (!response.ok) {
    let message = 'Помилка в опрацюванні запиту';
    try {
      const data = await response.json();
      if (data && data.detail) {
        message = typeof data.detail === 'string'
          ? data.detail
          : 'Некоректні дані';
      }
    } catch (_) {}
    throw new Error(message);
  }
  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  list: () =>
    fetch(`${API_BASE_URL}/books`).then(handle),

  get: (id) =>
    fetch(`${API_BASE_URL}/books/${id}`).then(handle),

  create: (book) =>
    fetch(`${API_BASE_URL}/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(book),
    }).then(handle),

  update: (id, book) =>
    fetch(`${API_BASE_URL}/books/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(book),
    }).then(handle),

  remove: (id) =>
    fetch(`${API_BASE_URL}/books/${id}`, { method: 'DELETE' }).then(handle),
};
