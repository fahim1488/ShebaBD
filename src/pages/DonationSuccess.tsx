/**
 * DonationSuccess - Standalone donation success page
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DonationConfirmation } from '@/components/common/DonationConfirmation';
import { useDonation } from '@/hooks/useDonations';
import type { Donation } from '@/types/donation';

export default function DonationSuccess() {
  const { donationId } = useParams<{ donationId: string }>();
  const navigate = useNavigate();
  const { donation, loading, error } = useDonation(donationId || null);
  const [transactionData, setTransactionData] = useState<any>(null);

  useEffect(() => {
    // Try to get transaction data from sessionStorage (if coming from payment flow)
    const storedTransactionData = sessionStorage.getItem(`transaction_${donationId}`);
    if (storedTransactionData) {
      try {
        setTransactionData(JSON.parse(storedTransactionData));
        // Clear the stored data after use
        sessionStorage.removeItem(`transaction_${donationId}`);
      } catch (err) {
        console.error('Failed to parse transaction data:', err);
      }
    }
  }, [donationId]);

  const handleBackHome = () => {
    navigate('/');
  };

  const handleNewDonation = () => {
    navigate('/donate');
  };

  const handleViewDonations = () => {
    navigate('/profile'); // Assuming donations are shown in profile
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ds-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-ds-primary" />
          <h2 className="text-lg font-semibold text-ds-foreground">
            Loading donation details...
          </h2>
          <p className="text-ds-muted">
            Please wait while we fetch your donation information
          </p>
        </div>
      </div>
    );
  }

  if (error || !donation) {
    return (
      <div className="min-h-screen bg-ds-background flex items-center justify-center">
        <div className="max-w-md mx-auto text-center space-y-6">
          <AlertCircle className="mx-auto h-16 w-16 text-red-500" />
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-ds-foreground">
              Donation Not Found
            </h2>
            <p className="text-ds-muted">
              {error || 'We could not find the donation you are looking for.'}
            </p>
          </div>
          <div className="space-y-3">
            <Button
              onClick={handleBackHome}
              leftIcon={ArrowLeft}
              className="w-full"
            >
              Go to Home
            </Button>
            <Button
              onClick={handleNewDonation}
              variant="outline"
              className="w-full"
            >
              Make a Donation
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Check if donation is completed
  if (donation.status !== 'completed') {
    return (
      <div className="min-h-screen bg-ds-background flex items-center justify-center">
        <div className="max-w-md mx-auto text-center space-y-6">
          <AlertCircle className="mx-auto h-16 w-16 text-amber-500" />
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-ds-foreground">
              Donation Pending
            </h2>
            <p className="text-ds-muted">
              This donation is still being processed. Current status: {donation.status}
            </p>
          </div>
          <div className="space-y-3">
            <Button
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Refresh Status
            </Button>
            <Button
              onClick={handleBackHome}
              variant="outline"
              className="w-full"
            >
              Go to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DonationConfirmation
      donation={donation}
      transactionData={transactionData}
      onBackToDonations={handleViewDonations}
      onNewDonation={handleNewDonation}
      showSuggestions={true}
    />
  );
}