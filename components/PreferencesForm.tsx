import React, { useState } from 'react';
import { ChefHat, Users, DollarSign, Clock, AlertTriangle, Plus, X } from 'lucide-react';
import { PreferencesInput, CookingSkillLevel } from '../types';

interface PreferencesFormProps {
  onSubmit: (data: PreferencesInput) => void;
  isLoading: boolean;
}

const DIETARY_OPTIONS = [
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'eggetarian', label: 'Eggetarian' },
  { id: 'non-vegetarian', label: 'Non-Vegetarian' },
  { id: 'keto', label: 'Keto' },
  { id: 'low-carb', label: 'Low-Carb' },
  { id: 'gluten-free', label: 'Gluten-Free' },
  { id: 'dairy-free', label: 'Dairy-Free' },
];

const MEAL_OPTIONS = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'snacks', label: 'Snacks' },
];

const CUISINE_OPTIONS = [
  'Indian', 'Italian', 'Mexican', 'Asian', 'Mediterranean', 'American'
];

export default function PreferencesForm({ onSubmit, isLoading }: PreferencesFormProps) {
  // Input fields state
  const [peopleCount, setPeopleCount] = useState<number>(2);
  const [ageGroup, setAgeGroup] = useState<string>('adults');
  const [cookingSkill, setCookingSkill] = useState<CookingSkillLevel>('intermediate');
  const [selectedDietary, setSelectedDietary] = useState<string[]>(['vegetarian']);
  const [selectedMeals, setSelectedMeals] = useState<string[]>(['breakfast', 'lunch', 'dinner']);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>(['Indian']);
  const [dailyBudget, setDailyBudget] = useState<string>('500');
  const [currency, setCurrency] = useState<string>('INR');
  const [maxCookingTime, setMaxCookingTime] = useState<number>(30);
  
  // Tag-like fields
  const [availableInput, setAvailableInput] = useState<string>('');
  const [availableIngredients, setAvailableIngredients] = useState<string[]>(['rice', 'onions', 'tomatoes', 'milk', 'eggs']);
  
  const [allergyInput, setAllergyInput] = useState<string>('');
  const [allergies, setAllergies] = useState<string[]>([]);

  // Validation Error State
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Tag helpers
  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (availableInput.trim()) {
      const item = availableInput.trim().toLowerCase();
      if (!availableIngredients.includes(item)) {
        setAvailableIngredients([...availableIngredients, item]);
      }
      setAvailableInput('');
    }
  };

  const handleRemoveIngredient = (ing: string) => {
    setAvailableIngredients(availableIngredients.filter(x => x !== ing));
  };

  const handleAddAllergy = (e: React.FormEvent) => {
    e.preventDefault();
    if (allergyInput.trim()) {
      const item = allergyInput.trim().toLowerCase();
      if (!allergies.includes(item)) {
        setAllergies([...allergies, item]);
      }
      setAllergyInput('');
    }
  };

  const handleRemoveAllergy = (alg: string) => {
    setAllergies(allergies.filter(x => x !== alg));
  };

  const toggleDietary = (id: string) => {
    if (selectedDietary.includes(id)) {
      setSelectedDietary(selectedDietary.filter(x => x !== id));
    } else {
      setSelectedDietary([...selectedDietary, id]);
    }
  };

  const toggleMeal = (id: string) => {
    if (selectedMeals.includes(id)) {
      // Keep at least one meal checked
      if (selectedMeals.length > 1) {
        setSelectedMeals(selectedMeals.filter(x => x !== id));
      }
    } else {
      setSelectedMeals([...selectedMeals, id]);
    }
  };

  const toggleCuisine = (cuisine: string) => {
    if (selectedCuisines.includes(cuisine)) {
      setSelectedCuisines(selectedCuisines.filter(x => x !== cuisine));
    } else {
      setSelectedCuisines([...selectedCuisines, cuisine]);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!peopleCount || peopleCount < 1) {
      newErrors.peopleCount = 'Number of people must be at least 1';
    }
    if (!dailyBudget || parseFloat(dailyBudget) <= 0 || isNaN(parseFloat(dailyBudget))) {
      newErrors.dailyBudget = 'Budget must be a positive number';
    }
    if (selectedDietary.length === 0) {
      newErrors.dietary = 'Select at least one dietary preference';
    }
    if (selectedMeals.length === 0) {
      newErrors.meals = 'Select at least one meal type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        peopleCount,
        ageGroup,
        cookingSkill,
        dietaryPreferences: selectedDietary,
        mealsRequired: selectedMeals,
        cuisines: selectedCuisines,
        dailyBudget: parseFloat(dailyBudget),
        currency,
        availableIngredients,
        maxCookingTime,
        allergies,
      });
    }
  };

  return (
    <form 
      id="preferences-form" 
      onSubmit={handleSubmit} 
      className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 p-6 rounded-2xl shadow-xl text-slate-800 dark:text-slate-100 flex flex-col gap-6 transition-all duration-300"
    >
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800/80">
        <div className="p-2.5 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl text-white shadow-md shadow-indigo-500/10">
          <ChefHat className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-650 to-pink-600 dark:from-indigo-205 dark:to-purple-200">
            Configure Preferences
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Specify details to generate a cost-optimized daily plan</p>
        </div>
      </div>

      {/* Grid: People count, Cooking skill, Age group */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* People Count */}
        <div className="flex flex-col gap-2">
          <label htmlFor="peopleCount" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            Number of People
          </label>
          <input
            type="number"
            id="peopleCount"
            min="1"
            max="50"
            value={peopleCount}
            onChange={(e) => setPeopleCount(parseInt(e.target.value) || 1)}
            className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-4 py-2.5 outline-none text-slate-850 dark:text-slate-200 transition-all"
            aria-describedby="error-peopleCount"
          />
          {errors.peopleCount && (
            <p id="error-peopleCount" className="text-xs text-rose-500 dark:text-rose-400 flex items-center gap-1 mt-1 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" />
              {errors.peopleCount}
            </p>
          )}
        </div>

        {/* Cooking Skill */}
        <div className="flex flex-col gap-2">
          <label htmlFor="cookingSkill" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Cooking Skill Level
          </label>
          <select
            id="cookingSkill"
            value={cookingSkill}
            onChange={(e) => setCookingSkill(e.target.value as CookingSkillLevel)}
            className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-4 py-2.5 outline-none text-slate-800 dark:text-slate-200 cursor-pointer transition-all"
          >
            <option value="beginner">Beginner (Simple & Quick)</option>
            <option value="intermediate">Intermediate (Balanced)</option>
            <option value="advanced">Advanced (Technique-focused)</option>
          </select>
        </div>

        {/* Age Group */}
        <div className="flex flex-col gap-2">
          <label htmlFor="ageGroup" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Age Group (Optional)
          </label>
          <select
            id="ageGroup"
            value={ageGroup}
            onChange={(e) => setAgeGroup(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-4 py-2.5 outline-none text-slate-800 dark:text-slate-200 cursor-pointer transition-all"
          >
            <option value="adults">Adults</option>
            <option value="kids">Kids</option>
            <option value="mixed">Mixed Family</option>
            <option value="elderly">Elderly Friendly</option>
          </select>
        </div>
      </div>

      {/* Dietary Preferences Checkboxes */}
      <div className="flex flex-col gap-3">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Dietary Preferences</span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {DIETARY_OPTIONS.map((opt) => {
            const isChecked = selectedDietary.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                id={`dietary-${opt.id}`}
                onClick={() => toggleDietary(opt.id)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer ${
                  isChecked
                    ? 'bg-indigo-500/10 border-indigo-500 text-indigo-650 dark:text-indigo-300 font-bold'
                    : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800/80 text-slate-550 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
                aria-pressed={isChecked}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
        {errors.dietary && (
          <p className="text-xs text-rose-500 dark:text-rose-400 flex items-center gap-1 mt-1 font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            {errors.dietary}
          </p>
        )}
      </div>

      {/* Meals Required & Cuisines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Meals */}
        <div className="flex flex-col gap-3">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Meals Required</span>
          <div className="flex flex-wrap gap-2">
            {MEAL_OPTIONS.map((opt) => {
              const isChecked = selectedMeals.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  id={`meal-${opt.id}`}
                  onClick={() => toggleMeal(opt.id)}
                  className={`py-2 px-4 rounded-xl border text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer ${
                    isChecked
                      ? 'bg-indigo-500 text-white border-indigo-400 shadow-md shadow-indigo-500/15'
                      : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-855 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                  aria-pressed={isChecked}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          {errors.meals && (
            <p className="text-xs text-rose-500 dark:text-rose-400 flex items-center gap-1 mt-1 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" />
              {errors.meals}
            </p>
          )}
        </div>

        {/* Cuisines */}
        <div className="flex flex-col gap-3">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Preferred Cuisines</span>
          <div className="flex flex-wrap gap-2">
            {CUISINE_OPTIONS.map((cuisine) => {
              const isChecked = selectedCuisines.includes(cuisine);
              return (
                <button
                  key={cuisine}
                  type="button"
                  id={`cuisine-${cuisine.toLowerCase()}`}
                  onClick={() => toggleCuisine(cuisine)}
                  className={`py-2 px-3.5 rounded-xl border text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer ${
                    isChecked
                      ? 'bg-purple-500 text-white border-purple-400 shadow-md shadow-purple-500/15'
                      : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-855 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                  aria-pressed={isChecked}
                >
                  {cuisine}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Budget & Time Constraints */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Currency selection */}
        <div className="flex flex-col gap-2">
          <label htmlFor="currency" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Currency
          </label>
          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-4 py-2.5 outline-none text-slate-800 dark:text-slate-200 transition-all cursor-pointer"
          >
            <option value="INR">Rupees (₹ - INR)</option>
            <option value="USD">Dollars ($ - USD)</option>
            <option value="EUR">Euros (€ - EUR)</option>
          </select>
        </div>

        {/* Budget */}
        <div className="flex flex-col gap-2">
          <label htmlFor="dailyBudget" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            Daily Budget limit
          </label>
          <input
            type="number"
            id="dailyBudget"
            min="10"
            value={dailyBudget}
            onChange={(e) => setDailyBudget(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-4 py-2.5 outline-none text-slate-850 dark:text-slate-200 transition-all"
            aria-describedby="error-dailyBudget"
          />
          {errors.dailyBudget && (
            <p id="error-dailyBudget" className="text-xs text-rose-500 dark:text-rose-400 flex items-center gap-1 mt-1 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" />
              {errors.dailyBudget}
            </p>
          )}
        </div>

        {/* Max Cooking Time */}
        <div className="flex flex-col gap-2">
          <label htmlFor="maxCookingTime" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            Max Cook Time per Meal
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              id="maxCookingTime"
              min="10"
              max="120"
              step="5"
              value={maxCookingTime}
              onChange={(e) => setMaxCookingTime(parseInt(e.target.value))}
              className="flex-1 accent-indigo-500 cursor-pointer"
            />
            <span className="text-sm font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 px-2 py-1 rounded-lg min-w-[65px] text-center">
              {maxCookingTime}m
            </span>
          </div>
        </div>
      </div>

      {/* Available Ingredients */}
      <div className="flex flex-col gap-2">
        <label htmlFor="availableIngredients" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Available Ingredients (What's in your pantry?)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            id="availableIngredients"
            placeholder="e.g. rice, onions, eggs, chicken"
            value={availableInput}
            onChange={(e) => setAvailableInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddIngredient(e);
              }
            }}
            className="flex-1 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-4 py-2.5 outline-none text-slate-850 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 transition-all"
          />
          <button
            type="button"
            onClick={handleAddIngredient}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center gap-1 transition-all text-sm font-semibold cursor-pointer text-slate-750 dark:text-slate-200"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
        {availableIngredients.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {availableIngredients.map((ing) => (
              <span 
                key={ing} 
                className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-semibold"
              >
                {ing}
                <button
                  type="button"
                  onClick={() => handleRemoveIngredient(ing)}
                  className="hover:bg-indigo-500/20 p-0.5 rounded-full text-indigo-550 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-200 transition-colors cursor-pointer"
                  aria-label={`Remove ${ing}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No ingredients added. We will assume you need to buy everything.</p>
        )}
      </div>

      {/* Allergies */}
      <div className="flex flex-col gap-2">
        <label htmlFor="allergies" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Allergies or Disliked Ingredients (Optional)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            id="allergies"
            placeholder="e.g. peanuts, dairy, soy, fish"
            value={allergyInput}
            onChange={(e) => setAllergyInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddAllergy(e);
              }
            }}
            className="flex-1 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-4 py-2.5 outline-none text-slate-850 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 transition-all"
          />
          <button
            type="button"
            onClick={handleAddAllergy}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center gap-1 transition-all text-sm font-semibold cursor-pointer text-slate-750 dark:text-slate-200"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
        {allergies.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {allergies.map((alg) => (
              <span 
                key={alg} 
                className="inline-flex items-center gap-1 px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 rounded-lg text-xs font-semibold animate-fade-in"
              >
                {alg}
                <button
                  type="button"
                  onClick={() => handleRemoveAllergy(alg)}
                  className="hover:bg-rose-500/20 p-0.5 rounded-full text-rose-550 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-200 transition-colors cursor-pointer"
                  aria-label={`Remove allergy to ${alg}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        id="submit-preferences-btn"
        disabled={isLoading}
        className="w-full mt-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-xl hover:shadow-indigo-500/10 disabled:opacity-50 cursor-pointer text-center flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Analyzing ingredients & planning meals...
          </>
        ) : (
          'Generate My Cooking Plan'
        )}
      </button>
    </form>
  );
}
