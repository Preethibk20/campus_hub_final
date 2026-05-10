import React, { useState } from 'react';
import { FakePayment } from '../components/FakePayment';
import { WalletBalance } from '../components/WalletBalance';
import { ArrowRight, CheckCircle, Play } from 'lucide-react';

export const DemoPaymentPage: React.FC = () => {
  const [showPayment, setShowPayment] = useState(false);
  const [walletBalance] = useState(2500);
  const [earnings] = useState(1200);
  const [spent] = useState(800);

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    // In real app, this would refresh wallet balance
    alert('✅ Payment completed successfully!');
  };

  const demoGigs = [
    { id: 1, title: 'DSA Tutoring Session', price: 500, tutor: 'John Doe' },
    { id: 2, title: 'React Project Help', price: 800, tutor: 'Jane Smith' },
    { id: 3, title: 'Java Assignment Review', price: 300, tutor: 'Mike Johnson' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎓 Campus Hub Payment Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience our secure payment system with demo transactions. 
            No real money required - perfect for presentations!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Wallet Section */}
          <div className="lg:col-span-1">
            <WalletBalance 
              balance={walletBalance}
              earnings={earnings}
              spent={spent}
            />
            
            <div className="mt-6 bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                Demo Features
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Realistic QR code payment flow
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Payment processing animation
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Transaction confirmation
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Wallet balance updates
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Escrow system simulation
                </li>
              </ul>
            </div>
          </div>

          {/* Gigs Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6">Available Services</h2>
              
              <div className="space-y-4">
                {demoGigs.map((gig) => (
                  <div key={gig.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{gig.title}</h3>
                        <p className="text-gray-600">by {gig.tutor}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-600">₹{gig.price}</p>
                        <button
                          onClick={() => setShowPayment(true)}
                          className="mt-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all flex items-center text-sm"
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-6 bg-blue-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-3 text-blue-900">
                🎯 How to Use in Your Presentation
              </h3>
              <div className="space-y-2 text-sm text-blue-800">
                <p>
                  <strong>Step 1:</strong> Click "Book Now" on any service
                </p>
                <p>
                  <strong>Step 2:</strong> Scan the QR code (simulated)
                </p>
                <p>
                  <strong>Step 3:</strong> Click "I've Completed Payment"
                </p>
                <p>
                  <strong>Step 4:</strong> Watch the payment processing animation
                </p>
                <p>
                  <strong>Step 5:</strong> See success confirmation
                </p>
              </div>
              
              <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                <p className="text-xs text-blue-900 font-medium">
                  💡 <strong>Viva Tip:</strong> Say "This demonstrates our payment architecture. 
                  In production, we integrate with Razorpay/Cashfree for real transactions."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <FakePayment
          amount={500}
          gigTitle="DSA Tutoring Session"
          onSuccess={handlePaymentSuccess}
          onCancel={() => setShowPayment(false)}
        />
      )}
    </div>
  );
};
