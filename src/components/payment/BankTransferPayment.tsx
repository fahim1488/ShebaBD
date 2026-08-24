/**
 * BankTransferPayment - Bank transfer payment flow component
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Copy,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Clock,
  Shield,
  Upload,
  FileText,
  Calendar,
  CreditCard,
  Eye,
  EyeOff,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TextInput } from '@/components/ui/input';
import { 
  initiateBankTransfer, 
  uploadTransferReceipt, 
  checkBankTransferStatus,
  validateReceiptFile,
  formatFileSize,
  type BankTransferResponse,
  type BankTransferVerification,
  type ReceiptUploadResponse,
} from '@/services/bankTransferService';
import type { Donation } from '@/types/donation';

interface BankTransferPaymentProps {
  donation: Donation;
  onSuccess: (transactionData: any) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

type PaymentStep = 
  | 'initializing' 
  | 'instructions' 
  | 'receipt_upload' 
  | 'verifying' 
  | 'completed' 
  | 'failed';

interface ReceiptFormData {
  transferDate: string;
  transferAmount: string;
  fromAccountLastFour: string;
  receiptFile: File | null;
}

export const BankTransferPayment: React.FC<BankTransferPaymentProps> = ({
  donation,
  onSuccess,
  onError,
  onCancel,
}) => {
  const [step, setStep] = useState<PaymentStep>('initializing');
  const [bankData, setBankData] = useState<BankTransferResponse | null>(null);
  const [verificationData, setVerificationData] = useState<BankTransferVerification | null>(null);
  const [uploadData, setUploadData] = useState<ReceiptUploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [showAccountDetails, setShowAccountDetails] = useState<boolean>(true);
  
  const [receiptForm, setReceiptForm] = useState<ReceiptFormData>({
    transferDate: new Date().toISOString().split('T')[0], // Today's date
    transferAmount: donation.amount.toString(),
    fromAccountLastFour: '',
    receiptFile: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-initialize on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        setStep('initializing');
        
        const response = await initiateBankTransfer(
          donation.amount,
          donation.id
        );
        
        setBankData(response);
        setStep('instructions');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize bank transfer';
        setError(errorMessage);
        setStep('failed');
        onError(errorMessage);
      }
    };

    initialize();
  }, [donation.amount, donation.id, onError]);

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateReceiptFile(file);
    if (validation) {
      alert(validation);
      return;
    }

    setReceiptForm(prev => ({ ...prev, receiptFile: file }));
  };

  const handleUploadReceipt = async () => {
    if (!bankData || !receiptForm.receiptFile) return;

    const validation = validateReceiptFile(receiptForm.receiptFile);
    if (validation) {
      alert(validation);
      return;
    }

    if (!receiptForm.fromAccountLastFour || receiptForm.fromAccountLastFour.length !== 4) {
      alert('Please enter the last 4 digits of your account number');
      return;
    }

    if (!receiptForm.transferDate) {
      alert('Please select the transfer date');
      return;
    }

    const transferAmount = parseFloat(receiptForm.transferAmount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      alert('Please enter a valid transfer amount');
      return;
    }

    try {
      setIsUploading(true);
      
      const uploadResponse = await uploadTransferReceipt(
        bankData.referenceNumber,
        receiptForm.receiptFile,
        receiptForm.transferDate,
        transferAmount,
        receiptForm.fromAccountLastFour
      );
      
      setUploadData(uploadResponse);
      setStep('verifying');
      
      // Start polling for verification status
      pollVerificationStatus();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload receipt';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const pollVerificationStatus = async () => {
    if (!bankData) return;

    try {
      const status = await checkBankTransferStatus(bankData.referenceNumber);
      setVerificationData(status);
      
      if (status.status === 'verified') {
        setStep('completed');
        onSuccess({
          provider: 'bank',
          referenceNumber: bankData.referenceNumber,
          amount: status.transferAmount,
          status: status.status,
          verificationDate: status.verificationDate,
          transferDate: status.transferDate,
          fromAccount: status.fromAccount,
        });
      } else if (status.status === 'failed') {
        setStep('failed');
        setError(status.notes || 'Transfer verification failed');
        onError(status.notes || 'Transfer verification failed');
      } else {
        // Still pending, continue polling after delay
        setTimeout(pollVerificationStatus, 30000); // Check every 30 seconds
      }
    } catch (err) {
      console.error('Verification polling failed:', err);
      setTimeout(pollVerificationStatus, 60000); // Retry after 1 minute on error
    }
  };

  const handleCheckStatus = async () => {
    if (!bankData) return;
    
    try {
      const status = await checkBankTransferStatus(bankData.referenceNumber);
      setVerificationData(status);
      
      if (status.status === 'verified') {
        setStep('completed');
        onSuccess({
          provider: 'bank',
          referenceNumber: bankData.referenceNumber,
          amount: status.transferAmount,
          status: status.status,
          verificationDate: status.verificationDate,
        });
      } else if (status.status === 'failed') {
        setStep('failed');
        setError(status.notes || 'Transfer verification failed');
      }
    } catch (err) {
      console.error('Status check failed:', err);
    }
  };

  const handleRetry = () => {
    setStep('initializing');
    setBankData(null);
    setVerificationData(null);
    setUploadData(null);
    setError(null);
    setReceiptForm({
      transferDate: new Date().toISOString().split('T')[0],
      transferAmount: donation.amount.toString(),
      fromAccountLastFour: '',
      receiptFile: null,
    });
    window.location.reload();
  };

  const formatExpiryTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString();
  };

  return (
    <div className="min-h-screen bg-ds-background">
      <div className="mx-auto max-w-2xl px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-ds-xl border border-ds-muted/10 bg-ds-surface p-8 shadow-ds-sm"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-14 w-auto flex items-center justify-center">
                <svg viewBox="0 0 160 44" xmlns="http://www.w3.org/2000/svg" className="h-12 w-auto drop-shadow-md">
                  <rect width="160" height="44" rx="8" fill="#1A56DB"/>
                  <rect x="10" y="15" width="5" height="16" rx="1.5" fill="white" opacity="0.9"/>
                  <rect x="18" y="15" width="5" height="16" rx="1.5" fill="white" opacity="0.9"/>
                  <rect x="26" y="15" width="5" height="16" rx="1.5" fill="white" opacity="0.9"/>
                  <polygon points="8,15 24.5,6 41,15" fill="white" opacity="0.9"/>
                  <rect x="8" y="31" width="33" height="3.5" rx="1.5" fill="white" opacity="0.9"/>
                  <text x="50" y="29" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="14" fill="white">Bank Transfer</text>
                </svg>
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-ds-foreground">Bank Transfer</h2>
                <p className="text-sm text-ds-muted">৳{donation.amount} donation</p>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* Initializing */}
            {step === 'initializing' && (
              <motion.div
                key="initializing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold text-ds-foreground mb-2">
                  Setting Up Bank Transfer
                </h3>
                <p className="text-ds-muted">Generating transfer details...</p>
              </motion.div>
            )}

            {/* Instructions */}
            {step === 'instructions' && bankData && (
              <motion.div
                key="instructions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="bg-blue-50 border border-blue-200 rounded-ds-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-blue-800">Transfer Instructions</h3>
                    <div className="flex items-center gap-1 text-blue-600 text-sm">
                      <Clock size={16} />
                      <span>Expires: {formatExpiryTime(bankData.expiresAt)}</span>
                    </div>
                  </div>

                  {/* Bank Details */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-blue-800">Bank Account Details</h4>
                      <button
                        onClick={() => setShowAccountDetails(!showAccountDetails)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {showAccountDetails ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    
                    {showAccountDetails && (
                      <div className="grid grid-cols-2 gap-3 text-sm bg-blue-100 rounded-ds-md p-4">
                        <div>
                          <span className="text-blue-600 font-medium">Account Name:</span>
                          <p className="text-blue-800">{bankData.bankDetails.accountName}</p>
                        </div>
                        <div>
                          <span className="text-blue-600 font-medium">Account Number:</span>
                          <div className="flex items-center gap-2">
                            <p className="text-blue-800 font-mono">{bankData.bankDetails.accountNumber}</p>
                            <button
                              onClick={() => handleCopy(bankData.bankDetails.accountNumber, 'account')}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Copy size={12} />
                            </button>
                          </div>
                        </div>
                        <div>
                          <span className="text-blue-600 font-medium">Bank:</span>
                          <p className="text-blue-800">{bankData.bankDetails.bankName}</p>
                        </div>
                        <div>
                          <span className="text-blue-600 font-medium">Branch:</span>
                          <p className="text-blue-800">{bankData.bankDetails.branchName}</p>
                        </div>
                        <div>
                          <span className="text-blue-600 font-medium">Routing:</span>
                          <div className="flex items-center gap-2">
                            <p className="text-blue-800 font-mono">{bankData.bankDetails.routingNumber}</p>
                            <button
                              onClick={() => handleCopy(bankData.bankDetails.routingNumber, 'routing')}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Copy size={12} />
                            </button>
                          </div>
                        </div>
                        <div>
                          <span className="text-blue-600 font-medium">Swift Code:</span>
                          <p className="text-blue-800">{bankData.bankDetails.swiftCode}</p>
                        </div>
                      </div>
                    )}

                    <div className="bg-blue-200 rounded-ds-md p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-blue-800 font-medium">Reference Number:</span>
                          <p className="text-blue-900 font-mono text-lg">{bankData.referenceNumber}</p>
                        </div>
                        <button
                          onClick={() => handleCopy(bankData.referenceNumber, 'reference')}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-ds-lg p-4">
                  <h4 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
                    <Info size={16} />
                    Important Instructions
                  </h4>
                  <ol className="text-sm text-amber-700 space-y-1">
                    {bankData.instructions.map((instruction, index) => (
                      <li key={index}>{index + 1}. {instruction}</li>
                    ))}
                  </ol>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setStep('receipt_upload')}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    leftIcon={Upload}
                  >
                    I've Made the Transfer
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Receipt Upload */}
            {step === 'receipt_upload' && bankData && (
              <motion.div
                key="receipt_upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-ds-foreground mb-2">
                    Upload Transfer Receipt
                  </h3>
                  <p className="text-ds-muted">
                    Please upload your bank transfer receipt for verification
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-ds-foreground mb-1">
                        Transfer Date <span className="text-ds-danger">*</span>
                      </label>
                      <input
                        type="date"
                        value={receiptForm.transferDate}
                        onChange={(e) => setReceiptForm(prev => ({ ...prev, transferDate: e.target.value }))}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full rounded-ds-md border border-ds-muted/20 bg-ds-background px-3 py-2 text-sm focus:border-ds-primary focus:outline-none focus:ring-2 focus:ring-ds-primary/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ds-foreground mb-1">
                        Transfer Amount <span className="text-ds-danger">*</span>
                      </label>
                      <TextInput
                        type="number"
                        value={receiptForm.transferAmount}
                        onChange={(e) => setReceiptForm(prev => ({ ...prev, transferAmount: e.target.value }))}
                        placeholder="৳0.00"
                        fullWidth
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ds-foreground mb-1">
                      Last 4 digits of your account <span className="text-ds-danger">*</span>
                    </label>
                    <TextInput
                      type="text"
                      maxLength={4}
                      value={receiptForm.fromAccountLastFour}
                      onChange={(e) => setReceiptForm(prev => ({ ...prev, fromAccountLastFour: e.target.value.replace(/\D/g, '') }))}
                      placeholder="1234"
                      fullWidth
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ds-foreground mb-1">
                      Receipt File <span className="text-ds-danger">*</span>
                    </label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-ds-muted/30 rounded-ds-lg p-6 text-center cursor-pointer hover:border-ds-primary/50 transition-colors"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      {receiptForm.receiptFile ? (
                        <div className="space-y-2">
                          <FileText className="mx-auto h-8 w-8 text-green-600" />
                          <p className="text-sm font-medium text-green-800">
                            {receiptForm.receiptFile.name}
                          </p>
                          <p className="text-xs text-green-600">
                            {formatFileSize(receiptForm.receiptFile.size)}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="mx-auto h-8 w-8 text-ds-muted" />
                          <p className="text-sm text-ds-muted">
                            Click to upload receipt (JPG, PNG, PDF)
                          </p>
                          <p className="text-xs text-ds-muted">
                            Max file size: 5MB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleUploadReceipt}
                    disabled={!receiptForm.receiptFile || isUploading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    leftIcon={isUploading ? Loader2 : CheckCircle2}
                  >
                    {isUploading ? 'Uploading...' : 'Submit for Verification'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setStep('instructions')}
                    className="flex-1"
                  >
                    Back
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Verifying */}
            {step === 'verifying' && (
              <motion.div
                key="verifying"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="text-center py-8">
                  <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600 mb-4" />
                  <h3 className="text-lg font-semibold text-ds-foreground mb-2">
                    Verifying Transfer
                  </h3>
                  <p className="text-ds-muted mb-4">
                    Your receipt has been uploaded. We're verifying your transfer.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-ds-lg p-4 text-center">
                    <p className="text-sm text-blue-800">
                      Verification typically takes 1-2 business days
                    </p>
                    {uploadData && (
                      <p className="text-xs text-blue-600 mt-2">
                        Receipt ID: {uploadData.receiptId}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={handleCheckStatus}
                    variant="outline"
                    leftIcon={RefreshCw}
                  >
                    Check Status
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onCancel}
                  >
                    Close
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Completed */}
            {step === 'completed' && verificationData && (
              <motion.div
                key="completed"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8"
              >
                <CheckCircle2 className="mx-auto h-16 w-16 text-green-600 mb-4" />
                <h3 className="text-xl font-bold text-ds-foreground mb-2">
                  Transfer Verified!
                </h3>
                <p className="text-2xl font-bold text-green-600 mb-4">
                  ৳{donation.amount}
                </p>
                
                {verificationData && (
                  <div className="bg-green-50 border border-green-200 rounded-ds-lg p-4 mb-6">
                    <p className="text-sm text-green-800 font-medium mb-2">
                      Verification Details
                    </p>
                    <div className="space-y-1 text-xs text-green-700">
                      <div className="flex justify-between">
                        <span>Reference:</span>
                        <span className="font-mono">{verificationData.referenceNumber}</span>
                      </div>
                      {verificationData.transferDate && (
                        <div className="flex justify-between">
                          <span>Transfer Date:</span>
                          <span>{new Date(verificationData.transferDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      {verificationData.fromAccount && (
                        <div className="flex justify-between">
                          <span>From Account:</span>
                          <span>{verificationData.fromAccount}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Verified:</span>
                        <span>{new Date(verificationData.verificationDate!).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-sm text-ds-muted">
                  Your bank transfer has been verified successfully. Thank you for your donation!
                </p>
              </motion.div>
            )}

            {/* Failed */}
            {step === 'failed' && (
              <motion.div
                key="failed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8"
              >
                <XCircle className="mx-auto h-16 w-16 text-red-600 mb-4" />
                <h3 className="text-xl font-bold text-ds-foreground mb-2">
                  Transfer Failed
                </h3>
                <p className="text-ds-muted mb-6">
                  {error || 'Transfer verification failed'}
                </p>
                
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={handleRetry}
                    leftIcon={RefreshCw}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Try Again
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onCancel}
                  >
                    Go Back
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default BankTransferPayment;