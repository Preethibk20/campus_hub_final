import React, { useState } from 'react';
import { DollarSign, AlertTriangle, Settings, Check, Info } from 'lucide-react';

interface PriceControlsProps {
  currentRateLimit?: number;
  onRateLimitChange?: (limit: number) => void;
  showNotification?: boolean;
}

const PriceControls: React.FC<PriceControlsProps> = ({
  currentRateLimit = 50,
  onRateLimitChange,
  showNotification = true
}) => {
  const [customLimit, setCustomLimit] = useState(currentRateLimit.toString());
  const [showSettings, setShowSettings] = useState(false);
  const [tempLimit, setTempLimit] = useState(currentRateLimit);

  const presetLimits = [
    { value: 25, label: 'Budget Friendly', description: 'Perfect for casual help' },
    { value: 50, label: 'Standard Rate', description: 'Balanced price point' },
    { value: 75, label: 'Premium Help', description: 'Expert assistance' },
    { value: 100, label: 'Maximum', description: 'Top-tier support' }
  ];

  const handlePresetSelect = (limit: number) => {
    setTempLimit(limit);
    setCustomLimit(limit.toString());
  };

  const handleApplyLimit = () => {
    const limit = parseInt(customLimit);
    if (limit >= 5 && limit <= 200) {
      onRateLimitChange?.(limit);
      setShowSettings(false);
    }
  };

  const getLimitColor = (limit: number) => {
    if (limit <= 25) return 'text-green-600 bg-green-50 border-green-200';
    if (limit <= 50) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (limit <= 75) return 'text-purple-600 bg-purple-50 border-purple-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getLimitLabel = (limit: number) => {
    if (limit <= 25) return 'Budget Friendly';
    if (limit <= 50) return 'Standard';
    if (limit <= 75) return 'Premium';
    return 'Maximum';
  };

  return (
    <div className="space-y-4">
      {/* Current Limit Display */}
      <div className={`p-4 rounded-xl border ${getLimitColor(currentRateLimit)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DollarSign className="w-5 h-5" />
            <div>
              <p className="font-semibold">Current Rate Limit</p>
              <p className="text-sm opacity-75">{getLimitLabel(currentRateLimit)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">${currentRateLimit}</p>
            <p className="text-xs opacity-75">per hour max</p>
          </div>
        </div>
      </div>

      {/* Settings Button */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
      >
        <Settings size={16} />
        {showSettings ? 'Hide' : 'Show'} Price Settings
      </button>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Price Limit Settings</h4>
            <p className="text-sm text-slate-600 mb-4">
              Set a maximum hourly rate to keep help affordable for all students.
            </p>
          </div>

          {/* Preset Options */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Quick Select
            </label>
            <div className="grid grid-cols-2 gap-3">
              {presetLimits.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => handlePresetSelect(preset.value)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    tempLimit === preset.value
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-900">${preset.value}/hr</span>
                    {tempLimit === preset.value && (
                      <Check className="w-4 h-4 text-indigo-600" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-slate-700">{preset.label}</p>
                  <p className="text-xs text-slate-500">{preset.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Custom Limit
            </label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <DollarSign className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  min="5"
                  max="200"
                  value={customLimit}
                  onChange={(e) => {
                    setCustomLimit(e.target.value);
                    setTempLimit(parseInt(e.target.value) || 0);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter amount"
                />
              </div>
              <span className="text-sm text-slate-600">per hour</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Range: $5 - $200 per hour
            </p>
          </div>

          {/* Warning for High Limits */}
          {tempLimit > 100 && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  High Price Limit
                </p>
                <p className="text-xs text-amber-700">
                  This limit may make help less accessible to some students. Consider a lower limit for broader participation.
                </p>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Info className="w-4 h-4 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">
                How Price Limits Work
              </p>
              <p className="text-xs text-blue-700">
                This sets the maximum hourly rate that can be charged on the platform. Students can still offer lower rates based on their budget.
              </p>
            </div>
          </div>

          {/* Apply Button */}
          <div className="flex gap-2">
            <button
              onClick={handleApplyLimit}
              disabled={tempLimit < 5 || tempLimit > 200}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply New Limit
            </button>
            <button
              onClick={() => setShowSettings(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Notification */}
      {showNotification && currentRateLimit <= 50 && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            <p className="text-sm text-green-800">
              Great! Your price limit keeps help affordable for everyone.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceControls;
