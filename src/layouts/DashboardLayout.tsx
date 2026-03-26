import React from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, Package, Users, Settings, LogOut, Menu, X, Bell, Globe, Leaf } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { useCurrency } from '../context/CurrencyContext';
import { cn } from '../lib/utils';

export const DashboardLayout: React.FC<{ 
  children: React.ReactNode,
  activeTab: string,
  onTabChange: (tab: any) => void
}> = ({ children, activeTab, onTabChange }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const { isDemoMode, toggleDemoMode } = useAppState();
  const { currency, setCurrency } = useCurrency();

  const navItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { id: 'inventory', icon: <Package size={20} />, label: 'Inventory' },
    { id: 'crm', icon: <Users size={20} />, label: 'Kopesha+ CRM' },
    { id: 'sustainability', icon: <Leaf size={20} />, label: 'Sustainability' },
    { id: 'settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 glass border-r border-white/10 transition-all duration-500",
        isSidebarOpen ? "w-64" : "w-20"
      )}>
        <div className="h-full flex flex-col p-4">
          <div className="flex items-center gap-3 px-2 mb-10">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Package className="text-white" size={24} />
            </div>
            {isSidebarOpen && (
              <motion.span 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="text-xl font-bold tracking-tight text-white"
              >
                AgroFlow<span className="text-blue-500">Pro</span>
              </motion.span>
            )}
          </div>

          <nav className="flex-1 flex flex-col gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-xl transition-all group",
                  activeTab === item.id ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <span className={cn(activeTab === item.id ? "text-white" : "group-hover:text-blue-400")}>{item.icon}</span>
                {isSidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            ))}
          </nav>

          <div className="mt-auto flex flex-col gap-4">
            {isSidebarOpen && (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Demo Mode</span>
                  <button 
                    onClick={toggleDemoMode}
                    className={cn(
                      "w-8 h-4 rounded-full transition-all relative",
                      isDemoMode ? "bg-blue-500" : "bg-slate-700"
                    )}
                  >
                    <div className={cn(
                      "absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all",
                      isDemoMode ? "right-0.5" : "left-0.5"
                    )} />
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Demo mode preloads sample data for testing.
                </p>
              </div>
            )}
            
            <button className="flex items-center gap-4 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all">
              <LogOut size={20} />
              {isSidebarOpen && <span className="font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-all duration-500 min-h-screen",
        isSidebarOpen ? "pl-64" : "pl-20"
      )}>
        {/* Header */}
        <header className="sticky top-0 z-40 glass border-b border-white/10 px-8 py-4 flex items-center justify-between">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-white/5 text-slate-400"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <Globe size={14} className="text-blue-400" />
              <select 
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="bg-transparent text-xs font-bold focus:outline-none cursor-pointer"
              >
                <option value="KES">KES</option>
                <option value="UGX">UGX</option>
                <option value="TZS">TZS</option>
                <option value="RWF">RWF</option>
              </select>
            </div>

            <button className="relative p-2 rounded-lg hover:bg-white/5 text-slate-400">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500" />
            </button>

            <div className="flex items-center gap-3 pl-6 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white">Main Agrovet</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">Admin</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 border-2 border-white/10" />
            </div>
          </div>
        </header>

        <div className="p-8 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>

      <div className="sm:hidden fixed bottom-0 inset-x-0 glass border-t border-white/10 px-6 py-3 flex justify-between items-center z-50">
        {navItems.map((item) => (
          <button 
            key={item.id} 
            onClick={() => onTabChange(item.id)}
            className={cn("p-2 rounded-xl", activeTab === item.id ? "text-blue-400" : "text-slate-500")}
          >
            {item.icon}
          </button>
        ))}
      </div>
    </div>
  );
};
