import React, { useState, useMemo } from 'react';
import { useAuth } from '../authContext';
import { StorageService } from '../services/storageService';
import { Guest, UserRole } from '../types';
import { GUEST_GROUPS, RSVP_STATUSES } from '../constants';
import { 
  Plus, 
  Search, 
  Mail, 
  Calendar, 
  Tag, 
  CheckCircle2, 
  Clock, 
  XCircle,
  X,
  Loader2,
  Trash2,
  UserPlus
} from 'lucide-react';

export const Guests: React.FC = () => {
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    eventDate: new Date().toISOString().split('T')[0],
    group: 'Other' as Guest['group'],
    rsvpStatus: 'Pending' as Guest['rsvpStatus']
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const guests = useMemo(() => {
    if (!user) return [];
    return StorageService.getGuests(user.id, user.role);
  }, [user, isFormOpen]);

  const filteredGuests = useMemo(() => {
    return guests.filter(g => 
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      g.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [guests, searchQuery]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = 'Valid email is required';
    if (!formData.eventDate) newErrors.eventDate = 'Event date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !user) return;

    setIsLoading(true);
    // Simulate brief network delay for UX
    await new Promise(r => setTimeout(r, 600));

    const newGuest: Guest = {
      ...formData,
      id: crypto.randomUUID(),
      userId: user.id,
      checkedIn: false
    };

    StorageService.addGuest(newGuest);
    setIsFormOpen(false);
    setIsLoading(false);
    setFormData({
      name: '',
      email: '',
      eventDate: new Date().toISOString().split('T')[0],
      group: 'Other',
      rsvpStatus: 'Pending'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Confirmed': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'Declined': return <XCircle className="w-4 h-4 text-rose-500" />;
      default: return <Clock className="w-4 h-4 text-amber-500" />;
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Declined': return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-amber-50 text-amber-700 border-amber-100';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0f172a]">Guest List</h1>
          <p className="text-slate-500 mt-1">Manage your event invitations and RSVPs</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-5 h-5" />
          Add New Guest
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text"
              placeholder="Search guests by name or email..."
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all text-sm"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Guest</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Group</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Event Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGuests.length > 0 ? filteredGuests.map(guest => (
                <tr key={guest.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 font-bold shrink-0">
                        {guest.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0f172a]">{guest.name}</p>
                        <p className="text-xs text-slate-400">{guest.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyles(guest.rsvpStatus)}`}>
                      {getStatusIcon(guest.rsvpStatus)}
                      {guest.rsvpStatus}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                      <Tag className="w-3.5 h-3.5" />
                      {guest.group}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(guest.eventDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button 
                      onClick={() => StorageService.deleteGuest(guest.id, user!.id, user!.role)}
                      className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <UserPlus className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-slate-400 font-medium">No guests found. Try refining your search or add a new guest.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Form Overlay */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-[#0f172a]/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsFormOpen(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#0f172a]">Add Guest</h2>
                <p className="text-sm text-slate-500">Enter details for the new invitee</p>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleAddGuest} className="flex-1 overflow-y-auto p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Jane Smith"
                  className={`w-full px-4 py-3 bg-slate-50 border ${errors.name ? 'border-rose-300' : 'border-slate-100'} rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all`}
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                />
                {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="email"
                    required
                    placeholder="jane@example.com"
                    className={`w-full pl-12 pr-4 py-3 bg-slate-50 border ${errors.email ? 'border-rose-300' : 'border-slate-100'} rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all`}
                    value={formData.email}
                    onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                  />
                </div>
                {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Event Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="date"
                    required
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                    value={formData.eventDate}
                    onChange={e => setFormData(p => ({ ...p, eventDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Group</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                    value={formData.group}
                    onChange={e => setFormData(p => ({ ...p, group: e.target.value as Guest['group'] }))}
                  >
                    {GUEST_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">RSVP Status</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                    value={formData.rsvpStatus}
                    onChange={e => setFormData(p => ({ ...p, rsvpStatus: e.target.value as Guest['rsvpStatus'] }))}
                  >
                    {RSVP_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </form>

            <div className="p-8 border-t border-slate-100 bg-slate-50/50">
              <button 
                disabled={isLoading}
                onClick={handleAddGuest}
                className="w-full py-4 bg-[#0f172a] text-white font-bold rounded-xl shadow-xl hover:bg-slate-800 disabled:bg-slate-300 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Guest Details'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};