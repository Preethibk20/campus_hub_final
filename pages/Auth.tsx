import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Mail, Lock, User, Eye, EyeOff, CheckCircle, AlertCircle,
  Sparkles, ArrowRight, Building2
} from 'lucide-react';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);

  const { login, signup, verifyEmail, resendVerification, isLoading, user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      if (isLogin) {
        const ok = await login(email, password);
        if (ok) setSuccess('Login successful!');
        else setError('Invalid credentials. Please try again.');
      } else {
        const ok = await signup(email, password, name, collegeName);
        if (ok) { setSuccess('Account created! Check your email for the verification code.'); setShowVerification(true); }
        else setError('Signup failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      const ok = await verifyEmail(verificationCode);
      if (ok) { setSuccess('Email verified!'); setShowVerification(false); }
      else setError('Invalid code. Please try again.');
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    }
  };

  if (user && user.isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(160deg, #f0f4ff 0%, #fafbff 60%, #f5f0ff 100%)' }}>
        <div className="text-center animate-scale-in">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Already Logged In</h2>
          <p className="text-slate-500 font-medium">You are verified and logged in.</p>
        </div>
      </div>
    );
  }

  if (showVerification && user && !user.isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(160deg, #f0f4ff 0%, #fafbff 60%, #f5f0ff 100%)' }}>
        <div className="w-full max-w-md animate-scale-in">
          <div className="bg-white rounded-3xl shadow-2xl shadow-indigo-100/50 p-8 border border-slate-100">
            <div className="text-center mb-7">
              <div className="bg-indigo-100 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Verify Your Email</h2>
              <p className="text-slate-500 text-sm font-medium">We sent a code to <span className="text-indigo-600 font-bold">{user.email}</span></p>
            </div>

            {error && (
              <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}
            {success && (
              <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <p className="text-sm text-emerald-700 font-medium">{success}</p>
              </div>
            )}

            <form onSubmit={handleVerification} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Verification Code</label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full px-4 py-3.5 border border-slate-200 rounded-2xl input-focus text-center text-2xl font-black tracking-[0.5em] text-slate-900"
                  placeholder="• • • • • •"
                  maxLength={6}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-primary text-white py-3.5 rounded-2xl font-extrabold hover:opacity-90 transition-all shadow-lg shadow-indigo-100 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? 'Verifying...' : <><CheckCircle size={17} /> Verify Email</>}
              </button>
            </form>

            <div className="mt-5 text-center">
              <button
                onClick={resendVerification}
                disabled={isLoading}
                className="text-indigo-600 hover:text-indigo-700 text-sm font-bold disabled:opacity-50 transition-colors"
              >
                Resend verification code
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(160deg, #f0f4ff 0%, #fafbff 60%, #f5f0ff 100%)' }}>
      {/* Left panel — decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-primary items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 30% 70%, rgba(255,255,255,0.4) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(255,255,255,0.3) 0%, transparent 50%)' }}></div>
        <div className="relative z-10 text-white max-w-sm text-center">
          <div className="bg-white/20 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-xl border border-white/30">
            <Sparkles size={36} />
          </div>
          <h1 className="text-4xl font-black mb-4 leading-tight">Campus Hub</h1>
          <p className="text-indigo-200 text-lg font-medium leading-relaxed">
            The peer-to-peer skill exchange platform built for students, by students.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            {[['500+', 'Students'], ['1.2k', 'Gigs Posted'], ['$12k', 'Earned']].map(([val, label]) => (
              <div key={label} className="bg-white/10 rounded-2xl p-4 border border-white/20">
                <p className="text-2xl font-black">{val}</p>
                <p className="text-indigo-200 text-xs font-semibold mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-scale-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-8">
            <div className="bg-gradient-primary p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-200">
              <Sparkles size={22} />
            </div>
            <span className="font-extrabold text-2xl text-slate-900">Campus Hub</span>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/60 p-8 border border-slate-100">
            <div className="mb-7">
              <h2 className="text-2xl font-extrabold text-slate-900">
                {isLogin ? 'Welcome back 👋' : 'Join Campus Hub'}
              </h2>
              <p className="text-slate-500 mt-1 font-medium text-sm">
                {isLogin ? 'Sign in to your account to continue.' : 'Create your student account for free.'}
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}
            {success && (
              <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <p className="text-sm text-emerald-700 font-medium">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3.5 border border-slate-200 rounded-2xl input-focus text-sm"
                      placeholder="Alex Johnson"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              {!isLogin && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">College Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={collegeName}
                      onChange={(e) => setCollegeName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3.5 border border-slate-200 rounded-2xl input-focus text-sm"
                      placeholder="Your University"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">College Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 border border-slate-200 rounded-2xl input-focus text-sm"
                    placeholder="your.email@gmail.com"
                    required
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1.5 font-medium">Currently accepting @gmail.com addresses</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3.5 border border-slate-200 rounded-2xl input-focus text-sm"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-primary text-white py-3.5 rounded-2xl font-extrabold hover:opacity-90 transition-all shadow-lg shadow-indigo-100 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? 'Please wait...' : (
                  <>{isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={17} /></>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
              <p className="text-slate-500 text-sm">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
                <button
                  onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }}
                  className="ml-1.5 text-indigo-600 hover:text-indigo-700 font-bold transition-colors"
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
