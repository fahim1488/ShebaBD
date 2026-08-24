/**
 * emergency.types.ts - Type definitions for emergency dispatch and hotline directory.
 */
export type EmergencyCategory = 'ambulance' | 'fire_service' | 'police' | 'disaster_relief' | 'hospital';

export interface EmergencyContact {
  id: string;
  title: string;
  number: string;
  district: string;
  category: EmergencyCategory;
  is24x7: boolean;
}
