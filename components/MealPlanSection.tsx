import React, { useState } from 'react';
import { Sunrise, Sun, Sunset, Cookie, Clock, DollarSign, ListChecks } from 'lucide-react';
import { MealPlan } from '../types';

interface MealPlanSectionProps {
  meals: {
    breakfast?: MealPlan;
    lunch?: MealPlan;
    dinner?: MealPlan;
    snacks?: MealPlan;
  };
  currency: string;
}

const MEAL_ICONS: Record<string, any> = {
  breakfast: Sunrise,
  lunch: Sun,
  dinner: Sunset,
  snacks: Cookie,
};

const MEAL_THEMES: Record<string, { bg: string; border: string; text: string; iconBg: string }> = {
  breakfast: {
    bg: 'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/5',
    border: 'border-amber-500/20 dark:border-amber-500/30',
    text: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
  lunch: {
    bg: 'from-sky-500/5 to-blue-500/5 dark:from-sky-500/10 dark:to-blue-500/5',
    border: 'border-sky-500/20 dark:border-sky-500/30',
    text: 'text-sky-600 dark:text-sky-400',
    iconBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  },
  dinner: {
    bg: 'from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/5',
    border: 'border-indigo-500/20 dark:border-indigo-500/30',
    text: 'text-indigo-600 dark:text-indigo-400',
    iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  },
  snacks: {
    bg: 'from-rose-500/5 to-pink-500/5 dark:from-rose-500/10 dark:to-pink-500/5',
    border: 'border-rose-500/20 dark:border-rose-500/30',
    text: 'text-rose-600 dark:text-rose-400',
    iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  },
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
};

export default function MealPlanSection({ meals, currency }: MealPlanSectionProps) {
  const symbol = CURRENCY_SYMBOLS[currency] || '₹';
  const availableMeals = Object.entries(meals).filter(([_, data]) => !!data);
  const [activeTab, setActiveTab] = useState<string>(availableMeals[0]?.[0] || 'breakfast');

  if (availableMeals.length === 0) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <ListChecks className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
          Meal Planning Dashboard
        </h3>
        {/* Quick info */}
        <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 px-2.5 py-1 rounded-full shadow-sm">
          {availableMeals.length} Meals Planned
        </span>
      </div>

      {/* Tabs Selector on Mobile / Desktop */}
      <div className="flex border border-slate-200 dark:border-slate-850 p-1 bg-slate-100/50 dark:bg-slate-950/40 rounded-xl">
        {availableMeals.map(([key, _]) => {
          const Icon = MEAL_ICONS[key] || Sun;
          const isActive = activeTab === key;
          const theme = MEAL_THEMES[key] || MEAL_THEMES.lunch;
          return (
            <button
              key={key}
              type="button"
              id={`meal-tab-${key}`}
              onClick={() => setActiveTab(key)}
              className={`flex-1 py-3 px-2 rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? `bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 ${theme.text} shadow-sm dark:shadow-md`
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-900/40'
              }`}
              aria-selected={isActive}
              role="tab"
            >
              <Icon className="w-4 h-4" />
              <span className="capitalize">{key}</span>
            </button>
          );
        })}
      </div>

      {/* Active Meal Details Card */}
      {availableMeals.map(([key, data]) => {
        if (key !== activeTab) return null;
        const meal = data as MealPlan;
        const theme = MEAL_THEMES[key] || MEAL_THEMES.lunch;
        const Icon = MEAL_ICONS[key] || Sun;

        return (
          <div
            key={key}
            role="tabpanel"
            className={`bg-gradient-to-br ${theme.bg} border ${theme.border} p-6 rounded-2xl flex flex-col gap-5 transition-all duration-300 shadow-sm`}
          >
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${theme.iconBg} border border-current/10 shadow-sm`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${theme.text}`}>
                    {key}
                  </span>
                  <h4 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">{meal.name}</h4>
                </div>
              </div>

              {/* Cooking time & cost badges */}
              <div className="flex gap-2">
                {/* Time */}
                <div className="bg-white/90 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 px-3.5 py-1.5 rounded-xl flex items-center gap-2 shadow-sm">
                  <Clock className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200">{meal.cookingTime}m</span>
                </div>
                {/* Cost */}
                <div className="bg-white/90 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 px-3.5 py-1.5 rounded-xl flex items-center gap-2 shadow-sm">
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">{symbol}{meal.cost}</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
              {meal.description}
            </p>

            {/* Ingredients Table */}
            <div className="flex flex-col gap-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                Ingredients Required
              </h5>
              <div className="bg-white/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-2.5 px-4">Ingredient</th>
                      <th className="py-2.5 px-4">Quantity</th>
                      <th className="py-2.5 px-4 text-right">Estimated Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300 font-medium">
                    {meal.ingredients.map((ing, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                        <td className="py-2.5 px-4 font-semibold text-slate-800 dark:text-slate-200">{ing.name}</td>
                        <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400 font-mono">{ing.quantity}</td>
                        <td className="py-2.5 px-4 text-right font-mono text-emerald-600 dark:text-emerald-400/90 font-semibold">
                          {symbol}{ing.estimatedPrice}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Steps Checklist Previews */}
            <div className="flex flex-col gap-2.5">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Action Steps Preview
              </h5>
              <ol className="list-decimal pl-5 text-xs text-slate-600 dark:text-slate-300 flex flex-col gap-1.5 font-medium">
                {meal.tasks.map((task, idx) => (
                  <li key={idx} className="marker:text-slate-400 dark:marker:text-slate-550 pl-0.5 leading-relaxed">
                    {task}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        );
      })}
    </div>
  );
}
