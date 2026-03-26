import React from 'react';
import { motion } from 'motion/react';
import { Leaf, Sun, Wind, Droplets, TrendingUp, ShieldCheck, Award, BarChart3 } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { formatCurrency } from '../lib/utils';
import { useCurrency } from '../context/CurrencyContext';

export const Sustainability: React.FC = () => {
  const { transactions } = useAppState();
  const { currency, convert } = useCurrency();

  const totalCarbonCredits = transactions.reduce((sum, t) => sum + (t.carbonCredits || 0), 0);
  const totalSubsidies = transactions.filter(t => t.isSubsidy).length;
  const organicSales = transactions.filter(t => t.productName.toLowerCase().includes('organic')).length;

  const stats = [
    { label: 'Total Carbon Credits', value: totalCarbonCredits.toFixed(2), icon: <Wind className="text-blue-400" />, unit: 'Credits' },
    { label: 'Subsidized Transactions', value: totalSubsidies, icon: <ShieldCheck className="text-green-400" />, unit: 'Orders' },
    { label: 'Organic Products Sold', value: organicSales, icon: <Leaf className="text-emerald-400" />, unit: 'Items' },
    { label: 'Environmental Impact', value: 'High', icon: <TrendingUp className="text-orange-400" />, unit: 'Rating' },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Leaf className="text-green-400" /> Sustainability & ESG
        </h2>
        <p className="text-slate-400 text-sm">Track your environmental impact and government subsidies</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                {stat.icon}
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.unit}</span>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">{stat.label}</p>
              <p className="text-2xl font-mono text-white">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Carbon Credit Ledger */}
        <div className="glass-card">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Wind size={18} className="text-blue-400" /> Carbon Credit Ledger
          </h3>
          <div className="flex flex-col gap-4">
            {transactions.filter(t => (t.carbonCredits || 0) > 0).slice(0, 5).map(t => (
              <div key={t.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white">{t.productName}</span>
                  <span className="text-[10px] text-slate-500">{new Date(t.timestamp).toLocaleDateString()}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-mono text-blue-400">+{t.carbonCredits?.toFixed(2)} Credits</span>
                  <p className="text-[10px] text-slate-500">Organic Incentive</p>
                </div>
              </div>
            ))}
            {transactions.filter(t => (t.carbonCredits || 0) > 0).length === 0 && (
              <p className="text-center py-8 text-slate-500 italic text-sm">No carbon credits earned yet.</p>
            )}
          </div>
        </div>

        {/* Subsidy Tracking */}
        <div className="glass-card">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <ShieldCheck size={18} className="text-green-400" /> Government Subsidies
          </h3>
          <div className="flex flex-col gap-4">
            <div className="p-6 rounded-2xl bg-green-500/10 border border-green-500/20 flex flex-col items-center text-center gap-4">
              <Award size={48} className="text-green-400" />
              <div>
                <p className="text-lg font-bold text-white">Subsidized Partner</p>
                <p className="text-sm text-slate-400">You are an authorized distributor for government-subsidized DAP and CAN fertilizers.</p>
              </div>
              <button className="px-6 py-2 rounded-lg bg-green-500 text-white text-sm font-bold hover:bg-green-400 transition-all">
                View Certificate
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Total Savings</p>
                <p className="text-lg font-mono text-white">{formatCurrency(convert(totalSubsidies * 500), currency)}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Active Programs</p>
                <p className="text-lg font-mono text-white">02</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
