/**
 * DonationConfirmation - Donation confirmation and success page component
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Heart,
  Share2,
  ArrowLeft,
  Sparkles,
  Users,
  TrendingUp,
  Calendar,
  Gift,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DonationReceipt } from './DonationReceipt';
import { useDonations } from '@/hooks/useDonations';
import type { 
  Donation,
  DonationCause,
} from '@/types/donation';
import { CAUSE_LABELS } from '@/types/donation';

interface DonationConfirmationProps {
  donation: Donation;
  transactionData?: any;
  onBackToDonations?: () => void;
  onNewDonation?: () => void;
  showSuggestions?: boolean;
}

interface SuggestedAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  action: string;
  color: string;
}

export const DonationConfirmation: React.FC<DonationConfirmationProps> = ({
  donation,
  transactionData,
  onBackToDonations,
  onNewDonation,
  showSuggestions = true,
}) => {
  const [showReceipt, setShowReceipt] = useState<boolean>(false);
  const [celebrationVisible, setCelebrationVisible] = useState<boolean>(true);
  const [shareCount, setShareCount] = useState<number>(0);
  const { donations } = useDonations();
  const navigate = useNavigate();

  // Hide celebration animation after a few seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setCelebrationVisible(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Calculate user's total donations
  const userTotalDonations = donations.length;
  const userTotalAmount = donations.reduce((sum, d) => sum + d.amount, 0);

  const handleShare = () => {
    setShareCount(prev => prev + 1);
  };

  // Suggested actions based on donation
  const suggestedActions: SuggestedAction[] = [
    {
      id: 'share',
      title: 'Share Your Impact',
      description: 'Inspire others to join your cause',
      icon: Share2,
      action: 'Share donation on social media',
      color: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      id: 'monthly',
      title: 'Monthly Giving',
      description: 'Set up recurring donations for bigger impact',
      icon: Calendar,
      action: 'Setup monthly donations',
      color: 'bg-green-50 text-green-600 border-green-200',
    },
    {
      id: 'volunteer',
      title: 'Volunteer With Us',
      description: 'Give your time to multiply your impact',
      icon: Users,
      action: 'Find volunteer opportunities',
      color: 'bg-purple-50 text-purple-600 border-purple-200',
    },
    {
      id: 'gift',
      title: 'Gift a Donation',
      description: 'Donate in honor of someone special',
      icon: Gift,
      action: 'Make a gift donation',
      color: 'bg-pink-50 text-pink-600 border-pink-200',
    },
  ];

  if (showReceipt) {
    return (
      <div className="min-h-screen bg-ds-background py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <Button
              onClick={() => setShowReceipt(false)}
              variant="outline"
              leftIcon={ArrowLeft}
            >
              Back to Confirmation
            </Button>
          </div>
          <DonationReceipt
            donation={donation}
            transactionData={transactionData}
            onNewDonation={onNewDonation}
            onShareSuccess={handleShare}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ds-primary/5 via-ds-background to-ds-success/5">
      {/* Celebration Animation */}
      {celebrationVisible && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute inset-0 flex items-center justify-center">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 1, 
                  scale: 0,
                  x: 0,
                  y: 0,
                }}
                animate={{
                  opacity: [1, 0],
                  scale: [0, 1, 0.5],
                  x: (Math.random() - 0.5) * 400,
                  y: (Math.random() - 0.5) * 400,
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.1,
                  ease: "easeOut",
                }}
                className="absolute"
              >
                <Sparkles className="h-6 w-6 text-ds-primary" />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", duration: 0.6 }}
            className="mx-auto mb-6 h-24 w-24 rounded-full bg-green-100 flex items-center justify-center"
          >
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-display text-3xl md:text-4xl font-bold text-ds-foreground mb-4"
          >
            Thank You for Your Generosity!
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-2"
          >
            <p className="font-display text-2xl md:text-3xl font-bold text-ds-primary">
              ৳{donation.amount.toLocaleString()} Donated
            </p>
            <p className="text-ds-muted">
              to {CAUSE_LABELS[donation.cause as DonationCause]}
            </p>
            <p className="text-sm text-ds-muted">
              Receipt #{donation.receipt_number}
            </p>
          </motion.div>
        </motion.div>

        {/* Impact Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <div className="bg-ds-surface rounded-ds-xl border border-ds-muted/10 p-6 text-center">
            <Heart className="mx-auto h-8 w-8 text-red-500 mb-3" />
            <h3 className="font-semibold text-ds-foreground mb-2">Your Impact</h3>
            <p className="text-sm text-ds-muted">
              Your donation will help provide essential services to those in need
            </p>
          </div>

          <div className="bg-ds-surface rounded-ds-xl border border-ds-muted/10 p-6 text-center">
            <TrendingUp className="mx-auto h-8 w-8 text-green-500 mb-3" />
            <h3 className="font-semibold text-ds-foreground mb-2">Total Donations</h3>
            <p className="text-2xl font-bold text-ds-primary mb-1">{userTotalDonations}</p>
            <p className="text-sm text-ds-muted">
              ৳{userTotalAmount.toLocaleString()} lifetime giving
            </p>
          </div>

          <div className="bg-ds-surface rounded-ds-xl border border-ds-muted/10 p-6 text-center">
            <Users className="mx-auto h-8 w-8 text-blue-500 mb-3" />
            <h3 className="font-semibold text-ds-foreground mb-2">Community</h3>
            <p className="text-sm text-ds-muted">
              Join thousands of donors making Bangladesh better
            </p>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="flex flex-wrap gap-4 justify-center mb-12"
        >
          <Button
            onClick={() => setShowReceipt(true)}
            size="lg"
            className="bg-ds-primary hover:bg-ds-primary/90"
          >
            View Receipt
          </Button>

          <Button
            onClick={() => navigate(`/donations/${donation.id}/track`)}
            size="lg"
            variant="outline"
            leftIcon={Activity}
          >
            Track Donation
          </Button>

          {onNewDonation && (
            <Button
              onClick={onNewDonation}
              size="lg"
              variant="outline"
              leftIcon={Heart}
            >
              Donate Again
            </Button>
          )}

          {onBackToDonations && (
            <Button
              onClick={onBackToDonations}
              size="lg"
              variant="outline"
            >
              View My Donations
            </Button>
          )}
        </motion.div>

        {/* Suggested Actions */}
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="font-display text-xl font-bold text-ds-foreground mb-2">
                Keep the Impact Going
              </h2>
              <p className="text-ds-muted">
                Here are some ways to amplify your contribution
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestedActions.map((action, index) => (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.4 + index * 0.1 }}
                  className={`
                    ${action.color} border rounded-ds-lg p-4 text-left 
                    hover:shadow-md transition-all duration-ds-fast
                    group cursor-pointer
                  `}
                  onClick={() => {
                    // Handle action based on action.id
                    console.log(`Action: ${action.action}`);
                  }}
                >
                  <div className="flex items-start gap-3">
                    <action.icon 
                      size={20} 
                      className="mt-1 group-hover:scale-110 transition-transform duration-ds-fast" 
                    />
                    <div>
                      <h3 className="font-semibold mb-1">{action.title}</h3>
                      <p className="text-sm opacity-80">{action.description}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Thank You Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="mt-12 text-center"
        >
          <div className="bg-ds-surface rounded-ds-xl border border-ds-muted/10 p-8">
            <h3 className="font-display text-lg font-bold text-ds-foreground mb-4">
              From All of Us at ShebaBD
            </h3>
            <p className="text-ds-muted max-w-2xl mx-auto leading-relaxed">
              Your generosity helps us continue our mission to serve communities across Bangladesh. 
              Every donation, no matter the size, creates real change in people's lives. 
              Thank you for being part of our journey toward a better tomorrow.
            </p>
            <div className="mt-6 flex justify-center">
              <div className="flex items-center gap-2 text-ds-primary">
                <Heart size={20} />
                <span className="font-medium">With gratitude</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DonationConfirmation;