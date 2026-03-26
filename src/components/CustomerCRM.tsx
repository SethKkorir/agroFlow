import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Shield, MapPin, Plus, Trash2, Camera, Info } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { dataService } from '../services/dataService';
import { type Customer, type Collateral } from '../services/db';
import { formatCurrency, generateId, cn } from '../lib/utils';
import { useCurrency } from '../context/CurrencyContext';

export const CustomerCRM: React.FC = () => {
  const { customers, chamas } = useAppState();
  const { currency, convert } = useCurrency();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddingCollateral, setIsAddingCollateral] = useState(false);

  const [newCollateral, setNewCollateral] = useState<Partial<Collateral>>({
    type: 'Land',
    description: '',
    estimatedValue: 0
  });

  const handleAddCollateral = async () => {
    if (!selectedCustomer || !newCollateral.description || !newCollateral.estimatedValue) return;

    const collateral: Collateral = {
      id: generateId(),
      type: newCollateral.type as any,
      description: newCollateral.description || '',
      estimatedValue: newCollateral.estimatedValue || 0,
      gpsTag: '-1.2921, 36.8219', // Mock GPS
      photoUrl: 'https://picsum.photos/seed/collateral/200/200'
    };

    const updatedCollateral = [...(selectedCustomer.collateral || []), collateral];
    await dataService.updateCustomer(selectedCustomer.id, { collateral: updatedCollateral });
    
    setIsAddingCollateral(false);
    setNewCollateral({ type: 'Land', description: '', estimatedValue: 0 });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Customer List */}
      <div className="lg:col-span-1 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Users className="text-blue-400" /> Kopesha+ CRM
          </h2>
        </div>
        
        <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {customers.map(customer => (
            <button
              key={customer.id}
              onClick={() => setSelectedCustomer(customer)}
              className={cn(
                "p-4 rounded-xl border transition-all text-left",
                selectedCustomer?.id === customer.id
                  ? "bg-blue-500/20 border-blue-500/50 shadow-lg shadow-blue-500/10"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              )}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold text-white">{customer.name}</span>
                <span className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider",
                  customer.totalDebt > 0 ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"
                )}>
                  {customer.totalDebt > 0 ? 'In Debt' : 'Clear'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-2">{customer.phone}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Debt:</span>
                <span className="font-mono text-white">{formatCurrency(convert(customer.totalDebt), currency)}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Customer Details & Collateral */}
      <div className="lg:col-span-2">
        <AnimatePresence mode="wait">
          {selectedCustomer ? (
            <motion.div
              key={selectedCustomer.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card h-full"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">{selectedCustomer.name}</h3>
                  <p className="text-slate-400 flex items-center gap-1 text-sm">
                    <MapPin size={14} className="text-blue-400" /> {String(selectedCustomer.gpsLocation || 'Nairobi, Kenya')}
                  </p>
                </div>
                {selectedCustomer.chamaId && (
                  <div className="px-3 py-1 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs font-bold flex items-center gap-2">
                    <Shield size={14} /> Chama Member
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Credit Limit</span>
                  <p className="text-xl font-mono text-white mt-1">
                    {formatCurrency(convert(selectedCustomer.creditLimit), currency)}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Outstanding Balance</span>
                  <p className="text-xl font-mono text-red-400 mt-1">
                    {formatCurrency(convert(selectedCustomer.totalDebt), currency)}
                  </p>
                </div>
              </div>

              {/* Collateral Registry */}
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <Shield size={18} className="text-blue-400" /> Collateral Registry
                </h4>
                <button
                  onClick={() => setIsAddingCollateral(true)}
                  className="p-2 rounded-lg bg-blue-500 hover:bg-blue-400 text-white transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedCustomer.collateral?.map(item => (
                  <div key={item.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex gap-4">
                    <img src={item.photoUrl} alt={item.type} className="w-16 h-16 rounded-lg object-cover border border-white/10" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-bold text-white">{item.type}</span>
                        <span className="text-[10px] text-blue-400 font-mono">{String(item.gpsTag)}</span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1 mb-1">{item.description}</p>
                      <p className="text-xs font-mono text-green-400">
                        Est. {formatCurrency(convert(item.estimatedValue), currency)}
                      </p>
                    </div>
                  </div>
                ))}
                {(!selectedCustomer.collateral || selectedCustomer.collateral.length === 0) && (
                  <div className="col-span-full py-8 text-center text-slate-500 border-2 border-dashed border-white/5 rounded-2xl">
                    No collateral registered for this customer.
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="glass-card h-full flex flex-col items-center justify-center text-slate-500 gap-4">
              <div className="p-4 rounded-full bg-white/5">
                <Users size={48} className="opacity-20" />
              </div>
              <p>Select a customer to view CRM details</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Collateral Modal */}
      <AnimatePresence>
        {isAddingCollateral && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card w-full max-w-md border-blue-500/30"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Register Collateral</h3>
                <button onClick={() => setIsAddingCollateral(false)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Asset Type</label>
                  <select
                    value={newCollateral.type}
                    onChange={(e) => setNewCollateral({ ...newCollateral, type: e.target.value as any })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="Land">Land Title</option>
                    <option value="Livestock">Livestock (Cows/Goats)</option>
                    <option value="Vehicle">Motorbike/Vehicle</option>
                    <option value="Equipment">Farm Equipment</option>
                    <option value="Other">Other Asset</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Description</label>
                  <textarea
                    value={newCollateral.description}
                    onChange={(e) => setNewCollateral({ ...newCollateral, description: e.target.value })}
                    placeholder="e.g., 2-acre plot in Kiambu"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 h-24"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Estimated Value (KES)</label>
                  <input
                    type="number"
                    value={newCollateral.estimatedValue}
                    onChange={(e) => setNewCollateral({ ...newCollateral, estimatedValue: Number(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-3 text-xs text-blue-400">
                  <Info size={16} />
                  GPS Tagging will be automatically captured upon saving.
                </div>

                <button
                  onClick={handleAddCollateral}
                  className="w-full py-4 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all mt-2"
                >
                  Register Asset
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const X = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
  </svg>
);
