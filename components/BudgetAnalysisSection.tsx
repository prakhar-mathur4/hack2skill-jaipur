import React from 'react';
import { Landmark, TrendingDown, CheckCircle, AlertOctagon, HelpCircle } from 'lucide-react';
import { BudgetAnalysis } from '../types';

interface BudgetAnalysisSectionProps {
  analysis: BudgetAnalysis;
  currency: string;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
};

export default function BudgetAnalysisSection({ analysis, currency }: BudgetAnalysisSectionProps) {
  const symbol = CURRENCY_SYMBOLS[currency] || '₹';
  const isOverBudget = analysis.status === 'over_budget';
  
  // Calculate percentage of budget used
  const percentage = Math.round((analysis.totalEstimatedCost / analysis.dailyBudget) * 100);
  const progressWidth = Math.min(100, percentage);

  return (
    <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 p-6 rounded-2xl shadow-xl flex flex-col gap-5 text-slate-800 dark:text-slate-200 transition-all duration-300">
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <Landmark className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Budget Feasibility Analysis</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Status Indicators */}
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex flex-col gap-1 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-500">Daily Budget</span>
              <span className="text-lg font-mono font-bold text-slate-800 dark:text-slate-200">{symbol}{analysis.dailyBudget}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex flex-col gap-1 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-500">Estimated Cost</span>
              <span className="text-lg font-mono font-bold text-slate-800 dark:text-slate-200">{symbol}{analysis.totalEstimatedCost}</span>
            </div>
          </div>

          {/* Status Alert Box */}
          <div className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
            isOverBudget 
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300' 
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-750 dark:text-emerald-300'
          }`}>
            {isOverBudget ? (
              <>
                <AlertOctagon className="w-5 h-5 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider">Over Budget</h4>
                  <p className="text-sm font-semibold mt-1">
                    Meals exceed your budget by <span className="font-mono">{symbol}{analysis.difference}</span>
                  </p>
                </div>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider font-extrabold">Within Budget</h4>
                  <p className="text-sm font-semibold mt-1">
                    Your daily meals fit perfectly within budget!
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Progress gauge */}
        <div className="flex flex-col justify-center gap-3 bg-slate-50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-200 dark:border-slate-800/40 shadow-sm">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-slate-500 dark:text-slate-400">Budget Consumed</span>
            <span className={isOverBudget ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>{percentage}%</span>
          </div>

          <div className="w-full h-3.5 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOverBudget 
                  ? 'bg-gradient-to-r from-orange-500 to-rose-500' 
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500'
              }`}
              style={{ width: `${progressWidth}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 leading-normal">
            Calculated as the sum of raw meal prep costs. If over budget, follow the optimizations below.
          </span>
        </div>
      </div>

      {/* Optimizations */}
      <div className="flex flex-col gap-3 mt-1.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <TrendingDown className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          {isOverBudget ? 'Cost Optimization Recommendations' : 'Useful Planning Suggestions'}
        </h4>

        <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800/50 shadow-sm">
          <ul className="list-disc pl-5 flex flex-col gap-2 text-xs text-slate-600 dark:text-slate-350 font-medium">
            {analysis.optimizationSuggestions.map((sug, idx) => (
              <li key={idx} className="marker:text-indigo-500 dark:marker:text-indigo-400 pl-0.5 leading-relaxed">
                {sug}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
