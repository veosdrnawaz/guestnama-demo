
import React, { useState, useEffect } from 'react';
import { useAuth } from '../authContext';
import { StorageService } from '../services/storageService';
import { Guest, UserRole } from '../types';
import { GUEST_GROUPS, RSVP_STATUSES } from '../constants';
import { Plus, Trash2, Mail, Tag, ChevronRight, Filter } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newGuest, setNewGuest] = useState({
    name: '',
    email: '',
    eventDate: new Date().toISOString().split('T')[0],
    group: 'Other' as Guest['group']
  });

  useEffect(() => {
    if (user) {
      setGuests(StorageService.getGuests(user.id, user.role));
    }
  }, [user]);

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const guest: Guest = {
      ...newGuest,
      id: crypto.randomUUID(),
      userId: user.id,
      rsvpStatus: 'Pending'
    };

    StorageService.addGuest(guest);
    setGuests(prev => [...prev, guest]);
    setIsAdding(false);
    setNewGuest({
      name: '',
      email: '',
      eventDate: new Date().toISOString().split('T')[0],
      group: 'Other'
    });
  };

  const handleDelete = (id: string) => {
    if (!user) return;
    StorageService.deleteGuest(id, user.id, user.role);
    setGuests(prev => prev.filter(g => g.id !== id));
  };

  const updateStatus = (id: string, status: Guest['rsvpStatus']) => {
    StorageService.updateGuestStatus(id, status);
    setGuests(prev => prev.map(g => g.id === id ? { ...g, rsvpStatus: status } : g));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Guest List</h1>
          <p className="text-slate-500 text-sm">Manage your invitations and RSVP statuses</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Guest
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleAddGuest} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Name</label>
              <input 
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Guest name"
                value={newGuest.name}
                onChange={e => setNewGuest(p => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Email</label>
              <input 
                required
                type="email"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="email@example.com"
                value={newGuest.email}
                onChange={e => setNewGuest(p => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Group</label>
              <select 
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                value={newGuest.group}
                onChange={e => setNewGuest(p => ({ ...p, group: e.target.value as Guest['group'] }))}
              >
                {GUEST_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button 
                type="submit"
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700"
              >
                Save
              </button>
              <button 
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-slate-400 hover:text-slate-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Guest</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Group</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">RSVP Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Event Date</th>
                {user?.role === UserRole.ADMIN && (
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Owner ID</th>
                )}
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {guests.length === 0 ? (
                <tr>
                  <td colSpan={user?.role === UserRole.ADMIN ? 6 : 5} className="px-6 py-12 text-center text-slate-400">
                    No guests found. Start adding some to your list!
                  </td>
                </tr>
              ) : (
                guests.map(guest => (
                  <tr key={guest.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-indigo-600 font-bold mr-3 uppercase shrink-0">
                          {guest.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{guest.name}</div>
                          <div className="text-xs text-slate-500 flex items-center mt-1">
                            <Mail className="w-3 h-3 mr-1" /> {guest.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                        <Tag className="w-3 h-3 mr-1" /> {guest.group}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={guest.rsvpStatus}
                        onChange={(e) => updateStatus(guest.id, e.target.value as Guest['rsvpStatus'])}
                        className={`
                          text-xs font-bold px-3 py-1.5 rounded-lg border-none focus:ring-2 focus:ring-offset-2 transition-all cursor-pointer
                          ${guest.rsvpStatus === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' : 
                            guest.rsvpStatus === 'Declined' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}
                        `}
                      >
                        {RSVP_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                      {new Date(guest.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    {user?.role === UserRole.ADMIN && (
                      <td className="px-6 py-4 text-xs font-mono text-slate-400">
                        {guest.userId}
                      </td>
                    )}
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(guest.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50"
                        title="Delete Guest"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
