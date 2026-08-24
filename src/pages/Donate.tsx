import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HandHeart,
  Heart,
  Users,
  BookOpen,
  Stethoscope,
  Home,
  Leaf,
  ShieldCheck,
  Zap,
  Loader2,
  AlertCircle,
} from 'lucide-react';

/* ── Payment provider logos ─────────────────────────────────────────── */

// Official bKash brand colors: #E2136E (magenta pink)
const BkashLogo = () => (
  <div className="flex items-center gap-3">
    {/* bKash official logo — pink circle with stylized "b" mark */}
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E2136E] shadow-lg shadow-[#E2136E]/30">
      <svg viewBox="0 0 40 40" className="h-7 w-7" fill="none">
        {/* Stylized bKash "b" letterform */}
        <path d="M10 8h6v24h-6V8z" fill="white"/>
        <path d="M16 20c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8-8-3.6-8-8z" fill="white" opacity="0.9"/>
        <path d="M16 20c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8-8-3.6-8-8z" fill="#E2136E"/>
        <circle cx="24" cy="20" r="4" fill="white"/>
      </svg>
    </div>
    <div>
      <div className="flex items-center gap-2">
        <span className="text-base font-extrabold tracking-tight text-white">bKash</span>
        <span className="rounded-md bg-[#E2136E]/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-[#f48db4] border border-[#E2136E]/30">
          Mobile MFS
        </span>
      </div>
      <span className="text-[11px] text-slate-400">Bangladesh's #1 Mobile Wallet</span>
    </div>
  </div>
);

// Official Nagad brand colors: #F05A28 (orange-red)
const NagadLogo = () => (
  <div className="flex items-center gap-3">
    {/* Nagad official logo — orange flame/drop mark */}
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F05A28] shadow-lg shadow-[#F05A28]/30">
      <svg viewBox="0 0 40 40" className="h-7 w-7" fill="none">
        {/* Nagad flame/teardrop symbol */}
        <path
          d="M20 6C20 6 26 14 26 20C26 23.3 23.3 26 20 26C16.7 26 14 23.3 14 20C14 14 20 6 20 6Z"
          fill="white"
        />
        <path
          d="M20 16C20 16 23 19.5 23 22C23 23.7 21.7 25 20 25C18.3 25 17 23.7 17 22C17 19.5 20 16 20 16Z"
          fill="#F05A28"
        />
        <path
          d="M15 25C17 28 19 30 20 34C21 30 23 28 25 25"
          stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"
        />
      </svg>
    </div>
    <div>
      <div className="flex items-center gap-2">
        <span className="text-base font-extrabold tracking-tight text-white">নগদ</span>
        <span className="rounded-md bg-[#F05A28]/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-[#fb9270] border border-[#F05A28]/30">
          Instant Pay
        </span>
      </div>
      <span className="text-[11px] text-slate-400">Bangladesh Post Office MFS</span>
    </div>
  </div>
);

// Bank Transfer — professional blue
const BankLogo = () => (
  <div className="flex items-center gap-3">
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#1D4ED8] shadow-lg shadow-[#1D4ED8]/30">
      <svg viewBox="0 0 40 40" className="h-7 w-7" fill="none">
        {/* Classic bank/building icon */}
        <path d="M20 6L6 14h28L20 6z" fill="white"/>
        <rect x="8" y="15" width="3" height="14" rx="1" fill="white"/>
        <rect x="13.5" y="15" width="3" height="14" rx="1" fill="white"/>
        <rect x="19" y="15" width="3" height="14" rx="1" fill="white" opacity="0.7"/>
        <rect x="24.5" y="15" width="3" height="14" rx="1" fill="white"/>
        <rect x="30" y="15" width="3" height="14" rx="1" fill="white"/>
        <rect x="6" y="30" width="28" height="3" rx="1.5" fill="white"/>
      </svg>
    </div>
    <div>
      <div className="flex items-center gap-2">
        <span className="text-base font-extrabold tracking-tight text-white">Bank Transfer</span>
        <span className="rounded-md bg-[#1D4ED8]/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-[#93c5fd] border border-[#1D4ED8]/30">
          EFT / NPSB
        </span>
      </div>
      <span className="text-[11px] text-slate-400">Direct bank account transfer</span>
    </div>
  </div>
);
import { Button } from '@/components/ui/button';
import { TextInput } from '@/components/ui/input';
import { BkashPayment } from '@/components/payment/BkashPayment';
import { NagadPayment } from '@/components/payment/NagadPayment';
import { BankTransferPayment } from '@/components/payment/BankTransferPayment';
import { DonationConfirmation } from '@/components/common/DonationConfirmation';
import { useDonationForm, useDonations } from '@/hooks/useDonations';
import { useAuth } from '@/hooks/useAuth';
import {
  DonationCause,
  PaymentProvider,
  DonationStatus,
  CAUSE_LABELS,
  PRESET_AMOUNTS,
  IMPACT_MESSAGES,
  type DonationFormData,
  type PaymentMethod,
} from '@/types/donation';

import type { Variants } from 'framer-motion';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.4 },
  }),
};

const CAUSES = [
  { 
    id: DonationCause.EDUCATION, 
    label: 'Education', 
    icon: BookOpen, 
    color: 'bg-ds-secondary/10 text-ds-secondary border-ds-secondary/20', 
    raised: 1240000, 
    goal: 2000000,
    description: 'Support education for underprivileged children'
  },
  { 
    id: DonationCause.HEALTHCARE, 
    label: 'Healthcare', 
    icon: Stethoscope, 
    color: 'bg-ds-success/10 text-ds-success border-ds-success/20', 
    raised: 890000, 
    goal: 1500000,
    description: 'Provide medical care to rural communities'
  },
  { 
    id: DonationCause.DISASTER, 
    label: 'Disaster Relief', 
    icon: Home, 
    color: 'bg-ds-warning/10 text-ds-warning border-ds-warning/20', 
    raised: 3200000, 
    goal: 5000000,
    description: 'Emergency aid for flood and cyclone victims'
  },
  { 
    id: DonationCause.ENVIRONMENT, 
    label: 'Environment', 
    icon: Leaf, 
    color: 'bg-green-600/10 text-green-600 border-green-600/20', 
    raised: 450000, 
    goal: 1000000,
    description: 'Climate action and environmental protection'
  },
  { 
    id: DonationCause.POVERTY, 
    label: 'Poverty Relief', 
    icon: Users, 
    color: 'bg-ds-primary/10 text-ds-primary border-ds-primary/20', 
    raised: 2100000, 
    goal: 4000000,
    description: 'Livelihood programs for the poor'
  },
];

const PAYMENT_PROVIDERS = [
  {
    provider: PaymentProvider.BKASH,
    Logo: BkashLogo,
    // selected: deep pink tint + bright pink border
    selectedBg: 'border-[#E2136E] bg-[#E2136E]/10',
    // unselected: subtle dark border, pink on hover
    defaultBg: 'border-white/10 hover:border-[#E2136E]/60 hover:bg-[#E2136E]/5',
  },
  {
    provider: PaymentProvider.NAGAD,
    Logo: NagadLogo,
    selectedBg: 'border-[#F05A28] bg-[#F05A28]/10',
    defaultBg: 'border-white/10 hover:border-[#F05A28]/60 hover:bg-[#F05A28]/5',
  },
  {
    provider: PaymentProvider.BANK,
    Logo: BankLogo,
    selectedBg: 'border-[#1D4ED8] bg-[#1D4ED8]/10',
    defaultBg: 'border-white/10 hover:border-[#1D4ED8]/60 hover:bg-[#1D4ED8]/5',
  },
];

export default function Donate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isSubmitting, errors, success, submitDonation, resetForm } = useDonationForm();
  const { verifyPayment } = useDonations();
  
  const [form, setForm] = useState<DonationFormData>({
    amount: '',
    cause: '',
    donor_name: user?.name || '',
    donor_email: user?.email || '',
    donor_phone: '',
    message: '',
    payment_provider: '',
    is_anonymous: false,
  });
  
  const [customAmount, setCustomAmount] = useState(false);
  const [currentStep, setCurrentStep] = useState<'form' | 'payment' | 'success'>('form');
  const [createdDonation, setCreatedDonation] = useState<any>(null);

  const selectedAmount = parseFloat(form.amount) || 0;
  const impact = IMPACT_MESSAGES[selectedAmount] ?? (selectedAmount > 0 ? `Your ৳${selectedAmount} donation will make a meaningful impact.` : null);

  const handleAmountSelect = (amt: number) => {
    setForm((f) => ({ ...f, amount: String(amt) }));
    setCustomAmount(false);
  };

  const handleCauseSelect = (causeId: DonationCause) => {
    setForm((f) => ({ ...f, cause: causeId }));
  };

  const handlePaymentMethodSelect = (provider: PaymentProvider) => {
    setForm((f) => ({ ...f, payment_provider: provider }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please sign in to make a donation');
      return;
    }

    const donation = await submitDonation({
      amount: selectedAmount,
      cause: form.cause as DonationCause,
      donor_name: form.donor_name,
      donor_email: form.donor_email,
      donor_phone: form.donor_phone || undefined,
      message: form.message || undefined,
      payment_provider: form.payment_provider as PaymentProvider,
      is_anonymous: form.is_anonymous,
    });

    if (donation) {
      setCreatedDonation(donation);
      setCurrentStep('payment');
    }
  };

  const handleNewDonation = () => {
    setCurrentStep('form');
    setCreatedDonation(null);
    setForm({
      amount: '',
      cause: '',
      donor_name: user?.name || '',
      donor_email: user?.email || '',
      donor_phone: '',
      message: '',
      payment_provider: '',
      is_anonymous: false,
    });
    resetForm();
  };

  const handlePaymentSuccess = async (transactionData: any) => {
    if (createdDonation?.id) {
      // Store transaction data for receipt/success view
      sessionStorage.setItem(`transaction_${createdDonation.id}`, JSON.stringify(transactionData));
      try {
        await verifyPayment(createdDonation.id, { status: DonationStatus.COMPLETED });
      } catch (err) {
        console.error('Failed to sync donation status with backend:', err);
      }
    }
    setCurrentStep('success');
  };

  const totalRaised = CAUSES.reduce((s, c) => s + c.raised, 0);

  // Show bKash payment processing
  if (currentStep === 'payment' && createdDonation && form.payment_provider === PaymentProvider.BKASH) {
    return (
      <BkashPayment
        donation={createdDonation}
        onSuccess={(transactionData) => {
          console.log('bKash payment successful:', transactionData);
          handlePaymentSuccess(transactionData);
        }}
        onError={(error) => {
          console.error('bKash payment error:', error);
          setCurrentStep('form');
          resetForm();
          alert(`Payment failed: ${error}`);
        }}
        onCancel={handleNewDonation}
      />
    );
  }

  // Show Nagad payment processing
  if (currentStep === 'payment' && createdDonation && form.payment_provider === PaymentProvider.NAGAD) {
    return (
      <NagadPayment
        donation={createdDonation}
        onSuccess={(transactionData) => {
          console.log('Nagad payment successful:', transactionData);
          handlePaymentSuccess(transactionData);
        }}
        onError={(error) => {
          console.error('Nagad payment error:', error);
          setCurrentStep('form');
          resetForm();
          alert(`Payment failed: ${error}`);
        }}
        onCancel={handleNewDonation}
      />
    );
  }

  // Show Bank Transfer payment processing
  if (currentStep === 'payment' && createdDonation && form.payment_provider === PaymentProvider.BANK) {
    return (
      <BankTransferPayment
        donation={createdDonation}
        onSuccess={(transactionData) => {
          console.log('Bank transfer successful:', transactionData);
          handlePaymentSuccess(transactionData);
        }}
        onError={(error) => {
          console.error('Bank transfer error:', error);
          setCurrentStep('form');
          resetForm();
          alert(`Transfer failed: ${error}`);
        }}
        onCancel={handleNewDonation}
      />
    );
  }

  // Show payment processing page for other providers
  if (currentStep === 'payment' && createdDonation) {
    return (
      <div className="min-h-screen bg-ds-background">
        <div className="mx-auto max-w-4xl px-4 py-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="rounded-ds-xl border border-ds-muted/10 bg-ds-surface p-8 shadow-ds-sm text-center"
          >
            <div className="mb-6">
              <Loader2 className="mx-auto h-16 w-16 animate-spin text-ds-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold text-ds-foreground mb-4">
              Processing Your Donation
            </h2>
            <p className="text-ds-muted mb-6">
              Donation ID: {createdDonation.id}<br />
              Amount: ৳{createdDonation.amount}<br />
              Receipt: {createdDonation.receipt_number}
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => setCurrentStep('success')} variant="outline">
                Mark as Completed
              </Button>
              <Button onClick={handleNewDonation} variant="outline">
                Cancel & Start Over
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Show success page
  if (currentStep === 'success' && createdDonation) {
    // Get stored transaction data
    const storedTransactionData = sessionStorage.getItem(`transaction_${createdDonation.id}`);
    let transactionData = null;
    if (storedTransactionData) {
      try {
        transactionData = JSON.parse(storedTransactionData);
        // Clear the stored data
        sessionStorage.removeItem(`transaction_${createdDonation.id}`);
      } catch (err) {
        console.error('Failed to parse transaction data:', err);
      }
    }

    return (
      <DonationConfirmation
        donation={createdDonation}
        transactionData={transactionData}
        onNewDonation={handleNewDonation}
        onBackToDonations={() => {
          // Navigate to profile or donation history page
          navigate('/donations/history');
        }}
        showSuggestions={true}
      />
    );
  }

  // Main donation form
  return (
    <div style={{ background: '#0B2E22', color: '#F7F1E1' }} className="min-h-screen">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <section 
        style={{ background: 'linear-gradient(135deg, #0B2E22 0%, #0F3A2B 50%, #0B2E22 100%)' }}
        className="py-14 border-b border-[rgba(247,241,225,0.12)]"
      >
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="max-w-2xl">
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#E7A93B]/30 bg-[#E7A93B]/10 px-3.5 py-1 text-xs font-medium text-[#E7A93B] backdrop-blur-md">
              <HandHeart size={12} /> Donation Platform
            </span>
            <h1 className="font-display text-3xl font-bold text-[#F7F1E1] md:text-4xl tracking-tight">
              Give the Gift of Change
            </h1>
            <p className="mt-3 text-[rgba(247,241,225,0.75)] leading-relaxed">
              100% of your donation reaches verified organisations. Full transparency, AI-powered impact tracking.
            </p>
            <div className="mt-5 flex items-center gap-4 text-sm text-[rgba(247,241,225,0.7)]">
              <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-[#3E7A8C]" />Secure Payment</span>
              <span className="flex items-center gap-1.5"><Zap size={14} className="text-[#E7A93B]" />AI Impact Tracking</span>
              <span className="flex items-center gap-1.5"><Heart size={14} className="text-[#D6472C]" />Verified Orgs Only</span>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* ── Causes ───────────────────────────────────────────────────────── */}
          <div className="lg:col-span-1 space-y-5">
            <div style={{ background: '#0F3A2B', borderColor: 'rgba(247,241,225,0.14)' }} className="rounded-2xl border p-5 shadow-xl">
              <h2 className="font-display text-lg font-bold text-[#F7F1E1] mb-1">Total Raised</h2>
              <p className="font-display text-3xl font-bold text-[#E7A93B]">৳{(totalRaised / 100000).toFixed(1)}L</p>
              <p className="text-xs text-[rgba(247,241,225,0.65)] mt-1">Across all active causes</p>
            </div>

            <div style={{ background: '#0F3A2B', borderColor: 'rgba(247,241,225,0.14)' }} className="rounded-2xl border p-5 shadow-xl space-y-4">
              <h2 className="font-display text-lg font-bold text-[#F7F1E1]">Active Causes</h2>
              {CAUSES.map((cause) => (
                <button
                  key={cause.id}
                  type="button"
                  onClick={() => handleCauseSelect(cause.id)}
                  className={`w-full rounded-xl border p-3 text-left transition-all ${
                    form.cause === cause.id 
                      ? 'border-[#D6472C] bg-[#D6472C]/20 text-[#F7F1E1] ring-2 ring-[#D6472C]' 
                      : 'border-[rgba(247,241,225,0.12)] bg-[#0B2E22] hover:border-[#E7A93B] text-[rgba(247,241,225,0.8)]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <cause.icon size={15} />
                    <span className="text-sm font-medium">{cause.label}</span>
                    <span className="ml-auto text-xs opacity-70">{Math.round((cause.raised / cause.goal) * 100)}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[rgba(247,241,225,0.15)] overflow-hidden">
                    <div className="h-full rounded-full bg-[#E7A93B]" style={{ width: `${(cause.raised / cause.goal) * 100}%` }} />
                  </div>
                  <p className="mt-1.5 text-xs opacity-60">৳{(cause.raised / 1000).toFixed(0)}k of ৳{(cause.goal / 1000).toFixed(0)}k goal</p>
                </button>
              ))}
              {errors.cause && (
                <p className="text-xs text-red-400">{errors.cause}</p>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div style={{ background: '#0F3A2B', borderColor: 'rgba(247,241,225,0.14)' }} className="rounded-2xl border p-6 shadow-xl md:p-8">
              <h2 className="font-display text-2xl font-bold text-[#F7F1E1] mb-5">Make a Donation</h2>

              {errors.general && (
                <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3.5">
                  <AlertCircle size={16} className="text-red-400" />
                  <p className="text-sm text-red-200">{errors.general}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Amount selection */}
                <div>
                  <label className="block text-sm font-medium text-[#F7F1E1] mb-2">
                    Donation Amount (৳) <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {PRESET_AMOUNTS.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => handleAmountSelect(amt)}
                        className={`rounded-xl border py-2.5 text-sm font-semibold transition-colors ${
                          form.amount === String(amt) && !customAmount 
                            ? 'border-[#D6472C] bg-[#D6472C] text-white shadow-md' 
                            : 'border-[rgba(247,241,225,0.15)] bg-[#0B2E22] text-[#F7F1E1] hover:border-[#E7A93B]'
                        }`}
                      >
                        ৳{amt}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => { setCustomAmount(true); setForm((f) => ({ ...f, amount: '' })); }}
                    className={`w-full rounded-xl border py-2 text-sm font-medium transition-colors ${
                      customAmount 
                        ? 'border-[#E7A93B] text-[#E7A93B] bg-[#E7A93B]/10' 
                        : 'border-[rgba(247,241,225,0.15)] text-[rgba(247,241,225,0.7)] hover:border-[#E7A93B]'
                    }`}
                  >
                    Enter custom amount
                  </button>
                  {customAmount && (
                    <TextInput
                      className="mt-2"
                      placeholder="Enter amount in ৳"
                      type="number"
                      required
                      fullWidth
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    />
                  )}
                  {errors.amount && (
                    <p className="mt-1 text-xs text-ds-danger">{errors.amount}</p>
                  )}
                </div>

                {/* AI impact preview */}
                {impact && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    className="flex items-start gap-3 rounded-ds-lg bg-ds-primary/5 border border-ds-primary/20 p-3"
                  >
                    <Zap size={16} className="text-ds-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-ds-primary">AI Impact Estimate</p>
                      <p className="text-xs text-ds-muted mt-0.5">{impact}</p>
                    </div>
                  </motion.div>
                )}

                {/* Payment Method Selection */}
                <div>
                  <label className="block text-sm font-medium text-ds-foreground mb-2">
                    Payment Method <span className="text-ds-danger">*</span>
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {PAYMENT_PROVIDERS.map((provider) => {
                      const isSelected = form.payment_provider === provider.provider;
                      const isDisabled = isSubmitting;

                      return (
                        <button
                          key={provider.provider}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => !isDisabled && handlePaymentMethodSelect(provider.provider)}
                          className={`relative w-full rounded-xl border-2 px-5 py-4 text-left transition-all duration-150
                            ${isSelected ? provider.selectedBg : `bg-[#0B2E22] ${provider.defaultBg}`}
                            ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                          `}
                        >
                          <provider.Logo />

                          {/* Tick indicator when selected */}
                          {isSelected && (
                            <div className={`absolute right-4 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full ${
                              provider.provider === PaymentProvider.BKASH ? 'bg-[#E2136E]' :
                              provider.provider === PaymentProvider.NAGAD ? 'bg-[#F05A28]' : 'bg-[#1D4ED8]'
                            }`}>
                              <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" fill="none">
                                <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {errors.payment_provider && (
                    <p className="mt-1 text-xs text-ds-danger">{errors.payment_provider}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <TextInput 
                      label="Full Name" 
                      placeholder="Your full name" 
                      required 
                      fullWidth 
                      value={form.donor_name} 
                      onChange={(e) => setForm({ ...form, donor_name: e.target.value })}
                    />
                    {errors.donor_name && (
                      <p className="mt-1 text-xs text-ds-danger">{errors.donor_name}</p>
                    )}
                  </div>
                  <div>
                    <TextInput 
                      label="Email Address" 
                      placeholder="you@example.com" 
                      type="email" 
                      required 
                      fullWidth 
                      value={form.donor_email} 
                      onChange={(e) => setForm({ ...form, donor_email: e.target.value })}
                    />
                    {errors.donor_email && (
                      <p className="mt-1 text-xs text-ds-danger">{errors.donor_email}</p>
                    )}
                  </div>
                </div>
                
                <TextInput 
                  label="Phone (optional)" 
                  placeholder="+880 1XXX-XXXXXX" 
                  type="tel" 
                  fullWidth 
                  value={form.donor_phone} 
                  onChange={(e) => setForm({ ...form, donor_phone: e.target.value })}
                />

                <div>
                  <label className="block text-sm font-medium text-ds-foreground mb-2">
                    Message (optional)
                  </label>
                  <textarea
                    className="w-full rounded-ds-md border border-ds-muted/20 bg-ds-background px-3 py-2 text-sm focus:border-ds-primary focus:outline-none focus:ring-2 focus:ring-ds-primary/20"
                    placeholder="Leave a message with your donation"
                    rows={3}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={form.is_anonymous}
                    onChange={(e) => setForm({ ...form, is_anonymous: e.target.checked })}
                    className="rounded border-ds-muted/20 text-ds-primary focus:ring-ds-primary/20"
                  />
                  <label htmlFor="anonymous" className="text-sm text-ds-muted">
                    Make this donation anonymous
                  </label>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  fullWidth
                  leftIcon={isSubmitting ? Loader2 : HandHeart}
                  disabled={isSubmitting || !user}
                  className={isSubmitting ? 'animate-spin-icon' : ''}
                >
                  {isSubmitting 
                    ? 'Processing...' 
                    : !user 
                    ? 'Sign in to Donate' 
                    : `Donate ৳${form.amount || '0'} Now`
                  }
                </Button>

                <p className="text-xs text-center text-ds-muted">
                  <ShieldCheck size={11} className="inline mr-1 text-ds-primary" />
                  Your donation is secure and 100% reaches verified organisations.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
/* Fahim: Improved donation user experience */ 
