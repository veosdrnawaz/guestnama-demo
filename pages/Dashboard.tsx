import React, { useMemo } from 'react';
import { useAuth } from '../authContext';
import { StorageService } from '../services/storageService';
import { UserRole } from '../types';
import { Users, UserCheck, Clock, Check, X, Calendar, ArrowRight, UserPlus } from 'lucide-react';

interface DashboardProps {
  onNavigateToGuests: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigateToGuests }) => {
  const { user } = useAuth();
  
  const stats = useMemo(() => {
    if (!user) return { total: 0, confirmed: 0, pending: 0, checkedIn: 0, declined: 0, events: 0 };
    const guests = StorageService.getGuests(user.id, user.role);
    return {
      total: guests.length,
      confirmed: guests.filter(g => g.rsvpStatus === 'Confirmed').length,
      pending: guests.filter(g => g.rsvpStatus === 'Pending').length,
      checkedIn: guests.filter(g => g.checkedIn).length,
      declined: guests.filter(g => g.rsvpStatus === 'Declined').length,
      events: guests.length > 0 ? 1 : 0
    };
  }, [user]);

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0f172a]">Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back, {user?.name.split(' ')[0]}</p>
        </div>
        <button 
          onClick={onNavigateToGuests}
          className="text-amber-500 text-sm font-bold flex items-center gap-2 hover:gap-3 transition-all"
        >
          View detailed list <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard onClick={onNavigateToGuests} title="Total Guests" value={stats.total} subtitle="Across all events" icon={<Users className="w-5 h-5 text-amber-500" />} />
        <StatCard onClick={onNavigateToGuests} title="Confirmed" value={stats.confirmed} subtitle="Ready to attend" icon={<UserCheck className="w-5 h-5 text-amber-500" />} />
        <StatCard onClick={onNavigateToGuests} title="Pending" value={stats.pending} subtitle="Awaiting response" icon={<Clock className="w-5 h-5 text-amber-500" />} />
        <StatCard onClick={onNavigateToGuests} title="Checked In" value={stats.checkedIn} subtitle="Already arrived" icon={<Check className="w-5 h-5 text-amber-500" />} />
        <StatCard onClick={onNavigateToGuests} title="Declined" value={stats.declined} subtitle="Unable to attend" icon={<X className="w-5 h-5 text-amber-500" />} />
        <StatCard onClick={onNavigateToGuests} title="Events" value={stats.events} subtitle="Unique occasions" icon={<Calendar className="w-5 h-5 text-amber-500" />} />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 min-h-[400px] flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-[#0f172a]">Recent Guests</h2>
          <button 
            onClick={onNavigateToGuests}
            className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-400"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <Users className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-2">No guest activity yet</h3>
          <p className="text-slate-400 max-w-xs mx-auto mb-8">Ready to host your next event? Start building your guest list today.</p>
          <button 
            onClick={onNavigateToGuests}
            className="px-6 py-3 bg-[#0f172a] text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg"
          >
            <UserPlus className="w-5 h-5" />
            Add First Guest
          </button>
        </div>
      </div>
      
      {/* Welcome Toast */}
      <div className="fixed bottom-8 right-8 bg-white/90 backdrop-blur border border-slate-200 shadow-2xl rounded-2xl p-4 flex items-center gap-4 animate-in slide-in-from-right-10 duration-700">
        <div className="p-2 bg-amber-500 rounded-lg text-white font-bold shadow-lg shadow-amber-500/20">
          <Check className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-[#0f172a]">Live Synchronization</p>
          <p className="text-xs text-slate-500">System is online and ready</p>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtitle, icon, onClick }: any) => (
  <button 
    onClick={onClick}
    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-amber-200 transition-all duration-300 flex items-start justify-between text-left group"
  >
    <div className="flex-1">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-hover:text-amber-500 transition-colors">{title}</p>
      <h3 className="text-4xl font-bold text-[#0f172a] mb-1 tracking-tight">{value}</h3>
      <p className="text-xs text-slate-400 font-medium">{subtitle}</p>
    </div>
    <div className="w-12 h-12 bg-slate-50 group-hover:bg-amber-50 rounded-xl flex items-center justify-center shrink-0 transition-colors">
      {icon}
    </div>
  </button>
);