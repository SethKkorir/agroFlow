import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useAppState } from '../context/AppStateContext';
import { useCurrency } from '../context/CurrencyContext';
import { format, subDays, startOfDay } from 'date-fns';

export const Analytics: React.FC = () => {
  const { transactions } = useAppState();
  const { currency, convert } = useCurrency();

  // Prepare data for last 7 days
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayStart = startOfDay(date).getTime();
    const dayEnd = dayStart + 86400000;
    
    const dayTxs = transactions.filter(tx => tx.timestamp >= dayStart && tx.timestamp < dayEnd);
    const revenue = dayTxs.reduce((sum, tx) => sum + tx.amount, 0);
    const profit = dayTxs.reduce((sum, tx) => sum + tx.profit, 0);

    return {
      name: format(date, 'EEE'),
      revenue: convert(revenue),
      profit: convert(profit)
    };
  });

  return (
    <div className="glass-card flex flex-col gap-6 h-[400px]">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Revenue Trends</h3>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-xs text-slate-400">Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-xs text-slate-400">Profit</span>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 10 }}
              tickFormatter={(val) => `${val / 1000}k`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#0f172a', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                fontSize: '12px'
              }}
              itemStyle={{ color: '#fff' }}
            />
            <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
            <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProf)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
