import { api } from './api';

export interface Organization {
  id: number;
  name: string;
  initial: string;
  category: string;
  district: string;
  description: string;
  phone: string | null;
  website: string | null;
  rating: number;
  review_count: number;
  volunteer_count: number;
  color_hex: string;
  is_verified: boolean;
  created_at: string;
}

export const getOrganizations = async (params?: {
  category?: string;
  district?: string;
  search?: string;
  skip?: number;
  limit?: number;
}): Promise<Organization[]> => {
  const res = await api.get('/organizations', { params });
  return res.data;
};

export const getOrgCount = async (): Promise<number> => {
  const res = await api.get('/organizations/count');
  return res.data.count;
};
// Murad: Search query API handler
