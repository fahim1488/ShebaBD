import { api } from './api';

export interface Event {
  id: number;
  title: string;
  category: string;
  description: string;
  date: string;
  time: string;
  datetime_start?: string | null;
  registration_deadline?: string | null;
  location: string;
  organizer: string;
  capacity: number;
  registered_count: number;
  tags: string | null;
  is_featured: boolean;
  is_active: boolean;
  is_cancelled?: boolean;
  reminder_minutes_before?: number;
  email_confirmation_enabled?: boolean;
  reminder_enabled?: boolean;
  created_at: string;
  is_registered?: boolean;
  user_registration_id?: number | string | null;
}

export interface EventRegistration {
  id: number | string;
  event_id: number;
  user_id?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  status: string;
  confirmation_sent: boolean;
  confirmation_sent_at?: string | null;
  reminder_sent: boolean;
  reminder_sent_at?: string | null;
  created_at: string;
  event_title?: string;
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

export const getEvent = async (eventId: number): Promise<Event> => {
  const res = await api.get(`/events/${eventId}`);
  return res.data;
};

export const registerForEvent = async (
  eventId: number,
  data?: { name?: string; email?: string; phone?: string },
): Promise<EventRegistration> => {
  const res = await api.post(`/events/${eventId}/register`, data || {});
  return res.data;
};

export const cancelEventRegistration = async (eventId: number): Promise<{ message: string; event_id: number }> => {
  const res = await api.delete(`/events/${eventId}/register`);
  return res.data;
};

export const getMyRegistrations = async (): Promise<EventRegistration[]> => {
  const res = await api.get('/events/my-registrations');
  return res.data;
};
