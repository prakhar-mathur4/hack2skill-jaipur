export type CookingSkillLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Ingredient {
  name: string;
  quantity: string;
  estimatedPrice: number;
}

export interface MealPlan {
  name: string;
  description: string;
  cookingTime: number; // in minutes
  cost: number;
  ingredients: Ingredient[];
  tasks: string[];
}

export interface PreferencesInput {
  peopleCount: number;
  ageGroup?: string;
  cookingSkill: CookingSkillLevel;
  dietaryPreferences: string[];
  mealsRequired: string[];
  cuisines: string[];
  dailyBudget: number;
  currency: string;
  availableIngredients: string[];
  maxCookingTime: number;
  allergies: string[];
}

export interface GroceryItem {
  name: string;
  quantity: string;
  estimatedPrice: number;
}

export interface GroceryList {
  alreadyAvailable: string[];
  needToBuy: GroceryItem[];
  totalCost: number;
}

export interface Substitution {
  ingredient: string;
  substitutes: string[];
  reason: string;
}

export interface BudgetAnalysis {
  dailyBudget: number;
  totalEstimatedCost: number;
  status: 'within_budget' | 'over_budget';
  difference: number;
  optimizationSuggestions: string[];
}

export interface CookingChecklistItem {
  id: string;
  category: string;
  task: string;
  completed: boolean;
  assignee?: string;
}

export interface CookingPlanResult {
  meals: {
    breakfast?: MealPlan;
    lunch?: MealPlan;
    dinner?: MealPlan;
    snacks?: MealPlan;
  };
  suggestedSubstitutions: Substitution[];
  budgetSuggestions?: string[];
}

// Full response containing both AI generated parts and processed parts
export interface FullCookingDashboardData {
  preferences: PreferencesInput;
  meals: {
    breakfast?: MealPlan;
    lunch?: MealPlan;
    dinner?: MealPlan;
    snacks?: MealPlan;
  };
  groceryList: GroceryList;
  substitutions: Substitution[];
  budgetAnalysis: BudgetAnalysis;
  cookingChecklist: CookingChecklistItem[];
  teamMembers?: string[];
}
