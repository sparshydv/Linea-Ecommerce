import { setToken, setStoredUser, removeToken, removeStoredUser } from './auth';
import type { AuthResponse, User } from '@/types/cart';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export async function register(email: string, password: string, name: string): Promise<{ user: User; token: string }> {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, name }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Registration failed');
  }

  const data: AuthResponse = await response.json();
  setToken(data.data.token);
  setStoredUser(data.data.user);
  return data.data;
}

export async function login(email: string, password: string): Promise<{ user: User; token: string }> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  const data: AuthResponse = await response.json();
  setToken(data.data.token);
  setStoredUser(data.data.user);
  return data.data;
}

export async function googleLogin(code: string): Promise<{ user: User; token: string }> {
  const response = await fetch(`${API_BASE}/auth/google`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Google sign-in failed');
  }

  const data: AuthResponse = await response.json();
  setToken(data.data.token);
  setStoredUser(data.data.user);
  return data.data;
}

export function logout(): void {
  removeToken();
  removeStoredUser();
}
