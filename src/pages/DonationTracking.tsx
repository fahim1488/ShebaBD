/**
 * DonationTracking — Real-time status tracking for a specific donation
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Receipt,
  Share2,
  Phone,
  Building2,
  CreditCard,
  Smartphone,
  Heart,
  Calendar,
  Banknote,
  Info,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DonationReceipt } from '@/components/common/DonationReceipt';
import { getDonation, getDonationTransactions } from '@/services/donationApi';
import type { Donation, Transaction } from '@/types/donation';
import {
  DonationStatus,
  PaymentProvider,
  CAUSE_LABELS,
  PAYMENT_PROVIDER_LABELS,
  DONATION_STATUS_LABELS,
} from '@/types/donation';

// Status config with steps for each provider
const PAYMENT_STEPS: Record<PaymentProvider, { id: string; label: string; description: string }[]> = {
  [PaymentProvider.BKASH]: [
    { id: 'initiated', label: 'Payment Initiated', description: 'bKash payment request created' },
    { id: 'pending', label: 'Awaiting Confirmation', description: 'Waiting for bKash mobile confirmation' },
    { id: 'processing', label: 'Processing', description: 'bKash is verifying your payment' },
    { id: 'completed', label: 'Payment Complete', description: 'bKash payment successfully received' },
  ],
  [PaymentProvider.NAGAD]: [
    { id: 'initiated', label: 'Payment Initiated', description: 'Nagad payment request created' },
    { id: 'pending', label: 'Awaiting Confirmation', description: 'Waiting for Nagad mobile confirmation' },
    { id: 'processing', label: 'Processing', description: 'Nagad is verifying your payment' },
    { id: 'completed', label: 'Payment Complete', description: 'Nagad payment successfully received' },
  ],
  [PaymentProvider.BANK]: [
    { id: 'initiated', label: 'Transfer Details Provided', description: 'Bank account details shared with you' },
    { id: 'pending', label: 'Awaiting Transfer', description: 'Waiting for your bank transfer to arrive' },
    { id: 'processing', label: 'Verifying Transfer', description: 'Our team is verifying your bank transfer' },
    { id: 'completed', label: 'Transfer Verified', description: 'Bank transfer received and confirmed' },
  ],
};

// Map donation status → step index
function getStepIndex(status: DonationStatus): number {
  switch (status) {
    case DonationStatus.PENDING: return 0;
    case DonationStatus.PROCESSING: return 2;
    case DonationStatus.COMPLETED: return 3;
    default: return 0;
  }
}

const STATUS_ICON_MAP = {
  [DonationStatus.PENDING]: Clock,
  [DonationStatus.PROCESSING]: Loader2,
  [DonationStatus.COMPLETED]: CheckCircle2,
  [DonationStatus.FAILED]: XCircle,
  [DonationStatus.CANCELLED]: XCircle,
  [DonationStatus.REFUNDED]: AlertTriangle,
};

const STATUS_COLOR_MAP = {
  [DonationStatus.PENDING]: 'text-amber-600',
  [DonationStatus.PROCESSING]: 'text-blue-600',
  [DonationStatus.COMPLETED]: 'text-green-600',
  [DonationStatus.FAILED]: 'text-red-600',
  [DonationStatus.CANCELLED]: 'text-gray-600',
  [DonationStatus.REFUNDED]: 'text-purple-600',
};

const PROVIDER_ICON_MAP = {
  [PaymentProvider.BKASH]: Smartphone,
  [PaymentProvider.NAGAD]: CreditCard,
  [PaymentProvider.BANK]: Building2,
};

const PROVIDER_COLOR_MAP = {
  [PaymentProvider.BKASH]: 'bg-pink-500',
  [PaymentProvider.NAGAD]: 'bg-orange-500',
  [PaymentProvider.BANK]: 'bg-blue-600',
};

// Auto-refresh interval in ms (10 seconds for active, 30 seconds when idle)
const ACTIVE_POLL_INTERVAL = 10_000;
const IDLE_POLL_INTERVAL = 30_000;

export default function DonationTracking() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [donation, setDonation] = useState<Donation | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [copied, setCopied] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchDonation = useCallback(async (silent = false) => {
    if (!id) return;
    if (!silent) setIsRefreshing(true);
    try {
      const [donationData, txData] = await Promise.all([
        getDonation(id),
        getDonationTransactions(id),
      ]);
      setDonation(donationData);
      setTransactions(txData);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load donation');
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  }, [id]);

  // Initial load
  useEffect(() => {
    fetchDonation(false);
  }, [fetchDonation]);

  // Auto-poll based on status
  useEffect(() => {
    if (!autoRefresh) {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }

    const isTerminal =
      donation?.status === DonationStatus.COMPLETED ||
      donation?.status === DonationStatus.FAILED ||
      donation?.status === DonationStatus.CANCELLED;

    if (isTerminal) {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }

    const interval = donation?.status === DonationStatus.PROCESSING
      ? ACTIVE_POLL_INTERVAL
      : IDLE_POLL_INTERVAL;

    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => fetchDonation(true), interval);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [donation?.status, autoRefresh, fetchDonation]);

  const handleManualRefresh = () => {
    fetchDonation(false);
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Donation Tracking',
          text: `Track donation ${donation?.receipt_number}`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Clipboard API may fail in some contexts
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ds-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-ds-primary mb-4" />
          <p className="text-ds-muted">Loading donation details…</p>
        </div>
      </div>
    );
  }

  if (error || !donation) {
    return (
      <div className="min-h-screen bg-ds-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <XCircle className="mx-auto h-14 w-14 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-ds-foreground mb-2">Donation Not Found</h2>
          <p className="text-ds-muted mb-6">{error || 'The donation you are looking for does not exist.'}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate('/donations/history')} variant="outline" leftIcon={ArrowLeft}>
              My Donations
            </Button>
            <Button onClick={() => navigate('/donate')}>
              New Donation
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (showReceipt) {
    return (
      <div className="min-h-screen bg-ds-background py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-6">
            <Button onClick={() => setShowReceipt(false)} variant="outline" leftIcon={ArrowLeft}>
              Back to Tracking
            </Button>
          </div>
          <DonationReceipt
            donation={donation}
            onNewDonation={() => navigate('/donate')}
            showActions
          />
        </div>
      </div>
    );
  }

  const steps = PAYMENT_STEPS[donation.payment_provider];
  const currentStep = getStepIndex(donation.status);
  const isFailed = donation.status === DonationStatus.FAILED || donation.status === DonationStatus.CANCELLED;
  const isCompleted = donation.status === DonationStatus.COMPLETED;
  const isActive = !isCompleted && !isFailed;

  const StatusIcon = STATUS_ICON_MAP[donation.status];
  const ProviderIcon = PROVIDER_ICON_MAP[donation.payment_provider];

  return (
    <div className="min-h-screen bg-ds-background">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Back Nav */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/donations/history')}
            className="flex items-center gap-2 text-ds-muted hover:text-ds-foreground transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm">Back to My Donations</span>
          </button>
        </div>

        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-ds-surface rounded-ds-xl border border-ds-muted/10 p-6 mb-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-ds-foreground mb-1">
                Donation Tracking
              </h1>
              <p className="text-ds-muted text-sm font-mono">{donation.receipt_number}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="p-2 rounded-ds-md text-ds-muted hover:text-ds-foreground hover:bg-ds-muted/10 transition-colors disabled:opacity-50"
                title="Refresh status"
              >
                <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-ds-md text-ds-muted hover:text-ds-foreground hover:bg-ds-muted/10 transition-colors"
                title="Share tracking link"
              >
                <Share2 size={18} />
              </button>
            </div>
          </div>

          {/* Amount + Status Row */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white ${PROVIDER_COLOR_MAP[donation.payment_provider]}`}>
                <ProviderIcon size={22} />
              </div>
              <div>
                <p className="text-3xl font-bold text-ds-foreground">
                  ৳{donation.amount.toLocaleString()}
                </p>
                <p className="text-sm text-ds-muted">{CAUSE_LABELS[donation.cause]}</p>
              </div>
            </div>

            <div className="ml-auto">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm ${
                isCompleted ? 'bg-green-50 border border-green-200 text-green-700' :
                isFailed ? 'bg-red-50 border border-red-200 text-red-700' :
                'bg-blue-50 border border-blue-200 text-blue-700'
              }`}>
                <StatusIcon
                  size={16}
                  className={donation.status === DonationStatus.PROCESSING ? 'animate-spin' : ''}
                />
                {DONATION_STATUS_LABELS[donation.status]}
              </div>
            </div>
          </div>

          {/* Auto-refresh indicator */}
          {isActive && (
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-ds-muted">
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                Auto-refreshing every {donation.status === DonationStatus.PROCESSING ? '10' : '30'}s
                {lastUpdated && ` · Last updated ${lastUpdated.toLocaleTimeString()}`}
              </div>
              <button
                onClick={() => setAutoRefresh(v => !v)}
                className="text-xs text-ds-muted hover:text-ds-foreground underline"
              >
                {autoRefresh ? 'Pause' : 'Resume'} auto-refresh
              </button>
            </div>
          )}

          {isCompleted && lastUpdated && (
            <p className="mt-4 text-xs text-ds-muted">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </motion.div>

        {/* Progress Stepper */}
        {!isFailed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-ds-surface rounded-ds-xl border border-ds-muted/10 p-6 mb-6"
          >
            <h2 className="font-semibold text-ds-foreground mb-6">Payment Progress</h2>
            <div className="relative">
              {/* Connector line */}
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-ds-muted/20" />
              <div
                className="absolute left-5 top-0 w-0.5 bg-ds-primary transition-all duration-700"
                style={{ height: `${(currentStep / (steps.length - 1)) * 100}%` }}
              />

              <div className="space-y-6">
                {steps.map((step, index) => {
                  const isDone = index < currentStep || isCompleted;
                  const isCurrent = index === currentStep && !isCompleted;

                  return (
                    <div key={step.id} className="flex items-start gap-4 relative">
                      {/* Circle */}
                      <div className={`relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                        isDone
                          ? 'bg-ds-primary border-ds-primary'
                          : isCurrent
                          ? 'bg-ds-surface border-ds-primary'
                          : 'bg-ds-surface border-ds-muted/30'
                      }`}>
                        {isDone ? (
                          <CheckCircle2 size={18} className="text-white" />
                        ) : isCurrent ? (
                          <Loader2 size={16} className="text-ds-primary animate-spin" />
                        ) : (
                          <span className="text-xs font-bold text-ds-muted">{index + 1}</span>
                        )}
                      </div>

                      <div className="pt-1.5">
                        <p className={`font-medium ${isDone || isCurrent ? 'text-ds-foreground' : 'text-ds-muted'}`}>
                          {step.label}
                        </p>
                        <p className="text-sm text-ds-muted mt-0.5">{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Failed/Cancelled State */}
        {isFailed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-200 rounded-ds-xl p-6 mb-6 text-center"
          >
            <XCircle className="mx-auto h-12 w-12 text-red-500 mb-3" />
            <h3 className="font-bold text-red-800 text-lg mb-2">
              {donation.status === DonationStatus.CANCELLED ? 'Donation Cancelled' : 'Payment Failed'}
            </h3>
            <p className="text-red-700 mb-4">
              {donation.status === DonationStatus.CANCELLED
                ? 'This donation was cancelled before completion.'
                : 'Your payment could not be processed. No amount was charged.'}
            </p>
            <Button onClick={() => navigate('/donate')}>
              Try Again
            </Button>
          </motion.div>
        )}

        {/* Success Celebration */}
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="bg-green-50 border border-green-200 rounded-ds-xl p-6 mb-6 text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <CheckCircle2 className="mx-auto h-14 w-14 text-green-600 mb-3" />
            </motion.div>
            <h3 className="font-bold text-green-800 text-xl mb-2">Payment Confirmed!</h3>
            <p className="text-green-700 mb-4">
              Your donation of <span className="font-bold">৳{donation.amount.toLocaleString()}</span> has been received. Thank you for your generosity!
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => setShowReceipt(true)}
                variant="outline"
                leftIcon={Receipt}
                className="border-green-300 text-green-700 hover:bg-green-100"
              >
                View Receipt
              </Button>
              <Button onClick={() => navigate('/donate')} leftIcon={Heart}>
                Donate Again
              </Button>
            </div>
          </motion.div>
        )}

        {/* Donation Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-ds-surface rounded-ds-xl border border-ds-muted/10 p-6 mb-6"
        >
          <h2 className="font-semibold text-ds-foreground mb-4">Donation Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar size={16} className="text-ds-muted flex-shrink-0" />
              <div>
                <p className="text-xs text-ds-muted">Date</p>
                <p className="text-sm font-medium text-ds-foreground">
                  {new Date(donation.created_at).toLocaleDateString('en-BD', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Banknote size={16} className="text-ds-muted flex-shrink-0" />
              <div>
                <p className="text-xs text-ds-muted">Amount</p>
                <p className="text-sm font-medium text-ds-foreground">৳{donation.amount.toLocaleString()} BDT</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ProviderIcon size={16} className="text-ds-muted flex-shrink-0" />
              <div>
                <p className="text-xs text-ds-muted">Payment Method</p>
                <p className="text-sm font-medium text-ds-foreground">
                  {PAYMENT_PROVIDER_LABELS[donation.payment_provider]}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Heart size={16} className="text-ds-muted flex-shrink-0" />
              <div>
                <p className="text-xs text-ds-muted">Cause</p>
                <p className="text-sm font-medium text-ds-foreground">{CAUSE_LABELS[donation.cause]}</p>
              </div>
            </div>

            {donation.donor_phone && (
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-ds-muted flex-shrink-0" />
                <div>
                  <p className="text-xs text-ds-muted">Phone</p>
                  <p className="text-sm font-medium text-ds-foreground">{donation.donor_phone}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Info size={16} className="text-ds-muted flex-shrink-0" />
              <div>
                <p className="text-xs text-ds-muted">Receipt #</p>
                <p className="text-sm font-medium text-ds-foreground font-mono">{donation.receipt_number}</p>
              </div>
            </div>
          </div>

          {donation.message && (
            <div className="mt-4 pt-4 border-t border-ds-muted/10">
              <p className="text-xs text-ds-muted mb-1">Your Message</p>
              <p className="text-sm text-ds-foreground italic">"{donation.message}"</p>
            </div>
          )}
        </motion.div>

        {/* Transaction Timeline */}
        {transactions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-ds-surface rounded-ds-xl border border-ds-muted/10 p-6 mb-6"
          >
            <h2 className="font-semibold text-ds-foreground mb-4">Transaction Timeline</h2>
            <div className="space-y-4">
              {transactions.map((tx, index) => (
                <div key={tx.id} className="flex items-start gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    tx.status === 'success' ? 'bg-green-100 text-green-600' :
                    tx.status === 'failed' ? 'bg-red-100 text-red-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {tx.status === 'success' ? (
                      <CheckCircle2 size={14} />
                    ) : tx.status === 'failed' ? (
                      <XCircle size={14} />
                    ) : (
                      <Clock size={14} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-ds-foreground capitalize">
                        {tx.status.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-ds-muted flex-shrink-0 ml-2">
                        {new Date(tx.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    {tx.provider_transaction_id && (
                      <p className="text-xs text-ds-muted font-mono mt-0.5 truncate">
                        TxID: {tx.provider_transaction_id}
                      </p>
                    )}
                    {tx.error_message && (
                      <p className="text-xs text-red-600 mt-0.5">{tx.error_message}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Help / Contact */}
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-amber-50 border border-amber-200 rounded-ds-xl p-5"
          >
            <div className="flex items-start gap-3">
              <Info size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-800 mb-1">Need Help?</h3>
                <p className="text-sm text-amber-700">
                  If your payment is stuck for more than 15 minutes, please contact our support team with your receipt number <span className="font-mono font-bold">{donation.receipt_number}</span>.
                </p>
                <a
                  href="mailto:support@shebabd.org"
                  className="inline-flex items-center gap-1 mt-2 text-sm text-amber-800 font-medium hover:underline"
                >
                  support@shebabd.org
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </motion.div>
        )}

        {/* Copy confirmation */}
        <AnimatePresence>
          {copied && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-ds-foreground text-ds-background px-4 py-2 rounded-full text-sm font-medium shadow-lg"
            >
              Tracking link copied!
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
