import React, { useState } from 'react';
import { useAuth } from '../authContext';
import { UserRole } from '../types';
import { 
  Users, 
  LogOut, 
  Menu, 
  X, 
  LayoutDashboard,
  ShieldCheck,
  ChevronRight,
  UsersRound,
  Wallet,
  CheckSquare
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [UserRole.USER, UserRole.ADMIN] },
    { id: 'guests', label: 'Guests', icon: Users, roles: [UserRole.USER, UserRole.ADMIN] },
    { id: 'finance', label: 'Finance', icon: Wallet, roles: [UserRole.USER, UserRole.ADMIN] },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, roles: [UserRole.USER, UserRole.ADMIN] },
  ];

  if (user?.role === UserRole.ADMIN) {
    menuItems.push({ id: 'admin-stats', label: 'Analytics', icon: ShieldCheck, roles: [UserRole.ADMIN] });
    menuItems.push({ id: 'user-management', label: 'User Directory', icon: UsersRound, roles: [UserRole.ADMIN] });
  }

  const filteredItems = menuItems.filter(item => user && item.roles.includes(user.role));

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden selection:bg-amber-100">
      {/* Mobile Glassmorphism Toggle */}
      {!isSidebarOpen && (
        <button 
          className="lg:hidden fixed top-6 right-6 z-[60] p-3 bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl border border-white/50 active:scale-90 transition-all"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="w-6 h-6 text-slate-800" />
        </button>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-[280px] bg-[#0f172a] text-slate-300 transform transition-transform duration-500 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
           <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500 rounded-full blur-3xl translate-x-12 -translate-y-12"></div>
           <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-600 rounded-full blur-3xl -translate-x-12 translate-y-12"></div>
        </div>

        <div className="flex flex-col h-full relative z-10">
          <div className="p-8 pb-10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-lg shadow-amber-500/30">G</div>
              <span className="text-xl font-bold tracking-tight text-white">Guest<span className="text-amber-500">Nama</span></span>
            </div>
            <button className="lg:hidden p-2 hover:bg-white/10 rounded-xl transition-colors" onClick={() => setSidebarOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 px-4 space-y-1.5">
            {filteredItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between px-5 py-4 text-sm font-bold rounded-2xl transition-all duration-300
                  ${activeTab === item.id 
                    ? 'bg-amber-500 text-white shadow-xl shadow-amber-500/20 translate-x-1' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'}
                `}
              >
                <div className="flex items-center gap-3.5">
                  <item.icon className={`w-5 h-5 transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : ''}`} />
                  {item.label}
                </div>
                {activeTab === item.id && <ChevronRight className="w-4 h-4 animate-in fade-in slide-in-from-left-2" />}
              </button>
            ))}
          </nav>

          <div className="p-6 mt-auto">
            <div className="flex items-center p-4 mb-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-black text-lg mr-4 shadow-lg border border-white/10">
                {user?.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-amber-500 uppercase tracking-widest font-black flex items-center gap-1.5 mt-0.5">
                  <ShieldCheck className="w-3 h-3" />
                  {user?.role}
                </p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="w-full flex items-center px-5 py-4 text-sm font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-400/5 rounded-2xl transition-all group active:scale-95"
            >
              <LogOut className="w-4 h-4 mr-3.5 group-hover:-translate-x-1 transition-transform" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-[#0f172a]/80 backdrop-blur-md z-40 lg:hidden animate-in fade-in duration-300" onClick={() => setSidebarOpen(false)} />
        )}
        
        <div className="flex-1 overflow-y-auto p-5 lg:p-12 relative">
          {/* Top header spacing for mobile toggle */}
          <div className="lg:hidden h-12"></div>
          
          <div className="max-w-6xl mx-auto page-transition pb-12">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};