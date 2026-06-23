import Cookies from 'js-cookie';

const API_BASE_URL = '/api/v1';

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof data.message === 'string'
        ? data.message
        : Array.isArray(data.message)
        ? data.message.join(', ')
        : response.statusText;
    throw new Error(message || 'Request failed');
  }

  return data as T;
}

export async function registerUser(payload: {
  name: string;
  email: string;
  password: string;
}) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return handleResponse<{ message: string; user: { _id: string; name: string; email: string } }>(response);
}

export async function loginUser(payload: {
  email: string;
  password: string;
}) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return handleResponse<{ accessToken: string; user: { _id: string; name: string; email: string } }>(response);
}

export async function getWhoAmI() {
  const token = Cookies.get('token');
  if (!token) throw new Error('No token found');

  const response = await fetch(`${API_BASE_URL}/auth/whoami`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse<{ _id: string; name: string; email: string; profileImage?: string }>(response);
}

export async function updateProfile(formData: FormData) {
  const token = Cookies.get('token');
  if (!token) throw new Error('No token found');

  const response = await fetch(`${API_BASE_URL}/auth/update`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return handleResponse<{ message: string; user: { _id: string; name: string; email: string; profileImage?: string } }>(response);
}
