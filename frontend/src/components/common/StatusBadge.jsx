import React from 'react';
import { Clock, CheckCircle2, XCircle, AlertCircle, CheckCheck } from 'lucide-react';

const statusConfig = {
  Pending: {
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock,
  },
  Confirmed: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
  },
  Completed: {
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: CheckCheck,
  },
  Cancelled: {
    bg: 'bg-slate-100 text-slate-600 border-slate-200',
    icon: XCircle,
  },
  Rejected: {
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: AlertCircle,
  },
};

const StatusBadge = ({ status = 'Pending', size = 'sm' }) => {
  const config = statusConfig[status] || statusConfig.Pending;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-sm px-3 py-1.5 gap-2',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${config.bg} ${
        sizeClasses[size] || sizeClasses.sm
      }`}
    >
      <Icon className={size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      {status}
    </span>
  );
};

export default StatusBadge;
