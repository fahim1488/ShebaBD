/**
 * DonationHistory - User donation history and management page
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Filter,
  Search,
  Download,
  Eye,
  Heart,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Receipt,
  RefreshCw,
  BookOpen,
  Stethoscope,
  Home,
  Leaf,
  Users,
  CreditCard,
  Building2,
  Smartphone,
  ArrowUpDown,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TextInput } from '@/components/ui/input';
import { DonationReceipt } from '@/components/common/DonationReceipt';
import { useDonations } from '@/hooks/useDonations';
import { useAuth } from '@/hooks/useAuth';
import {
  DonationStatus,
  DonationCause,
  PaymentProvider,
  CAUSE_LABELS,
  PAYMENT_PROVIDER_LABELS,
  DONATION_STATUS_LABELS,
  type Donation,
  type DonationFilters,
} from '@/types/donation';

// Status color mapping
const STATUS_COLORS = {
  [DonationStatus.PENDING]: 'text-amber-600 bg-amber-50 border-amber-200',
  [DonationStatus.PROCESSING]: 'text-blue-600 bg-blue-50 border-blue-200',
  [DonationStatus.COMPLETED]: 'text-green-600 bg-green-50 border-green-200',
  [DonationStatus.FAILED]: 'text-red-600 bg-red-50 border-red-200',
  [DonationStatus.CANCELLED]: 'text-gray-600 bg-gray-50 border-gray-200',
  [DonationStatus.REFUNDED]: 'text-purple-600 bg-purple-50 border-purple-200',
};

const STATUS_ICONS = {
  [DonationStatus.PENDING]: Clock,
  [DonationStatus.PROCESSING]: Loader2,
  [DonationStatus.COMPLETED]: CheckCircle2,
  [DonationStatus.FAILED]: XCircle,
  [DonationStatus.CANCELLED]: XCircle,
  [DonationStatus.REFUNDED]: AlertTriangle,
};

const CAUSE_ICONS = {
  [DonationCause.EDUCATION]: BookOpen,
  [DonationCause.HEALTHCARE]: Stethoscope,
  [DonationCause.DISASTER]: Home,
  [DonationCause.ENVIRONMENT]: Leaf,
  [DonationCause.POVERTY]: Users,
};

const PAYMENT_ICONS = {
  [PaymentProvider.BKASH]: Smartphone,
  [PaymentProvider.NAGAD]: CreditCard,
  [PaymentProvider.BANK]: Building2,
};

type SortField = 'created_at' | 'amount' | 'status';
type SortOrder = 'asc' | 'desc';

export default function DonationHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { donations, loading, error, refetch } = useDonations();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<DonationStatus | ''>('');
  const [selectedCause, setSelectedCause] = useState<DonationCause | ''>('');
  const [selectedPaymentProvider, setSelectedPaymentProvider] = useState<PaymentProvider | ''>('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Filter and sort donations
  const filteredAndSortedDonations = useMemo(() => {
    let filtered = donations.filter(donation => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          donation.receipt_number?.toLowerCase().includes(searchLower) ||
          donation.donor_name.toLowerCase().includes(searchLower) ||
          CAUSE_LABELS[donation.cause].toLowerCase().includes(searchLower) ||
          donation.message?.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Status filter
      if (selectedStatus && donation.status !== selectedStatus) return false;

      // Cause filter
      if (selectedCause && donation.cause !== selectedCause) return false;

      // Payment provider filter
      if (selectedPaymentProvider && donation.payment_provider !== selectedPaymentProvider) return false;

      // Date range filter
      if (dateRange.start || dateRange.end) {
        const donationDate = new Date(donation.created_at).toISOString().split('T')[0];
        if (dateRange.start && donationDate < dateRange.start) return false;
        if (dateRange.end && donationDate > dateRange.end) return false;
      }

      return true;
    });

    // Sort donations
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [donations, searchTerm, selectedStatus, selectedCause, selectedPaymentProvider, dateRange, sortField, sortOrder]);

  // Calculate statistics
  const stats = useMemo(() => {
    const completedDonations = donations.filter(d => d.status === DonationStatus.COMPLETED);
    const totalAmount = completedDonations.reduce((sum, d) => sum + d.amount, 0);
    const totalDonations = donations.length;
    const completedCount = completedDonations.length;

    return {
      totalDonations,
      completedCount,
      totalAmount,
      averageAmount: completedCount > 0 ? totalAmount / completedCount : 0,
    };
  }, [donations]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setSelectedCause('');
    setSelectedPaymentProvider('');
    setDateRange({ start: '', end: '' });
  };

  const handleViewReceipt = (donation: Donation) => {
    setSelectedDonation(donation);
  };

  const handleTrackDonation = (donationId: string) => {
    navigate(`/donations/${donationId}/track`);
  };

  const handleNewDonation = () => {
    navigate('/donate');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-ds-background flex items-center justify-center">
        <div className="text-center">
          <Heart className="mx-auto h-16 w-16 text-ds-muted mb-4" />
          <h2 className="text-xl font-bold text-ds-foreground mb-2">Sign In Required</h2>
          <p className="text-ds-muted mb-6">Please sign in to view your donation history</p>
          <Button onClick={() => navigate('/signin')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  // Show receipt modal
  if (selectedDonation) {
    return (
      <div className="min-h-screen bg-ds-background py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <Button
              onClick={() => setSelectedDonation(null)}
              variant="outline"
              leftIcon={ArrowUpDown}
            >
              Back to History
            </Button>
          </div>
          <DonationReceipt
            donation={selectedDonation}
            onNewDonation={() => {
              setSelectedDonation(null);
              handleNewDonation();
            }}
            showActions={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ds-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display text-3xl font-bold text-ds-foreground">
                My Donations
              </h1>
              <p className="text-ds-muted mt-2">
                Track your contribution history and impact
              </p>
            </div>
            <Button
              onClick={handleNewDonation}
              leftIcon={Plus}
              className="bg-ds-primary hover:bg-ds-primary/90"
            >
              Make New Donation
            </Button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-ds-surface rounded-ds-lg border border-ds-muted/10 p-4">
              <div className="flex items-center gap-3">
                <Heart className="h-8 w-8 text-ds-primary" />
                <div>
                  <p className="text-2xl font-bold text-ds-foreground">
                    {stats.totalDonations}
                  </p>
                  <p className="text-sm text-ds-muted">Total Donations</p>
                </div>
              </div>
            </div>

            <div className="bg-ds-surface rounded-ds-lg border border-ds-muted/10 p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-ds-foreground">
                    {stats.completedCount}
                  </p>
                  <p className="text-sm text-ds-muted">Completed</p>
                </div>
              </div>
            </div>

            <div className="bg-ds-surface rounded-ds-lg border border-ds-muted/10 p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-ds-success" />
                <div>
                  <p className="text-2xl font-bold text-ds-foreground">
                    ৳{stats.totalAmount.toLocaleString()}
                  </p>
                  <p className="text-sm text-ds-muted">Total Given</p>
                </div>
              </div>
            </div>

            <div className="bg-ds-surface rounded-ds-lg border border-ds-muted/10 p-4">
              <div className="flex items-center gap-3">
                <Receipt className="h-8 w-8 text-ds-secondary" />
                <div>
                  <p className="text-2xl font-bold text-ds-foreground">
                    ৳{Math.round(stats.averageAmount).toLocaleString()}
                  </p>
                  <p className="text-sm text-ds-muted">Average</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-ds-surface rounded-ds-lg border border-ds-muted/10 p-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <TextInput
                  placeholder="Search by receipt number, name, or cause..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  prefixIcon={Search}
                  fullWidth
                />
              </div>
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                leftIcon={Filter}
              >
                Filters
              </Button>
              <Button
                onClick={refetch}
                variant="outline"
                leftIcon={RefreshCw}
              >
                Refresh
              </Button>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-ds-muted/10 pt-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-ds-foreground mb-1">
                        Status
                      </label>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value as DonationStatus)}
                        className="w-full rounded-ds-md border border-ds-muted/20 bg-ds-background px-3 py-2 text-sm focus:border-ds-primary focus:outline-none focus:ring-2 focus:ring-ds-primary/20"
                      >
                        <option value="">All Statuses</option>
                        {Object.values(DonationStatus).map(status => (
                          <option key={status} value={status}>
                            {DONATION_STATUS_LABELS[status]}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-ds-foreground mb-1">
                        Cause
                      </label>
                      <select
                        value={selectedCause}
                        onChange={(e) => setSelectedCause(e.target.value as DonationCause)}
                        className="w-full rounded-ds-md border border-ds-muted/20 bg-ds-background px-3 py-2 text-sm focus:border-ds-primary focus:outline-none focus:ring-2 focus:ring-ds-primary/20"
                      >
                        <option value="">All Causes</option>
                        {Object.entries(CAUSE_LABELS).map(([cause, label]) => (
                          <option key={cause} value={cause}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-ds-foreground mb-1">
                        Payment Method
                      </label>
                      <select
                        value={selectedPaymentProvider}
                        onChange={(e) => setSelectedPaymentProvider(e.target.value as PaymentProvider)}
                        className="w-full rounded-ds-md border border-ds-muted/20 bg-ds-background px-3 py-2 text-sm focus:border-ds-primary focus:outline-none focus:ring-2 focus:ring-ds-primary/20"
                      >
                        <option value="">All Methods</option>
                        {Object.entries(PAYMENT_PROVIDER_LABELS).map(([provider, label]) => (
                          <option key={provider} value={provider}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-ds-foreground mb-1">
                        From Date
                      </label>
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                        className="w-full rounded-ds-md border border-ds-muted/20 bg-ds-background px-3 py-2 text-sm focus:border-ds-primary focus:outline-none focus:ring-2 focus:ring-ds-primary/20"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-ds-foreground mb-1">
                        To Date
                      </label>
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                        className="w-full rounded-ds-md border border-ds-muted/20 bg-ds-background px-3 py-2 text-sm focus:border-ds-primary focus:outline-none focus:ring-2 focus:ring-ds-primary/20"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mt-4">
                    <Button
                      onClick={clearFilters}
                      variant="outline"
                      size="sm"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-ds-primary mb-4" />
            <p className="text-ds-muted">Loading your donations...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-ds-lg p-6 text-center">
            <XCircle className="mx-auto h-8 w-8 text-red-600 mb-4" />
            <h3 className="font-semibold text-red-800 mb-2">Failed to Load Donations</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <Button onClick={refetch} variant="outline">
              Try Again
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredAndSortedDonations.length === 0 && (
          <div className="text-center py-12">
            <Heart className="mx-auto h-16 w-16 text-ds-muted mb-4" />
            <h3 className="font-semibold text-ds-foreground mb-2">
              {donations.length === 0 ? 'No Donations Yet' : 'No Matching Donations'}
            </h3>
            <p className="text-ds-muted mb-6">
              {donations.length === 0 
                ? 'Start making a difference today with your first donation'
                : 'Try adjusting your search or filter criteria'
              }
            </p>
            <div className="flex gap-3 justify-center">
              {donations.length === 0 ? (
                <Button onClick={handleNewDonation} leftIcon={Plus}>
                  Make Your First Donation
                </Button>
              ) : (
                <>
                  <Button onClick={clearFilters} variant="outline">
                    Clear Filters
                  </Button>
                  <Button onClick={handleNewDonation} leftIcon={Plus}>
                    New Donation
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Donations Table */}
        {!loading && !error && filteredAndSortedDonations.length > 0 && (
          <div className="bg-ds-surface rounded-ds-lg border border-ds-muted/10 overflow-hidden">
            {/* Results Summary */}
            <div className="px-6 py-4 border-b border-ds-muted/10 flex items-center justify-between">
              <p className="text-sm text-ds-muted">
                Showing {filteredAndSortedDonations.length} of {donations.length} donations
              </p>
              <div className="flex items-center gap-2 text-sm text-ds-muted">
                Sort by:
                <button
                  onClick={() => handleSort('created_at')}
                  className={`flex items-center gap-1 hover:text-ds-foreground ${
                    sortField === 'created_at' ? 'text-ds-primary font-medium' : ''
                  }`}
                >
                  Date {sortField === 'created_at' && <ArrowUpDown size={12} />}
                </button>
                <button
                  onClick={() => handleSort('amount')}
                  className={`flex items-center gap-1 hover:text-ds-foreground ${
                    sortField === 'amount' ? 'text-ds-primary font-medium' : ''
                  }`}
                >
                  Amount {sortField === 'amount' && <ArrowUpDown size={12} />}
                </button>
                <button
                  onClick={() => handleSort('status')}
                  className={`flex items-center gap-1 hover:text-ds-foreground ${
                    sortField === 'status' ? 'text-ds-primary font-medium' : ''
                  }`}
                >
                  Status {sortField === 'status' && <ArrowUpDown size={12} />}
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <tbody>
                  {filteredAndSortedDonations.map((donation, index) => {
                    const StatusIcon = STATUS_ICONS[donation.status];
                    const CauseIcon = CAUSE_ICONS[donation.cause];
                    const PaymentIcon = PAYMENT_ICONS[donation.payment_provider];

                    return (
                      <motion.tr
                        key={donation.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-ds-muted/10 hover:bg-ds-muted/5 transition-colors duration-ds-fast"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-ds-md bg-ds-primary/10 flex items-center justify-center">
                              <CauseIcon size={20} className="text-ds-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-ds-foreground">
                                {CAUSE_LABELS[donation.cause]}
                              </p>
                              <p className="text-sm text-ds-muted">
                                {donation.receipt_number}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-right">
                            <p className="font-bold text-lg text-ds-foreground">
                              ৳{donation.amount.toLocaleString()}
                            </p>
                            <div className="flex items-center justify-end gap-1 text-sm text-ds-muted">
                              <PaymentIcon size={14} />
                              <span>{PAYMENT_PROVIDER_LABELS[donation.payment_provider]}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[donation.status]}`}>
                            <StatusIcon size={12} className={donation.status === DonationStatus.PROCESSING ? 'animate-spin' : ''} />
                            {DONATION_STATUS_LABELS[donation.status]}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-sm text-ds-muted">
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              <span>
                                {new Date(donation.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="mt-1">
                              {new Date(donation.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => handleTrackDonation(donation.id)}
                              size="sm"
                              variant="outline"
                              leftIcon={Eye}
                            >
                              Track
                            </Button>
                            {donation.status === DonationStatus.COMPLETED && (
                              <Button
                                onClick={() => handleViewReceipt(donation)}
                                size="sm"
                                variant="outline"
                                leftIcon={Download}
                              >
                                Receipt
                              </Button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}