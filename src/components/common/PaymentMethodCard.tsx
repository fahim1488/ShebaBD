/**
 * PaymentMethodCard - Individual payment method selection card component
 */

import { motion } from 'framer-motion';
import { 
  Smartphone, 
  CreditCard, 
  Building2, 
  CheckCircle2,
  Clock,
  Shield,
} from 'lucide-react';
import type { 
  PaymentMethod,
} from '@/types/donation';
import { 
  PaymentProvider,
} from '@/types/donation';

// Payment provider configurations
const PROVIDER_CONFIG = {
  [PaymentProvider.BKASH]: {
    name: 'bKash',
    icon: Smartphone,
    color: 'bg-pink-50 text-pink-600 border-pink-200',
    selectedColor: 'bg-pink-100 text-pink-700 border-pink-300 ring-pink-500',
    description: 'Mobile wallet payment',
    features: ['Instant transfer', 'Mobile number login', 'SMS confirmation'],
    processingTime: '2-5 minutes',
    logo: '💳', // You can replace with actual logo
  },
  [PaymentProvider.NAGAD]: {
    name: 'Nagad',
    icon: CreditCard,
    color: 'bg-orange-50 text-orange-600 border-orange-200',
    selectedColor: 'bg-orange-100 text-orange-700 border-orange-300 ring-orange-500',
    description: 'Digital financial services',
    features: ['Quick payment', 'Secure transaction', 'Real-time processing'],
    processingTime: '1-3 minutes',
    logo: '📱', // You can replace with actual logo
  },
  [PaymentProvider.BANK]: {
    name: 'Bank Transfer',
    icon: Building2,
    color: 'bg-blue-50 text-blue-600 border-blue-200',
    selectedColor: 'bg-blue-100 text-blue-700 border-blue-300 ring-blue-500',
    description: 'Direct bank account transfer',
    features: ['Traditional banking', 'Manual verification', 'Receipt upload'],
    processingTime: '1-2 business days',
    logo: '🏦', // You can replace with actual logo
  },
} as const;

interface PaymentMethodCardProps {
  method: PaymentMethod;
  selected: boolean;
  onSelect: (provider: PaymentProvider) => void;
  disabled?: boolean;
  showDetails?: boolean;
}

export const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  method,
  selected,
  onSelect,
  disabled = false,
  showDetails = false,
}) => {
  const config = PROVIDER_CONFIG[method.provider];
  const Icon = config.icon;

  const handleClick = () => {
    if (!disabled) {
      onSelect(method.provider);
    }
  };

  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={`
        relative w-full rounded-ds-lg border p-4 text-left transition-all duration-ds-fast
        ${selected 
          ? `${config.selectedColor} ring-2 ring-offset-1` 
          : disabled
          ? 'border-ds-muted/10 bg-ds-muted/5 text-ds-muted/50 cursor-not-allowed'
          : `${config.color} hover:shadow-md border-ds-muted/20`
        }
      `}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Selection indicator */}
      {selected && (
        <motion.div
          className="absolute top-2 right-2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.3 }}
        >
          <CheckCircle2 size={20} className="text-current" />
        </motion.div>
      )}

      {/* Disabled overlay */}
      {disabled && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-ds-lg">
          <span className="text-xs bg-ds-muted/90 text-white px-3 py-1 rounded-full">
            Unavailable
          </span>
        </div>
      )}

      {/* Main content */}
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-ds-md bg-current/10">
              <Icon size={20} className="text-current" />
            </div>
            <div>
              <p className="text-sm font-semibold text-current">{config.name}</p>
              <p className="text-xs opacity-70">{config.description}</p>
            </div>
          </div>
          <span className="text-lg opacity-60">{config.logo}</span>
        </div>

        {/* Amount limits */}
        <div className="flex items-center justify-between text-xs">
          <span className="opacity-60">Limits:</span>
          <span className="font-medium">
            ৳{method.min_amount} - ৳{method.max_amount.toLocaleString()}
          </span>
        </div>

        {/* Processing time */}
        <div className="flex items-center gap-1.5 text-xs opacity-70">
          <Clock size={12} />
          <span>Processing: {config.processingTime}</span>
        </div>

        {/* Expanded details */}
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="border-t border-current/20 pt-3 space-y-2"
          >
            {/* Features */}
            <div>
              <p className="text-xs font-medium mb-1">Features:</p>
              <ul className="space-y-0.5">
                {config.features.map((feature, index) => (
                  <li key={index} className="text-xs opacity-70 flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-current/40" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Security badge */}
            <div className="flex items-center gap-1.5 text-xs">
              <Shield size={12} />
              <span className="opacity-70">Secured & Encrypted</span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.button>
  );
};

export default PaymentMethodCard;