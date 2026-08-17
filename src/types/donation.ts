/**
 * TypeScript types for donation system
 */

// ── Enums ─────────────────────────────────────────────────────────────────────
export enum DonationStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
}

export enum PaymentProvider {
  BKASH = "bkash",
  NAGAD = "nagad",
  BANK = "bank",
}

export enum TransactionStatus {
  INITIATED = "initiated",
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

export enum DonationCause {
  EDUCATION = "education",
  HEALTHCARE = "healthcare",
  DISASTER = "disaster",
  ENVIRONMENT = "environment",
  POVERTY = "poverty",
}

// ── API Request/Response Types ────────────────────────────────────────────────
export interface DonationCreateRequest {
  amount: number;
  cause: DonationCause;
  donor_name: string;
  donor_email: string;
  donor_phone?: string;
  message?: string;
  payment_provider: PaymentProvider;
  is_anonymous?: boolean;
}

export interface DonationUpdateRequest {
  status?: DonationStatus;
  error_message?: string;
}

export interface PaymentInitiateRequest {
  return_url?: string;
  cancel_url?: string;
}

// ── API Response Types ────────────────────────────────────────────────────────
export interface Donation {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  cause: DonationCause;
  donor_name: string;
  donor_email: string;
  donor_phone?: string;
  message?: string;
  payment_provider: PaymentProvider;
  status: DonationStatus;
  receipt_number?: string;
  is_anonymous: boolean;
  extra_data?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethod {
  id: number;
  provider: PaymentProvider;
  name: string;
  display_name: string;
  description?: string;
  is_active: boolean;
  min_amount: number;
  max_amount: number;
  config?: Record<string, any>;
}

export interface Transaction {
  id: string;
  donation_id: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  provider_transaction_id?: string;
  provider_reference?: string;
  status: TransactionStatus;
  provider_response?: Record<string, any>;
  error_message?: string;
  initiated_at: string;
  completed_at?: string;
  created_at: string;
}

export interface PaymentInitiateResponse {
  donation_id: string;
  transaction_id: string;
  provider: PaymentProvider;
  provider_transaction_id: string;
  payment_url?: string;
  provider_response: Record<string, any>;
  amount: number;
  currency: string;
  expires_at: number; // Unix timestamp
}

// ── Component Props Types ─────────────────────────────────────────────────────
export interface DonationFormData {
  amount: string;
  cause: DonationCause | "";
  donor_name: string;
  donor_email: string;
  donor_phone: string;
  message: string;
  payment_provider: PaymentProvider | "";
  is_anonymous: boolean;
}

export interface PaymentMethodCardProps {
  method: PaymentMethod;
  selected: boolean;
  onSelect: (provider: PaymentProvider) => void;
  disabled?: boolean;
}

export interface DonationConfirmationProps {
  donation: Donation;
  transaction?: Transaction;
  onNewDonation: () => void;
}

// ── Analytics Types ───────────────────────────────────────────────────────────
export interface DonationStats {
  total_donations: number;
  total_amount: number;
  total_by_cause: Record<string, number>;
  total_by_provider: Record<string, number>;
  recent_donations: Donation[];
}

export interface CauseStats {
  cause: DonationCause;
  total_amount: number;
  total_donations: number;
  goal_amount?: number;
  progress_percentage?: number;
}

// ── UI Helper Types ───────────────────────────────────────────────────────────
export interface CauseConfig {
  id: DonationCause;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  raised: number;
  goal: number;
  description: string;
}

export interface PaymentProviderConfig {
  provider: PaymentProvider;
  name: string;
  display_name: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  description: string;
  features: string[];
}

// ── Form Validation Types ─────────────────────────────────────────────────────
export interface DonationFormErrors {
  amount?: string;
  cause?: string;
  donor_name?: string;
  donor_email?: string;
  donor_phone?: string;
  payment_provider?: string;
  general?: string;
}

// ── API Error Types ───────────────────────────────────────────────────────────
export interface ApiError {
  detail: string;
  request_id?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// ── Pagination Types ──────────────────────────────────────────────────────────
export interface PaginatedDonations {
  donations: Donation[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
  has_prev: boolean;
}

// ── Filter Types ──────────────────────────────────────────────────────────────
export interface DonationFilters {
  status?: DonationStatus;
  cause?: DonationCause;
  payment_provider?: PaymentProvider;
  date_from?: string;
  date_to?: string;
  min_amount?: number;
  max_amount?: number;
}

// ── Hook Return Types ─────────────────────────────────────────────────────────
export interface UseDonationsReturn {
  donations: Donation[];
  loading: boolean;
  error: string | null;
  totalAmount: number;
  createDonation: (data: DonationCreateRequest) => Promise<Donation>;
  initiatePayment: (donationId: string, data: PaymentInitiateRequest) => Promise<PaymentInitiateResponse>;
  verifyPayment: (donationId: string, data: DonationUpdateRequest) => Promise<Donation>;
  refetch: () => Promise<void>;
}

export interface UsePaymentMethodsReturn {
  paymentMethods: PaymentMethod[];
  loading: boolean;
  error: string | null;
  getMethod: (provider: PaymentProvider) => PaymentMethod | undefined;
}

// ── Constants ─────────────────────────────────────────────────────────────────
export const CAUSE_LABELS: Record<DonationCause, string> = {
  [DonationCause.EDUCATION]: "Education",
  [DonationCause.HEALTHCARE]: "Healthcare", 
  [DonationCause.DISASTER]: "Disaster Relief",
  [DonationCause.ENVIRONMENT]: "Environment",
  [DonationCause.POVERTY]: "Poverty Relief",
};

export const PAYMENT_PROVIDER_LABELS: Record<PaymentProvider, string> = {
  [PaymentProvider.BKASH]: "bKash",
  [PaymentProvider.NAGAD]: "Nagad",
  [PaymentProvider.BANK]: "Bank Transfer",
};

export const DONATION_STATUS_LABELS: Record<DonationStatus, string> = {
  [DonationStatus.PENDING]: "Pending",
  [DonationStatus.PROCESSING]: "Processing",
  [DonationStatus.COMPLETED]: "Completed",
  [DonationStatus.FAILED]: "Failed",
  [DonationStatus.CANCELLED]: "Cancelled", 
  [DonationStatus.REFUNDED]: "Refunded",
};

export const PRESET_AMOUNTS = [100, 250, 500, 1000, 2500, 5000] as const;

export const IMPACT_MESSAGES: Record<number, string> = {
  100: "Provides 3 meals for a flood-affected family",
  250: "Buys school supplies for one child for a month",
  500: "Covers basic healthcare for a rural family",
  1000: "Funds one week of disaster relief operations",
  2500: "Provides vocational training for one person",
  5000: "Sponsors a month of free education for 10 children",
};

// ── Utility Type Guards ───────────────────────────────────────────────────────
export const isDonationStatus = (value: string): value is DonationStatus => {
  return Object.values(DonationStatus).includes(value as DonationStatus);
};

export const isPaymentProvider = (value: string): value is PaymentProvider => {
  return Object.values(PaymentProvider).includes(value as PaymentProvider);
};

export const isDonationCause = (value: string): value is DonationCause => {
  return Object.values(DonationCause).includes(value as DonationCause);
};