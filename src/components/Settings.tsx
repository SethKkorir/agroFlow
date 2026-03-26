import React from 'react';
import { motion } from 'motion/react';
import { Settings as SettingsIcon, Globe, Shield, Bell, Database, LogOut, Trash2, Save, Printer, Smartphone, Cloud, User } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { useCurrency } from '../context/CurrencyContext';
import { cn } from '../lib/utils';

export const Settings: React.FC = () => {
  const { isDemoMode, toggleDemoMode, refreshData } = useAppState();
  const { currency, setCurrency } = useCurrency();

  const sections = [
    {
      id: 'general',
      title: 'General Settings',
      icon: <Globe size={20} className="text-blue-400" />,
      description: 'Localization, currency, and regional preferences'
    },
    {
      id: 'security',
      title: 'Security & Access',
      icon: <Shield size={20} className="text-purple-400" />,
      description: 'User management, roles, and biometric settings'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: <Bell size={20} className="text-orange-400" />,
      description: 'Alert thresholds for low stock and debt'
    },
    {
      id: 'data',
      title: 'Data & Sync',
      icon: <Database size={20} className="text-green-400" />,
      description: 'Offline storage, cloud sync, and backup'
    }
  ];

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <SettingsIcon className="text-blue-400" /> System Settings
        </h2>
        <p className="text-slate-400 text-sm">Configure AgroFlow Pro for your business needs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar Navigation */}
        <div className="flex flex-col gap-2">
          {sections.map(section => (
            <button
              key={section.id}
              className={cn(
                "p-4 rounded-xl border transition-all text-left group",
                section.id === 'general'
                  ? "bg-blue-500/20 border-blue-500/50 shadow-lg shadow-blue-500/10"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              )}
            >
              <div className="flex items-center gap-3 mb-1">
                {section.icon}
                <span className="font-bold text-white">{section.title}</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{section.description}</p>
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* Localization */}
          <div className="glass-card">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Globe size={18} className="text-blue-400" /> Localization & Currency
            </h3>
            
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">Default Currency</p>
                  <p className="text-xs text-slate-500">All prices will be converted to this currency</p>
                </div>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as any)}
                  className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="KES">KES (Kenyan Shilling)</option>
                  <option value="UGX">UGX (Ugandan Shilling)</option>
                  <option value="TZS">TZS (Tanzanian Shilling)</option>
                  <option value="RWF">RWF (Rwandan Franc)</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">Timezone</p>
                  <p className="text-xs text-slate-500">Currently set to East Africa Time (EAT)</p>
                </div>
                <span className="text-xs font-mono text-slate-400">UTC +3:00</span>
              </div>
            </div>
          </div>

          {/* System Mode */}
          <div className="glass-card">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Database size={18} className="text-green-400" /> System Mode & Data
            </h3>
            
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">Demo Mode</p>
                  <p className="text-xs text-slate-500">Preloads sample data for testing purposes</p>
                </div>
                <button 
                  onClick={toggleDemoMode}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all relative",
                    isDemoMode ? "bg-blue-500" : "bg-slate-700"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
                    isDemoMode ? "right-1" : "left-1"
                  )} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">Cloud Sync</p>
                  <p className="text-xs text-slate-500">Last synced: 12 minutes ago</p>
                </div>
                <button 
                  onClick={refreshData}
                  className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-blue-400 transition-all flex items-center gap-2"
                >
                  <Cloud size={14} /> Sync Now
                </button>
              </div>

              <div className="pt-4 border-t border-white/5">
                <button className="flex items-center gap-2 text-rose-400 hover:text-rose-300 transition-colors text-sm font-bold">
                  <Trash2 size={16} /> Clear All Local Data
                </button>
              </div>
            </div>
          </div>

          {/* Hardware */}
          <div className="glass-card">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Printer size={18} className="text-purple-400" /> Hardware Integration
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex flex-col items-center gap-3 text-center">
                <Printer size={24} className="text-slate-400" />
                <div>
                  <p className="text-xs font-bold text-white">Thermal Printer</p>
                  <p className="text-[10px] text-slate-500">Not Connected</p>
                </div>
              </button>
              <button className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex flex-col items-center gap-3 text-center">
                <Smartphone size={24} className="text-slate-400" />
                <div>
                  <p className="text-xs font-bold text-white">M-Pesa Terminal</p>
                  <p className="text-[10px] text-slate-500">Connected</p>
                </div>
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-4">
            <button className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold transition-all">
              Cancel
            </button>
            <button className="px-8 py-4 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2">
              <Save size={20} /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
