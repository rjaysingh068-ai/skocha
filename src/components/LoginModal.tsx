import React, { useState } from 'react';
import { X, Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
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

  // Password checks (register mode)
  const passLength = password.length >= 8;
  const passUpper = /[A-Z]/.test(password);
  const passLower = /[a-z]/.test(password);
  const passDigit = /[0-9]/.test(password);
  const passSpecial = /[^A-Za-z0-9]/.test(password);
  const isPasswordValid = passLength && passUpper && passLower && passDigit && passSpecial;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">

          {/* Title */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              {isRegister ? 'Create Agent Profile' : 'Agent Login'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isRegister ? 'Register your account' : 'Login to continue'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label className="text-xs text-slate-300">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white"
                  placeholder="email@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs text-slate-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white"
                  placeholder="Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-amber-500 text-black font-bold rounded-lg"
            >
              {loading ? 'Loading...' : isRegister ? 'Register' : 'Login'}
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-5 text-center text-xs text-slate-400">
            {isRegister ? 'Already have account?' : 'New user?'}{' '}
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-amber-400 font-bold"
            >
              {isRegister ? 'Login' : 'Register'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}