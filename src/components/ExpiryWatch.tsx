import React from 'react';
import { motion } from 'motion/react';
import { AlertCircle, Calendar } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { format, differenceInDays } from 'date-fns';

export const ExpiryWatch: React.FC = () => {
  const { products } = useAppState();
  
  const expiringSoon = products
    .filter(p => p.expiryDate && differenceInDays(new Date(p.expiryDate), new Date()) < 30)
    .sort((a, b) => new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime());

  if (expiringSoon.length === 0) return null;

  return (
    <div className="glass-card flex flex-col gap-4 border-rose-500/20">
      <div className="flex items-center gap-2 text-rose-400">
        <AlertCircle size={20} className="animate-pulse" />
        <h3 className="text-lg font-semibold">Expiry Watch</h3>
      </div>

      <div className="flex flex-col gap-3">
        {expiringSoon.map((p, i) => {
          const daysLeft = differenceInDays(new Date(p.expiryDate!), new Date());
          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={p.id}
              className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/10 flex items-center justify-between"
            >
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">{p.name}</span>
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Calendar size={10} /> {format(new Date(p.expiryDate!), 'MMM dd, yyyy')}
                </span>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <span className={`text-xs font-bold ${daysLeft < 7 ? 'text-rose-500' : 'text-rose-400'}`}>
                  {daysLeft} days left
                </span>
                {p.isVaccine && (
                  <span className="text-[10px] text-blue-400 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    Cold Chain OK
                  </span>
                )}
                <span className="block text-[10px] text-slate-500">{p.stock} {p.unit}s left</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
