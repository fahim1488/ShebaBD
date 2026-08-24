/**
 * Donation API service - handles all donation-related HTTP requests
 */

import type {
  Donation,
  DonationCreateRequest,
  DonationUpdateRequest,
  PaymentMethod,
  Transaction,
  PaymentInitiateRequest,
  PaymentInitiateResponse,
  DonationFilters,
  ApiError,
} from '@/types/donation';

const API_BASE = '/api/v1';

// ── Helper Functions ──────────────────────────────────────────────────────────
const getAuthToken = (): string | null => {
  // Match the key used by AuthProvider
  return localStorage.getItem('shebabd_token');
};

const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

class ApiErrorClass extends Error {
  constructor(
    public status: number,
    public data: ApiError,
    message?: string
  ) {
    super(message || data.detail || 'API Error');
    this.name = 'ApiError';
  }
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let errorData: ApiError;
    try {
      errorData = await response.json();
    } catch {
      errorData = { detail: `HTTP ${response.status}: ${response.statusText}` };
    }
    throw new ApiErrorClass(response.status, errorData);
  }

  return response.json();
};

// ── Payment Methods ───────────────────────────────────────────────────────────
export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const response = await fetch(`${API_BASE}/donations/payment-methods`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleResponse<PaymentMethod[]>(response);
};

// ── Donations ─────────────────────────────────────────────────────────────────
export const createDonation = async (
  data: DonationCreateRequest
): Promise<Donation> => {
  const response = await fetch(`${API_BASE}/donations`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse<Donation>(response);
};

export const getDonations = async (
  filters?: DonationFilters & { skip?: number; limit?: number }
): Promise<Donation[]> => {
  const params = new URLSearchParams();
  
  if (filters?.skip !== undefined) params.append('skip', filters.skip.toString());
  if (filters?.limit !== undefined) params.append('limit', filters.limit.toString());
  if (filters?.status) params.append('status_filter', filters.status);
  if (filters?.cause) params.append('cause_filter', filters.cause);
  
  const response = await fetch(`${API_BASE}/donations?${params}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleResponse<Donation[]>(response);
};

export const getDonation = async (donationId: string): Promise<Donation> => {
  const response = await fetch(`${API_BASE}/donations/${donationId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleResponse<Donation>(response);
};

// ── Payment Processing ────────────────────────────────────────────────────────
export const initiatePayment = async (
  donationId: string,
  data: PaymentInitiateRequest = {}
): Promise<PaymentInitiateResponse> => {
  const response = await fetch(`${API_BASE}/donations/${donationId}/initiate-payment`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse<PaymentInitiateResponse>(response);
};

export const verifyPayment = async (
  donationId: string,
  data: DonationUpdateRequest
): Promise<Donation> => {
  const response = await fetch(`${API_BASE}/donations/${donationId}/verify`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse<Donation>(response);
};

// ── Transactions ──────────────────────────────────────────────────────────────
export const getDonationTransactions = async (
  donationId: string
): Promise<Transaction[]> => {
  const response = await fetch(`${API_BASE}/donations/${donationId}/transactions`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleResponse<Transaction[]>(response);
};

// ── Tracking ──────────────────────────────────────────────────────────────────
export interface DonationStatusResponse {
  donation_id: string;
  status: string;
  amount: number;
  payment_provider: string;
  receipt_number?: string;
  created_at: string;
  updated_at: string;
  latest_transaction?: {
    id: string;
    status: string;
    provider_transaction_id?: string;
    error_message?: string;
    created_at: string;
  } | null;
}

export interface TimelineEvent {
  id: string;
  type: string;
  status: string;
  title: string;
  description: string;
  timestamp: string;
  details: Record<string, any>;
}

export interface DonationTimeline {
  donation_id: string;
  current_status: string;
  timeline: TimelineEvent[];
}

export const getDonationStatus = async (
  donationId: string
): Promise<DonationStatusResponse> => {
  const response = await fetch(`${API_BASE}/donations/${donationId}/status`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse<DonationStatusResponse>(response);
};

export const getDonationTimeline = async (
  donationId: string
): Promise<DonationTimeline> => {
  const response = await fetch(`${API_BASE}/donations/${donationId}/timeline`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse<DonationTimeline>(response);
};

// ── Admin Functions (future) ──────────────────────────────────────────────────
export const getAllDonationsAdmin = async (
  filters?: { skip?: number; limit?: number }
): Promise<Donation[]> => {
  const params = new URLSearchParams();
  
  if (filters?.skip !== undefined) params.append('skip', filters.skip.toString());
  if (filters?.limit !== undefined) params.append('limit', filters.limit.toString());
  
  const response = await fetch(`${API_BASE}/donations/admin/all?${params}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleResponse<Donation[]>(response);
};

// ── Utility Functions ─────────────────────────────────────────────────────────
export const isApiError = (error: unknown): error is ApiErrorClass => {
  return error instanceof ApiErrorClass;
};

export const getErrorMessage = (error: unknown): string => {
  if (isApiError(error)) {
    return error.data.detail || error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unknown error occurred';
};

export const getFieldErrors = (error: unknown): Record<string, string> => {
  if (isApiError(error) && error.data.errors) {
    const fieldErrors: Record<string, string> = {};
    error.data.errors.forEach(({ field, message }) => {
      fieldErrors[field] = message;
    });
    return fieldErrors;
  }
  
  return {};
};

// ── Export all functions as default ──────────────────────────────────────────
export default {
  // Payment Methods
  getPaymentMethods,
  
  // Donations
  createDonation,
  getDonations,
  getDonation,
  
  // Payment Processing
  initiatePayment,
  verifyPayment,
  
  // Transactions
  getDonationTransactions,
  
  // Tracking
  getDonationStatus,
  getDonationTimeline,
  
  // Admin
  getAllDonationsAdmin,
  
  // Utilities
  isApiError,
  getErrorMessage,
  getFieldErrors,
};