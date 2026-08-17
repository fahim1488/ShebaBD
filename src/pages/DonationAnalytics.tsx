/**
 * DonationAnalytics — Admin dashboard for donation analytics and reporting
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Heart,
  CheckCircle2,
  Clock,
  XCircle,
  Banknote,
  Users,
  Download,
  RefreshCw,
  Smartphone,
  CreditCard,
  Building2,
  BookOpen,
  Stethoscope,
  Home,
  Leaf,
  AlertTriangle,
  Calendar,
  PieChart,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAllDonationsAdmin } from '@/services/donationApi';
import { useAuth } from '@/hooks/useAuth';
import type { Donation } from '@/types/donation';
import {
  DonationStatus,
  PaymentProvider,
  DonationCause,
  CAUSE_LABELS,
  PAYMENT_PROVIDER_LABELS,
  DONATION_STATUS_LABELS,
} from '@/types/donation';

// ── Helper: group by key ──────────────────────────────────────────────────────
function groupBy<T>(arr: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

// ── Date helpers ──────────────────────────────────────────────────────────────
function formatMonth(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-BD', { month: 'short', year: 'numeric' });
}

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

// ── Icon/Color Maps ───────────────────────────────────────────────────────────
const CAUSE_ICON_MAP = {
  [DonationCause.EDUCATION]: BookOpen,
  [DonationCause.HEALTHCARE]: Stethoscope,
  [DonationCause.DISASTER]: Home,
  [DonationCause.ENVIRONMENT]: Leaf,
  [DonationCause.POVERTY]: Users,
};

const CAUSE_COLOR_MAP = {
  [DonationCause.EDUCATION]: '#3B82F6',
  [DonationCause.HEALTHCARE]: '#EF4444',
  [DonationCause.DISASTER]: '#F97316',
  [DonationCause.ENVIRONMENT]: '#22C55E',
  [DonationCause.POVERTY]: '#A855F7',
};

const PROVIDER_COLOR_MAP = {
  [PaymentProvider.BKASH]: '#EC4899',
  [PaymentProvider.NAGAD]: '#F97316',
  [PaymentProvider.BANK]: '#3B82F6',
};

const PROVIDER_ICON_MAP = {
  [PaymentProvider.BKASH]: Smartphone,
  [PaymentProvider.NAGAD]: CreditCard,
  [PaymentProvider.BANK]: Building2,
};

const STATUS_COLOR_MAP = {
  [DonationStatus.PENDING]: '#F59E0B',
  [DonationStatus.PROCESSING]: '#3B82F6',
  [DonationStatus.COMPLETED]: '#22C55E',
  [DonationStatus.FAILED]: '#EF4444',
  [DonationStatus.CANCELLED]: '#6B7280',
  [DonationStatus.REFUNDED]: '#A855F7',
};

// ── Simple Bar Chart ──────────────────────────────────────────────────────────
function SimpleBar({ label, value, max, color, suffix = '' }: {
  label: string; value: number; max: number; color: string; suffix?: string;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <p className="text-xs text-ds-muted w-28 flex-shrink-0 truncate">{label}</p>
      <div className="flex-1 bg-ds-muted/10 rounded-full h-2.5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <p className="text-xs font-semibold text-ds-foreground w-20 text-right flex-shrink-0">
        {suffix}{value.toLocaleString()}
      </p>
    </div>
  );
}

// ── Metric Card ───────────────────────────────────────────────────────────────
function MetricCard({ title, value, sub, icon: Icon, color, delta }: {
  title: string; value: string; sub?: string;
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  color: string; delta?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-ds-surface rounded-ds-xl border border-ds-muted/10 p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`h-10 w-10 rounded-ds-lg flex items-center justify-center`} style={{ backgroundColor: `${color}20` }}>
          <Icon size={20} style={{ color }} />
        </div>
        {delta !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${delta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {delta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(delta)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-ds-foreground">{value}</p>
      <p className="text-sm text-ds-muted mt-0.5">{title}</p>
      {sub && <p className="text-xs text-ds-muted mt-1">{sub}</p>}
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function DonationAnalytics() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  // Guard: admin only
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllDonationsAdmin({ limit: 1000 });
      setDonations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Filter by time range
  const filteredDonations = useMemo(() => {
    if (timeRange === 'all') return donations;
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return donations.filter(d => new Date(d.created_at) >= cutoff);
  }, [donations, timeRange]);

  // Computed stats
  const stats = useMemo(() => {
    const completed = filteredDonations.filter(d => d.status === DonationStatus.COMPLETED);
    const failed = filteredDonations.filter(d => d.status === DonationStatus.FAILED);
    const pending = filteredDonations.filter(d =>
      d.status === DonationStatus.PENDING || d.status === DonationStatus.PROCESSING
    );

    const totalAmount = completed.reduce((s, d) => s + d.amount, 0);
    const avgAmount = completed.length > 0 ? totalAmount / completed.length : 0;
    const successRate = filteredDonations.length > 0
      ? Math.round((completed.length / filteredDonations.length) * 100)
      : 0;

    // By cause
    const byCause = Object.values(DonationCause).map(cause => ({
      cause,
      label: CAUSE_LABELS[cause],
      total: completed.filter(d => d.cause === cause).reduce((s, d) => s + d.amount, 0),
      count: completed.filter(d => d.cause === cause).length,
    })).sort((a, b) => b.total - a.total);

    // By provider
    const byProvider = Object.values(PaymentProvider).map(provider => ({
      provider,
      label: PAYMENT_PROVIDER_LABELS[provider],
      total: completed.filter(d => d.payment_provider === provider).reduce((s, d) => s + d.amount, 0),
      count: filteredDonations.filter(d => d.payment_provider === provider).length,
    })).sort((a, b) => b.total - a.total);

    // By status
    const byStatus = Object.values(DonationStatus).map(status => ({
      status,
      count: filteredDonations.filter(d => d.status === status).length,
    }));

    // Daily chart (last 7 days or per-day for 30d)
    const dailyMap: Record<string, number> = {};
    completed.forEach(d => {
      const day = d.created_at.split('T')[0];
      dailyMap[day] = (dailyMap[day] || 0) + d.amount;
    });

    // Monthly breakdown
    const monthlyMap: Record<string, { amount: number; count: number }> = {};
    completed.forEach(d => {
      const month = formatMonth(d.created_at);
      if (!monthlyMap[month]) monthlyMap[month] = { amount: 0, count: 0 };
      monthlyMap[month].amount += d.amount;
      monthlyMap[month].count += 1;
    });

    const monthly = Object.entries(monthlyMap)
      .map(([month, data]) => ({ month, ...data }))
      .slice(-6);

    const maxMonthly = Math.max(...monthly.map(m => m.amount), 1);

    // Top donors (non-anonymous)
    const donorMap: Record<string, { name: string; email: string; total: number; count: number }> = {};
    completed.forEach(d => {
      if (!d.is_anonymous) {
        const key = d.donor_email;
        if (!donorMap[key]) donorMap[key] = { name: d.donor_name, email: d.donor_email, total: 0, count: 0 };
        donorMap[key].total += d.amount;
        donorMap[key].count += 1;
      }
    });

    const topDonors = Object.values(donorMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return {
      total: filteredDonations.length,
      completed: completed.length,
      failed: failed.length,
      pending: pending.length,
      totalAmount,
      avgAmount,
      successRate,
      byCause,
      byProvider,
      byStatus,
      monthly,
      maxMonthly,
      topDonors,
    };
  }, [filteredDonations]);

  // Export as CSV
  const handleExport = () => {
    const headers = ['Receipt #', 'Donor', 'Email', 'Amount', 'Cause', 'Method', 'Status', 'Date'];
    const rows = filteredDonations.map(d => [
      d.receipt_number || '',
      d.is_anonymous ? 'Anonymous' : d.donor_name,
      d.is_anonymous ? '' : d.donor_email,
      d.amount,
      CAUSE_LABELS[d.cause],
      PAYMENT_PROVIDER_LABELS[d.payment_provider],
      DONATION_STATUS_LABELS[d.status],
      new Date(d.created_at).toLocaleDateString(),
    ]);

    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `donations_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-ds-background flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-14 w-14 text-amber-500 mb-4" />
          <h2 className="text-xl font-bold text-ds-foreground mb-2">Admin Access Required</h2>
          <p className="text-ds-muted mb-6">Please sign in with an admin account.</p>
          <Button onClick={() => navigate('/sign-in')}>Sign In</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ds-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-10 w-10 animate-spin text-ds-primary mb-4" />
          <p className="text-ds-muted">Loading analytics…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-ds-background flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto px-4">
          <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="font-bold text-ds-foreground mb-2">Failed to Load Analytics</h2>
          <p className="text-ds-muted mb-4">{error}</p>
          <Button onClick={fetchAll}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ds-background">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-ds-foreground flex items-center gap-3">
              <BarChart3 size={30} className="text-ds-primary" />
              Donation Analytics
            </h1>
            <p className="text-ds-muted mt-1">Admin dashboard — all donation data</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Time range selector */}
            <div className="flex bg-ds-surface border border-ds-muted/20 rounded-ds-lg overflow-hidden">
              {(['7d', '30d', '90d', 'all'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                    timeRange === range
                      ? 'bg-ds-primary text-white'
                      : 'text-ds-muted hover:text-ds-foreground'
                  }`}
                >
                  {range === 'all' ? 'All time' : range}
                </button>
              ))}
            </div>

            <Button onClick={fetchAll} variant="outline" leftIcon={RefreshCw} size="sm">
              Refresh
            </Button>
            <Button onClick={handleExport} variant="outline" leftIcon={Download} size="sm">
              Export CSV
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Total Donations"
            value={stats.total.toLocaleString()}
            icon={Heart}
            color="#E11D48"
          />
          <MetricCard
            title="Total Raised"
            value={`৳${stats.totalAmount.toLocaleString()}`}
            sub={`Avg ৳${Math.round(stats.avgAmount).toLocaleString()}`}
            icon={Banknote}
            color="#16A34A"
          />
          <MetricCard
            title="Success Rate"
            value={`${stats.successRate}%`}
            sub={`${stats.completed} completed`}
            icon={CheckCircle2}
            color="#2563EB"
          />
          <MetricCard
            title="Pending"
            value={stats.pending.toLocaleString()}
            sub={`${stats.failed} failed`}
            icon={Clock}
            color="#D97706"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* Monthly Trend */}
          <div className="lg:col-span-2 bg-ds-surface rounded-ds-xl border border-ds-muted/10 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Activity size={18} className="text-ds-primary" />
              <h2 className="font-semibold text-ds-foreground">Monthly Donations</h2>
            </div>
            {stats.monthly.length > 0 ? (
              <div className="space-y-3">
                {stats.monthly.map(m => (
                  <SimpleBar
                    key={m.month}
                    label={m.month}
                    value={m.amount}
                    max={stats.maxMonthly}
                    color="#E11D48"
                    suffix="৳"
                  />
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-ds-muted text-sm">
                No completed donations in this period
              </div>
            )}
          </div>

          {/* Status Distribution */}
          <div className="bg-ds-surface rounded-ds-xl border border-ds-muted/10 p-6">
            <div className="flex items-center gap-2 mb-6">
              <PieChart size={18} className="text-ds-primary" />
              <h2 className="font-semibold text-ds-foreground">By Status</h2>
            </div>
            <div className="space-y-3">
              {stats.byStatus.filter(s => s.count > 0).map(s => (
                <div key={s.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: STATUS_COLOR_MAP[s.status] }}
                    />
                    <span className="text-sm text-ds-muted">{DONATION_STATUS_LABELS[s.status]}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-ds-muted/10 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.total > 0 ? (s.count / stats.total) * 100 : 0}%` }}
                        transition={{ duration: 0.8 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: STATUS_COLOR_MAP[s.status] }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-ds-foreground w-8 text-right">
                      {s.count}
                    </span>
                  </div>
                </div>
              ))}
              {stats.byStatus.every(s => s.count === 0) && (
                <p className="text-sm text-ds-muted text-center py-4">No data</p>
              )}
            </div>
          </div>
        </div>

        {/* By Cause + By Payment Method */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          {/* By Cause */}
          <div className="bg-ds-surface rounded-ds-xl border border-ds-muted/10 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Heart size={18} className="text-ds-primary" />
              <h2 className="font-semibold text-ds-foreground">Donations by Cause</h2>
            </div>
            <div className="space-y-4">
              {stats.byCause.map(c => {
                const Icon = CAUSE_ICON_MAP[c.cause];
                const color = CAUSE_COLOR_MAP[c.cause];
                return (
                  <div key={c.cause} className="flex items-center gap-3">
                    <div
                      className="h-9 w-9 rounded-ds-md flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      <Icon size={16} style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-ds-foreground truncate">{c.label}</span>
                        <span className="text-sm font-bold text-ds-foreground ml-2 flex-shrink-0">
                          ৳{c.total.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-ds-muted/10 rounded-full h-1.5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${stats.byCause[0]?.total > 0 ? (c.total / stats.byCause[0].total) * 100 : 0}%` }}
                          transition={{ duration: 0.8 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      </div>
                      <p className="text-xs text-ds-muted mt-0.5">{c.count} donations</p>
                    </div>
                  </div>
                );
              })}
              {stats.byCause.every(c => c.total === 0) && (
                <p className="text-sm text-ds-muted text-center py-4">No completed donations yet</p>
              )}
            </div>
          </div>

          {/* By Payment Method */}
          <div className="bg-ds-surface rounded-ds-xl border border-ds-muted/10 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Smartphone size={18} className="text-ds-primary" />
              <h2 className="font-semibold text-ds-foreground">By Payment Method</h2>
            </div>
            <div className="space-y-4">
              {stats.byProvider.map(p => {
                const Icon = PROVIDER_ICON_MAP[p.provider];
                const color = PROVIDER_COLOR_MAP[p.provider];
                const pct = stats.byProvider[0]?.total > 0
                  ? Math.round((p.total / stats.byProvider[0].total) * 100)
                  : 0;
                return (
                  <div key={p.provider} className="flex items-center gap-3">
                    <div
                      className="h-9 w-9 rounded-ds-md flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      <Icon size={16} style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-ds-foreground">{p.label}</span>
                        <span className="text-sm font-bold text-ds-foreground">
                          ৳{p.total.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-ds-muted/10 rounded-full h-1.5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      </div>
                      <p className="text-xs text-ds-muted mt-0.5">{p.count} transactions</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Donors */}
        <div className="bg-ds-surface rounded-ds-xl border border-ds-muted/10 p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={18} className="text-ds-primary" />
            <h2 className="font-semibold text-ds-foreground">Top Donors</h2>
            <span className="ml-auto text-xs text-ds-muted">(non-anonymous only)</span>
          </div>

          {stats.topDonors.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-ds-muted/10">
                    <th className="text-left text-xs font-medium text-ds-muted pb-3 pl-2">#</th>
                    <th className="text-left text-xs font-medium text-ds-muted pb-3">Donor</th>
                    <th className="text-right text-xs font-medium text-ds-muted pb-3">Donations</th>
                    <th className="text-right text-xs font-medium text-ds-muted pb-3 pr-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topDonors.map((donor, index) => (
                    <tr key={donor.email} className="border-b border-ds-muted/5 hover:bg-ds-muted/5 transition-colors">
                      <td className="py-3 pl-2">
                        <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                          index === 0 ? 'bg-amber-100 text-amber-700' :
                          index === 1 ? 'bg-gray-100 text-gray-600' :
                          index === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-ds-muted/10 text-ds-muted'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-3">
                        <p className="text-sm font-medium text-ds-foreground">{donor.name}</p>
                        <p className="text-xs text-ds-muted">{donor.email}</p>
                      </td>
                      <td className="py-3 text-right">
                        <span className="text-sm text-ds-muted">{donor.count}</span>
                      </td>
                      <td className="py-3 text-right pr-2">
                        <span className="text-sm font-bold text-ds-foreground">
                          ৳{donor.total.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-ds-muted text-center py-6">No donor data available for this period</p>
          )}
        </div>

        {/* Recent Donations Table */}
        <div className="bg-ds-surface rounded-ds-xl border border-ds-muted/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-ds-primary" />
              <h2 className="font-semibold text-ds-foreground">Recent Donations</h2>
            </div>
            <p className="text-xs text-ds-muted">Showing latest 20</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ds-muted/10">
                  {['Donor', 'Amount', 'Cause', 'Method', 'Status', 'Date'].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-ds-muted pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredDonations.slice(0, 20).map((donation) => (
                  <tr
                    key={donation.id}
                    className="border-b border-ds-muted/5 hover:bg-ds-muted/5 transition-colors cursor-pointer"
                    onClick={() => navigate(`/donations/${donation.id}/track`)}
                  >
                    <td className="py-3 pr-4">
                      <p className="text-sm font-medium text-ds-foreground">
                        {donation.is_anonymous ? 'Anonymous' : donation.donor_name}
                      </p>
                      {!donation.is_anonymous && (
                        <p className="text-xs text-ds-muted">{donation.donor_email}</p>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-sm font-bold text-ds-foreground">
                        ৳{donation.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-sm text-ds-muted">{CAUSE_LABELS[donation.cause]}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-sm text-ds-muted">
                        {PAYMENT_PROVIDER_LABELS[donation.payment_provider]}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${STATUS_COLOR_MAP[donation.status]}20`,
                          color: STATUS_COLOR_MAP[donation.status],
                        }}
                      >
                        {DONATION_STATUS_LABELS[donation.status]}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="text-xs text-ds-muted">
                        {new Date(donation.created_at).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredDonations.length === 0 && (
              <p className="text-sm text-ds-muted text-center py-8">No donations in this time period</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
