/**
 * PaymentProcessor - Handles payment processing flows for different providers
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Copy,
  Upload,
  Clock,
  Shield,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePaymentProcessing } from '@/hooks/useDonations';
import type { 
  Donation, 
  PaymentInitiateResponse,
  Transaction 
} from '@/types/donation';
import {
  PaymentProvider,
  DonationStatus,
} from '@/types/donation';

interface PaymentProcessorProps {
  donation: Donation;
  onSuccess: (donation: Donation) => void;
  onCancel: () => void;
  onError: (error: string) => void;
}

export const PaymentProcessor: React.FC<PaymentProcessorProps> = ({
  donation,
  onSuccess,
  onCancel,
  onError,
}) => {
  const { isProcessing, error, processPayment, verifyPayment } = usePaymentProcessing();
  const [paymentResponse, setPaymentResponse] = useState<PaymentInitiateResponse | null>(null);
  const [step, setStep] = useState<'initiating' | 'processing' | 'verifying' | 'completed' | 'failed'>('initiating');
  const [copied, setCopied] = useState<string | null>(null);

  // Auto-initiate payment when component mounts
  useEffect(() => {
    const initiate = async () => {
      const response = await processPayment(donation.id);
      if (response) {
        setPaymentResponse(response);
        setStep('processing');
      } else {
        setStep('failed');
        onError(error || 'Failed to initiate payment');
      }
    };

    initiate();
  }, [donation.id, processPayment, error, onError]);

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleVerifySuccess = async () => {
    const result = await verifyPayment(donation.id, DonationStatus.COMPLETED);
    if (result) {
      setStep('completed');
      onSuccess(result);
    } else {
      setStep('failed');
      onError(error || 'Payment verification failed');
    }
  };

  const handleVerifyFailure = async () => {
    const result = await verifyPayment(donation.id, DonationStatus.FAILED, 'Payment failed or cancelled by user');
    if (result) {
      setStep('failed');
      onError('Payment was not completed');
    }
  };

  const handleRetry = () => {
    setStep('initiating');
    setPaymentResponse(null);
    window.location.reload(); // Simple retry by reloading
  };

  // Render different UI based on payment provider
  const renderPaymentFlow = () => {
    if (!paymentResponse) return null;

    switch (donation.payment_provider) {
      case PaymentProvider.BKASH:
        return (
          <BkashPaymentFlow 
            response={paymentResponse}
            onCopy={handleCopy}
            copied={copied}
          />
        );
      
      case PaymentProvider.NAGAD:
        return (
          <NagadPaymentFlow 
            response={paymentResponse}
            onCopy={handleCopy}
            copied={copied}
          />
        );
      
      case PaymentProvider.BANK:
        return (
          <BankTransferFlow 
            response={paymentResponse}
            onCopy={handleCopy}
            copied={copied}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-ds-background">
      <div className="mx-auto max-w-4xl px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-ds-xl border border-ds-muted/10 bg-ds-surface p-8 shadow-ds-sm"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl font-bold text-ds-foreground mb-2">
              Complete Your Donation
            </h2>
            <p className="text-ds-muted">
              Donation ID: {donation.id} • Amount: ৳{donation.amount}
            </p>
          </div>

          {/* Payment Flow */}
          {step === 'initiating' && (
            <div className="text-center py-12">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-ds-primary mb-4" />
              <p className="text-ds-muted">Initiating payment...</p>
            </div>
          )}

          {step === 'processing' && paymentResponse && (
            <div className="space-y-6">
              {renderPaymentFlow()}
              
              {/* Action buttons */}
              <div className="flex gap-4 justify-center pt-6 border-t border-ds-muted/20">
                <Button
                  onClick={handleVerifySuccess}
                  leftIcon={CheckCircle2}
                  disabled={isProcessing}
                >
                  I've Completed Payment
                </Button>
                <Button
                  variant="outline"
                  onClick={handleVerifyFailure}
                  leftIcon={XCircle}
                  disabled={isProcessing}
                >
                  Cancel Payment
                </Button>
              </div>
            </div>
          )}

          {step === 'verifying' && (
            <div className="text-center py-12">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-ds-success mb-4" />
              <p className="text-ds-muted">Verifying payment...</p>
            </div>
          )}

          {step === 'failed' && (
            <div className="text-center py-12">
              <XCircle className="mx-auto h-12 w-12 text-ds-danger mb-4" />
              <h3 className="text-lg font-semibold text-ds-foreground mb-2">Payment Failed</h3>
              <p className="text-ds-muted mb-6">{error || 'Something went wrong'}</p>
              <div className="flex gap-4 justify-center">
                <Button onClick={handleRetry} leftIcon={RefreshCw}>
                  Try Again
                </Button>
                <Button variant="outline" onClick={onCancel}>
                  Start Over
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

// bKash payment flow component
const BkashPaymentFlow: React.FC<{
  response: PaymentInitiateResponse;
  onCopy: (text: string, type: string) => void;
  copied: string | null;
}> = ({ response, onCopy, copied }) => (
  <div className="space-y-6">
    <div className="bg-pink-50 border border-pink-200 rounded-ds-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 bg-pink-600 rounded-ds-md flex items-center justify-center text-white font-bold">
          bK
        </div>
        <div>
          <h3 className="font-semibold text-pink-800">bKash Payment</h3>
          <p className="text-sm text-pink-600">Complete payment in bKash app</p>
        </div>
      </div>
      
      {response.payment_url && (
        <div className="space-y-4">
          <Button
            onClick={() => window.open(response.payment_url, '_blank', 'noopener,noreferrer')}
            className="w-full bg-pink-600 hover:bg-pink-700"
            leftIcon={ExternalLink}
          >
            Open bKash Payment
          </Button>
          
          <div className="text-xs text-pink-600 space-y-2">
            <p>Payment ID: {response.provider_transaction_id}</p>
            <button
              onClick={() => onCopy(response.provider_transaction_id, 'payment_id')}
              className="flex items-center gap-1 hover:text-pink-800"
            >
              <Copy size={12} />
              {copied === 'payment_id' ? 'Copied!' : 'Copy ID'}
            </button>
          </div>
        </div>
      )}
    </div>
    
    <div className="bg-blue-50 border border-blue-200 rounded-ds-lg p-4">
      <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
        <Shield size={16} />
        Instructions
      </h4>
      <ol className="text-sm text-blue-700 space-y-1">
        <li>1. Click "Open bKash Payment" above</li>
        <li>2. Enter your bKash PIN</li>
        <li>3. Confirm the payment amount</li>
        <li>4. Return here and click "I've Completed Payment"</li>
      </ol>
    </div>
  </div>
);

// Nagad payment flow component
const NagadPaymentFlow: React.FC<{
  response: PaymentInitiateResponse;
  onCopy: (text: string, type: string) => void;
  copied: string | null;
}> = ({ response, onCopy, copied }) => (
  <div className="space-y-6">
    <div className="bg-orange-50 border border-orange-200 rounded-ds-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 bg-orange-600 rounded-ds-md flex items-center justify-center text-white font-bold">
          N
        </div>
        <div>
          <h3 className="font-semibold text-orange-800">Nagad Payment</h3>
          <p className="text-sm text-orange-600">Complete payment in Nagad app</p>
        </div>
      </div>
      
      {response.payment_url && (
        <div className="space-y-4">
          <Button
            onClick={() => window.open(response.payment_url, '_blank', 'noopener,noreferrer')}
            className="w-full bg-orange-600 hover:bg-orange-700"
            leftIcon={ExternalLink}
          >
            Open Nagad Payment
          </Button>
          
          <div className="text-xs text-orange-600 space-y-2">
            <p>Reference: {response.provider_transaction_id}</p>
            <button
              onClick={() => onCopy(response.provider_transaction_id, 'reference')}
              className="flex items-center gap-1 hover:text-orange-800"
            >
              <Copy size={12} />
              {copied === 'reference' ? 'Copied!' : 'Copy Reference'}
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
);

// Bank transfer flow component
const BankTransferFlow: React.FC<{
  response: PaymentInitiateResponse;
  onCopy: (text: string, type: string) => void;
  copied: string | null;
}> = ({ response, onCopy, copied }) => {
  const bankDetails = response.provider_response.bankDetails;
  const instructions = response.provider_response.instructions || [];

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-ds-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 bg-blue-600 rounded-ds-md flex items-center justify-center text-white">
            🏦
          </div>
          <div>
            <h3 className="font-semibold text-blue-800">Bank Transfer</h3>
            <p className="text-sm text-blue-600">Transfer to the account below</p>
          </div>
        </div>
        
        {bankDetails && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-600">Account Name:</span>
                <p className="font-medium text-blue-800">{bankDetails.accountName}</p>
              </div>
              <div>
                <span className="text-blue-600">Account Number:</span>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-blue-800">{bankDetails.accountNumber}</p>
                  <button
                    onClick={() => onCopy(bankDetails.accountNumber, 'account')}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Copy size={12} />
                  </button>
                </div>
              </div>
              <div>
                <span className="text-blue-600">Bank:</span>
                <p className="font-medium text-blue-800">{bankDetails.bankName}</p>
              </div>
              <div>
                <span className="text-blue-600">Routing:</span>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-blue-800">{bankDetails.routingNumber}</p>
                  <button
                    onClick={() => onCopy(bankDetails.routingNumber, 'routing')}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Copy size={12} />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-100 rounded-ds-md p-3">
              <p className="text-sm text-blue-800">
                <strong>Reference:</strong> {response.provider_transaction_id}
              </p>
              <button
                onClick={() => onCopy(response.provider_transaction_id, 'reference')}
                className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1 mt-1"
              >
                <Copy size={10} />
                {copied === 'reference' ? 'Copied!' : 'Copy reference number'}
              </button>
            </div>
          </div>
        )}
      </div>
      
      {instructions.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-ds-lg p-4">
          <h4 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
            <Clock size={16} />
            Instructions
          </h4>
          <ul className="text-sm text-amber-700 space-y-1">
            {instructions.map((instruction: string, index: number) => (
              <li key={index}>{index + 1}. {instruction}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PaymentProcessor;