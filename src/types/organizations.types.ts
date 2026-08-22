/**
 * organizations.types.ts - Type definitions for NGO directory and trust verification.
 */
export type VerificationLevel = 'unverified' | 'verified' | 'featured' | 'government_registered';

export interface NGOProfile {
  id: string;
  name: string;
  registrationNumber: string;
  category: string;
  trustScore: number;
  verificationLevel: VerificationLevel;
  websiteUrl?: string;
  district: string;
  activeProjectsCount: number;
}
