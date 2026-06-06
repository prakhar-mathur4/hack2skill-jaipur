import React from 'react';
import { ArrowRight, Shuffle, AlertCircle } from 'lucide-react';
import { Substitution } from '../types';

interface SubstitutionSectionProps {
  substitutions: Substitution[];
}

export default function SubstitutionSection({ substitutions }: SubstitutionSectionProps) {
  if (substitutions.length === 0) return null;

  return (
    <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 p-6 rounded-2xl shadow-xl flex flex-col gap-5 text-slate-800 dark:text-slate-200 transition-all duration-300">
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <Shuffle className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Ingredient Substitutions</h3>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed -mt-2">
        Missing something? Here are verified alternative swaps based on dietary preferences, allergies, and cost optimizations:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-1">
        {substitutions.map((sub, idx) => (
          <div
            key={idx}
            className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/60 p-4 rounded-xl flex flex-col gap-3 hover:border-indigo-500/20 dark:hover:border-indigo-500/25 hover:shadow-sm transition-all group"
          >
            {/* Swap visual header */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-lg shadow-sm">
                {sub.ingredient}
              </span>
              <ArrowRight className="w-4 h-4 text-indigo-500 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
              <div className="flex flex-wrap gap-1 flex-1">
                {sub.substitutes.map((opt, oIdx) => (
                  <span
                    key={oIdx}
                    className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded"
                  >
                    {opt}
                  </span>
                ))}
              </div>
            </div>

            {/* Substitution reason */}
            <div className="flex items-start gap-2 bg-slate-100/50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-150 dark:border-slate-800/40">
              <AlertCircle className="w-4 h-4 text-slate-555 dark:text-slate-400 shrink-0 mt-0.5" />
              <span className="text-xs text-slate-655 dark:text-slate-400 leading-normal font-medium">
                {sub.reason}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
