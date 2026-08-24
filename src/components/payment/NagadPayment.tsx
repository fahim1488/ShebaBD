/**
 * NagadPayment - Complete Nagad payment flow component
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  ExternalLink,
  Copy,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Clock,
  Shield,
  Smartphone,
  QrCode,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  initiateNagadPayment, 
  verifyNagadPayment, 
  queryNagadPaymentStatus,
  type NagadInitiateResponse,
  type NagadCompleteResponse,
  type NagadVerifyResponse,
} from '@/services/nagadService';
import type { Donation } from '@/types/donation';

interface NagadPaymentProps {
  donation: Donation;
  onSuccess: (transactionData: any) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

type PaymentStep = 
  | 'initiating' 
  | 'redirecting' 
  | 'processing' 
  | 'verifying' 
  | 'completed' 
  | 'failed';

interface PaymentData {
  initiateResponse: NagadInitiateResponse;
  completeResponse: NagadCompleteResponse;
}

export const NagadPayment: React.FC<NagadPaymentProps> = ({
  donation,
  onSuccess,
  onError,
  onCancel,
}) => {
  const [step, setStep] = useState<PaymentStep>('initiating');
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [verificationData, setVerificationData] = useState<NagadVerifyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(1200); // 20 minutes for Nagad

  // Timer for payment expiry
  useEffect(() => {
    if (step === 'redirecting' || step === 'processing') {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setStep('failed');
            setError('Payment session expired. Please try again.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [step]);

  // Auto-initiate payment on mount
  useEffect(() => {
    const initializePayment = async () => {
      try {
        setStep('initiating');
        
        const response = await initiateNagadPayment(
          donation.amount,
          donation.id
        );
        
        setPaymentData(response);
        setStep('redirecting');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize Nagad payment';
        setError(errorMessage);
        setStep('failed');
        onError(errorMessage);
      }
    };

    initializePayment();
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

  const handleOpenNagad = () => {
    if (paymentData?.completeResponse.checkoutURL) {
      window.open(paymentData.completeResponse.checkoutURL, '_blank');
      setStep('processing');
    }
  };

  const handleVerifyPayment = async () => {
    if (!paymentData) return;

    try {
      setStep('verifying');
      const result = await verifyNagadPayment(
        paymentData.initiateResponse.paymentReferenceId,
        paymentData.initiateResponse.challenge
      );
      
      setVerificationData(result);

      if (result.status === 'Success') {
        setStep('completed');
        onSuccess({
          provider: 'nagad',
          paymentReferenceId: result.paymentReferenceId,
          orderId: result.orderId,
          amount: result.amount,
          status: result.status,
          paymentDateTime: result.paymentDateTime,
          issuerPaymentRefNo: result.issuerPaymentRefNo,
          clientMobileNo: result.clientMobileNo,
        });
      } else {
        setStep('failed');
        const failureReason = result.status === 'Cancelled' 
          ? 'Payment was cancelled by user'
          : result.status === 'Aborted'
          ? 'Payment was aborted'
          : 'Payment failed during processing';
        setError(failureReason);
        onError(failureReason);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment verification failed';
      setError(errorMessage);
      setStep('failed');
      onError(errorMessage);
    }
  };

  const handleQueryPayment = async () => {
    if (!paymentData) return;

    try {
      const result = await queryNagadPaymentStatus(
        paymentData.initiateResponse.paymentReferenceId
      );
      
      if (result.status === 'Success') {
        setStep('completed');
        onSuccess({
          provider: 'nagad',
          paymentReferenceId: paymentData.initiateResponse.paymentReferenceId,
          amount: result.amount,
          status: result.status,
          paymentDateTime: result.paymentDateTime,
          issuerPaymentRefNo: result.issuerPaymentRefNo,
          clientMobileNo: result.clientMobileNo,
        });
      } else if (result.status === 'Failed') {
        setStep('failed');
        setError('Payment failed');
      }
    } catch (err) {
      console.error('Query payment failed:', err);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRetry = () => {
    setStep('initiating');
    setPaymentData(null);
    setVerificationData(null);
    setError(null);
    setTimeLeft(1200);
    window.location.reload();
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
                <svg viewBox="0 0 140 44" xmlns="http://www.w3.org/2000/svg" className="h-12 w-auto drop-shadow-md">
                  <rect width="140" height="44" rx="8" fill="#F15A24"/>
                  <circle cx="22" cy="22" r="14" fill="white" opacity="0.2"/>
                  <circle cx="22" cy="22" r="8" fill="white" opacity="0.9"/>
                  <circle cx="22" cy="22" r="3.5" fill="#F15A24"/>
                  <text x="44" y="30" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="21" fill="white" letterSpacing="-0.3">nagad</text>
                </svg>
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-ds-foreground">Nagad Payment</h2>
                <p className="text-sm text-ds-muted">৳{donation.amount} donation</p>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* Initiating Payment */}
            {step === 'initiating' && (
              <motion.div
                key="initiating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-orange-600 mb-4" />
                <h3 className="text-lg font-semibold text-ds-foreground mb-2">
                  Initializing Nagad Payment
                </h3>
                <p className="text-ds-muted">Setting up your payment session...</p>
              </motion.div>
            )}

            {/* Redirecting to Nagad */}
            {step === 'redirecting' && paymentData && (
              <motion.div
                key="redirecting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="bg-orange-50 border border-orange-200 rounded-ds-lg p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-orange-800">Ready for Payment</h3>
                      <div className="flex items-center gap-1 text-orange-600 text-sm">
                        <Clock size={16} />
                        <span>{formatTime(timeLeft)}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-orange-700">
                      Click the button below to open Nagad and complete your payment
                    </p>
                    
                    <Button
                      onClick={handleOpenNagad}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                      leftIcon={ExternalLink}
                      size="lg"
                    >
                      Open Nagad Payment
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ds-muted">Payment Reference:</span>
                    <div className="flex items-center gap-2">
                      <code className="bg-ds-muted/10 px-2 py-1 rounded text-xs">
                        {paymentData.initiateResponse.paymentReferenceId}
                      </code>
                      <button
                        onClick={() => handleCopy(paymentData.initiateResponse.paymentReferenceId, 'reference')}
                        className="text-ds-primary hover:text-ds-primary/80"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ds-muted">Amount:</span>
                    <span className="font-medium">৳{donation.amount}</span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-ds-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                    <Shield size={16} />
                    Payment Steps
                  </h4>
                  <ol className="text-sm text-blue-700 space-y-1">
                    <li>1. Click "Open Nagad Payment" above</li>
                    <li>2. Enter your mobile number</li>
                    <li>3. Enter your Nagad PIN when prompted</li>
                    <li>4. Confirm the payment amount (৳{donation.amount})</li>
                    <li>5. Complete the payment</li>
                    <li>6. Return here to verify payment</li>
                  </ol>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep('processing')}
                    className="flex-1"
                  >
                    I've Opened Nagad
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1"
                  >
                    Cancel Payment
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Processing Payment */}
            {step === 'processing' && paymentData && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="text-center py-8">
                  <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center">
                    <Smartphone className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-ds-foreground mb-2">
                    Complete Payment in Nagad
                  </h3>
                  <p className="text-ds-muted mb-4">
                    Please complete the payment process in Nagad
                  </p>
                  <div className="flex items-center justify-center gap-1 text-orange-600 text-sm">
                    <Clock size={16} />
                    <span>Time remaining: {formatTime(timeLeft)}</span>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-ds-lg p-4 text-center">
                  <AlertTriangle className="mx-auto h-6 w-6 text-amber-600 mb-2" />
                  <p className="text-sm text-amber-800 font-medium">
                    Waiting for payment completion
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    Reference: {paymentData.initiateResponse.paymentReferenceId}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleVerifyPayment}
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                    leftIcon={CheckCircle2}
                  >
                    I've Completed Payment
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleQueryPayment}
                    className="flex-1"
                    leftIcon={RefreshCw}
                  >
                    Check Status
                  </Button>
                </div>

                <Button
                  variant="outline"
                  onClick={onCancel}
                  className="w-full"
                >
                  Cancel & Go Back
                </Button>
              </motion.div>
            )}

            {/* Verifying Payment */}
            {step === 'verifying' && (
              <motion.div
                key="verifying"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-green-600 mb-4" />
                <h3 className="text-lg font-semibold text-ds-foreground mb-2">
                  Verifying Payment
                </h3>
                <p className="text-ds-muted">Confirming your payment with Nagad...</p>
              </motion.div>
            )}

            {/* Payment Completed */}
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
                  Payment Successful!
                </h3>
                <p className="text-2xl font-bold text-green-600 mb-4">
                  ৳{donation.amount}
                </p>
                
                {verificationData.issuerPaymentRefNo && (
                  <div className="bg-green-50 border border-green-200 rounded-ds-lg p-4 mb-6">
                    <p className="text-sm text-green-800 font-medium mb-2">
                      Transaction Details
                    </p>
                    <div className="space-y-1 text-xs text-green-700">
                      <div className="flex justify-between">
                        <span>Transaction Ref:</span>
                        <span className="font-mono">{verificationData.issuerPaymentRefNo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payment Ref:</span>
                        <span className="font-mono">{verificationData.paymentReferenceId}</span>
                      </div>
                      {verificationData.clientMobileNo && (
                        <div className="flex justify-between">
                          <span>From:</span>
                          <span>{verificationData.clientMobileNo}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Time:</span>
                        <span>{new Date(verificationData.paymentDateTime).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-sm text-ds-muted">
                  Your donation has been processed successfully via Nagad. Thank you!
                </p>
              </motion.div>
            )}

            {/* Payment Failed */}
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
                  Payment Failed
                </h3>
                <p className="text-ds-muted mb-6">
                  {error || 'Something went wrong during payment processing'}
                </p>
                
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={handleRetry}
                    leftIcon={RefreshCw}
                    className="bg-orange-600 hover:bg-orange-700"
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

export default NagadPayment;