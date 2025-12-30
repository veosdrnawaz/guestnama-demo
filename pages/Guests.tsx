import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../authContext';
import { StorageService } from '../services/storageService';
import { Guest, UserRole } from '../types';
import { GUEST_GROUPS, RSVP_STATUSES, RELATIONSHIPS, CAR_STATUS, INVITE_STATUS } from '../constants';
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
  Filter,
  Check,
  MapPin,
  Car,
  User as UserIcon,
  MessageSquare,
  History
} from 'lucide-react';

export const Guests: React.FC = () => {
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [groupFilter, setGroupFilter] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(false);
  const [guestList, setGuestList] = useState<Guest[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  const initialFormState = {
    name: '',
    phone: '',
    city: '',
    vipStatus: false,
    men: 0,
    women: 0,
    children: 0,
    relationship: 'Family',
    ownCar: 'No (Need Transport)',
    invitedBy: '',
    rsvpStatus: 'Pending' as Guest['rsvpStatus'],
    invitationSent: 'Not Sent',
    notes: '',
    group: 'Other' as Guest['group'],
    eventDate: new Date().toISOString().split('T')[0],
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Derive dynamic quick fills from existing guest names in the "invitedBy" field
  const previousReferences = useMemo(() => {
    const names = guestList
      .map(g => g.invitedBy?.trim())
      .filter(Boolean);
    return Array.from(new Set(names)).slice(0, 8); // Show top 8 unique references
  }, [guestList]);

  // Auto-calculate total persons
  const totalPersons = (Number(formData.men) || 0) + (Number(formData.women) || 0) + (Number(formData.children) || 0);

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

  const filteredGuests = useMemo(() => {
    return guestList.filter(g => {
      const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            g.phone.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || g.rsvpStatus === statusFilter;
      const matchesGroup = groupFilter === 'All' || g.group === groupFilter;
      return matchesSearch && matchesStatus && matchesGroup;
    });
  }, [guestList, searchQuery, statusFilter, groupFilter]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Full Name is required';
    if (!formData.city.trim()) newErrors.city = 'City/Village is required';
    if (!formData.invitedBy.trim()) newErrors.invitedBy = 'Reference is required';
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
        checkedIn: false,
        totalPersons: totalPersons
      };

      await StorageService.addGuest(newGuest);
      await refreshGuests();
      setIsFormOpen(false);
      setFormData(initialFormState);
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
      {/* Header Section */}
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
          >
            <RefreshCw className={`w-5 h-5 mx-auto ${isFetching ? 'animate-spin text-amber-500' : ''}`} />
          </button>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="flex-[3] lg:flex-none flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 lg:px-8 py-3.5 lg:py-4 rounded-2xl font-bold transition-all shadow-lg shadow-amber-500/20 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Add New Guest
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Filters Section */}
        <div className="p-4 lg:p-6 border-b border-slate-100 bg-slate-50/30 space-y-4">
          <div className="flex flex-col lg:row items-center gap-4 lg:flex-row lg:justify-between">
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

          <div className="flex flex-col sm:flex-row gap-4 sm:items-center pt-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Status:
              </span>
              <button 
                onClick={() => setStatusFilter('All')}
                className={`px-4 py-1.5 rounded-xl text-[11px] font-bold transition-all border ${statusFilter === 'All' ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-amber-200 hover:text-amber-500'}`}
              >
                All
              </button>
              {RSVP_STATUSES.map(status => (
                <button 
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-1.5 rounded-xl text-[11px] font-bold transition-all border flex items-center gap-1.5 ${statusFilter === status ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-amber-200 hover:text-amber-500'}`}
                >
                  {statusFilter === status && <Check className="w-3 h-3" />}
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Guest Identity</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Persons</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Attendance</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reference</th>
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
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 transition-all shadow-sm ${guest.vipStatus ? 'bg-amber-100 text-amber-600 border border-amber-200' : 'bg-slate-50 text-slate-500'}`}>
                        {guest.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-bold text-[#0f172a]">{guest.name}</p>
                          {guest.vipStatus && <span className="text-[9px] bg-amber-500 text-white px-1.5 py-0.5 rounded font-black uppercase">VIP</span>}
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium">{guest.city}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm font-bold text-slate-700">
                      {guest.totalPersons} <span className="text-[10px] text-slate-400 font-normal ml-1">(M:{guest.men} W:{guest.women} C:{guest.children})</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <button 
                      onClick={() => toggleRsvpStatus(guest)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer active:scale-90 ${getStatusStyles(guest.rsvpStatus)}`}
                    >
                      {getStatusIcon(guest.rsvpStatus)}
                      {guest.rsvpStatus}
                    </button>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                      <UserIcon className="w-3 h-3 text-slate-300" />
                      {guest.invitedBy}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button 
                      onClick={() => handleDelete(guest.id)}
                      className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all active:scale-90"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-24 text-center text-slate-400">
                    No results found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Advanced "Add New Guest" Slide-over */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-[#0f172a]/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsFormOpen(false)} />
          <div className="relative w-full max-w-xl bg-white h-full shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#0f172a]">Add New Guest</h2>
              <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddGuest} className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-10">
              
              {/* Basic Information Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-black text-fuchsia-600 uppercase tracking-widest">Basic Information</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-slate-400">VIP Status</span>
                    <button 
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, vipStatus: !p.vipStatus }))}
                      className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${formData.vipStatus ? 'bg-amber-500' : 'bg-slate-200'}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${formData.vipStatus ? 'left-5.5' : 'left-0.5'}`} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2">Full Name <span className="text-rose-500">*</span></label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Ali Khan"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                      value={formData.name}
                      onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    />
                    {errors.name && <p className="text-[10px] text-rose-500 mt-1 font-bold">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2">Phone Number</label>
                    <input 
                      type="tel"
                      placeholder="0300-XXXXXXX"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                      value={formData.phone}
                      onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">City / Village <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Model Town, Lahore"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                      value={formData.city}
                      onChange={e => setFormData(p => ({ ...p, city: e.target.value }))}
                    />
                  </div>
                  {errors.city && <p className="text-[10px] text-rose-500 mt-1 font-bold">{errors.city}</p>}
                </div>
              </div>

              {/* Guest Breakdown Section */}
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-black text-fuchsia-600 uppercase tracking-widest">Guest Breakdown</h3>
                </div>
                
                <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <label className="block text-[10px] font-black text-blue-600 uppercase mb-2">Men</label>
                      <input 
                        type="number"
                        min="0"
                        className="w-full text-center py-3 bg-white border border-slate-200 rounded-xl font-bold text-lg"
                        value={formData.men}
                        onChange={e => setFormData(p => ({ ...p, men: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div className="text-center">
                      <label className="block text-[10px] font-black text-rose-600 uppercase mb-2">Women</label>
                      <input 
                        type="number"
                        min="0"
                        className="w-full text-center py-3 bg-white border border-slate-200 rounded-xl font-bold text-lg"
                        value={formData.women}
                        onChange={e => setFormData(p => ({ ...p, women: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div className="text-center">
                      <label className="block text-[10px] font-black text-amber-600 uppercase mb-2">Children</label>
                      <input 
                        type="number"
                        min="0"
                        className="w-full text-center py-3 bg-white border border-slate-200 rounded-xl font-bold text-lg"
                        value={formData.children}
                        onChange={e => setFormData(p => ({ ...p, children: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>
                  <div className="text-center border-t border-slate-200 pt-4">
                    <p className="text-slate-400 font-bold text-sm">Total Persons: <span className="text-slate-900 text-lg ml-1">{totalPersons}</span></p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2">Relationship</label>
                    <select 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm appearance-none"
                      value={formData.relationship}
                      onChange={e => setFormData(p => ({ ...p, relationship: e.target.value }))}
                    >
                      {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5">
                      Own Car? <Car className="w-3.5 h-3.5 text-slate-400" />
                    </label>
                    <select 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm appearance-none"
                      value={formData.ownCar}
                      onChange={e => setFormData(p => ({ ...p, ownCar: e.target.value }))}
                    >
                      {CAR_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Invited By / Reference Section */}
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-black text-fuchsia-600 uppercase tracking-widest">Invited By / Reference <span className="text-rose-500">*</span></h3>
                </div>
                
                <input 
                  type="text"
                  required
                  placeholder="Enter YOUR name (e.g. Mukhtar, Khalil)"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm shadow-sm"
                  value={formData.invitedBy}
                  onChange={e => setFormData(p => ({ ...p, invitedBy: e.target.value }))}
                />
                
                {previousReferences.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      <History className="w-3 h-3" />
                      Previous Names:
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {previousReferences.map(name => (
                        <button 
                          key={name}
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, invitedBy: name }))}
                          className="px-4 py-2 bg-white hover:bg-amber-500 hover:text-white text-[11px] font-bold text-slate-600 rounded-xl transition-all border border-slate-200 hover:border-amber-500 shadow-sm active:scale-95"
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {errors.invitedBy && <p className="text-[10px] text-rose-500 mt-1 font-bold">{errors.invitedBy}</p>}
              </div>

              {/* Status & Notes Section */}
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-black text-fuchsia-600 uppercase tracking-widest">Status & Notes</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2">Attendance Status</label>
                    <select 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm appearance-none"
                      value={formData.rsvpStatus}
                      onChange={e => setFormData(p => ({ ...p, rsvpStatus: e.target.value as Guest['rsvpStatus'] }))}
                    >
                      {RSVP_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2">Invitation Sent?</label>
                    <select 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm appearance-none"
                      value={formData.invitationSent}
                      onChange={e => setFormData(p => ({ ...p, invitationSent: e.target.value }))}
                    >
                      {INVITE_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">Notes</label>
                  <textarea 
                    rows={3}
                    placeholder="Any special requirements..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm resize-none"
                    value={formData.notes}
                    onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                  />
                </div>
              </div>
            </form>

            {/* Sticky Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
              <button 
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button 
                disabled={isLoading}
                onClick={handleAddGuest}
                className="flex-[2] py-3 bg-[#9333ea] hover:bg-[#7e22ce] text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Guest'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};