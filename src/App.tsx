/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppStateProvider, useAppState } from './context/AppStateContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { SmartLog } from './components/SmartLog';
import { SmartInsights } from './components/SmartInsights';
import { StatCard } from './components/StatCard';
import { TransactionTable } from './components/TransactionTable';
import { ExpiryWatch } from './components/ExpiryWatch';
import { Analytics } from './components/Analytics';
import { CustomerCRM } from './components/CustomerCRM';
import { Inventory } from './components/Inventory';
import { Settings } from './components/Settings';
import { Sustainability } from './components/Sustainability';
import { DollarSign, Package, Users, AlertTriangle, LayoutDashboard, UserCircle, Leaf, Camera, Printer, ShieldCheck } from 'lucide-react';

function Dashboard() {
  const { transactions, products, customers } = useAppState();

  const totalRevenue = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const totalProfit = transactions.reduce((sum, tx) => sum + tx.profit, 0);
  const totalDebt = customers.reduce((sum, c) => sum + c.totalDebt, 0);
  const lowStockCount = products.filter(p => p.stock <= p.lowStockThreshold).length;
  const totalCarbonCredits = transactions.reduce((sum, t) => sum + (t.carbonCredits || 0), 0);
  const totalSubsidies = transactions.filter(t => t.isSubsidy).length;

  return (
    <div className="flex flex-col gap-8">
      {/* Hero Section: Smart Log & Insights */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 flex flex-col gap-6">
          <SmartLog />
          <SmartInsights />
        </div>
        
        {/* Quick Actions & Sustainability */}
        <div className="flex flex-col gap-6">
          <div className="glass-card border-green-500/20 shadow-green-500/5">
            <h3 className="text-sm font-bold text-green-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Leaf size={16} /> Sustainability Module
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Carbon Credits</span>
                <p className="text-xl font-mono text-white">{totalCarbonCredits.toFixed(1)}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Subsidies</span>
                <p className="text-xl font-mono text-white">{totalSubsidies}</p>
              </div>
            </div>
          </div>

          <div className="glass-card border-purple-500/20 shadow-purple-500/5">
            <h3 className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <ShieldCheck size={16} /> Security & Tools
            </h3>
            <div className="flex flex-col gap-3">
              <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-3 text-sm font-semibold text-slate-300">
                <Camera size={18} className="text-purple-400" /> OCR Receipt Scan
              </button>
              <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-3 text-sm font-semibold text-slate-300">
                <Printer size={18} className="text-purple-400" /> Thermal Print Test
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={totalRevenue} 
          trend={12.5} 
          icon={<DollarSign size={24} />} 
          color="blue" 
        />
        <StatCard 
          title="Net Profit" 
          value={totalProfit} 
          trend={8.2} 
          icon={<Package size={24} />} 
          color="green" 
        />
        <StatCard 
          title="Total Debt (Kopesha)" 
          value={totalDebt} 
          trend={-2.4} 
          icon={<Users size={24} />} 
          color="orange" 
        />
        <StatCard 
          title="Low Stock Items" 
          value={lowStockCount} 
          icon={<AlertTriangle size={24} />} 
          color="red" 
        />
      </section>

      {/* Main Content Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Analytics & Transactions */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <Analytics />
          <TransactionTable />
        </div>

        {/* Right Column: Expiry & Top Products */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <ExpiryWatch />
          
          <div className="glass-card flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Top Products</h3>
            <div className="flex flex-col gap-4">
              {products.slice(0, 4).map((p, i) => (
                <div key={p.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-slate-400">
                      0{i + 1}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white">{p.name}</span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest">{p.category}</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-blue-400">{p.stock} in stock</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'crm' | 'inventory' | 'settings' | 'sustainability'>('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'crm':
        return <CustomerCRM />;
      case 'inventory':
        return <Inventory />;
      case 'sustainability':
        return <Sustainability />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppStateProvider>
      <CurrencyProvider>
        <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
          {renderContent()}
        </DashboardLayout>
      </CurrencyProvider>
    </AppStateProvider>
  );
}

