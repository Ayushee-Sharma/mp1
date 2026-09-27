import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

const alertStyles = {
  error: {
    container: 'bg-rose-50 border-rose-200 text-rose-800',
    icon: AlertCircle,
    iconColor: 'text-rose-600',
  },
  success: {
    container: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    icon: CheckCircle,
    iconColor: 'text-emerald-600',
  },
  info: {
    container: 'bg-sky-50 border-sky-200 text-sky-800',
    icon: Info,
    iconColor: 'text-sky-600',
  },
};

const Alert = ({ type = 'error', message, onClose }) => {
  if (!message) return null;

  const style = alertStyles[type] || alertStyles.error;
  const Icon = style.icon;

  return (
    <div className={`p-4 rounded-xl border flex items-start gap-3 shadow-xs ${style.container}`}>
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${style.iconColor}`} />
      <div className="flex-1 text-sm font-medium leading-relaxed">{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition-colors p-0.5"
          aria-label="Close alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;
