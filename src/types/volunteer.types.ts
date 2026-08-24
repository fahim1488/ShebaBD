/**
 * volunteer.types.ts - Type definitions for volunteer opportunities and applications.
 */
export interface VolunteerOpportunity {
  id: string;
  title: string;
  organization: string;
  location: string;
  skillsRequired: string[];
  spotsAvailable: number;
  startDate: string;
}

export interface VolunteerApplication {
  opportunityId: string;
  volunteerId: string;
  status: 'pending' | 'accepted' | 'completed';
  appliedAt: string;
}
