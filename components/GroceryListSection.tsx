import React, { useState } from 'react';
import { ShoppingCart, Check, CheckCircle2, ShoppingBag } from 'lucide-react';
import { GroceryList } from '../types';

interface GroceryListSectionProps {
  groceryList: GroceryList;
  currency: string;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
};

export default function GroceryListSection({ groceryList, currency }: GroceryListSectionProps) {
  const symbol = CURRENCY_SYMBOLS[currency] || '₹';
  
  // Track check-off state for items in "Need to Buy" list
  const [boughtItems, setBoughtItems] = useState<Record<string, boolean>>({});

  const toggleBought = (name: string) => {
    setBoughtItems(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const totalGroceryCost = groceryList.needToBuy.reduce((sum, item) => sum + item.estimatedPrice, 0);
  const remainingCost = groceryList.needToBuy
    .filter(item => !boughtItems[item.name])
    .reduce((sum, item) => sum + item.estimatedPrice, 0);

  return (
    <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 p-6 rounded-2xl shadow-xl flex flex-col gap-5 text-slate-800 dark:text-slate-200 transition-all duration-300">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
          Smart Grocery List
        </h3>
        <span className="text-xs text-indigo-650 dark:text-indigo-400 font-bold bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20 shadow-sm">
          Estimated: {symbol}{totalGroceryCost.toFixed(2)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Need to Buy */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4" />
            Need to Buy ({groceryList.needToBuy.length - Object.values(boughtItems).filter(Boolean).length} left)
          </h4>

          {groceryList.needToBuy.length > 0 ? (
            <div className="flex flex-col gap-2 bg-slate-50/50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800/50 max-h-[300px] overflow-y-auto">
              {groceryList.needToBuy.map((item, idx) => {
                const isBought = !!boughtItems[item.name];
                return (
                  <label
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer select-none transition-all ${
                      isBought
                        ? 'bg-slate-100/30 dark:bg-slate-950/20 border-slate-250 dark:border-slate-900/40 opacity-40 text-slate-400 dark:text-slate-500 line-through'
                        : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800/60 hover:border-slate-350 dark:hover:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-900/80 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isBought}
                        onChange={() => toggleBought(item.name)}
                        className="w-4.5 h-4.5 rounded border-slate-300 dark:border-slate-800 text-indigo-650 dark:text-indigo-600 focus:ring-indigo-500/30 accent-indigo-500 cursor-pointer"
                      />
                      <div className="flex flex-col">
                        <span className={`text-xs font-bold ${isBought ? 'text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>{item.name}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-450 font-mono mt-0.5">{item.quantity}</span>
                      </div>
                    </div>
                    <span className={`text-xs font-mono font-bold ${isBought ? 'text-slate-400 dark:text-slate-550' : 'text-slate-700 dark:text-slate-300'}`}>
                      {symbol}{item.estimatedPrice}
                    </span>
                  </label>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 bg-slate-50 dark:bg-slate-950/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-500 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
              <span>You have all ingredients! Nothing to buy.</span>
            </div>
          )}
        </div>

        {/* Already Available */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Already Available ({groceryList.alreadyAvailable.length})
          </h4>

          {groceryList.alreadyAvailable.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 bg-slate-50/50 dark:bg-slate-950/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/50 max-h-[300px] overflow-y-auto">
              {groceryList.alreadyAvailable.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-bold"
                >
                  <Check className="w-3.5 h-3.5" />
                  {item}
                </span>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 bg-slate-50 dark:bg-slate-950/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-550 dark:text-slate-500 text-xs">
              <span>No ingredients matched in your pantry.</span>
            </div>
          )}
        </div>
      </div>

      {/* Shopping progress footer */}
      {groceryList.needToBuy.length > 0 && (
        <div className="mt-2 p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Shopping Progress</span>
            <div className="w-full sm:w-60 h-2 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden mt-1 border border-slate-200 dark:border-slate-850">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                style={{ 
                  width: `${(Object.values(boughtItems).filter(Boolean).length / groceryList.needToBuy.length) * 100}%` 
                }}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 font-mono font-bold text-slate-600 dark:text-slate-300 self-end sm:self-center">
            <span>Remaining:</span>
            <span className="text-emerald-600 dark:text-emerald-400 text-sm">{symbol}{remainingCost.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
