'use client';

import React, { useState, useEffect } from 'react';
import { ChefHat, RefreshCw, Printer, Trash2, Info, Sun, Moon, Users, Plus, X } from 'lucide-react';
import PreferencesForm from '../components/PreferencesForm';
import MealPlanSection from '../components/MealPlanSection';
import GroceryListSection from '../components/GroceryListSection';
import SubstitutionSection from '../components/SubstitutionSection';
import BudgetAnalysisSection from '../components/BudgetAnalysisSection';
import CookingChecklist from '../components/CookingChecklist';
import { FullCookingDashboardData, PreferencesInput, CookingChecklistItem } from '../types';

export default function Home() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<FullCookingDashboardData | null>(null);
  const [isMockResponse, setIsMockResponse] = useState<boolean>(false);
  const [uiApiKey, setUiApiKey] = useState<string>('');
  const [formattedDate, setFormattedDate] = useState<string>('');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [teamMembers, setTeamMembers] = useState<string[]>(['Self', 'Helper']);
  const [newMemberName, setNewMemberName] = useState<string>('');

  // 1. Load initial dashboard data, API key & theme & team from localStorage on mount
  useEffect(() => {
    setFormattedDate(new Date().toLocaleDateString());
    try {
      const savedData = localStorage.getItem('cooking_plan_data');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setData(parsed);
        if (parsed.isMock) {
          setIsMockResponse(true);
        }
      }

      const savedKey = localStorage.getItem('gemini_user_api_key');
      if (savedKey) {
        setUiApiKey(savedKey);
      }

      const savedTheme = localStorage.getItem('chef_flow_theme') as 'light' | 'dark' | null;
      const initialTheme = savedTheme || 'dark';
      setTheme(initialTheme);
      if (initialTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      const savedTeam = localStorage.getItem('cooking_team_members');
      if (savedTeam) {
        setTeamMembers(JSON.parse(savedTeam));
      } else {
        localStorage.setItem('cooking_team_members', JSON.stringify(['Self', 'Helper']));
      }
    } catch (e) {
      console.error('Failed to load cached plan/key/theme:', e);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    try {
      localStorage.setItem('chef_flow_theme', nextTheme);
    } catch (e) {
      console.error('Failed to save theme:', e);
    }
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleApiKeyChange = (newKey: string) => {
    setUiApiKey(newKey);
    try {
      if (newKey) {
        localStorage.setItem('gemini_user_api_key', newKey);
      } else {
        localStorage.removeItem('gemini_user_api_key');
      }
    } catch (e) {
      console.error('Failed to save API key:', e);
    }
  };

  // 2. Persist dashboard data changes to localStorage
  const saveToLocalStorage = (newData: FullCookingDashboardData | null) => {
    if (newData) {
      localStorage.setItem('cooking_plan_data', JSON.stringify(newData));
    } else {
      localStorage.removeItem('cooking_plan_data');
    }
  };

  const handlePreferencesSubmit = async (preferences: PreferencesInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (uiApiKey) {
        headers['x-gemini-api-key'] = uiApiKey;
      }

      const response = await fetch('/api/plan', {
        method: 'POST',
        headers,
        body: JSON.stringify(preferences),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || 'Failed to generate plan. Please try again.');
      }

      // Add default assignee and teamMembers info
      const enrichedChecklist = json.cookingChecklist.map((item: any) => ({
        ...item,
        assignee: 'Self',
      }));

      const enrichedData = {
        ...json,
        cookingChecklist: enrichedChecklist,
        teamMembers: teamMembers,
      };

      setData(enrichedData);
      setIsMockResponse(!!json.isMock);
      saveToLocalStorage(enrichedData);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please verify your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTeamMember = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (teamMembers.includes(trimmed)) return;

    const updatedTeam = [...teamMembers, trimmed];
    setTeamMembers(updatedTeam);
    localStorage.setItem('cooking_team_members', JSON.stringify(updatedTeam));

    if (data) {
      const updatedData = {
        ...data,
        teamMembers: updatedTeam,
      };
      setData(updatedData);
      saveToLocalStorage(updatedData);
    }
  };

  const handleRemoveTeamMember = (name: string) => {
    if (name === 'Self') return; // Cannot remove Self
    const updatedTeam = teamMembers.filter((m) => m !== name);
    setTeamMembers(updatedTeam);
    localStorage.setItem('cooking_team_members', JSON.stringify(updatedTeam));

    if (data) {
      // Reassign tasks assigned to removed member to 'Self'
      const updatedChecklist = data.cookingChecklist.map((item) =>
        item.assignee === name ? { ...item, assignee: 'Self' } : item
      );

      const updatedData = {
        ...data,
        teamMembers: updatedTeam,
        cookingChecklist: updatedChecklist,
      };
      setData(updatedData);
      saveToLocalStorage(updatedData);
    }
  };

  // Toggle tasks on checklist
  const handleToggleTask = (id: string) => {
    if (!data) return;

    const updatedChecklist = data.cookingChecklist.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );

    const updatedData = {
      ...data,
      cookingChecklist: updatedChecklist,
    };

    setData(updatedData);
    saveToLocalStorage(updatedData);
  };

  const handleAssignTask = (id: string, assignee: string) => {
    if (!data) return;

    const updatedChecklist = data.cookingChecklist.map((item) =>
      item.id === id ? { ...item, assignee } : item
    );

    const updatedData = {
      ...data,
      cookingChecklist: updatedChecklist,
    };

    setData(updatedData);
    saveToLocalStorage(updatedData);
  };

  const handleClearPlan = () => {
    if (window.confirm('Are you sure you want to discard your current plan?')) {
      setData(null);
      setIsMockResponse(false);
      saveToLocalStorage(null);
      setError(null);
    }
  };


  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.08),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] text-slate-800 dark:text-slate-100 px-4 py-8 sm:px-6 lg:px-8 transition-colors duration-300">
      {/* Background patterns */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-[-1] opacity-20 dark:opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        
        {/* App Title */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-900 pb-5 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-xl shadow-indigo-500/10">
              <ChefHat className="w-8 h-8 text-white animate-bounce-slow" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                ChefFlow
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  AI Planning
                </span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Smart, budget-optimized daily meal planner & cooking checklist</p>
            </div>
          </div>

          {/* Global actions and API Key Section */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2.5 bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-sm dark:shadow-none"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-indigo-400" />}
            </button>

            {/* API Key Input */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-2.5 px-3.5 rounded-xl hover:border-slate-350 dark:hover:border-slate-700 focus-within:border-indigo-500 dark:focus-within:border-indigo-500/80 transition-all shadow-sm dark:shadow-none">
              <svg className="w-4 h-4 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <input
                type="password"
                id="uiApiKey"
                placeholder="GEMINI_API_KEY (optional)"
                value={uiApiKey}
                onChange={(e) => handleApiKeyChange(e.target.value)}
                className="bg-transparent text-xs outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 w-44 focus:ring-0"
              />
              {uiApiKey && (
                <button
                  type="button"
                  onClick={() => handleApiKeyChange('')}
                  className="text-slate-500 hover:text-slate-350 dark:hover:text-slate-300 transition-colors cursor-pointer shrink-0"
                  title="Clear Key"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Print & Reset Buttons if data exists */}
            {data && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="p-2.5 bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-sm dark:shadow-none"
                  title="Print Plan"
                >
                  <Printer className="w-4 h-4" />
                  Print Plan
                </button>
                <button
                  type="button"
                  onClick={handleClearPlan}
                  className="p-2.5 bg-rose-500/5 hover:bg-rose-500/10 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl flex items-center gap-2 text-xs font-bold transition-all cursor-pointer shadow-sm dark:shadow-none"
                >
                  <Trash2 className="w-4 h-4" />
                  Reset Plan
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Global Error Banner */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl text-rose-400 text-sm font-semibold flex items-center gap-3 print:hidden">
            <div className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            <span>{error}</span>
          </div>
        )}

        {/* Sandbox Mock Mode Alert */}
        {data && isMockResponse && (
          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl text-amber-300 text-xs leading-relaxed flex gap-3 items-start print:hidden">
            <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Sandbox Sandbox Mode:</span> Running offline fallback because no <code>GEMINI_API_KEY</code> was found in the environment. All features (ingredient comparisons, checklist toggles, budget analyses) are fully active with simulated plans.
            </div>
          </div>
        )}

        {/* Dynamic Display Layout */}
        {!data ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Preferences Form (Left side) */}
            <div className="lg:col-span-2">
              <PreferencesForm onSubmit={handlePreferencesSubmit} isLoading={isLoading} />
            </div>

            {/* Feature Highlights (Right side) */}
            <div className="bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800/80 p-6 rounded-2xl flex flex-col gap-6 text-slate-500 dark:text-slate-400 shadow-sm transition-all duration-300">
              <h3 className="text-slate-700 dark:text-slate-200 font-bold text-sm border-b border-slate-100 dark:border-slate-800 pb-2">How ChefFlow works</h3>
              
              <div className="flex gap-3 items-start text-xs">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/20 shrink-0">1</span>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-300">Set Preferences</h4>
                  <p className="mt-1 leading-relaxed">Specify budget limits, pantry ingredients, allergies, and desired cuisines.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start text-xs">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold border border-purple-500/20 shrink-0">2</span>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-300">AI Plan Generation</h4>
                  <p className="mt-1 leading-relaxed">AI compiles a balanced menu matching all constraints (max cooking time, dietary guidelines).</p>
                </div>
              </div>

              <div className="flex gap-3 items-start text-xs">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 font-bold border border-pink-500/20 shrink-0">3</span>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-300">Compare & Prep</h4>
                  <p className="mt-1 leading-relaxed">Check off missing ingredients as you shop, view alternative swaps, and tick off tasks step-by-step.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-8 animate-fade-in">
            {/* Preferences Summary Card */}
            <div className="bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800/80 p-4 rounded-xl flex flex-wrap gap-x-6 gap-y-2.5 text-xs text-slate-650 dark:text-slate-450 font-semibold print:hidden shadow-sm transition-all duration-300">
              <span className="text-slate-850 dark:text-slate-300">Active Plan Summary:</span>
              <span>• For {data.preferences.peopleCount} {data.preferences.peopleCount === 1 ? 'person' : 'people'}</span>
              <span className="capitalize">• {data.preferences.cookingSkill} skill level</span>
              <span>• Budget: {data.preferences.currency} {data.preferences.dailyBudget}</span>
              <span>• Max prep time: {data.preferences.maxCookingTime}m</span>
              {data.preferences.allergies.length > 0 && (
                <span className="text-rose-600 dark:text-rose-400 font-bold">• Allergen avoidance: {data.preferences.allergies.join(', ')}</span>
              )}
            </div>

            {/* Dashboard Sections grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Meal Plans & Checklist */}
              <div className="lg:col-span-7 flex flex-col gap-8">
                
                {/* 1. Meal Plan Card */}
                <section id="meal-plans">
                  <MealPlanSection meals={data.meals} currency={data.preferences.currency} />
                </section>

                {/* 2. Checklist Tracker */}
                <section id="checklist">
                  <CookingChecklist
                    items={data.cookingChecklist}
                    onToggleTask={handleToggleTask}
                    teamMembers={teamMembers}
                    onAssignTask={handleAssignTask}
                  />
                </section>
              </div>

              {/* Right Column: Grocery List, Substitutions, Budget */}
              <div className="lg:col-span-5 flex flex-col gap-8">
                
                {/* 2.5 Cooking Team Section */}
                <section id="cooking-team" className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 p-6 rounded-2xl shadow-xl flex flex-col gap-5 text-slate-800 dark:text-slate-200 print:hidden transition-all duration-300">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Users className="w-5 h-5 text-indigo-500" />
                      Cooking Team Crew
                    </h3>
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                      {teamMembers.length} Members
                    </span>
                  </div>

                  <div className="flex flex-col gap-4">
                    {/* List of members */}
                    <div className="flex flex-wrap gap-2">
                      {teamMembers.map((member) => {
                        const initials = member.slice(0, 2).toUpperCase();
                        const isSelf = member === 'Self';
                        return (
                          <div
                            key={member}
                            className="inline-flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold shadow-sm"
                          >
                            <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-extrabold text-[10px]">
                              {initials}
                            </div>
                            <span>{member}</span>
                            {!isSelf && (
                              <button
                                type="button"
                                onClick={() => handleRemoveTeamMember(member)}
                                className="hover:bg-rose-500/10 p-0.5 rounded text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                                title={`Remove ${member}`}
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Add member form */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleAddTeamMember(newMemberName);
                        setNewMemberName('');
                      }}
                      className="flex gap-2"
                    >
                      <input
                        type="text"
                        placeholder="Add helper (e.g. Prakhar)..."
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        maxLength={15}
                        className="flex-1 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-3.5 py-2 text-xs outline-none text-slate-850 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 transition-all"
                      />
                      <button
                        type="submit"
                        className="px-3.5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl flex items-center gap-1 transition-all text-xs font-bold shadow-md shadow-indigo-500/10 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add
                      </button>
                    </form>
                  </div>
                </section>

                {/* 3. Budget Analysis */}
                <section id="budget">
                  <BudgetAnalysisSection analysis={data.budgetAnalysis} currency={data.preferences.currency} />
                </section>

                {/* 4. Smart Grocery list */}
                <section id="groceries">
                  <GroceryListSection groceryList={data.groceryList} currency={data.preferences.currency} />
                </section>

                {/* 5. Substitutions swaps */}
                <section id="substitutions">
                  <SubstitutionSection substitutions={data.substitutions} />
                </section>
              </div>

            </div>
          </div>
        )}

        {/* Footer print note */}
        <footer className="text-center text-[10px] text-slate-500 py-6 border-t border-slate-900 mt-8 print:block print:text-slate-800 flex flex-col gap-1 items-center justify-center">
          <div>
            ChefFlow Daily Planner • Generated on {formattedDate || '...'} • Fits budget: {data ? `${data.preferences.currency} ${data.preferences.dailyBudget}` : 'N/A'}
          </div>
          <div className="text-slate-500 mt-1">
            Made by <span className="font-bold text-slate-400">Prakhar Mathur</span> | <a href="https://prakharmathur.in" target="_blank" rel="noopener noreferrer" className="text-indigo-400/80 hover:text-indigo-400 hover:underline transition-all">prakharmathur.in</a> | <a href="mailto:mathurprakhar@gmail.com" className="text-indigo-400/80 hover:text-indigo-400 hover:underline transition-all">mathurprakhar@gmail.com</a>
          </div>
        </footer>
      </div>
    </main>
  );
}
