/**
 * blood.types.ts - Type definitions for blood donation requests and donor searches.
 */
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface BloodDonorProfile {
  id: string;
  name: string;
  bloodGroup: BloodGroup;
  district: string;
  phone: string;
  isAvailable: boolean;
  lastDonationDate?: string;
}

export interface BloodRequestFilter {
  bloodGroup?: BloodGroup;
  district?: string;
  urgency?: 'normal' | 'urgent' | 'critical';
}
