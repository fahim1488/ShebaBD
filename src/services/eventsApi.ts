import { api } from './api';

export interface Event {
  id: number;
  title: string;
  category: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  capacity: number;
  registered_count: number;
  tags: string | null;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
}

export interface EventRegistration {
  id: number;
  event_id: number;
  name: string;
  email: string;
  phone?: string;
  created_at: string;
}

export const getEvents = async (params?: {
  category?: string;
  search?: string;
  skip?: number;
  limit?: number;
}): Promise<Event[]> => {
  const res = await api.get('/events', { params });
  return res.data;
};

export const registerForEvent = async (
  eventId: number,
  data: { name: string; email: string; phone?: string },
): Promise<EventRegistration> => {
  const res = await api.post(`/events/${eventId}/register`, data);
  return res.data;
};
// Murad: Event registration API handler
