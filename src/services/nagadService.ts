/**
 * Nagad Payment Service - Simulates Nagad payment integration
 */

import type { PaymentInitiateResponse } from '@/types/donation';

// Nagad API simulation configuration
const NAGAD_CONFIG = {
  baseUrl: 'https://api.mynagad.com/api/dfs',
  merchantId: 'demo_merchant_id',
  merchantPrivateKey: 'demo_merchant_private_key',
  publicKey: 'demo_public_key',
  simulateDelay: 1500, // 1.5 second delay for realistic simulation
};

export interface NagadInitiateRequest {
  merchantId: string;
  orderId: string;
  amount: string;
  currency: string;
  challenge: string;
}

export interface NagadInitiateResponse {
  sensitiveData: string;
  signature: string;
  paymentReferenceId: string;
  challenge: string;
}

export interface NagadCompleteRequest {
  merchantId: string;
  orderId: string;
  paymentReferenceId: string;
  challenge: string;
}

export interface NagadCompleteResponse {
  paymentReferenceId: string;
  checkoutURL: string;
  callbackURL: string;
}

export interface NagadVerifyRequest {
  paymentReferenceId: string;
  challenge: string;
}

export interface NagadVerifyResponse {
  merchantId: string;
  orderId: string;
  paymentReferenceId: string;
  amount: string;
  clientMobileNo: string;
  merchantMobileNo: string;
  status: 'Success' | 'Failed' | 'Cancelled' | 'Aborted';
  statusCode: string;
  paymentDateTime: string;
  issuerPaymentDateTime: string;
  issuerPaymentRefNo: string;
  additionalMerchantInfo?: any;
}

// Simulated delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Simulate network errors occasionally
const shouldSimulateError = (): boolean => {
  return Math.random() < 0.08; // 8% chance of error
};

// Generate random challenge string
const generateChallenge = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

class NagadService {
  private activePayments = new Map<string, { amount: string }>();

  /**
   * Simulate Nagad payment initialization
   */
  async initiatePayment(request: NagadInitiateRequest): Promise<NagadInitiateResponse> {
    await delay(NAGAD_CONFIG.simulateDelay);

    if (shouldSimulateError()) {
      throw new Error('Nagad: Payment initiation failed');
    }

    // Validate amount
    const amount = parseFloat(request.amount);
    if (amount < 10) {
      throw new Error('Nagad: Minimum payment amount is ৳10');
    }
    if (amount > 25000) {
      throw new Error('Nagad: Maximum payment amount is ৳25,000');
    }

    const paymentReferenceId = `NG${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    this.activePayments.set(paymentReferenceId, { amount: request.amount });

    return {
      sensitiveData: `encrypted_${request.orderId}_${Date.now()}`,
      signature: `signature_${paymentReferenceId}`,
      paymentReferenceId,
      challenge: generateChallenge(),
    };
  }

  /**
   * Complete Nagad payment (get checkout URL)
   */
  async completePayment(request: NagadCompleteRequest): Promise<NagadCompleteResponse> {
    await delay(NAGAD_CONFIG.simulateDelay);

    if (shouldSimulateError()) {
      throw new Error('Nagad: Payment completion failed');
    }

    return {
      paymentReferenceId: request.paymentReferenceId,
      checkoutURL: `${NAGAD_CONFIG.baseUrl}/check-out/initialize/${request.paymentReferenceId}`,
      callbackURL: `/api/v1/donations/callback/nagad`,
    };
  }

  /**
   * Verify Nagad payment status
   */
  async verifyPayment(request: NagadVerifyRequest): Promise<NagadVerifyResponse> {
    await delay(1200); // Shorter delay for verification

    if (shouldSimulateError()) {
      throw new Error('Nagad: Payment verification failed');
    }

    // Simulate different payment outcomes
    const outcomes = ['Success', 'Failed', 'Cancelled', 'Aborted'] as const;
    const weights = [0.82, 0.12, 0.04, 0.02]; // 82% success, 12% fail, 4% cancel, 2% abort
    const random = Math.random();
    
    let status: 'Success' | 'Failed' | 'Cancelled' | 'Aborted' = 'Success';
    let cumulative = 0;
    for (let i = 0; i < outcomes.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        status = outcomes[i];
        break;
      }
    }

    const now = new Date();
    const issuerRefNo = status === 'Success' ? `NGD${Date.now()}${Math.random().toString(36).substr(2, 6)}` : '';
    const payment = this.activePayments.get(request.paymentReferenceId);
    const amount = payment ? payment.amount : '0';

    return {
      merchantId: NAGAD_CONFIG.merchantId,
      orderId: `ORDER_${Date.now()}`,
      paymentReferenceId: request.paymentReferenceId,
      amount,
      clientMobileNo: status === 'Success' ? '01XXXXXXXXX' : '',
      merchantMobileNo: '01XXXXXXXXX',
      status,
      statusCode: status === 'Success' ? '000' : '999',
      paymentDateTime: now.toISOString(),
      issuerPaymentDateTime: now.toISOString(),
      issuerPaymentRefNo: issuerRefNo,
      additionalMerchantInfo: {
        service_charge: '0',
        promotion: null,
      },
    };
  }

  /**
   * Generate Nagad checkout URL
   */
  generateCheckoutUrl(paymentReferenceId: string): string {
    return `${NAGAD_CONFIG.baseUrl}/check-out/initialize/${paymentReferenceId}`;
  }

  /**
   * Generate mobile deep link for Nagad app
   */
  generateMobileDeepLink(paymentReferenceId: string): string {
    return `nagad://payment?ref=${paymentReferenceId}`;
  }

  /**
   * Simulate payment status query
   */
  async queryPaymentStatus(paymentReferenceId: string): Promise<{
    status: string;
    amount?: string;
    clientMobileNo?: string;
    paymentDateTime?: string;
    issuerPaymentRefNo?: string;
  }> {
    await delay(800);

    if (shouldSimulateError()) {
      throw new Error('Nagad: Status query failed');
    }

    // Simulate status progression
    const statuses = ['Initiated', 'Processing', 'Success', 'Failed'] as const;
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    return {
      status: randomStatus,
      amount: randomStatus === 'Success' ? '0' : undefined,
      clientMobileNo: randomStatus === 'Success' ? '01XXXXXXXXX' : undefined,
      paymentDateTime: randomStatus === 'Success' ? new Date().toISOString() : undefined,
      issuerPaymentRefNo: randomStatus === 'Success' ? `NGD${Date.now()}` : undefined,
    };
  }
}

// Export singleton instance
export const nagadService = new NagadService();

/**
 * High-level helper functions for donation integration
 */
export const initiateNagadPayment = async (
  amount: number,
  donationId: string
): Promise<{ 
  initiateResponse: NagadInitiateResponse; 
  completeResponse: NagadCompleteResponse; 
}> => {
  const challenge = generateChallenge();
  
  // Step 1: Initiate payment
  const initiateRequest: NagadInitiateRequest = {
    merchantId: NAGAD_CONFIG.merchantId,
    orderId: `DONATION_${donationId}`,
    amount: amount.toString(),
    currency: 'BDT',
    challenge,
  };

  const initiateResponse = await nagadService.initiatePayment(initiateRequest);

  // Step 2: Complete payment (get checkout URL)
  const completeRequest: NagadCompleteRequest = {
    merchantId: NAGAD_CONFIG.merchantId,
    orderId: `DONATION_${donationId}`,
    paymentReferenceId: initiateResponse.paymentReferenceId,
    challenge: initiateResponse.challenge,
  };

  const completeResponse = await nagadService.completePayment(completeRequest);

  return {
    initiateResponse,
    completeResponse,
  };
};

export const verifyNagadPayment = async (
  paymentReferenceId: string,
  challenge: string
): Promise<NagadVerifyResponse> => {
  return nagadService.verifyPayment({
    paymentReferenceId,
    challenge,
  });
};

export const queryNagadPaymentStatus = async (
  paymentReferenceId: string
): Promise<{
  status: string;
  amount?: string;
  clientMobileNo?: string;
  paymentDateTime?: string;
  issuerPaymentRefNo?: string;
}> => {
  return nagadService.queryPaymentStatus(paymentReferenceId);
};

// Export service class as default
export default NagadService;