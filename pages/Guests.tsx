import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../authContext';
import { StorageService } from '../services/storageService';
import { Guest, UserRole } from '../types';
import { GUEST_GROUPS, RSVP_STATUSES } from '../constants';
import { 
  Plus, 
  Search, 
  Phone, 
  Calendar, 
  Tag, 
  CheckCircle2, 
  Clock, 
  XCircle,
  X,
  Loader2,
  Trash2,
  UserPlus,
  Cloud,
  RefreshCw,
  Filter
} from 'lucide-react';

export const Guests: React.FC = () => {
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [guestList, setGuestList] = useState<Guest[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  const refreshGuests = async () => {
    if (!user) return;
    setIsFetching(true);
    try {
      const data = await StorageService.getGuests(user.id, user.role);
      setGuestList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    refreshGuests();
  }, [user]);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    eventDate: new Date().toISOString().split('T')[0],
    group: 'Other' as Guest['group'],
    rsvpStatus: 'Pending' as Guest['rsvpStatus']
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredGuests = useMemo(() => {
    return guestList.filter(g => 
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      g.phone.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [guestList, searchQuery]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim() || formData.phone.length < 5) newErrors.phone = 'Valid phone contact is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !user) return;

    setIsLoading(true);
    try {
      const newGuest: Guest = {
        ...formData,
        id: crypto.randomUUID(),
        userId: user.id,
        checkedIn: false
      };

      await StorageService.addGuest(newGuest);
      await refreshGuests();
      setIsFormOpen(false);
      setFormData({
        name: '',
        phone: '',
        eventDate: new Date().toISOString().split('T')[0],
        group: 'Other',
        rsvpStatus: 'Pending'
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (!confirm("Are you sure you want to delete this guest from the cloud?")) return;
    
    setIsFetching(true);
    try {
      await StorageService.deleteGuest(id);
      await refreshGuests();
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  };

  const toggleRsvpStatus = async (guest: Guest) => {
    const currentIndex = RSVP_STATUSES.indexOf(guest.rsvpStatus as any);
    const nextIndex = (currentIndex + 1) % RSVP_STATUSES.length;
    const nextStatus = RSVP_STATUSES[nextIndex] as Guest['rsvpStatus'];

    setGuestList(prev => prev.map(g => g.id === guest.id ? { ...g, rsvpStatus: nextStatus } : g));

    try {
      await StorageService.updateGuestStatus(guest.id, nextStatus);
    } catch (err) {
      console.error("Failed to update status on cloud:", err);
      refreshGuests();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Confirmed': return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
      case 'Declined': return <XCircle className="w-3.5 h-3.5 text-rose-500" />;
      default: return <Clock className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100';
      case 'Declined': return 'bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100';
      default: return 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100';
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#0f172a] flex items-center gap-3">
            Guest Directory
            {isFetching && <Loader2 className="w-5 h-5 animate-spin text-amber-500" />}
          </h1>
          <p className="text-slate-500 text-sm mt-1">Refine and manage your cloud-hosted guest list</p>
        </div>
        <div className="flex items-center gap-2 lg:gap-3">
          <button 
            onClick={refreshGuests}
            className="flex-1 lg:flex-none p-3 lg:p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-amber-500 hover:border-amber-200 transition-all shadow-sm active:scale-95"
            title="Refresh from cloud"
          >
            <RefreshCw className={`w-5 h-5 mx-auto ${isFetching ? 'animate-spin text-amber-500' : ''}`} />
          </button>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="flex-[3] lg:flex-none flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 lg:px-8 py-3.5 lg:py-4 rounded-2xl font-bold transition-all shadow-lg shadow-amber-500/20 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Add Guest
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 lg:p-6 border-b border-slate-100 bg-slate-50/30 flex flex-col lg:row items-center gap-4 lg:flex-row lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by name or contact..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all text-sm shadow-sm"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <Cloud className="w-3 h-3" />
              Real-time Sync
            </div>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Guest Identity</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">RSVP Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scheduled</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isFetching && guestList.length === 0 ? (
                <tr>
                   <td colSpan={5} className="px-6 py-24 text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-amber-500 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">Synchronizing with Cloud...</p>
                  </td>
                </tr>
              ) : filteredGuests.length > 0 ? filteredGuests.map(guest => (
                <tr key={guest.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 font-bold shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-sm">
                        {guest.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0f172a]">{guest.name}</p>
                        <p className="text-[11px] text-slate-400 font-medium">{guest.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <button 
                      onClick={() => toggleRsvpStatus(guest)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer active:scale-90 ${getStatusStyles(guest.rsvpStatus)}`}
                      title="Tap to change"
                    >
                      {getStatusIcon(guest.rsvpStatus)}
                      {guest.rsvpStatus}
                    </button>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                      <Tag className="w-3 h-3 text-slate-300" />
                      {guest.group}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-300" />
                      {new Date(guest.eventDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button 
                      onClick={() => handleDelete(guest.id)}
                      className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-100 lg:opacity-0 group-hover:opacity-100 active:scale-90"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                        <UserPlus className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-slate-400 font-bold">No results matching search</p>
                      <p className="text-slate-400 text-xs mt-1">Clear your filters or add a new guest entry.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Mobile Swipe Indicator */}
        <div className="lg:hidden px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          Swipe table to see more columns
        </div>
      </div>

      {/* Modern Slide-over Form Overlay */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-[#0f172a]/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsFormOpen(false)} />
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
            <div className="p-6 lg:p-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-[#0f172a]">New Guest</h2>
                <p className="text-sm text-slate-500">Add profile to your cloud registry</p>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors active:scale-90">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleAddGuest} className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">Guest Name</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Danish Ali"
                    className={`w-full px-5 py-4 bg-slate-50 border ${errors.name ? 'border-rose-300 ring-1 ring-rose-100' : 'border-slate-100'} rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium text-slate-800`}
                    value={formData.name}
                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">Contact Phone</label>
                  <div className="relative group">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                    <input 
                      type="tel"
                      required
                      placeholder="Enter mobile number"
                      className={`w-full pl-12 pr-5 py-4 bg-slate-50 border ${errors.phone ? 'border-rose-300 ring-1 ring-rose-100' : 'border-slate-100'} rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium text-slate-800`}
                      value={formData.phone}
                      onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">Group</label>
                    <select 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-bold text-sm text-slate-700 appearance-none"
                      value={formData.group}
                      onChange={e => setFormData(p => ({ ...p, group: e.target.value as Guest['group'] }))}
                    >
                      {GUEST_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">RSVP Status</label>
                    <select 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-bold text-sm text-slate-700 appearance-none"
                      value={formData.rsvpStatus}
                      onChange={e => setFormData(p => ({ ...p, rsvpStatus: e.target.value as Guest['rsvpStatus'] }))}
                    >
                      {RSVP_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">Event Date</label>
                  <div className="relative group">
                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                    <input 
                      type="date"
                      required
                      className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-bold text-sm text-slate-700"
                      value={formData.eventDate}
                      onChange={e => setFormData(p => ({ ...p, eventDate: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </form>

            <div className="p-6 lg:p-8 border-t border-slate-100 bg-slate-50/50">
              <button 
                disabled={isLoading}
                onClick={handleAddGuest}
                className="w-full py-4.5 bg-[#0f172a] text-white font-bold rounded-2xl shadow-xl hover:bg-slate-800 disabled:bg-slate-200 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Save to Cloud Directory</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};