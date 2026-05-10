import React, { useState } from 'react';
import {
  ArrowUpRight, ArrowDownLeft, Plus, History, ShieldCheck,
  Landmark, X, Loader2, CheckCircle2, TrendingUp, CreditCard
} from 'lucide-react';
import { MOCK_USER } from '../constants';

const transactions = [
  { id: 1, type: 'in',  amount: 45.00, title: 'Poster Design Payment',   date: 'Oct 24, 2023', status: 'Completed' },
  { id: 2, type: 'out', amount: 20.00, title: 'Python Tutoring Session', date: 'Oct 22, 2023', status: 'Completed' },
  { id: 3, type: 'in',  amount: 15.00, title: 'Resume Proofreading',     date: 'Oct 20, 2023', status: 'In Escrow' },
];

const Wallet: React.FC = () => {
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('50');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [walletBalance, setWalletBalance] = useState(MOCK_USER.walletBalance ?? 450);

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      setWalletBalance(prev => prev + parseInt(paymentAmount || '0'));
      setTimeout(() => {
        setPaymentSuccess(false);
        setShowStripeModal(false);
      }, 2000);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-7 page-enter">
      <header>
        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Financial Hub</h2>
        <p className="text-slate-500 mt-1.5 font-medium">Manage your digital campus economy with enterprise-grade security.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Balance Card */}
        <div className="wallet-card rounded-3xl p-8 text-white shadow-2xl shadow-indigo-200 relative">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-1">
              <p className="text-indigo-200 font-bold uppercase tracking-widest text-[11px]">Current Balance</p>
              <CreditCard size={18} className="text-indigo-300" />
            </div>
            <h3 className="text-5xl font-black mb-2 tracking-tight">${walletBalance}<span className="text-2xl text-indigo-300">.00</span></h3>
            <div className="flex items-center gap-1.5 text-indigo-200 text-xs font-semibold mb-8">
              <TrendingUp size={13} /> <span>+$60 this month</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowStripeModal(true)}
                className="bg-white text-indigo-700 font-extrabold py-3.5 rounded-2xl hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 shadow-lg text-sm"
              >
                <Plus size={17} /> Add Funds
              </button>
              <button className="bg-white/15 text-white font-extrabold py-3.5 rounded-2xl hover:bg-white/25 backdrop-blur-md transition-all flex items-center justify-center gap-2 border border-white/20 text-sm">
                <ArrowUpRight size={17} /> Withdraw
              </button>
            </div>
          </div>
        </div>

        {/* Escrow */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 card-shadow flex flex-col justify-between hover-lift">
          <div className="space-y-5">
            <div className="flex items-center gap-2.5 text-emerald-600 bg-emerald-50 w-fit px-4 py-2 rounded-2xl border border-emerald-100">
              <ShieldCheck size={18} strokeWidth={2.5} />
              <span className="font-black uppercase tracking-widest text-[11px]">Secure Escrow</span>
            </div>
            <div>
              <p className="text-slate-400 font-bold uppercase tracking-wider text-[11px] mb-1">Income Pending</p>
              <p className="text-4xl font-black text-slate-900">$35<span className="text-xl text-slate-400">.00</span></p>
              <p className="text-sm text-slate-500 mt-3 leading-relaxed font-medium">
                Funds are securely held until you confirm project delivery at both ends.
              </p>
            </div>
          </div>
          <button className="mt-6 w-full text-indigo-600 font-extrabold flex items-center justify-center gap-2 py-3.5 bg-indigo-50 hover:bg-indigo-100 rounded-2xl transition-all text-sm border border-indigo-100">
            Learn More <ArrowUpRight size={16} />
          </button>
        </div>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Earned', value: '$510', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
          { label: 'Total Spent',  value: '$60',  color: 'text-rose-600',    bg: 'bg-rose-50',    border: 'border-rose-100'    },
          { label: 'In Escrow',    value: '$35',  color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-100'   },
        ].map((s, i) => (
          <div key={i} className={`bg-white rounded-2xl p-5 border ${s.border} card-shadow text-center`}>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 font-semibold mt-1 uppercase tracking-wide">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden card-shadow">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <h3 className="font-extrabold text-lg flex items-center gap-2.5 text-slate-900">
            <div className="bg-slate-100 p-2 rounded-xl">
              <History size={18} className="text-slate-600" />
            </div>
            Transaction Log
          </h3>
          <button className="text-xs font-bold uppercase tracking-widest text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-xl transition-colors border border-indigo-100">
            Export
          </button>
        </div>
        <div className="divide-y divide-slate-50">
          {transactions.map((tx) => (
            <div key={tx.id} className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition-all group">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                  tx.type === 'in'
                    ? 'bg-emerald-50 text-emerald-500 border border-emerald-100'
                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                }`}>
                  {tx.type === 'in' ? <ArrowDownLeft size={22} /> : <ArrowUpRight size={22} />}
                </div>
                <div>
                  <p className="font-extrabold text-slate-900">{tx.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-slate-400 font-semibold">{tx.date}</p>
                    <span className={`badge-pill ${
                      tx.status === 'In Escrow'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              </div>
              <p className={`text-xl font-black ${tx.type === 'in' ? 'text-emerald-500' : 'text-slate-700'}`}>
                {tx.type === 'in' ? '+' : '-'}${tx.amount.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Stripe Modal */}
      {showStripeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold">
                <Landmark size={20} className="text-indigo-600" />
                <span>Secure Checkout</span>
              </div>
              <button
                onClick={() => !isProcessing && setShowStripeModal(false)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-7 space-y-5">
              {paymentSuccess ? (
                <div className="text-center py-8 animate-scale-in">
                  <CheckCircle2 size={72} className="mx-auto text-emerald-500 mb-4" />
                  <h3 className="text-2xl font-black text-slate-900">Payment Successful!</h3>
                  <p className="text-slate-500 mt-2 font-medium">Funds added to your Campus Hub wallet.</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Amount to Deposit (USD)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">$</span>
                      <input
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        className="w-full text-3xl font-black text-slate-900 pl-9 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl input-focus"
                      />
                    </div>
                    <div className="flex gap-2 mt-2">
                      {['25', '50', '100'].map(amt => (
                        <button
                          key={amt}
                          onClick={() => setPaymentAmount(amt)}
                          className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                            paymentAmount === amt
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          ${amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
                    <div className="w-12 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white text-[10px] font-black italic shrink-0">
                      VISA
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">•••• •••• •••• 4242</p>
                      <p className="text-xs font-semibold text-slate-400">Expires 12/28</p>
                    </div>
                    <button className="ml-auto text-xs font-bold text-indigo-600 hover:text-indigo-700">Change</button>
                  </div>

                  <button
                    onClick={handleSimulatePayment}
                    disabled={isProcessing}
                    className="w-full bg-gradient-primary text-white font-black py-4 rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <><Loader2 size={18} className="animate-spin" /> Processing...</>
                    ) : (
                      <>Pay ${paymentAmount}.00</>
                    )}
                  </button>

                  <p className="text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
                    <ShieldCheck size={13} /> Secured by Mock Stripe
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
