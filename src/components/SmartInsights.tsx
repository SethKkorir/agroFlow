import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, AlertTriangle, TrendingUp, CreditCard, ArrowRight, Lightbulb } from 'lucide-react';
import { intelligenceService, type Insight } from '../services/intelligenceService';
import { useAppState } from '../context/AppStateContext';
import { cn } from '../lib/utils';

export const SmartInsights: React.FC = () => {
  const { products, transactions, customers } = useAppState();

  const insights = useMemo(() => 
    intelligenceService.generateInsights(products, transactions, customers),
    [products, transactions, customers]
  );

  const getIcon = (type: string, category: string) => {
    if (category === 'debt') return <CreditCard size={18} />;
    if (category === 'sales') return <TrendingUp size={18} />;
    if (type === 'error' || type === 'warning') return <AlertTriangle size={18} />;
    return <Lightbulb size={18} />;
  };

  const getColorClass = (type: string) => {
    switch (type) {
      case 'error': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'warning': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'success': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 px-2">
        <Sparkles size={18} className="text-blue-400" />
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Autopilot Insights</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {insights.slice(0, 4).map((insight, i) => (
            <motion.div
              key={insight.id}
              layout
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "glass-card p-4 flex flex-col gap-3 group relative overflow-hidden",
                "border-l-4",
                insight.type === 'error' ? 'border-l-rose-500' : 
                insight.type === 'warning' ? 'border-l-amber-500' : 
                insight.type === 'success' ? 'border-l-emerald-500' : 'border-l-blue-500'
              )}
            >
              <div className="flex items-start justify-between">
                <div className={cn("p-2 rounded-lg", getColorClass(insight.type))}>
                  {getIcon(insight.type, insight.category)}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-500">
                  {insight.category}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <h4 className="text-sm font-bold text-white leading-tight">{insight.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{insight.description}</p>
              </div>

              {insight.actionLabel && (
                <button className="mt-2 flex items-center gap-2 text-[11px] font-bold text-blue-400 hover:text-blue-300 transition-colors group/btn">
                  {insight.actionLabel} <ArrowRight size={12} className="transition-transform group-hover/btn:translate-x-1" />
                </button>
              )}

              {/* Decorative background glow */}
              <div className={cn(
                "absolute -right-4 -top-4 w-16 h-16 blur-2xl opacity-10 rounded-full",
                insight.type === 'error' ? 'bg-rose-500' : 
                insight.type === 'warning' ? 'bg-amber-500' : 
                insight.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
              )} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
