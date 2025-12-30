import React, { useMemo } from 'react';
import { useAuth } from '../authContext';
import { StorageService } from '../services/storageService';
import { UserRole } from '../types';
import { Users, UserCheck, Clock, Check, X, Calendar } from 'lucide-react';

export const Dashboard: React.FC = () => {
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
      events: guests.length > 0 ? 1 : 0 // Simplified for demo
    };
  }, [user]);

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-[#0f172a]">Welcome back</h1>
        <p className="text-slate-500 mt-1">Here's an overview of your guest management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Guests" value={stats.total} subtitle="Across all events" icon={<Users className="w-5 h-5 text-amber-500" />} />
        <StatCard title="Confirmed" value={stats.confirmed} subtitle="Ready to attend" icon={<UserCheck className="w-5 h-5 text-amber-500" />} />
        <StatCard title="Pending" value={stats.pending} subtitle="Awaiting response" icon={<Clock className="w-5 h-5 text-amber-500" />} />
        <StatCard title="Checked In" value={stats.checkedIn} subtitle="Already arrived" icon={<Check className="w-5 h-5 text-amber-500" />} />
        <StatCard title="Declined" value={stats.declined} subtitle="Unable to attend" icon={<X className="w-5 h-5 text-amber-500" />} />
        <StatCard title="Events" value={stats.events} subtitle="Unique occasions" icon={<Calendar className="w-5 h-5 text-amber-500" />} />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 min-h-[400px] flex flex-col">
        <h2 className="text-xl font-bold text-[#0f172a] mb-8">Recent Guests</h2>
        <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <Users className="w-10 h-10 text-slate-300" />
          </div>
          <p className="text-slate-400 font-medium">No guests yet. Start by adding your first guest!</p>
        </div>
      </div>
      
      {/* Toast-like notification from image */}
      <div className="fixed bottom-8 right-8 bg-white/90 backdrop-blur border border-slate-200 shadow-2xl rounded-2xl p-4 flex items-center gap-4 animate-in slide-in-from-right-10 duration-500">
        <div className="p-2 bg-amber-50 rounded-lg text-amber-600 font-bold">W</div>
        <div>
          <p className="text-sm font-bold text-[#0f172a]">Welcome back!</p>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtitle, icon }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between">
    <div>
      <p className="text-sm font-semibold text-slate-500 mb-2">{title}</p>
      <h3 className="text-4xl font-bold text-[#0f172a] mb-1">{value}</h3>
      <p className="text-xs text-slate-400">{subtitle}</p>
    </div>
    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
      {icon}
    </div>
  </div>
);