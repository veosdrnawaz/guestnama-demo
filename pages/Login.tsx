
import React, { useState } from 'react';
import { useAuth } from '../authContext';
import { Lock, Mail, Loader2, AlertCircle, KeyRound } from 'lucide-react';

interface LoginProps {
  onSwitch: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSwitch }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Mock hashing for demonstration
      const passHash = btoa(password); 
      const success = await login(email, passHash);
      if (!success) {
        setError('Invalid email or password combination.');
      }
    } catch (err) {
      setError('A connection error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-8 text-center bg-indigo-600 text-white">
            <h1 className="text-3xl font-bold tracking-tight">GuestNama</h1>
            <p className="mt-2 text-indigo-100">Secure Guest Management System</p>
          </div>
          
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-lg text-sm flex items-start">
                  <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input 
                    required
                    type="email"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-900"
                    placeholder="name@company.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input 
                    required
                    type="password"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-900"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button 
                disabled={isLoading}
                type="submit"
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center active:scale-95 disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <p className="text-center text-slate-600 text-sm">
                Don't have an account?{' '}
                <button 
                  onClick={onSwitch}
                  className="font-bold text-indigo-600 hover:text-indigo-700 underline underline-offset-4"
                >
                  Create Account
                </button>
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-2 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <KeyRound className="w-3 h-3" />
                Demo Credentials
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs text-slate-600">
                <div>
                  <span className="block font-bold">Admin:</span>
                  admin@guestnama.com / admin123
                </div>
                <div>
                  <span className="block font-bold">User:</span>
                  New signup / password
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
