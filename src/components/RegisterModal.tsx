import React, { useState } from 'react';
import { X, Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Profile } from '../types.ts';

interface RegisterModalProps {
  onClose: () => void;
  onSuccess: (agent: Profile) => void;
  onSwitchToLogin: () => void;
}

export default function RegisterModal({ onClose, onSuccess, onSwitchToLogin }: RegisterModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

    if (!isPasswordValid) {
      setError('Password does not meet the safety requirements.');
      setLoading(false);
      return;
    }

    try {
      const result = await supabase.auth.signUp({ email, password });
      if (result.error) throw result.error;
      const authData = result.data;

      if (authData.user) {
        const { error: insertError } = await supabase.from('profiles').insert({
          user_id: authData.user.id,
          email: authData.user.email,
          role: 'agent',
          coinBalance: 0,
        });

        if (insertError) {
          throw new Error('Profile creation failed: ' + insertError.message);
        }

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', authData.user.id)
          .single();

        if (profileError || !profileData) {
          throw new Error('Profile not found after registration.');
        }

        const profile: Profile = {
          id: profileData.id,
          email: profileData.email,
          coinBalance: profileData.coinBalance || 0,
          isDeveloper: profileData.role === 'developer',
          createdAt: profileData.created_at,
        };

        onSuccess(profile);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
        <div className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">Create Agent Profile</h2>
            <p className="text-xs text-slate-400 mt-1">Register your account</p>
          </div>
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
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
            <div>
              <label className="text-xs text-slate-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white"
                  placeholder="Min 8 chars, upper, lower, number, special"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-slate-500">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full py-2.5 bg-amber-500 text-black font-bold rounded-lg">
              {loading ? 'Loading...' : 'Register'}
            </button>
          </form>
          <div className="mt-5 text-center text-xs text-slate-400">
            Already have account?{' '}
            <button type="button" onClick={onSwitchToLogin} className="text-amber-400 font-bold">
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}