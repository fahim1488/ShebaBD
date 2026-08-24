/**
 * DonationReceipt - Donation receipt and confirmation component
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Download,
  Share2,
  Copy,
  Mail,
  Calendar,
  CreditCard,
  Receipt,
  Heart,
  Building2,
  Phone,
  MapPin,
  Globe,
  Printer,
  FileText,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { 
  Donation, 
  PaymentProvider, 
  DonationCause,
} from '@/types/donation';
import {
  CAUSE_LABELS,
  PAYMENT_PROVIDER_LABELS,
  IMPACT_MESSAGES,
} from '@/types/donation';

interface DonationReceiptProps {
  donation: Donation;
  transactionData?: any;
  onNewDonation?: () => void;
  onShareSuccess?: () => void;
  showActions?: boolean;
}

export const DonationReceipt: React.FC<DonationReceiptProps> = ({
  donation,
  transactionData,
  onNewDonation,
  onShareSuccess,
  showActions = true,
}) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState<boolean>(false);

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const shareData = {
        title: 'ShebaBD Donation Receipt',
        text: `I just donated ৳${donation.amount} to ${CAUSE_LABELS[donation.cause as DonationCause]} through ShebaBD. Join me in making a difference!`,
        url: window.location.origin,
      };

      if (navigator.share) {
        await navigator.share(shareData);
        onShareSuccess?.();
      } else {
        // Fallback to copying link
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        alert('Share text copied to clipboard!');
        onShareSuccess?.();
      }
    } catch (err) {
      console.error('Sharing failed:', err);
    } finally {
      setIsSharing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // In a real implementation, this would generate a PDF
    alert('PDF download would be implemented here');
  };

  const handleEmailReceipt = () => {
    const subject = `Donation Receipt - ${donation.receipt_number}`;
    const body = `Dear ${donation.donor_name},

Thank you for your generous donation of ৳${donation.amount} to ${CAUSE_LABELS[donation.cause as DonationCause]}.

Receipt Number: ${donation.receipt_number}
Date: ${new Date(donation.created_at).toLocaleDateString()}
Amount: ৳${donation.amount}
Payment Method: ${PAYMENT_PROVIDER_LABELS[donation.payment_provider as PaymentProvider]}

Your contribution makes a real difference in our community.

Best regards,
ShebaBD Team`;

    window.open(`mailto:${donation.donor_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const impactMessage = IMPACT_MESSAGES[donation.amount] || `Your ৳${donation.amount} donation will make a meaningful impact in our community.`;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Print-friendly styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
        }
        .print-only { display: none; }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-ds-xl border border-ds-muted/10 shadow-ds-lg overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-ds-primary to-ds-secondary p-6 text-white">
          <div className="text-center">
            <CheckCircle2 className="mx-auto h-16 w-16 mb-4" />
            <h1 className="font-display text-2xl font-bold mb-2">
              Thank You for Your Donation!
            </h1>
            <p className="text-ds-primary-foreground/80">
              Your generosity makes a real difference
            </p>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="p-8 space-y-8">
          {/* Organization Info */}
          <div className="text-center border-b border-ds-muted/10 pb-6">
            <h2 className="font-display text-xl font-bold text-ds-foreground mb-2">
              ShebaBD Foundation
            </h2>
            <div className="text-sm text-ds-muted space-y-1">
              <div className="flex items-center justify-center gap-2">
                <MapPin size={14} />
                <span>Dhaka, Bangladesh</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Phone size={14} />
                <span>+880 1XXX-XXXXXX</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Globe size={14} />
                <span>www.shebabd.org</span>
              </div>
            </div>
          </div>

          {/* Receipt Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-ds-muted">Receipt Number</label>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-lg font-bold text-ds-foreground">
                    {donation.receipt_number}
                  </p>
                  <button
                    onClick={() => handleCopy(donation.receipt_number || '', 'receipt')}
                    className="text-ds-primary hover:text-ds-primary/80 no-print"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-ds-muted">Donation Date</label>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-ds-muted" />
                  <p className="text-ds-foreground">
                    {new Date(donation.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-ds-muted">Payment Method</label>
                <div className="flex items-center gap-2">
                  <CreditCard size={16} className="text-ds-muted" />
                  <p className="text-ds-foreground">
                    {PAYMENT_PROVIDER_LABELS[donation.payment_provider as PaymentProvider]}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-ds-muted">Donor Information</label>
                <div className="bg-ds-muted/5 rounded-ds-lg p-4 space-y-2">
                  <p className="font-medium text-ds-foreground">{donation.donor_name}</p>
                  <p className="text-sm text-ds-muted">{donation.donor_email}</p>
                  {donation.donor_phone && (
                    <p className="text-sm text-ds-muted">{donation.donor_phone}</p>
                  )}
                  {donation.is_anonymous && (
                    <div className="flex items-center gap-1 text-xs text-ds-warning">
                      <Star size={12} />
                      <span>Anonymous Donation</span>
                    </div>
                  )}
                </div>
              </div>

              {transactionData && (
                <div>
                  <label className="text-sm font-medium text-ds-muted">Transaction Details</label>
                  <div className="bg-ds-muted/5 rounded-ds-lg p-4 space-y-1">
                    {transactionData.transactionId && (
                      <div className="flex justify-between text-sm">
                        <span>Transaction ID:</span>
                        <span className="font-mono">{transactionData.transactionId}</span>
                      </div>
                    )}
                    {transactionData.paymentId && (
                      <div className="flex justify-between text-sm">
                        <span>Payment ID:</span>
                        <span className="font-mono">{transactionData.paymentId}</span>
                      </div>
                    )}
                    {transactionData.referenceNumber && (
                      <div className="flex justify-between text-sm">
                        <span>Reference:</span>
                        <span className="font-mono">{transactionData.referenceNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Amount and Cause */}
          <div className="border border-ds-primary/20 rounded-ds-lg p-6 bg-ds-primary/5">
            <div className="text-center space-y-4">
              <div>
                <label className="text-sm font-medium text-ds-muted">Donation Amount</label>
                <p className="font-display text-4xl font-bold text-ds-primary">
                  ৳{donation.amount.toLocaleString()}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-ds-muted">Cause</label>
                <p className="text-xl font-semibold text-ds-foreground">
                  {CAUSE_LABELS[donation.cause as DonationCause]}
                </p>
              </div>

              {donation.message && (
                <div>
                  <label className="text-sm font-medium text-ds-muted">Message</label>
                  <p className="text-ds-foreground italic">"{donation.message}"</p>
                </div>
              )}
            </div>
          </div>

          {/* Impact Message */}
          <div className="bg-green-50 border border-green-200 rounded-ds-lg p-6">
            <div className="flex items-start gap-3">
              <Heart className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-green-800 mb-2">Your Impact</h3>
                <p className="text-green-700">{impactMessage}</p>
              </div>
            </div>
          </div>

          {/* Tax Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-ds-lg p-4">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <h4 className="font-medium text-blue-800 mb-1">Tax Information</h4>
                <p className="text-blue-700">
                  ShebaBD Foundation is a registered non-profit organization. 
                  This receipt can be used for tax deduction purposes as per local tax laws. 
                  Please consult your tax advisor for specific guidance.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-6 border-t border-ds-muted/10">
            <p className="text-sm text-ds-muted mb-2">
              Thank you for supporting our mission to serve Bangladesh
            </p>
            <p className="text-xs text-ds-muted">
              Generated on {new Date().toLocaleString()} | Receipt #{donation.receipt_number}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="px-8 pb-8 no-print">
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                onClick={handlePrint}
                variant="outline"
                leftIcon={Printer}
                size="sm"
              >
                Print Receipt
              </Button>
              
              <Button
                onClick={handleDownloadPDF}
                variant="outline"
                leftIcon={Download}
                size="sm"
              >
                Download PDF
              </Button>
              
              <Button
                onClick={handleEmailReceipt}
                variant="outline"
                leftIcon={Mail}
                size="sm"
              >
                Email Receipt
              </Button>
              
              <Button
                onClick={handleShare}
                disabled={isSharing}
                variant="outline"
                leftIcon={Share2}
                size="sm"
              >
                Share
              </Button>

              {onNewDonation && (
                <Button
                  onClick={onNewDonation}
                  leftIcon={Heart}
                  size="sm"
                  className="bg-ds-primary hover:bg-ds-primary/90"
                >
                  Donate Again
                </Button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DonationReceipt;