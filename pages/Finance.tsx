import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../authContext';
import { StorageService } from '../services/storageService';
import { FinanceEntry } from '../types';
import { Plus, Wallet, TrendingUp, TrendingDown, Trash2, Loader2, DollarSign, Tag, Calendar, X } from 'lucide-react';

export const Finance: React.FC = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<FinanceEntry[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    description: '',
    amount: 0,
    type: 'Expense' as 'Income' | 'Expense',
    category: 'Catering',
    date: new Date().toISOString().split('T')[0]
  });

  const refreshFinance = async () => {
    if (!user) return;
    setIsFetching(true);
    try {
      const data = await StorageService.getFinance(user.id);
      setEntries(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    refreshFinance();
  }, [user]);

  const stats = useMemo(() => {
    const income = entries.filter(e => e.type === 'Income').reduce((acc, curr) => acc + curr.amount, 0);
    const expenses = entries.filter(e => e.type === 'Expense').reduce((acc, curr) => acc + curr.amount, 0);
    return { income, expenses, balance: income - expenses };
  }, [entries]);

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);
    try {
      const newEntry: FinanceEntry = {
        ...formData,
        id: crypto.randomUUID(),
        userId: user.id
      };
      await StorageService.addFinance(newEntry);
      await refreshFinance();
      setIsFormOpen(false);
      setFormData({
        description: '',
        amount: 0,
        type: 'Expense',
        category: 'Catering',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this entry?")) return;
    try {
      await StorageService.deleteFinance(id);
      await refreshFinance();
    } catch (err) {
      console.error(err);
    }
  };

  if (isFetching && entries.length === 0) {
    return (
      <div className="h-96 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500 mb-4" />
        <p className="text-slate-400 font-bold">Loading ledger...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0f172a]">Finance Tracker</h1>
          <p className="text-slate-500 mt-1">Manage event budgets and expenditures</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg active:scale-95 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Transaction
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FinanceStat icon={<TrendingUp className="text-emerald-500" />} label="Total Income" value={stats.income} color="text-emerald-600" />
        <FinanceStat icon={<TrendingDown className="text-rose-500" />} label="Total Expenses" value={stats.expenses} color="text-rose-600" />
        <FinanceStat icon={<Wallet className="text-amber-500" />} label="Net Balance" value={stats.balance} color={stats.balance >= 0 ? 'text-amber-600' : 'text-rose-600'} />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <h2 className="font-bold text-slate-800">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Description</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Category</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Amount</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {entries.map(entry => (
                <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-500">{entry.date}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-800">{entry.description}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{entry.category}</td>
                  <td className={`px-6 py-4 text-sm font-black ${entry.type === 'Income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {entry.type === 'Income' ? '+' : '-'}${entry.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(entry.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0f172a]/40 backdrop-blur-sm" onClick={() => setIsFormOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-[#0f172a]">New Entry</h2>
              <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><X /></button>
            </div>
            <form onSubmit={handleAddEntry} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Description</label>
                <input required className="w-full px-5 py-4 bg-slate-50 border-transparent focus:border-amber-500 rounded-2xl outline-none" value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Amount</label>
                  <input type="number" required className="w-full px-5 py-4 bg-slate-50 border-transparent focus:border-amber-500 rounded-2xl outline-none" value={formData.amount} onChange={e => setFormData(p => ({ ...p, amount: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Type</label>
                  <select className="w-full px-5 py-4 bg-slate-50 border-transparent focus:border-amber-500 rounded-2xl outline-none" value={formData.type} onChange={e => setFormData(p => ({ ...p, type: e.target.value as any }))}>
                    <option value="Expense">Expense</option>
                    <option value="Income">Income</option>
                  </select>
                </div>
              </div>
              <button disabled={isLoading} className="w-full py-4.5 bg-amber-500 text-white font-bold rounded-2xl shadow-xl hover:bg-amber-600 transition-all active:scale-95">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Add to Registry'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const FinanceStat = ({ icon, label, value, color }: any) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mb-4">{icon}</div>
    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <h3 className={`text-2xl font-black ${color}`}>${value.toLocaleString()}</h3>
  </div>
);