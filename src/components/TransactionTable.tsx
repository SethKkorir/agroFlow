import React from 'react';
import { motion } from 'motion/react';
import { useAppState } from '../context/AppStateContext';
import { useCurrency } from '../context/CurrencyContext';
import { formatCurrency } from '../lib/utils';
import { format } from 'date-fns';
import { CheckCircle2, Clock, CreditCard, Wallet, Landmark } from 'lucide-react';

export const TransactionTable: React.FC = () => {
  const { transactions } = useAppState();
  const { currency, convert } = useCurrency();

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'mpesa': return <Wallet className="text-emerald-400" size={14} />;
      case 'airtel': return <Wallet className="text-rose-400" size={14} />;
      case 'bank': return <Landmark className="text-blue-400" size={14} />;
      case 'credit': return <CreditCard className="text-amber-400" size={14} />;
      default: return <Wallet className="text-slate-400" size={14} />;
    }
  };

  return (
    <div className="glass-card overflow-hidden flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Recent Transactions</h3>
        <button className="text-xs text-blue-400 hover:underline">View All</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs uppercase tracking-widest text-slate-500 border-b border-white/5">
              <th className="pb-4 font-medium">Item</th>
              <th className="pb-4 font-medium">Qty</th>
              <th className="pb-4 font-medium">Amount</th>
              <th className="pb-4 font-medium">Method</th>
              <th className="pb-4 font-medium">Status</th>
              <th className="pb-4 font-medium">Time</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {transactions.slice(0, 8).map((tx, i) => (
              <motion.tr
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                key={tx.id}
                className="group hover:bg-white/5 transition-colors"
              >
                <td className="py-4 font-medium text-slate-200">
                  {tx.productName}
                  {tx.customerName && (
                    <span className="block text-[10px] text-slate-500">to {tx.customerName}</span>
                  )}
                </td>
                <td className="py-4 text-slate-400 font-mono">{tx.quantity}</td>
                <td className="py-4 font-semibold text-white">
                  {formatCurrency(convert(tx.amount), currency)}
                </td>
                <td className="py-4">
                  <div className="flex items-center gap-2 capitalize text-xs text-slate-400">
                    {getMethodIcon(tx.paymentMethod)}
                    {tx.paymentMethod}
                  </div>
                </td>
                <td className="py-4">
                  {tx.paymentStatus === 'paid' ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full w-fit">
                      <CheckCircle2 size={10} /> Paid
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full w-fit">
                      <Clock size={10} /> Pending
                    </span>
                  )}
                </td>
                <td className="py-4 text-slate-500 text-xs">
                  {format(tx.timestamp, 'HH:mm')}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
