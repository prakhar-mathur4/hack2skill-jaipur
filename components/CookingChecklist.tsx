import React, { useState } from 'react';
import { ClipboardList, CheckCircle2, Square, CheckSquare } from 'lucide-react';
import { CookingChecklistItem } from '../types';

interface CookingChecklistProps {
  items: CookingChecklistItem[];
  onToggleTask: (id: string) => void;
  teamMembers?: string[];
  onAssignTask?: (id: string, assignee: string) => void;
}

export default function CookingChecklist({ items, onToggleTask, teamMembers = ['Self', 'Helper'], onAssignTask }: CookingChecklistProps) {
  const [activeFilter, setActiveFilter] = useState<string>('All');

  if (items.length === 0) return null;

  // Filter items by assignee
  const filteredItems = activeFilter === 'All'
    ? items
    : items.filter(item => (item.assignee || 'Self') === activeFilter);

  // Group items by category (e.g. Breakfast, Lunch, Dinner, Snacks)
  const categories = Array.from(new Set(filteredItems.map(item => item.category)));
  const completedCount = items.filter(item => item.completed).length;
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 p-6 rounded-2xl shadow-xl flex flex-col gap-5 text-slate-800 dark:text-slate-200 transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 gap-3">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
          Interactive Cooking To-Do List
        </h3>
        
        {/* Progress badge */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
            {completedCount} / {items.length} Tasks
          </span>
          <span className="text-xs text-indigo-650 dark:text-indigo-400 font-bold bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full shadow-sm">
            {progressPercent}% Done
          </span>
        </div>
      </div>

      {/* Global Progress Bar */}
      <div className="w-full h-2 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800/60 -mt-2">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Assignee Filter Tabs */}
      {teamMembers.length > 1 && (
        <div className="flex flex-wrap gap-1 p-1 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-850/80 -mt-1 select-none">
          <button
            type="button"
            onClick={() => setActiveFilter('All')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              activeFilter === 'All'
                ? 'bg-indigo-500 text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-900/35'
            }`}
          >
            All Crew
          </button>
          {teamMembers.map((member) => (
            <button
              key={member}
              type="button"
              onClick={() => setActiveFilter(member)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                activeFilter === member
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-900/35'
              }`}
            >
              {member}
            </button>
          ))}
        </div>
      )}

      {/* Grouped Checklist */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-1">
          {categories.map(cat => {
            const catItems = filteredItems.filter(item => item.category === cat);
            const catCompleted = catItems.filter(item => item.completed).length;
            
            return (
              <div 
                key={cat}
                className="bg-slate-50 dark:bg-slate-950/35 border border-slate-200 dark:border-slate-800/60 p-4 rounded-xl flex flex-col gap-3.5 hover:border-slate-300 dark:hover:border-slate-700/60 transition-all duration-300 shadow-sm"
              >
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-850 pb-2">
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 tracking-wide uppercase">
                    {cat}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 px-2 py-0.5 rounded-lg shadow-sm">
                    {catCompleted} / {catItems.length}
                  </span>
                </div>

                <div className="flex flex-col gap-2.5">
                  {catItems.map((item) => {
                    const assignee = item.assignee || 'Self';
                    const initials = assignee.slice(0, 2).toUpperCase();

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onToggleTask(item.id)}
                        className={`w-full text-left p-3 rounded-lg border flex items-start gap-3 cursor-pointer select-none transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                          item.completed
                            ? 'bg-slate-100/50 dark:bg-slate-900/10 border-slate-200 dark:border-slate-900/50 opacity-40 text-slate-450 dark:text-slate-505'
                            : 'bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/70 hover:border-slate-300 dark:hover:border-slate-700/60'
                        }`}
                      >
                        {item.completed ? (
                          <CheckSquare className="w-4.5 h-4.5 text-indigo-650 dark:text-indigo-400 shrink-0 mt-0.5" />
                        ) : (
                          <Square className="w-4.5 h-4.5 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors" />
                        )}

                        {/* Assignee Avatar Badge */}
                        <div 
                          className="w-5 h-5 rounded-md bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5"
                          title={`Assigned to ${assignee}`}
                        >
                          {initials}
                        </div>

                        <span className={`text-xs font-semibold leading-relaxed flex-1 ${item.completed ? 'line-through' : ''}`}>
                          {item.task}
                        </span>

                        {/* Dropdown Task Assigner */}
                        {onAssignTask && (
                          <select
                            value={assignee}
                            onChange={(e) => onAssignTask(item.id, e.target.value)}
                            onClick={(e) => e.stopPropagation()} // Prevent trigger checkbox toggle
                            className="text-[9px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-1.5 py-0.5 outline-none font-bold text-slate-600 dark:text-slate-400 focus:border-indigo-500 cursor-pointer max-w-[75px] truncate self-center"
                            title="Assign to crew member"
                          >
                            {teamMembers.map(m => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 bg-slate-50 dark:bg-slate-950/20 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-450 dark:text-slate-500 text-xs">
          <span>No active tasks assigned to {activeFilter} in this meal plan.</span>
        </div>
      )}
      
      {progressPercent === 100 && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl flex items-center justify-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-sm animate-bounce mt-2 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          Congratulations! All steps are complete. Enjoy your meal!
        </div>
      )}
    </div>
  );
}
