import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { 
  AuthContext, 
  type AuthUser, 
  type RegisterPayload,
  type UpdateProfilePayload,
  type ChangePasswordPayload 
} from './AuthContext';
import { authApi } from '@/services/authApi';
import { api } from '@/services/api';

const TOKEN_KEY = 'shebabd_token';
const USER_KEY  = 'shebabd_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,      setUser]      = useState<AuthUser | null>(null);
  const [token,     setToken]     = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Rehydrate from localStorage on mount ─────────────────────────────────
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      const savedUser  = localStorage.getItem(USER_KEY);
      if (savedToken && savedUser) {
        const parsed = JSON.parse(savedUser) as AuthUser;
        setToken(savedToken);
        setUser(parsed);
        api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      }
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Persist helpers ───────────────────────────────────────────────────────
  const persist = useCallback((t: string, u: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, t);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    api.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    setToken(t);
    setUser(u);
  }, []);

  const clear = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    const { token: t, user: u } = await authApi.login({ email, password });
    persist(t, u);
  }, [persist]);

  // ── Social Login ──────────────────────────────────────────────────────────
  const loginWithSocial = useCallback(async (provider: 'google' | 'facebook') => {
    const { token: t, user: u } = await authApi.loginWithSocial(provider);
    persist(t, u);
  }, [persist]);

  // ── Register ──────────────────────────────────────────────────────────────
  const register = useCallback(async (data: RegisterPayload) => {
    const { token: t, user: u } = await authApi.register(data);
    persist(t, u);
  }, [persist]);

  // ── Update Profile ────────────────────────────────────────────────────────
  const updateProfile = useCallback(async (data: UpdateProfilePayload) => {
    const updatedUser = await authApi.updateProfile(data);
    setUser(updatedUser);
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  }, []);

  // ── Change Password ───────────────────────────────────────────────────────
  const changePassword = useCallback(async (data: ChangePasswordPayload) => {
    return await authApi.changePassword(data);
  }, []);

  // ── Refresh User ──────────────────────────────────────────────────────────
  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const updatedUser = await authApi.me();
      setUser(updatedUser);
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    } catch (error) {
      // If token is invalid, clear auth state
      clear();
    }
  }, [token, clear]);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    clear();
    authApi.logout().catch(() => {}); // fire-and-forget
  }, [clear]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        loginWithSocial,
        register,
        updateProfile,
        changePassword,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
