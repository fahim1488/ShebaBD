/**
 * auth.types.ts - TypeScript interface definitions for user authentication & session.
 */
export type UserRole = 'member' | 'volunteer' | 'ngo' | 'admin';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  createdAt: string;
}

export interface AuthState {
  user: UserSession | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
