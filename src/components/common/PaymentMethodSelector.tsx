/**
 * PaymentMethodSelector - Component for selecting payment methods
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PaymentMethodCard } from './PaymentMethodCard';
import { usePaymentMethods } from '@/hooks/useDonations';
import type { PaymentProvider, PaymentMethod } from '@/types/donation';

interface PaymentMethodSelectorProps {
  selectedProvider: PaymentProvider | '';
  onSelect: (provider: PaymentProvider) => void;
  error?: string;
  disabled?: boolean;
  showDetails?: boolean;
  className?: string;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedProvider,
  onSelect,
  error,
  disabled = false,
  showDetails = false,
  className = '',
}) => {
  const { paymentMethods, loading, error: fetchError, getMethod } = usePaymentMethods();
  const [showAllMethods, setShowAllMethods] = useState(false);
  
  const availableMethods = paymentMethods.filter(method => method.is_active);
  const unavailableMethods = paymentMethods.filter(method => !method.is_active);

  // Validate amount against selected method limits
  const validateAmount = (amount: number): string | null => {
    if (!selectedProvider || !amount) return null;
    
    const method = getMethod(selectedProvider);
    if (!method) return null;
    
    if (amount < method.min_amount) {
      return `Minimum amount for ${method.display_name} is ৳${method.min_amount}`;
    }
    
    if (amount > method.max_amount) {
      return `Maximum amount for ${method.display_name} is ৳${method.max_amount.toLocaleString()}`;
    }
    
    return null;
  };

  const handleRefresh = () => {
    // Force refresh payment methods
    window.location.reload();
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-ds-foreground">
            Payment Method <span className="text-ds-danger">*</span>
          </label>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-ds-muted">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading payment methods...</span>
          </div>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-ds-foreground">
            Payment Method <span className="text-ds-danger">*</span>
          </label>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            leftIcon={RefreshCw}
          >
            Retry
          </Button>
        </div>
        <div className="rounded-ds-lg bg-ds-danger/10 border border-ds-danger/20 p-4">
          <div className="flex items-center gap-2 text-ds-danger">
            <AlertCircle size={16} />
            <p className="text-sm font-medium">Failed to load payment methods</p>
          </div>
          <p className="text-xs text-ds-danger/80 mt-1">{fetchError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-ds-foreground">
          Payment Method <span className="text-ds-danger">*</span>
        </label>
        {availableMethods.length > 3 && (
          <button
            type="button"
            onClick={() => setShowAllMethods(!showAllMethods)}
            className="flex items-center gap-1 text-xs text-ds-primary hover:text-ds-primary/80"
          >
            {showAllMethods ? (
              <>
                <ChevronUp size={12} />
                Show less
              </>
            ) : (
              <>
                <ChevronDown size={12} />
                Show all ({paymentMethods.length})
              </>
            )}
          </button>
        )}
      </div>

      {/* Available payment methods */}
      <div className="space-y-3">
        <AnimatePresence mode="wait">
          {availableMethods.length === 0 ? (
            <motion.div
              key="no-methods"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-ds-lg bg-ds-warning/10 border border-ds-warning/20 p-4 text-center"
            >
              <AlertCircle className="mx-auto h-8 w-8 text-ds-warning mb-2" />
              <p className="text-sm font-medium text-ds-warning">No payment methods available</p>
              <p className="text-xs text-ds-warning/80 mt-1">
                Please contact support or try again later
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="methods-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`grid gap-3 ${
                availableMethods.length === 1 
                  ? 'grid-cols-1' 
                  : availableMethods.length === 2 
                  ? 'grid-cols-1 sm:grid-cols-2' 
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              }`}
            >
              {availableMethods
                .slice(0, showAllMethods ? undefined : 3)
                .map((method, index) => (
                  <motion.div
                    key={method.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <PaymentMethodCard
                      method={method}
                      selected={selectedProvider === method.provider}
                      onSelect={onSelect}
                      disabled={disabled}
                      showDetails={showDetails}
                    />
                  </motion.div>
                ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Unavailable methods (if any) */}
      {unavailableMethods.length > 0 && showAllMethods && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-3"
        >
          <div className="border-t border-ds-muted/20 pt-4">
            <p className="text-xs font-medium text-ds-muted mb-3">Currently Unavailable:</p>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {unavailableMethods.map((method) => (
                <PaymentMethodCard
                  key={method.id}
                  method={method}
                  selected={false}
                  onSelect={() => {}} // No-op for disabled methods
                  disabled={true}
                  showDetails={false}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Selection error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-ds-danger"
        >
          <AlertCircle size={14} />
          <p className="text-xs">{error}</p>
        </motion.div>
      )}

      {/* Payment method info */}
      {selectedProvider && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-ds-lg bg-ds-primary/5 border border-ds-primary/20 p-3"
        >
          <p className="text-xs font-medium text-ds-primary mb-1">
            Selected: {getMethod(selectedProvider)?.display_name}
          </p>
          <p className="text-xs text-ds-muted">
            {getMethod(selectedProvider)?.description}
          </p>
        </motion.div>
      )}
    </div>
  );
};

// Export validation utility
export const validatePaymentAmount = (
  amount: number, 
  provider: PaymentProvider, 
  paymentMethods: PaymentMethod[]
): string | null => {
  const method = paymentMethods.find(m => m.provider === provider);
  if (!method) return 'Payment method not found';
  
  if (amount < method.min_amount) {
    return `Minimum amount is ৳${method.min_amount}`;
  }
  
  if (amount > method.max_amount) {
    return `Maximum amount is ৳${method.max_amount.toLocaleString()}`;
  }
  
  return null;
};

export default PaymentMethodSelector;