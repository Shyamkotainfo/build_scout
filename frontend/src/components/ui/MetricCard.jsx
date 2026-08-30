import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const trendConfig = {
  up:   { icon: TrendingUp,   color: 'text-[var(--bs-status-success)]' },
  down: { icon: TrendingDown, color: 'text-[var(--bs-status-critical)]' },
  flat: { icon: Minus,        color: 'text-[var(--bs-text-muted)]' },
};

const MetricCard = ({
  label,
  value,
  icon: Icon,
  trend,
  status,
  className = '',
  ...props
}) => {
  const trendInfo = trend ? trendConfig[trend] : null;
  const TrendIcon = trendInfo?.icon;

  return (
    <div
      className={`rounded-lg border border-[var(--bs-border-light)] bg-[var(--bs-bg-primary)] p-5 ${className}`}
      {...props}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium uppercase tracking-wider text-[var(--bs-text-tertiary)]">
          {label}
        </span>
        {Icon && (
          <Icon className="h-4 w-4 text-[var(--bs-text-muted)]" aria-hidden="true" />
        )}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-[var(--bs-text-primary)]">
          {value ?? '—'}
        </span>
        {TrendIcon && (
          <TrendIcon className={`h-4 w-4 mb-1 ${trendInfo.color}`} aria-hidden="true" />
        )}
      </div>
    </div>
  );
};

export default MetricCard;
