import type { User } from '../types';
import { apiRequest } from './client';

interface AuthResponse {
  token: string;
  user: User;
}

export function login(email: string, password: string) {
  return apiRequest<AuthResponse>('/auth/login', { method: 'POST', body: { email, password } });
}

export function register(name: string, email: string, password: string) {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: { name, email, password },
  });
}

export function fetchCurrentUser() {
  return apiRequest<{ user: User }>('/auth/me');
}
