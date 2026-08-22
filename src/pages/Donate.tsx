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

/* ── Payment provider logos — local image assets ─────────────────────────── */

const BkashLogo = () => (
  <div className="flex items-center gap-2.5">
    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#E2136E] via-[#D12053] to-[#990033] shadow-md shadow-pink-500/25 ring-1 ring-pink-400/40">
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-white drop-shadow">
        <path d="M2.5 12L12 2.5L21.5 12L12 21.5L2.5 12Z" fill="none" stroke="white" strokeWidth="1.5" opacity="0.3" />
        <path d="M12 3.5L4 12L12 17.5L20 12L12 3.5Z" fill="white" />
        <path d="M12 6.5L7 12L12 15L17 12L12 6.5Z" fill="#E2136E" />
      </svg>
    </div>
    <div className="flex flex-col">
      <div className="flex items-center gap-1.5">
        <span className="font-display text-base font-black tracking-tight text-ds-foreground">
          bKash
        </span>
        <span className="rounded bg-pink-500/10 px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase text-pink-500 border border-pink-500/20">
          Fast Pay
        </span>
      </div>
      <span className="text-[10px] font-medium text-ds-muted">bKash Mobile Wallet</span>
    </div>
  </div>
);

const NagadLogo = () => (
  <div className="flex items-center gap-2.5">
    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F73E1E] via-[#E62E05] to-[#B31D00] shadow-md shadow-orange-500/25 ring-1 ring-orange-400/40">
      <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="currentColor">
        <path d="M12 2C12 2 14.5 5.5 14.5 8C14.5 9.5 13.5 10.5 12 10.5C10.5 10.5 9.5 9.5 9.5 8C9.5 5.5 12 2 12 2Z" fill="white" opacity="0.9"/>
        <path d="M12 7C14.5 10.5 18 12.5 18 16C18 19.31 15.31 22 12 22C8.69 22 6 19.31 6 16C6 12.5 9.5 10.5 12 7Z" fill="white"/>
        <circle cx="12" cy="16" r="3" fill="#E62E05"/>
      </svg>
    </div>
    <div className="flex flex-col">
      <div className="flex items-center gap-1.5">
        <span className="font-display text-base font-black tracking-tight text-ds-foreground">
          Nagad
        </span>
        <span className="rounded bg-orange-500/10 px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase text-orange-500 border border-orange-500/20">
          নগদ
        </span>
      </div>
      <span className="text-[10px] font-medium text-ds-muted">Instant Digital Pay</span>
    </div>
  </div>
);

const BankLogo = () => (
  <div className="flex items-center gap-2.5">
    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1E3A8A] via-[#2563EB] to-[#1D4ED8] shadow-md shadow-blue-500/25 ring-1 ring-blue-400/40">
      <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M12 3L2 8h20l-10-5z" />
      </svg>
    </div>
    <div className="flex flex-col">
      <div className="flex items-center gap-1.5">
        <span className="font-display text-base font-black tracking-tight text-ds-foreground">
          Bank Pay
        </span>
        <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase text-blue-500 border border-blue-500/20">
          EFT / Online
        </span>
      </div>
      <span className="text-[10px] font-medium text-ds-muted">Direct Bank Transfer</span>
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
    name: 'bKash',
    Logo: BkashLogo,
    selectedBorder: 'ring-pink-500',
    selectedBg: 'bg-pink-950/30 border-pink-500/60',
    defaultBg: 'border-ds-muted/20 hover:border-pink-400/50 hover:bg-pink-950/10',
    description: 'Pay with your bKash mobile wallet',
    accentColor: 'text-pink-400',
  },
  {
    provider: PaymentProvider.NAGAD,
    name: 'Nagad',
    Logo: NagadLogo,
    selectedBorder: 'ring-orange-500',
    selectedBg: 'bg-orange-950/30 border-orange-500/60',
    defaultBg: 'border-ds-muted/20 hover:border-orange-400/50 hover:bg-orange-950/10',
    description: 'Pay with your Nagad account',
    accentColor: 'text-orange-400',
  },
  {
    provider: PaymentProvider.BANK,
    name: 'Bank Transfer',
    Logo: BankLogo,
    selectedBorder: 'ring-blue-500',
    selectedBg: 'bg-blue-950/30 border-blue-500/60',
    defaultBg: 'border-ds-muted/20 hover:border-blue-400/50 hover:bg-blue-950/10',
    description: 'Direct bank account transfer',
    accentColor: 'text-blue-400',
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
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {PAYMENT_PROVIDERS.map((provider) => {
                      const isSelected = form.payment_provider === provider.provider;

                      return (
                        <button
                          key={provider.provider}
                          type="button"
                          onClick={() => handlePaymentMethodSelect(provider.provider)}
                          className={`relative rounded-ds-lg border p-4 text-left transition-all duration-200 ${
                            isSelected
                              ? `${provider.selectedBg} ring-2 ${provider.selectedBorder}`
                              : `bg-ds-background ${provider.defaultBg}`
                          }`}
                        >
                          {/* Logo */}
                          <div className="mb-3">
                            <provider.Logo />
                          </div>
                          <p className={`text-xs ${isSelected ? provider.accentColor : 'text-ds-muted'}`}>
                            {provider.description}
                          </p>
                          {/* Selected indicator dot */}
                          {isSelected && (
                            <div className={`absolute top-2 right-2 h-2.5 w-2.5 rounded-full ${
                              provider.provider === PaymentProvider.BKASH ? 'bg-pink-500' :
                              provider.provider === PaymentProvider.NAGAD ? 'bg-orange-500' : 'bg-blue-500'
                            }`} />
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
