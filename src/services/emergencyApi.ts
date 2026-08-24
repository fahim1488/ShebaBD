import { api } from './api';

export interface EmergencyRequest {
  id: number;
  name: string;
  phone: string;
  location: string;
  emergency_type: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
}

export const submitEmergency = async (data: {
  name: string;
  phone: string;
  location: string;
  emergency_type: string;
  description: string;
}): Promise<EmergencyRequest> => {
  const res = await api.post('/emergency', data);
  return res.data;
};

export const getActiveEmergencies = async (limit = 20): Promise<EmergencyRequest[]> => {
  const res = await api.get('/emergency', { params: { limit } });
  return res.data;
};
