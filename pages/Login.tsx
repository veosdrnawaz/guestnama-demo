import React, { useState } from 'react';
import { useAuth } from '../authContext';
import { Lock, Mail, Loader2, AlertCircle, ArrowRight } from 'lucide-react';

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
      const passHash = btoa(password); 
      const success = await login(email, passHash);
      if (!success) setError('Invalid email or password combination.');
    } catch (err) {
      setError('A connection error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Brand Panel */}
      <div className="lg:w-1/2 bg-[#0f172a] p-12 lg:p-24 flex flex-col justify-between text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-20">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">G</div>
            <span className="text-xl font-bold tracking-tight">Guest<span className="text-amber-500">Nama</span></span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-serif leading-tight">
            Manage your guests <br />
            with <span className="text-amber-500">elegance</span>
          </h1>
          <p className="mt-8 text-slate-400 text-lg max-w-md">
            A sophisticated platform for organizing events, tracking RSVPs, and ensuring every guest feels welcome.
          </p>
        </div>
        <p className="text-slate-500 text-sm relative z-10">© 2024 GuestNama. All rights reserved.</p>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Form Panel */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-24 bg-slate-50/30">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#0f172a]">Welcome back</h2>
            <p className="text-slate-500 mt-2">Sign in to manage your guest lists</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-rose-50 text-rose-700 rounded-xl text-sm flex items-start">
                <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  required
                  type="email"
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  required
                  type="password"
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              disabled={isLoading}
              type="submit"
              className="w-full py-4 bg-white border border-slate-200 text-[#0f172a] font-bold rounded-xl shadow-sm hover:shadow-md hover:bg-white transition-all flex items-center justify-center gap-2 group"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-500 text-sm">
            Don't have an account?{' '}
            <button onClick={onSwitch} className="font-bold text-amber-500 hover:text-amber-600">Sign up</button>
          </p>
        </div>
      </div>
    </div>
  );
};