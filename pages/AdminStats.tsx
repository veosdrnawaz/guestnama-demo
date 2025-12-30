
import React, { useMemo, useState, useEffect } from 'react';
import { StorageService } from '../services/storageService';
import { UserRole, User, Guest } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Users, UserCheck, UserX, UserPlus, TrendingUp, Loader2 } from 'lucide-react';

export const AdminStats: React.FC = () => {
  // Fix: StorageService calls are asynchronous, use state to store fetched data
  const [users, setUsers] = useState<(User & { passwordHash: string })[]>([]);
  const [allGuests, setAllGuests] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fix: Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [u, g] = await Promise.all([
          StorageService.getUsers(),
          StorageService.getGuests('', UserRole.ADMIN)
        ]);
        setUsers(u);
        setAllGuests(g);
      } catch (err) {
        console.error("Failed to fetch admin stats:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const data = useMemo(() => {
    // Fix: Perform calculations only when users or allGuests change
    const rsvpCounts = allGuests.reduce((acc: any, g) => {
      acc[g.rsvpStatus] = (acc[g.rsvpStatus] || 0) + 1;
      return acc;
    }, {});

    const pieData = Object.entries(rsvpCounts).map(([name, value]) => ({ name, value }));

    const userGuestCounts = users.map(u => ({
      name: u.name.split(' ')[0],
      guests: allGuests.filter(g => g.userId === u.id).length
    })).sort((a, b) => b.guests - a.guests).slice(0, 5);

    return {
      totalUsers: users.length,
      totalGuests: allGuests.length,
      confirmed: rsvpCounts['Confirmed'] || 0,
      declined: rsvpCounts['Declined'] || 0,
      pending: rsvpCounts['Pending'] || 0,
      pieData,
      userGuestCounts
    };
  }, [users, allGuests]);

  const COLORS = ['#10b981', '#f43f5e', '#6366f1'];

  const stats = [
    { label: 'Total Users', value: data.totalUsers, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Total Guests', value: data.totalGuests, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Confirmed', value: data.confirmed, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pending/Declined', value: data.pending + data.declined, icon: UserX, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  // Fix: Add loading UI
  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="font-medium">Loading Analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">RSVP Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Top Users by Guests</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.userGuestCounts}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="guests" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
