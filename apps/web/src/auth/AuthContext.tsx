import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import * as authApi from '../api/auth';
import { getToken, setToken, setUnauthorizedHandler } from '../api/client';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  // True while we check a saved token on page load.
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(() => getToken() !== null);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  // If a token was saved from an earlier visit, find out who it belongs to.
  useEffect(() => {
    if (!getToken()) return;

    authApi
      .fetchCurrentUser()
      .then(({ user }) => setUser(user))
      .catch(() => setToken(null))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authApi.login(email, password);
    setToken(result.token);
    setUser(result.user);
    return result.user;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const result = await authApi.register(name, email, password);
    setToken(result.token);
    setUser(result.user);
    return result.user;
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return context;
}

// Where each role lands after logging in.
// eslint-disable-next-line react-refresh/only-export-components
export function homePathFor(user: User) {
  return user.role === 'ADMIN' ? '/admin' : '/doctors';
}
