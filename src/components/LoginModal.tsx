import React, { useState } from 'react';
import { X, Eye, EyeOff, ShieldCheck, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Profile } from '../types.ts';

interface LoginModalProps {
  onClose: () => void;
  onSuccess: (agent: Profile) => void;
}

export default function LoginModal({ onClose, onSuccess }: LoginModalProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Real-time password requirement checkers for Register mode
  const passLength = password.length >= 8;
  const passUpper = /[A-Z]/.test(password);
  const passLower = /[a-z]/.test(password);
  const passDigit = /[0-9]/.test(password);
  const passSpecial = /[^A-Za-z0-9]/.test(password);
  const isPasswordValid = passLength && passUpper && passLower && passDigit && passSpecial;

  // Handle Login or Register Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isRegister && !isPasswordValid) {
      setError('Password does not meet the safety requirements.');
      setLoading(false);
      return;
    }

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong.');
      }

      onSuccess(data);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Quick-fill Dev Account
  const prefillDeveloper = () => {
    setEmail('developer49@gmail.com');
    setPassword('@Developer49');
    setIsRegister(false);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div 
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl shadow-amber-500/5 animate-in fade-in zoom-in-95 duration-200"
        id="login-modal-content"
      >
        {/* Header Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors"
          id="btn-close-login"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Headline */}
          <div className="text-center mb-6">
            <h2 className="font-serif text-2xl font-bold tracking-tight text-white">
              {isRegister ? 'Create Agent Profile' : 'Agent Portal Access'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isRegister ? 'Register your agent profile on Skocha' : 'Log in to manage your premium coin balances & ads'}
            </p>
          </div>

          {/* Quick-fill Admin Badge */}
          {!isRegister && (
            <div 
              onClick={prefillDeveloper}
              className="mb-5 flex items-center justify-between p-3 rounded-lg bg-amber-500/5 border border-amber-500/10 hover:border-amber-500/30 cursor-pointer transition-all group"
              id="admin-quickfill"
            >
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-amber-500" />
                <div className="text-left">
                  <p className="text-xs font-bold text-amber-400">Developer Admin Account</p>
                  <p className="text-[10px] text-slate-400">developer49@gmail.com</p>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded group-hover:bg-amber-400">
                PREFILL
              </span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start space-x-2 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Login/Register Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="agent@example.com"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isRegister ? 'Minimum 8 characters' : 'Enter your password'}
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Password Policy Real-time Verification Checklist */}
            {isRegister && (
              <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-lg space-y-1.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password Requirements</p>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                  <div className="flex items-center space-x-1.5 text-[10px]">
                    <CheckCircle2 className={`w-3.5 h-3.5 ${passLength ? 'text-emerald-500' : 'text-slate-600'}`} />
                    <span className={passLength ? 'text-slate-300' : 'text-slate-500'}>8+ Characters</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-[10px]">
                    <CheckCircle2 className={`w-3.5 h-3.5 ${passUpper ? 'text-emerald-500' : 'text-slate-600'}`} />
                    <span className={passUpper ? 'text-slate-300' : 'text-slate-500'}>1 Capital (A)</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-[10px]">
                    <CheckCircle2 className={`w-3.5 h-3.5 ${passLower ? 'text-emerald-500' : 'text-slate-600'}`} />
                    <span className={passLower ? 'text-slate-300' : 'text-slate-500'}>1 Lowercase (a)</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-[10px]">
                    <CheckCircle2 className={`w-3.5 h-3.5 ${passDigit ? 'text-emerald-500' : 'text-slate-600'}`} />
                    <span className={passDigit ? 'text-slate-300' : 'text-slate-500'}>1 Number (0-9)</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-[10px] col-span-2">
                    <CheckCircle2 className={`w-3.5 h-3.5 ${passSpecial ? 'text-emerald-500' : 'text-slate-600'}`} />
                    <span className={passSpecial ? 'text-slate-300' : 'text-slate-500'}>1 Special Char (e.g. @, #, $)</span>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (isRegister && !isPasswordValid)}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold rounded-lg text-sm transition-all shadow-md shadow-amber-500/5 mt-2"
              id="btn-login-submit"
            >
              {loading ? 'Processing...' : isRegister ? 'Complete Agent Registration' : 'Secure Log In'}
            </button>
          </form>

          {/* Toggle View Link */}
          <div className="mt-6 text-center text-xs">
            <span className="text-slate-400">
              {isRegister ? 'Already registered as an agent?' : 'Need to create an agent account?'}
            </span>{' '}
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-amber-400 hover:text-amber-300 font-bold focus:outline-none"
              id="btn-toggle-register-view"
            >
              {isRegister ? 'Log In here' : 'Register Agent here'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
