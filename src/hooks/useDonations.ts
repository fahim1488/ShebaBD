/**
 * Custom hooks for donation management
 */

import { useState, useEffect, useCallback } from 'react';
import { PaymentProvider, DonationStatus } from '@/types/donation';
import type {
  Donation,
  DonationCreateRequest,
  DonationUpdateRequest,
  PaymentMethod,
  PaymentInitiateRequest,
  PaymentInitiateResponse,
  DonationFilters,
  UseDonationsReturn,
  UsePaymentMethodsReturn,
} from '@/types/donation';
import donationApi from '@/services/donationApi';

// ── Donations Hook ────────────────────────────────────────────────────────────
export const useDonations = (filters?: DonationFilters): UseDonationsReturn => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDonations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await donationApi.getDonations(filters);
      setDonations(data);
    } catch (err) {
      setError(donationApi.getErrorMessage(err));
      console.error('Failed to fetch donations:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createDonation = useCallback(async (data: DonationCreateRequest): Promise<Donation> => {
    try {
      setError(null);
      const newDonation = await donationApi.createDonation(data);
      setDonations(prev => [newDonation, ...prev]);
      return newDonation;
    } catch (err) {
      const errorMessage = donationApi.getErrorMessage(err);
      setError(errorMessage);
      throw err;
    }
  }, []);

  const initiatePayment = useCallback(async (
    donationId: string,
    data: PaymentInitiateRequest
  ): Promise<PaymentInitiateResponse> => {
    try {
      setError(null);
      const response = await donationApi.initiatePayment(donationId, data);
      
      // Update the donation status to processing
      setDonations(prev => prev.map(d => 
        d.id === donationId ? { ...d, status: DonationStatus.PROCESSING } : d
      ));
      
      return response;
    } catch (err) {
      const errorMessage = donationApi.getErrorMessage(err);
      setError(errorMessage);
      throw err;
    }
  }, []);

  const verifyPayment = useCallback(async (
    donationId: string,
    data: DonationUpdateRequest
  ): Promise<Donation> => {
    try {
      setError(null);
      const updatedDonation = await donationApi.verifyPayment(donationId, data);
      
      // Update the donation in the list
      setDonations(prev => prev.map(d => 
        d.id === donationId ? updatedDonation : d
      ));
      
      return updatedDonation;
    } catch (err) {
      const errorMessage = donationApi.getErrorMessage(err);
      setError(errorMessage);
      throw err;
    }
  }, []);

  const totalAmount = donations.reduce((sum, donation) => {
    return donation.status === 'completed' ? sum + donation.amount : sum;
  }, 0);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  return {
    donations,
    loading,
    error,
    totalAmount,
    createDonation,
    initiatePayment,
    verifyPayment,
    refetch: fetchDonations,
  };
};

// ── Default Payment Methods (Fallback) ───────────────────────────────────────
const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 1,
    provider: PaymentProvider.BKASH,
    name: 'bkash',
    display_name: 'bKash',
    description: 'Pay with your bKash mobile wallet',
    is_active: true,
    min_amount: 10,
    max_amount: 25000,
  },
  {
    id: 2,
    provider: PaymentProvider.NAGAD,
    name: 'nagad',
    display_name: 'Nagad',
    description: 'Pay with your Nagad account',
    is_active: true,
    min_amount: 10,
    max_amount: 25000,
  },
  {
    id: 3,
    provider: PaymentProvider.BANK,
    name: 'bank_transfer',
    display_name: 'Bank Transfer',
    description: 'Direct bank account transfer',
    is_active: true,
    min_amount: 50,
    max_amount: 100000,
  },
];

// ── Payment Methods Hook ──────────────────────────────────────────────────────
export const usePaymentMethods = (): UsePaymentMethodsReturn => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(DEFAULT_PAYMENT_METHODS);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentMethods = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await donationApi.getPaymentMethods();
      if (data && Array.isArray(data) && data.length > 0) {
        setPaymentMethods(data);
      }
    } catch (err) {
      setError(donationApi.getErrorMessage(err));
      console.warn('Using default payment methods fallback:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getMethod = useCallback((provider: PaymentProvider): PaymentMethod | undefined => {
    return paymentMethods.find(method => method.provider === provider);
  }, [paymentMethods]);

  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  return {
    paymentMethods,
    loading,
    error,
    getMethod,
  };
};

// ── Single Donation Hook ──────────────────────────────────────────────────────
export const useDonation = (donationId: string | null) => {
  const [donation, setDonation] = useState<Donation | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDonation = useCallback(async () => {
    if (!donationId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await donationApi.getDonation(donationId);
      setDonation(data);
    } catch (err) {
      setError(donationApi.getErrorMessage(err));
      console.error('Failed to fetch donation:', err);
    } finally {
      setLoading(false);
    }
  }, [donationId]);

  useEffect(() => {
    fetchDonation();
  }, [fetchDonation]);

  return {
    donation,
    loading,
    error,
    refetch: fetchDonation,
  };
};

// ── Donation Form Hook ────────────────────────────────────────────────────────
export const useDonationForm = () => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<boolean>(false);

  const validateForm = useCallback((data: DonationCreateRequest): boolean => {
    const newErrors: Record<string, string> = {};

    if (!data.amount || data.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!data.cause) {
      newErrors.cause = 'Please select a cause';
    }

    if (!data.donor_name.trim()) {
      newErrors.donor_name = 'Name is required';
    }

    if (!data.donor_email.trim()) {
      newErrors.donor_email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.donor_email)) {
      newErrors.donor_email = 'Invalid email format';
    }

    if (!data.payment_provider) {
      newErrors.payment_provider = 'Please select a payment method';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  const submitDonation = useCallback(async (
    data: DonationCreateRequest,
    onSuccess?: (donation: Donation) => void
  ): Promise<Donation | null> => {
    if (!validateForm(data)) {
      return null;
    }

    try {
      setIsSubmitting(true);
      setErrors({});
      
      const donation = await donationApi.createDonation(data);
      setSuccess(true);
      
      if (onSuccess) {
        onSuccess(donation);
      }
      
      return donation;
    } catch (err) {
      const fieldErrors = donationApi.getFieldErrors(err);
      const generalError = donationApi.getErrorMessage(err);
      
      setErrors({
        ...fieldErrors,
        ...(Object.keys(fieldErrors).length === 0 && { general: generalError }),
      });
      
      console.error('Failed to create donation:', err);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm]);

  const resetForm = useCallback(() => {
    setErrors({});
    setSuccess(false);
    setIsSubmitting(false);
  }, []);

  return {
    isSubmitting,
    errors,
    success,
    validateForm,
    submitDonation,
    resetForm,
    setErrors,
  };
};

// ── Payment Processing Hook ───────────────────────────────────────────────────
export const usePaymentProcessing = () => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const processPayment = useCallback(async (
    donationId: string,
    paymentData: PaymentInitiateRequest = {}
  ): Promise<PaymentInitiateResponse | null> => {
    try {
      setIsProcessing(true);
      setError(null);
      
      const response = await donationApi.initiatePayment(donationId, paymentData);
      return response;
    } catch (err) {
      const errorMessage = donationApi.getErrorMessage(err);
      setError(errorMessage);
      console.error('Payment processing failed:', err);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const verifyPayment = useCallback(async (
    donationId: string,
    status: DonationStatus,
    errorMessage?: string
  ): Promise<Donation | null> => {
    try {
      setIsProcessing(true);
      setError(null);
      
      const response = await donationApi.verifyPayment(donationId, {
        status,
        error_message: errorMessage,
      });
      
      return response;
    } catch (err) {
      const errorMsg = donationApi.getErrorMessage(err);
      setError(errorMsg);
      console.error('Payment verification failed:', err);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const resetProcessing = useCallback(() => {
    setIsProcessing(false);
    setError(null);
  }, []);

  return {
    isProcessing,
    error,
    processPayment,
    verifyPayment,
    resetProcessing,
  };
};