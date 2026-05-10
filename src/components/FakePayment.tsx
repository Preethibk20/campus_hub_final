import React, { useState } from 'react';
import { Check, Loader2, QrCode, ArrowLeft } from 'lucide-react';

interface FakePaymentProps {
  amount: number;
  gigTitle: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const FakePayment: React.FC<FakePaymentProps> = ({
  amount,
  gigTitle,
  onSuccess,
  onCancel,
}) => {
  const [step, setStep] = useState<'qr' | 'processing' | 'success'>('qr');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePaymentDone = async () => {
    setStep('processing');
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setStep('success');
    setIsProcessing(false);
    setTimeout(onSuccess, 1500);
  };

  const generateUPIString = () => {
    return `upi://pay?pa=campushub@upi&pn=CampusHub&am=${amount}&cu=INR&tn=${encodeURIComponent(gigTitle)}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-semibold">Secure Payment</h3>
          <div className="w-9" />
        </div>

        {/* QR Step */}
        {step === 'qr' && (
          <div className="text-center space-y-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-xl">
              <p className="text-sm font-medium">Amount to Pay</p>
              <p className="text-3xl font-bold">₹{amount}</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="bg-white p-4 rounded-lg inline-block">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(generateUPIString())}`}
                  alt="Payment QR Code"
                  className="w-48 h-48"
                />
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Scan QR code with any UPI app
              </p>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Virtual Payment:</strong> This is a demo payment system
                </p>
              </div>
            </div>

            <button
              onClick={handlePaymentDone}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
            >
              I've Completed Payment
            </button>
          </div>
        )}

        {/* Processing Step */}
        {step === 'processing' && (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
                <div className="absolute inset-0 w-16 h-16 bg-blue-100 rounded-full animate-ping opacity-20" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Processing Payment</h3>
              <p className="text-gray-600">Please wait while we verify your payment...</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-sm text-gray-600">Payment initiated</p>
              </div>
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                <p className="text-sm text-gray-600">Verifying transaction...</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-10 h-10 text-green-600" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-green-600">Payment Successful!</h3>
              <p className="text-gray-600">Your payment of ₹{amount} has been processed</p>
            </div>

            <div className="bg-green-50 p-4 rounded-xl space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-mono">DEMO{Date.now()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold">₹{amount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <span className="text-green-600 font-semibold">✓ Completed</span>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Demo Mode:</strong> This is a simulated payment for demonstration purposes
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
