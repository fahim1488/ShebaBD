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

/* ── Payment provider logos ──────────────────────────────────────────────── */
const BkashLogo = () => (
  <svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg" className="h-8 w-auto">
    <rect width="120" height="40" rx="6" fill="#E2136E"/>
    <text x="10" y="27" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="20" fill="white" letterSpacing="-0.5">bKash</text>
    <circle cx="104" cy="20" r="10" fill="white" opacity="0.15"/>
    <path d="M99 20 Q104 13 109 20 Q104 27 99 20Z" fill="white" opacity="0.9"/>
  </svg>
);

const NagadLogo = () => (
  <svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg" className="h-8 w-auto">
    <rect width="120" height="40" rx="6" fill="#F15A24"/>
    <circle cx="20" cy="20" r="12" fill="white" opacity="0.2"/>
    <circle cx="20" cy="20" r="7" fill="white" opacity="0.9"/>
    <circle cx="20" cy="20" r="3" fill="#F15A24"/>
    <text x="38" y="27" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="19" fill="white" letterSpacing="-0.3">nagad</text>
  </svg>
);

const BankLogo = () => (
  <svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg" className="h-8 w-auto">
    <rect width="120" height="40" rx="6" fill="#1A56DB"/>
    {/* building columns */}
    <rect x="10" y="14" width="4" height="14" rx="1" fill="white" opacity="0.9"/>
    <rect x="17" y="14" width="4" height="14" rx="1" fill="white" opacity="0.9"/>
    <rect x="24" y="14" width="4" height="14" rx="1" fill="white" opacity="0.9"/>
    {/* roof */}
    <polygon points="8,14 22,6 36,14" fill="white" opacity="0.9"/>
    {/* base */}
    <rect x="8" y="28" width="26" height="3" rx="1" fill="white" opacity="0.9"/>
    <text x="42" y="27" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="13" fill="white" letterSpacing="0">Bank Transfer</text>
  </svg>
);
import { Button } from '@/components/ui/button';
import { TextInput } from '@/components/ui/input';
import { BkashPayment } from '@/components/payment/BkashPayment';
import { NagadPayment } from '@/components/payment/NagadPayment';
import { BankTransferPayment } from '@/components/payment/BankTransferPayment';
import { DonationConfirmation } from '@/components/common/DonationConfirmation';
import { usePaymentMethods, useDonationForm, useDonations } from '@/hooks/useDonations';
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
  const { paymentMethods, loading: paymentMethodsLoading } = usePaymentMethods();
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
  const availablePaymentMethods = paymentMethods.filter(method => method.is_active);

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
    <div className="min-h-screen bg-ds-background">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-ds-primary/5 via-ds-background to-ds-warning/5 py-14">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="max-w-2xl">
            <span className="mb-3 inline-flex items-center gap-2 rounded-ds-full border border-ds-primary/20 bg-ds-primary/10 px-3 py-1 text-xs font-medium text-ds-primary">
              <HandHeart size={12} /> Donation Platform
            </span>
            <h1 className="font-display text-3xl font-bold text-ds-foreground md:text-4xl">
              Give the Gift of Change
            </h1>
            <p className="mt-3 text-ds-muted">
              100% of your donation reaches verified organisations. Full transparency, AI-powered impact tracking.
            </p>
            <div className="mt-5 flex items-center gap-3 text-sm text-ds-muted">
              <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-ds-primary" />Secure Payment</span>
              <span className="flex items-center gap-1.5"><Zap size={14} className="text-ds-warning" />AI Impact Tracking</span>
              <span className="flex items-center gap-1.5"><Heart size={14} className="text-ds-danger" />Verified Orgs Only</span>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* ── Causes ───────────────────────────────────────────────────────── */}
          <div className="lg:col-span-1 space-y-5">
            <div className="rounded-ds-xl border border-ds-muted/10 bg-ds-surface p-5 shadow-ds-sm">
              <h2 className="font-display text-lg font-bold text-ds-foreground mb-1">Total Raised</h2>
              <p className="font-display text-3xl font-bold text-ds-primary">৳{(totalRaised / 100000).toFixed(1)}L</p>
              <p className="text-xs text-ds-muted mt-1">Across all active causes</p>
            </div>

            <div className="rounded-ds-xl border border-ds-muted/10 bg-ds-surface p-5 shadow-ds-sm space-y-4">
              <h2 className="font-display text-lg font-bold text-ds-foreground">Active Causes</h2>
              {CAUSES.map((cause) => (
                <button
                  key={cause.id}
                  type="button"
                  onClick={() => handleCauseSelect(cause.id)}
                  className={`w-full rounded-ds-lg border p-3 text-left transition-all duration-ds-fast ${
                    form.cause === cause.id 
                      ? cause.color + ' ring-2 ring-current ring-offset-1' 
                      : 'border-ds-muted/10 bg-ds-background hover:border-ds-muted/30'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <cause.icon size={15} />
                    <span className="text-sm font-medium">{cause.label}</span>
                    <span className="ml-auto text-xs opacity-70">{Math.round((cause.raised / cause.goal) * 100)}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-ds-muted/20 overflow-hidden">
                    <div className="h-full rounded-full bg-current" style={{ width: `${(cause.raised / cause.goal) * 100}%` }} />
                  </div>
                  <p className="mt-1.5 text-xs opacity-60">৳{(cause.raised / 1000).toFixed(0)}k of ৳{(cause.goal / 1000).toFixed(0)}k goal</p>
                </button>
              ))}
              {errors.cause && (
                <p className="text-xs text-ds-danger">{errors.cause}</p>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-ds-xl border border-ds-muted/10 bg-ds-surface p-6 shadow-ds-sm md:p-8">
              <h2 className="font-display text-2xl font-bold text-ds-foreground mb-5">Make a Donation</h2>

              {errors.general && (
                <div className="mb-6 flex items-center gap-2 rounded-ds-lg bg-ds-danger/10 border border-ds-danger/20 p-3">
                  <AlertCircle size={16} className="text-ds-danger" />
                  <p className="text-sm text-ds-danger">{errors.general}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Amount selection */}
                <div>
                  <label className="block text-sm font-medium text-ds-foreground mb-2">
                    Donation Amount (৳) <span className="text-ds-danger">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {PRESET_AMOUNTS.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => handleAmountSelect(amt)}
                        className={`rounded-ds-md border py-2.5 text-sm font-semibold transition-colors duration-ds-fast ${
                          form.amount === String(amt) && !customAmount 
                            ? 'border-ds-primary bg-ds-primary text-white' 
                            : 'border-ds-muted/20 bg-ds-background text-ds-foreground hover:border-ds-primary/40'
                        }`}
                      >
                        ৳{amt}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => { setCustomAmount(true); setForm((f) => ({ ...f, amount: '' })); }}
                    className={`w-full rounded-ds-md border py-2 text-sm font-medium transition-colors duration-ds-fast ${
                      customAmount 
                        ? 'border-ds-primary text-ds-primary' 
                        : 'border-ds-muted/20 text-ds-muted hover:border-ds-primary/40'
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
                  {paymentMethodsLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="h-6 w-6 animate-spin text-ds-primary" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {PAYMENT_PROVIDERS.map((provider) => {
                        const method = availablePaymentMethods.find(m => m.provider === provider.provider);
                        const isSelected = form.payment_provider === provider.provider;
                        const isDisabled = !method;
                        
                        return (
                          <button
                            key={provider.provider}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => !isDisabled && handlePaymentMethodSelect(provider.provider)}
                            className={`relative rounded-ds-lg border p-4 text-left transition-all duration-ds-fast ${
                              isSelected
                                ? `${provider.selectedBg} ring-2 ${provider.selectedBorder}`
                                : isDisabled
                                ? 'border-ds-muted/10 bg-ds-muted/5 cursor-not-allowed opacity-40'
                                : `bg-ds-background ${provider.defaultBg}`
                            }`}
                          >
                            {/* Logo */}
                            <div className="mb-3">
                              <provider.Logo />
                            </div>
                            <div>
                              <p className={`text-xs mt-1 ${isSelected ? provider.accentColor : 'text-ds-muted'}`}>
                                {provider.description}
                              </p>
                              {method && (
                                <p className="text-xs text-ds-muted/60 mt-1">
                                  ৳{method.min_amount} – ৳{method.max_amount}
                                </p>
                              )}
                            </div>
                            {isDisabled && (
                              <div className="absolute inset-0 flex items-center justify-center rounded-ds-lg">
                                <span className="text-xs bg-ds-muted/90 text-white px-2 py-1 rounded">
                                  Unavailable
                                </span>
                              </div>
                            )}
                            {isSelected && (
                              <div className={`absolute top-2 right-2 h-2 w-2 rounded-full ${
                                provider.provider === PaymentProvider.BKASH ? 'bg-pink-500' :
                                provider.provider === PaymentProvider.NAGAD ? 'bg-orange-500' : 'bg-blue-500'
                              }`} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
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
