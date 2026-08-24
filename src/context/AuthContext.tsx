import { createContext } from 'react';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'volunteer' | 'ngo' | 'admin';
};

export type UpdateProfilePayload = {
  name: string;
  avatar?: string;
};

export type ChangePasswordPayload = {
  current_password: string;
  new_password: string;
};

export type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithSocial: (provider: 'google' | 'facebook') => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  updateProfile: (data: UpdateProfilePayload) => Promise<void>;
  changePassword: (data: ChangePasswordPayload) => Promise<{ ok: boolean; message: string }>;
  refreshUser: () => Promise<void>;
  logout: () => void;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  role?: 'user' | 'volunteer' | 'ngo';
};

export const AuthContext = createContext<AuthContextValue | null>(null);
