/**
 * Bank Transfer Service - Handles bank transfer payment processing
 */

// Bank transfer configuration
const BANK_CONFIG = {
  accountDetails: {
    accountName: 'ShebaBD Foundation',
    accountNumber: '1234567890123456',
    bankName: 'Dutch Bangla Bank Limited',
    branchName: 'Dhanmondi Branch',
    routingNumber: '090260323',
    swiftCode: 'DBBLBDDH',
  },
  processingTime: '1-2 business days',
  minAmount: 50,
  maxAmount: 100000,
  simulateDelay: 1000,
};

export interface BankTransferRequest {
  donationId: string;
  amount: number;
  currency: string;
  transferReference?: string;
  transferDate?: string;
  fromAccount?: string;
  receiptFile?: File;
}

export interface BankTransferResponse {
  referenceNumber: string;
  bankDetails: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    branchName: string;
    routingNumber: string;
    swiftCode: string;
  };
  instructions: string[];
  processingTime: string;
  amount: number;
  currency: string;
  expiresAt: number; // Unix timestamp (7 days)
}

export interface BankTransferVerification {
  referenceNumber: string;
  status: 'pending' | 'verified' | 'failed' | 'expired';
  verificationDate?: string;
  transferAmount?: number;
  transferDate?: string;
  fromAccount?: string;
  notes?: string;
}

export interface ReceiptUploadRequest {
  referenceNumber: string;
  receiptFile: File;
  transferDate: string;
  transferAmount: number;
  fromAccountLastFourDigits: string;
}

export interface ReceiptUploadResponse {
  receiptId: string;
  uploadTime: string;
  status: 'uploaded' | 'processing' | 'verified' | 'rejected';
  fileName: string;
  fileSize: number;
}

// Simulated delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Simulate processing occasionally
const shouldSimulateProcessingDelay = (): boolean => {
  return Math.random() < 0.3; // 30% chance of longer processing
};

class BankTransferService {
  private activeTransfers = new Map<string, { amount: number }>();

  /**
   * Initialize bank transfer payment
   */
  async initiateBankTransfer(request: BankTransferRequest): Promise<BankTransferResponse> {
    await delay(BANK_CONFIG.simulateDelay);

    // Validate amount
    if (request.amount < BANK_CONFIG.minAmount) {
      throw new Error(`Bank Transfer: Minimum amount is ৳${BANK_CONFIG.minAmount}`);
    }
    if (request.amount > BANK_CONFIG.maxAmount) {
      throw new Error(`Bank Transfer: Maximum amount is ৳${BANK_CONFIG.maxAmount.toLocaleString()}`);
    }

    const referenceNumber = `BT${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days

    this.activeTransfers.set(referenceNumber, { amount: request.amount });

    return {
      referenceNumber,
      bankDetails: BANK_CONFIG.accountDetails,
      instructions: [
        'Transfer the exact donation amount to the provided bank account',
        `Use reference number: ${referenceNumber}`,
        'Keep your bank transfer receipt/screenshot',
        'Upload the receipt on this page for faster verification',
        'Verification may take 1-2 business days',
        'Ensure the transfer amount matches exactly',
      ],
      processingTime: BANK_CONFIG.processingTime,
      amount: request.amount,
      currency: request.currency,
      expiresAt,
    };
  }

  /**
   * Upload transfer receipt for verification
   */
  async uploadReceipt(request: ReceiptUploadRequest): Promise<ReceiptUploadResponse> {
    await delay(shouldSimulateProcessingDelay() ? 3000 : 1500);

    // Validate file
    if (!request.receiptFile) {
      throw new Error('Receipt file is required');
    }

    if (request.receiptFile.size > 5 * 1024 * 1024) { // 5MB limit
      throw new Error('Receipt file size must be less than 5MB');
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(request.receiptFile.type)) {
      throw new Error('Receipt must be an image (JPG, PNG) or PDF file');
    }

    // Validate transfer date (not future, not older than 30 days)
    const transferDate = new Date(request.transferDate);
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

    if (transferDate > now) {
      throw new Error('Transfer date cannot be in the future');
    }

    if (transferDate < thirtyDaysAgo) {
      throw new Error('Transfer date cannot be older than 30 days');
    }

    const receiptId = `RCP${Date.now()}${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

    return {
      receiptId,
      uploadTime: new Date().toISOString(),
      status: 'uploaded',
      fileName: request.receiptFile.name,
      fileSize: request.receiptFile.size,
    };
  }

  /**
   * Check bank transfer verification status
   */
  async checkVerificationStatus(referenceNumber: string): Promise<BankTransferVerification> {
    await delay(800);

    // Simulate different verification states
    const states = ['pending', 'verified', 'failed'] as const;
    const weights = [0.6, 0.35, 0.05]; // 60% pending, 35% verified, 5% failed
    const random = Math.random();
    
    let status: 'pending' | 'verified' | 'failed' = 'pending';
    let cumulative = 0;
    for (let i = 0; i < states.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        status = states[i];
        break;
      }
    }

    const baseResponse: BankTransferVerification = {
      referenceNumber,
      status,
    };

    const transfer = this.activeTransfers.get(referenceNumber);
    const transferAmount = transfer ? transfer.amount : 0;

    if (status === 'verified') {
      return {
        ...baseResponse,
        verificationDate: new Date().toISOString(),
        transferAmount,
        transferDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
        fromAccount: '**** **** **** 1234',
        notes: 'Transfer verified successfully',
      };
    }

    if (status === 'failed') {
      return {
        ...baseResponse,
        verificationDate: new Date().toISOString(),
        notes: 'Amount mismatch or invalid transfer details',
      };
    }

    return baseResponse; // pending status
  }

  /**
   * Simulate manual verification (admin function)
   */
  async manualVerification(
    referenceNumber: string,
    verified: boolean,
    notes?: string
  ): Promise<BankTransferVerification> {
    await delay(1000);

    return {
      referenceNumber,
      status: verified ? 'verified' : 'failed',
      verificationDate: new Date().toISOString(),
      transferAmount: verified ? 0 : undefined,
      transferDate: verified ? new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() : undefined,
      fromAccount: verified ? '**** **** **** 1234' : undefined,
      notes: notes || (verified ? 'Manually verified by admin' : 'Verification failed'),
    };
  }

  /**
   * Get bank account details
   */
  getBankDetails() {
    return BANK_CONFIG.accountDetails;
  }

  /**
   * Validate transfer reference format
   */
  validateReferenceNumber(referenceNumber: string): boolean {
    return /^BT\d{13}[A-Z0-9]{6}$/.test(referenceNumber);
  }

  /**
   * Calculate processing time estimate
   */
  getProcessingTimeEstimate(): string {
    return BANK_CONFIG.processingTime;
  }
}

// Export singleton instance
export const bankTransferService = new BankTransferService();

/**
 * High-level helper functions for donation integration
 */
export const initiateBankTransfer = async (
  amount: number,
  donationId: string
): Promise<BankTransferResponse> => {
  return bankTransferService.initiateBankTransfer({
    donationId,
    amount,
    currency: 'BDT',
  });
};

export const uploadTransferReceipt = async (
  referenceNumber: string,
  receiptFile: File,
  transferDate: string,
  transferAmount: number,
  fromAccountLastFourDigits: string
): Promise<ReceiptUploadResponse> => {
  return bankTransferService.uploadReceipt({
    referenceNumber,
    receiptFile,
    transferDate,
    transferAmount,
    fromAccountLastFourDigits,
  });
};

export const checkBankTransferStatus = async (
  referenceNumber: string
): Promise<BankTransferVerification> => {
  return bankTransferService.checkVerificationStatus(referenceNumber);
};

// File validation helpers
export const validateReceiptFile = (file: File): string | null => {
  if (!file) return 'Receipt file is required';
  
  if (file.size > 5 * 1024 * 1024) {
    return 'File size must be less than 5MB';
  }
  
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    return 'File must be an image (JPG, PNG) or PDF';
  }
  
  return null;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Export service class as default
export default BankTransferService;