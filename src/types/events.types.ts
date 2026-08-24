/**
 * events.types.ts - Type definitions for event passes and registration states.
 */
export interface EventPass {
  passCode: string;
  eventId: number;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  attendeeName: string;
  attendeeEmail: string;
  isConfirmed: boolean;
}

export type EventCategory = 'all' | 'blood' | 'medical' | 'education' | 'environment' | 'fundraising' | 'awareness';
