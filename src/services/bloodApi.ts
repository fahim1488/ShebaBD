import { api } from './api';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface BloodDonor {
  id: number;
  name: string;
  phone: string;
  blood_group: string;
  district: string;
  area: string | null;
  is_available: boolean;
  is_verified: boolean;
  total_donations: number;
  last_donated_at: string | null;
  age: number | null;
  weight_kg: number | null;
  created_at: string;
}

export interface BloodRequest {
  id: number;
  patient_name: string;
  contact_name: string;
  contact_phone: string;
  blood_group: string;
  units_needed: number;
  hospital_name: string;
  hospital_district: string;
  hospital_address: string | null;
  urgency: 'normal' | 'urgent' | 'critical';
  notes: string | null;
  is_fulfilled: boolean;
  created_at: string;
}

export interface BloodStats {
  total_donors: number;
  available_donors: number;
  total_requests: number;
  active_requests: number;
  donors_by_group: Record<string, number>;
}

export interface DonorSearchParams {
  blood_group?: string;
  district?: string;
  available_only?: boolean;
  limit?: number;
  skip?: number;
}

export interface DonorRegistrationData {
  name: string;
  phone: string;
  blood_group: string;
  district: string;
  area?: string;
  age?: number;
  weight_kg?: number;
}

export interface BloodRequestData {
  patient_name: string;
  contact_name: string;
  contact_phone: string;
  blood_group: string;
  units_needed: number;
  hospital_name: string;
  hospital_district: string;
  hospital_address?: string;
  urgency: string;
  notes?: string;
}

// ── API functions ─────────────────────────────────────────────────────────────

export const getBloodStats = async (): Promise<BloodStats> => {
  const res = await api.get('/blood/stats');
  return res.data;
};

export const searchDonors = async (params: DonorSearchParams = {}): Promise<BloodDonor[]> => {
  const res = await api.get('/blood/donors', { params });
  return res.data;
};

export const registerDonor = async (data: DonorRegistrationData): Promise<BloodDonor> => {
  const res = await api.post('/blood/donors', data);
  return res.data;
};

export const getMyDonorProfile = async (): Promise<BloodDonor> => {
  const res = await api.get('/blood/donors/me');
  return res.data;
};

export const updateMyAvailability = async (is_available: boolean): Promise<BloodDonor> => {
  const res = await api.put('/blood/donors/me', { is_available });
  return res.data;
};

export const getBloodRequests = async (limit = 50, skip = 0): Promise<BloodRequest[]> => {
  const res = await api.get('/blood/requests', { params: { limit, skip } });
  return res.data;
};

export const createBloodRequest = async (data: BloodRequestData): Promise<BloodRequest> => {
  const res = await api.post('/blood/requests', data);
  return res.data;
};

export const fulfillBloodRequest = async (requestId: number): Promise<BloodRequest> => {
  const res = await api.put(`/blood/requests/${requestId}/fulfill`);
  return res.data;
};

// ── Constants ─────────────────────────────────────────────────────────────────
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

export const BANGLADESH_DISTRICTS = [
  'Barisal', 'Barguna', 'Bhola', 'Jhalokati', 'Patuakhali', 'Pirojpur',
  'Bandarban', 'Brahmanbaria', 'Chandpur', 'Chittagong', 'Comilla',
  "Cox's Bazar", 'Feni', 'Khagrachhari', 'Lakshmipur', 'Noakhali', 'Rangamati',
  'Dhaka', 'Faridpur', 'Gazipur', 'Gopalganj', 'Kishoreganj', 'Madaripur',
  'Manikganj', 'Munshiganj', 'Narayanganj', 'Narsingdi', 'Rajbari', 'Shariatpur', 'Tangail',
  'Bagerhat', 'Chuadanga', 'Jessore', 'Jhenaidah', 'Khulna', 'Kushtia',
  'Magura', 'Meherpur', 'Narail', 'Satkhira',
  'Jamalpur', 'Mymensingh', 'Netrakona', 'Sherpur',
  'Bogra', 'Joypurhat', 'Naogaon', 'Natore', 'Nawabganj', 'Pabna', 'Rajshahi', 'Sirajganj',
  'Dinajpur', 'Gaibandha', 'Kurigram', 'Lalmonirhat', 'Nilphamari', 'Panchagarh', 'Rangpur', 'Thakurgaon',
  'Habiganj', 'Moulvibazar', 'Sunamganj', 'Sylhet',
] as const;

export const bloodApi = {
  getStats: getBloodStats,
  searchDonors,
  getDonors: searchDonors,
  registerDonor,
  getMyProfile: getMyDonorProfile,
  updateMyAvailability,
  getBloodRequests,
  getRequests: getBloodRequests,
  createBloodRequest,
  fulfillBloodRequest,
};

export default bloodApi;
