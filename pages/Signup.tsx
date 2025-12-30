import React, { useState } from 'react';
import { useAuth } from '../authContext';
import { User, Mail, Lock, Loader2, AlertCircle, ArrowRight } from 'lucide-react';

interface SignupProps {
  onSwitch: () => void;
}

export const Signup: React.FC<SignupProps> = ({ onSwitch }) => {
  const { signup } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirm) return setError('Passwords do not match');
    if (formData.password.length < 6) return setError('Password must be 6+ characters');

    setIsLoading(true);
    try {
      const passHash = btoa(formData.password);
      const success = await signup(formData.name, formData.email, passHash);
      if (!success) setError('Email already registered.');
    } catch (err) {
      setError('An error occurred.');
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
            Join the world of <br />
            <span className="text-amber-500">elegant</span> hosting
          </h1>
          <p className="mt-8 text-slate-400 text-lg max-w-md">
            Start organizing your events with professional tools and a sophisticated interface.
          </p>
        </div>
        <p className="text-slate-500 text-sm relative z-10">© 2024 GuestNama. All rights reserved.</p>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Form Panel */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-24 bg-slate-50/30">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#0f172a]">Create account</h2>
            <p className="text-slate-500 mt-2">Start your journey with GuestNama today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-4 bg-rose-50 text-rose-700 rounded-xl text-sm flex items-start">
                <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  required
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  required
                  type="email"
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                <input 
                  required
                  type="password"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                  placeholder="••••••"
                  value={formData.password}
                  onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm</label>
                <input 
                  required
                  type="password"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                  placeholder="••••••"
                  value={formData.confirm}
                  onChange={e => setFormData(p => ({ ...p, confirm: e.target.value }))}
                />
              </div>
            </div>

            <button 
              disabled={isLoading}
              type="submit"
              className="w-full mt-4 py-4 bg-[#0f172a] text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign Up <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-500 text-sm">
            Already have an account?{' '}
            <button onClick={onSwitch} className="font-bold text-amber-500 hover:text-amber-600">Sign in</button>
          </p>
        </div>
      </div>
    </div>
  );
};