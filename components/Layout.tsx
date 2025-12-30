
import React, { useState } from 'react';
import { useAuth } from '../authContext';
import { UserRole } from '../types';
import { 
  LayoutDashboard, 
  Users, 
  LogOut, 
  Menu, 
  X, 
  ShieldCheck, 
  User as UserIcon,
  Calendar,
  PieChart
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = user?.role === UserRole.ADMIN;

  const menuItems = [
    { id: 'dashboard', label: 'My Guests', icon: Calendar, roles: [UserRole.USER, UserRole.ADMIN] },
    { id: 'admin-stats', label: 'Global Analytics', icon: PieChart, roles: [UserRole.ADMIN] },
    { id: 'user-management', label: 'User Management', icon: ShieldCheck, roles: [UserRole.ADMIN] },
  ];

  const filteredItems = menuItems.filter(item => user && item.roles.includes(user.role));

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h1 className="text-xl font-bold text-indigo-600 tracking-tight">GuestNama</h1>
            <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {filteredItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                  ${activeTab === item.id 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                `}
              >
                <item.icon className={`w-5 h-5 mr-3 ${activeTab === item.id ? 'text-indigo-600' : 'text-slate-400'}`} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center p-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                <UserIcon className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate capitalize">{user?.role.toLowerCase()}</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 lg:px-8 shrink-0">
          <button 
            className="lg:hidden p-2 -ml-2 text-slate-400"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="ml-4 lg:ml-0 flex-1">
            <h2 className="text-lg font-semibold text-slate-800">
              {filteredItems.find(i => i.id === activeTab)?.label}
            </h2>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
