/**
 * bKash Payment Service - Simulates bKash payment integration
 */

import type { PaymentInitiateResponse } from '@/types/donation';

// bKash API simulation configuration
const BKASH_CONFIG = {
  baseUrl: 'https://checkout.pay.bka.sh/v1.2.0-beta',
  appKey: 'demo_app_key',
  appSecret: 'demo_app_secret',
  username: 'demo_username',
  password: 'demo_password',
  simulateDelay: 2000, // 2 second delay for realistic simulation
};

export interface BkashTokenResponse {
  id_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

export interface BkashCreatePaymentRequest {
  mode: '0011' | '0001'; // 0011 for checkout, 0001 for payment
  payerReference: string;
  callbackURL: string;
  amount: string;
  currency: string;
  intent: 'sale' | 'authorization';
  merchantInvoiceNumber: string;
}

export interface BkashCreatePaymentResponse {
  paymentID: string;
  bkashURL: string;
  callbackURL: string;
  successCallbackURL: string;
  failureCallbackURL: string;
  cancelledCallbackURL: string;
  amount: string;
  intent: string;
  currency: string;
  paymentCreateTime: string;
  transactionStatus: string;
  merchantInvoiceNumber: string;
}

export interface BkashExecutePaymentRequest {
  paymentID: string;
}

export interface BkashExecutePaymentResponse {
  paymentID: string;
  trxID: string;
  transactionStatus: 'Completed' | 'Failed' | 'Cancelled';
  amount: string;
  currency: string;
  intent: string;
  paymentExecuteTime: string;
  merchantInvoiceNumber: string;
  payerAccount: string;
  payerType: string;
}

export interface BkashQueryPaymentResponse {
  paymentID: string;
  mode: string;
  paymentCreateTime: string;
  paymentExecuteTime?: string;
  amount: string;
  currency: string;
  intent: string;
  transactionStatus: 'Initiated' | 'Completed' | 'Cancelled' | 'Failed';
  merchantInvoiceNumber: string;
  payerAccount?: string;
  payerType?: string;
  trxID?: string;
}

// Simulated delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Simulate network errors occasionally
const shouldSimulateError = (): boolean => {
  return Math.random() < 0.1; // 10% chance of error
};

class BkashService {
  private token: string | null = null;
  private tokenExpiry: number = 0;
  private activePayments = new Map<string, { amount: string }>();

  /**
   * Simulate bKash token generation (OAuth)
   */
  async grantToken(): Promise<BkashTokenResponse> {
    await delay(BKASH_CONFIG.simulateDelay);

    if (shouldSimulateError()) {
      throw new Error('bKash: Authentication failed');
    }

    const token = `bkash_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresIn = 3600; // 1 hour

    this.token = token;
    this.tokenExpiry = Date.now() + (expiresIn * 1000);

    return {
      id_token: token,
      token_type: 'Bearer',
      expires_in: expiresIn,
      refresh_token: `refresh_${token}`,
    };
  }

  /**
   * Ensure we have a valid token
   */
  private async ensureToken(): Promise<string> {
    if (!this.token || Date.now() >= this.tokenExpiry) {
      const tokenResponse = await this.grantToken();
      return tokenResponse.id_token;
    }
    return this.token;
  }

  /**
   * Create a bKash payment
   */
  async createPayment(request: BkashCreatePaymentRequest): Promise<BkashCreatePaymentResponse> {
    await this.ensureToken();
    await delay(BKASH_CONFIG.simulateDelay);

    if (shouldSimulateError()) {
      throw new Error('bKash: Payment creation failed');
    }

    // Validate amount
    const amount = parseFloat(request.amount);
    if (amount < 10) {
      throw new Error('bKash: Minimum payment amount is ৳10');
    }
    if (amount > 25000) {
      throw new Error('bKash: Maximum payment amount is ৳25,000');
    }

    const paymentID = `BK${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const createTime = new Date().toISOString();

    this.activePayments.set(paymentID, { amount: request.amount });

    return {
      paymentID,
      bkashURL: `${BKASH_CONFIG.baseUrl}/checkout/payment/${paymentID}`,
      callbackURL: request.callbackURL,
      successCallbackURL: `${request.callbackURL}?status=success`,
      failureCallbackURL: `${request.callbackURL}?status=failure`,
      cancelledCallbackURL: `${request.callbackURL}?status=cancelled`,
      amount: request.amount,
      intent: request.intent,
      currency: request.currency,
      paymentCreateTime: createTime,
      transactionStatus: 'Initiated',
      merchantInvoiceNumber: request.merchantInvoiceNumber,
    };
  }

  /**
   * Execute a bKash payment (called after user completes payment)
   */
  async executePayment(request: BkashExecutePaymentRequest): Promise<BkashExecutePaymentResponse> {
    await this.ensureToken();
    await delay(BKASH_CONFIG.simulateDelay);

    if (shouldSimulateError()) {
      throw new Error('bKash: Payment execution failed');
    }

    // Simulate different outcomes
    const outcomes = ['Completed', 'Failed', 'Cancelled'] as const;
    const weights = [0.8, 0.15, 0.05]; // 80% success, 15% fail, 5% cancel
    const random = Math.random();
    
    let status: 'Completed' | 'Failed' | 'Cancelled' = 'Completed';
    let cumulative = 0;
    for (let i = 0; i < outcomes.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        status = outcomes[i];
        break;
      }
    }

    const trxID = `TXN${Date.now()}${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    const executeTime = new Date().toISOString();
    const payment = this.activePayments.get(request.paymentID);
    const amount = payment ? payment.amount : '0';

    return {
      paymentID: request.paymentID,
      trxID: status === 'Completed' ? trxID : '',
      transactionStatus: status,
      amount,
      currency: 'BDT',
      intent: 'sale',
      paymentExecuteTime: executeTime,
      merchantInvoiceNumber: `INV_${Date.now()}`,
      payerAccount: status === 'Completed' ? `01XXXXXXXXX` : '',
      payerType: 'Personal',
    };
  }

  /**
   * Query payment status
   */
  async queryPayment(paymentID: string): Promise<BkashQueryPaymentResponse> {
    await this.ensureToken();
    await delay(1000); // Shorter delay for query

    if (shouldSimulateError()) {
      throw new Error('bKash: Query payment failed');
    }

    // Simulate payment status progression
    const statuses = ['Initiated', 'Completed', 'Failed', 'Cancelled'] as const;
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    return {
      paymentID,
      mode: '0011',
      paymentCreateTime: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
      paymentExecuteTime: randomStatus !== 'Initiated' ? new Date().toISOString() : undefined,
      amount: '0',
      currency: 'BDT',
      intent: 'sale',
      transactionStatus: randomStatus,
      merchantInvoiceNumber: `INV_${Date.now()}`,
      payerAccount: randomStatus === 'Completed' ? '01XXXXXXXXX' : undefined,
      payerType: randomStatus === 'Completed' ? 'Personal' : undefined,
      trxID: randomStatus === 'Completed' ? `TXN${Date.now()}` : undefined,
    };
  }

  /**
   * Simulate bKash checkout URL generation
   */
  generateCheckoutUrl(paymentID: string): string {
    return `${BKASH_CONFIG.baseUrl}/checkout/payment/${paymentID}`;
  }

  /**
   * Simulate mobile deep link for bKash app
   */
  generateMobileDeepLink(paymentID: string): string {
    return `bkash://payment?paymentID=${paymentID}`;
  }
}

// Export singleton instance
export const bkashService = new BkashService();

/**
 * High-level helper functions for donation integration
 */
export const createBkashPayment = async (
  amount: number,
  donationId: string,
  callbackUrl: string
): Promise<BkashCreatePaymentResponse> => {
  const request: BkashCreatePaymentRequest = {
    mode: '0011',
    payerReference: donationId,
    callbackURL: callbackUrl,
    amount: amount.toString(),
    currency: 'BDT',
    intent: 'sale',
    merchantInvoiceNumber: `DONATION_${donationId}`,
  };

  return bkashService.createPayment(request);
};

export const executeBkashPayment = async (
  paymentID: string
): Promise<BkashExecutePaymentResponse> => {
  return bkashService.executePayment({ paymentID });
};

export const queryBkashPayment = async (
  paymentID: string
): Promise<BkashQueryPaymentResponse> => {
  return bkashService.queryPayment(paymentID);
};

// Export service class as default
export default BkashService;