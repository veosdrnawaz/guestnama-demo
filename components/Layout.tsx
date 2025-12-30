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
  ChevronRight
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
  ];

  if (user?.role === UserRole.ADMIN) {
    menuItems.push({ id: 'admin-stats', label: 'Admin Panel', icon: ShieldCheck, roles: [UserRole.ADMIN] });
  }

  const filteredItems = menuItems.filter(item => user && item.roles.includes(user.role));

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#0f172a] text-slate-300 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-8 flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-lg shadow-amber-500/20">G</div>
            <span className="text-xl font-bold tracking-tight text-white">Guest<span className="text-amber-500">Nama</span></span>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1">
            {filteredItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between px-4 py-3 text-sm font-semibold rounded-xl transition-all
                  ${activeTab === item.id 
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-xl shadow-amber-500/5' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'}
                `}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </div>
                {activeTab === item.id && <ChevronRight className="w-4 h-4" />}
              </button>
            ))}
          </nav>

          <div className="p-4 mt-auto border-t border-white/5">
            <div className="flex items-center p-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mr-3 border border-white/10 overflow-hidden">
                 <div className="w-full h-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold">
                   {user?.name.charAt(0)}
                 </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{user?.email}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">{user?.role}</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="w-full flex items-center px-4 py-2 text-sm font-bold text-slate-400 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
        
        <div className="flex-1 overflow-y-auto p-4 lg:p-12">
          <div className="max-w-6xl mx-auto">
             <button className="lg:hidden mb-6 p-2 bg-white rounded-lg shadow-sm border border-slate-200" onClick={() => setSidebarOpen(true)}>
               <Menu className="w-6 h-6 text-slate-600" />
             </button>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};