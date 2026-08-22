/**
 * donations.types.ts - Type definitions for donation campaigns and financial gifts.
 */
export interface CampaignGoal {
  id: string;
  title: string;
  targetAmount: number;
  raisedAmount: number;
  donorCount: number;
  deadline?: string;
  isUrgent: boolean;
}

export interface DonationReceiptData {
  receiptId: string;
  donorName: string;
  donorEmail: string;
  campaignTitle: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  issuedAt: string;
}
