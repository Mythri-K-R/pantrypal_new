import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/services/api';
import { useNavigate } from 'react-router-dom';

interface User {
  name: string;
  role: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (data: { name: string; phone: string; password: string; role: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('pantrypal_token');
    const role = localStorage.getItem('pantrypal_role');
    const name = localStorage.getItem('pantrypal_name');
    if (token && role && name) {
      setUser({ token, role, name });
    }
    setLoading(false);
  }, []);

  const login = async (phone: string, password: string) => {
    const res = await authApi.login(phone, password);
    localStorage.setItem('pantrypal_token', res.token);
    localStorage.setItem('pantrypal_name', res.name);
    const role = res.role.toLowerCase();
    localStorage.setItem('pantrypal_role', role);
    setUser({ token: res.token, role, name: res.name });
  };

  const register = async (data: { name: string; phone: string; password: string; role: string }) => {
    await authApi.register(data);
  };

  const logout = () => {
    localStorage.removeItem('pantrypal_token');
    localStorage.removeItem('pantrypal_role');
    localStorage.removeItem('pantrypal_name');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
