import React from 'react';
import { CheckCircle, AlertCircle, Clock, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const VerificationBadge: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const getVerificationStatus = () => {
    if (user.isVerified) {
      return {
        icon: CheckCircle,
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        text: 'Verified Student',
        subtext: user.collegeName || 'Verified'
      };
    } else {
      return {
        icon: Clock,
        color: 'text-amber-500',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        text: 'Pending Verification',
        subtext: 'Check your email'
      };
    }
  };

  const status = getVerificationStatus();
  const Icon = status.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${status.bgColor} ${status.borderColor}`}>
      <Icon className={`w-4 h-4 ${status.color}`} />
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-slate-900">{status.text}</span>
        <span className="text-[10px] text-slate-600">{status.subtext}</span>
      </div>
    </div>
  );
};

export default VerificationBadge;
