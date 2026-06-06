import { z } from 'zod';

export const PreferencesInputSchema = z.object({
  peopleCount: z.coerce.number().int().min(1, 'Must cook for at least 1 person').max(100),
  ageGroup: z.string().optional(),
  cookingSkill: z.enum(['beginner', 'intermediate', 'advanced']),
  dietaryPreferences: z.array(z.string()).min(1, 'Select at least one dietary preference'),
  mealsRequired: z.array(z.string()).min(1, 'Select at least one meal'),
  cuisines: z.array(z.string()).default([]),
  dailyBudget: z.coerce.number().positive('Budget must be a positive number'),
  currency: z.string().default('INR'),
  availableIngredients: z.union([
    z.array(z.string()),
    z.string().transform(val => val.split(',').map(s => s.trim().toLowerCase()).filter(Boolean))
  ]).default([]),
  maxCookingTime: z.coerce.number().int().positive('Cooking time must be a positive number'),
  allergies: z.union([
    z.array(z.string()),
    z.string().transform(val => val ? val.split(',').map(s => s.trim().toLowerCase()).filter(Boolean) : [])
  ]).default([]),
});

const IngredientSchema = z.object({
  name: z.string(),
  quantity: z.string(),
  estimatedPrice: z.number().nonnegative(),
});

const MealPlanSchema = z.object({
  name: z.string(),
  description: z.string(),
  cookingTime: z.number().int().positive(),
  cost: z.number().nonnegative(),
  ingredients: z.array(IngredientSchema),
  tasks: z.array(z.string()),
});

export const CookingPlanResponseSchema = z.object({
  meals: z.object({
    breakfast: MealPlanSchema.optional(),
    lunch: MealPlanSchema.optional(),
    dinner: MealPlanSchema.optional(),
    snacks: MealPlanSchema.optional(),
  }),
  suggestedSubstitutions: z.array(z.object({
    ingredient: z.string(),
    substitutes: z.array(z.string()),
    reason: z.string(),
  })),
  budgetSuggestions: z.array(z.string()).optional(),
});
