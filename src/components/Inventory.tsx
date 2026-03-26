import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Plus, Search, Filter, AlertTriangle, MoreVertical, Edit2, Trash2, ArrowUpRight, ArrowDownRight, History, Calendar } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { dataService } from '../services/dataService';
import { type Product, type Batch } from '../services/db';
import { formatCurrency, cn, generateId } from '../lib/utils';
import { useCurrency } from '../context/CurrencyContext';
import { format } from 'date-fns';

export const Inventory: React.FC = () => {
  const { products } = useAppState();
  const { currency, convert } = useCurrency();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.aliases.some(a => a.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package className="text-blue-400" /> Inventory Management
          </h2>
          <p className="text-slate-400 text-sm">Manage stock levels, batches, and pricing</p>
        </div>
        <button 
          onClick={() => setIsAddingProduct(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all"
        >
          <Plus size={20} /> Add New Product
        </button>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <input
            type="text"
            placeholder="Search products, aliases, or SKUs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
        </div>
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          >
            {categories.map(cat => (
              <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
            ))}
          </select>
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="glass-card py-20 flex flex-col items-center justify-center text-slate-500 gap-4">
          <Package size={48} className="opacity-20" />
          <p>No products found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { currency, convert } = useCurrency();
  const [showBatches, setShowBatches] = useState(false);

  const isLowStock = product.stock <= product.lowStockThreshold;

  return (
    <div className={cn(
      "glass-card flex flex-col gap-4 group transition-all duration-300",
      isLowStock ? "border-rose-500/20 shadow-rose-500/5" : "border-white/10"
    )}>
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">{product.category}</span>
          <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{product.name}</h3>
        </div>
        <div className="flex items-center gap-2">
          {isLowStock && (
            <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400" title="Low Stock">
              <AlertTriangle size={16} />
            </div>
          )}
          <button className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400">
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <span className="text-[10px] text-slate-500 font-bold uppercase">Stock Level</span>
          <p className={cn(
            "text-xl font-mono mt-1",
            isLowStock ? "text-rose-400" : "text-white"
          )}>
            {product.stock} <span className="text-xs font-sans text-slate-500">{product.unit}s</span>
          </p>
        </div>
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <span className="text-[10px] text-slate-500 font-bold uppercase">Selling Price</span>
          <p className="text-xl font-mono text-blue-400 mt-1">
            {formatCurrency(convert(product.sellingPrice), currency)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <History size={12} /> Last restocked: 2 days ago
        </div>
        <button 
          onClick={() => setShowBatches(!showBatches)}
          className="text-blue-400 hover:underline flex items-center gap-1"
        >
          {showBatches ? 'Hide Batches' : 'View Batches'}
        </button>
      </div>

      <AnimatePresence>
        {showBatches && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden flex flex-col gap-2 pt-2 border-t border-white/5"
          >
            {product.batches?.map(batch => (
              <div key={batch.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5 text-[10px]">
                <div className="flex flex-col">
                  <span className="text-slate-300 font-mono">#{batch.batchNumber}</span>
                  <span className="text-slate-500">Exp: {format(new Date(batch.expiryDate), 'MMM dd, yyyy')}</span>
                </div>
                <div className="text-right">
                  <span className="text-white font-bold">{batch.quantity} {product.unit}s</span>
                  <div className="flex items-center gap-1 text-blue-400">
                    <Calendar size={8} /> Received {format(new Date(batch.receivedDate), 'MMM dd')}
                  </div>
                </div>
              </div>
            ))}
            {(!product.batches || product.batches.length === 0) && (
              <p className="text-center py-2 text-slate-600 italic text-[10px]">No batch data available</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-2 mt-2">
        <button className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-slate-300 transition-all">
          <Edit2 size={14} /> Edit
        </button>
        <button className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 text-xs font-bold text-blue-400 transition-all">
          <Plus size={14} /> Stock In
        </button>
      </div>
    </div>
  );
};
