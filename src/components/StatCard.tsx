import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { useCurrency } from '../context/CurrencyContext';

interface StatCardProps {
  title: string;
  value: number;
  trend?: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'orange';
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, trend, icon, color }) => {
  const { currency, convert } = useCurrency();
  
  const colors = {
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    green: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    red: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    orange: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="glass-card flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          {icon}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-bold ${trend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      
      <div className="flex flex-col">
        <span className="text-sm text-slate-400 font-medium">{title}</span>
        <span className="text-2xl font-bold tracking-tight text-white mt-1">
          {title.toLowerCase().includes('revenue') || title.toLowerCase().includes('profit') || title.toLowerCase().includes('debt')
            ? formatCurrency(convert(value), currency)
            : value.toLocaleString()}
        </span>
      </div>
    </motion.div>
  );
};
