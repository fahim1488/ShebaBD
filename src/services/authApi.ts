import { api } from './api';
import type { 
  AuthUser, 
  RegisterPayload, 
  UpdateProfilePayload, 
  ChangePasswordPayload 
} from '@/context/AuthContext';

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await api.post<any>('/auth/login', payload);
    const token = data.token || data.data?.accessToken || data.data?.token || '';
    const user = data.user || data.data?.user || data;
    return { token, user };
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await api.post<any>('/auth/register', payload);
    const token = data.token || data.data?.accessToken || data.data?.token || '';
    const user = data.user || data.data?.user || data;
    return { token, user };
  },

  loginWithSocial: async (provider: 'google' | 'facebook'): Promise<AuthResponse> => {
    const { data } = await api.post<any>('/auth/social', { provider });
    const token = data.token || data.data?.accessToken || data.data?.token || '';
    const user = data.user || data.data?.user || data;
    return { token, user };
  },

  forgotPassword: async (email: string): Promise<{ ok: boolean; message: string }> => {
    const { data } = await api.post<{ ok: boolean; message: string }>('/auth/forgot-password', { email });
    return data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  me: async (): Promise<AuthUser> => {
    const { data } = await api.get<any>('/auth/me');
    return data.user || data.data?.user || data;
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<AuthUser> => {
    const { data } = await api.put<any>('/auth/profile', payload);
    return data.user || data.data?.user || data;
  },

  changePassword: async (payload: ChangePasswordPayload): Promise<{ ok: boolean; message: string }> => {
    const { data } = await api.put<{ ok: boolean; message: string }>('/auth/password', payload);
    return data;
  },
};
