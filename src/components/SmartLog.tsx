import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Zap, Check, X, History, ArrowRight, Mic, MicOff } from 'lucide-react';
import { parserService, type ParsedCommand } from '../services/parserService';
import { dataService } from '../services/dataService';
import { useAppState } from '../context/AppStateContext';
import { useCurrency } from '../context/CurrencyContext';
import { formatCurrency, cn } from '../lib/utils';

export const SmartLog: React.FC = () => {
  const [input, setInput] = useState('');
  const [parsed, setParsed] = useState<ParsedCommand | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const { products, customers } = useAppState();
  const { currency, convert } = useCurrency();
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser.');
      return;
    }

    // @ts-ignore
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.start();
  };

  useEffect(() => {
    if (input.trim()) {
      const result = parserService.parse(input, products, customers);
      setParsed(result);
    } else {
      setParsed(null);
    }
  }, [input, products, customers]);

  const handleExecute = async () => {
    if (!parsed || parsed.action === 'unknown' || !parsed.product) return;

    try {
      const amount = parsed.product.sellingPrice * parsed.quantity;
      const profit = (parsed.product.sellingPrice - parsed.product.costPrice) * parsed.quantity;

      await dataService.logTransaction({
        type: parsed.action as any,
        productId: parsed.product.id,
        productName: parsed.product.name,
        quantity: parsed.quantity,
        amount,
        profit,
        paymentMethod: parsed.paymentMethod,
        paymentStatus: parsed.paymentMethod === 'credit' ? 'pending' : 'paid',
        customerId: parsed.customer?.id,
        customerName: parsed.customer?.name,
        performedBy: 'Admin'
      });

      setHistory(prev => [input, ...prev.slice(0, 4)]);
      setInput('');
      setParsed(null);
    } catch (error) {
      console.error('Execution failed', error);
    }
  };

  return (
    <div className="relative w-full">
      <div className="glass-card flex flex-col gap-4 border-blue-500/20 shadow-blue-500/5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
            <Zap size={20} />
          </div>
          <h2 className="text-lg font-semibold tracking-tight">Smart Log</h2>
          <div className="ml-auto flex gap-2">
            <kbd className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-slate-400">⌘ K</kbd>
          </div>
        </div>

        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleExecute()}
            placeholder="e.g., 'Sold 5 DAP via mpesa' or 'Kopesha Juma 2 Seeds'"
            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-500"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button
              onClick={startVoiceInput}
              className={cn(
                "p-2 rounded-full transition-all",
                isListening ? "bg-red-500 text-white animate-pulse" : "hover:bg-white/10 text-slate-400"
              )}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
            <AnimatePresence>
              {input && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setInput('')}
                  className="p-1 rounded-full hover:bg-white/10 text-slate-400"
                >
                  <X size={16} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Ghost Preview */}
        <AnimatePresence>
          {parsed && parsed.action !== 'unknown' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between group"
            >
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-widest text-blue-400 font-bold">Preview Action</span>
                <p className="text-sm text-slate-300">
                  <span className="capitalize font-semibold text-white">{parsed.action}</span>{' '}
                  <span className="text-blue-400 font-mono">{parsed.quantity}</span>{' '}
                  <span className="font-semibold text-white">{parsed.productName || '...'}</span>
                  {parsed.customerName && (
                    <> to <span className="text-white font-semibold">{parsed.customerName}</span></>
                  )}
                  {' via '}
                  <span className="capitalize text-blue-400">{parsed.paymentMethod}</span>
                </p>
                {parsed.product && (
                  <p className="text-xs text-slate-500 italic">
                    Total: {formatCurrency(convert(parsed.product.sellingPrice * parsed.quantity), currency)}
                  </p>
                )}
              </div>
              
              <button
                onClick={handleExecute}
                disabled={!parsed.product}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all",
                  parsed.product 
                    ? "bg-blue-500 text-white hover:bg-blue-400 shadow-lg shadow-blue-500/20" 
                    : "bg-slate-700 text-slate-400 cursor-not-allowed"
                )}
              >
                Confirm <ArrowRight size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History Quick Access */}
        {history.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {history.map((h, i) => (
              <button
                key={i}
                onClick={() => setInput(h)}
                className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-400 hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <History size={12} /> {h}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
