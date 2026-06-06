import { describe, it, expect } from 'vitest';
import { normalizeIngredient, isMatch, generateGroceryList } from '../../utils/ingredientMatcher';
import { generateMockPlan, getMockSubstitutions } from '../../lib/mockData';
import { Ingredient, PreferencesInput } from '../../types';
import { PreferencesInputSchema } from '../../utils/validators';
import { generateAIPinPlan } from '../../lib/gemini';

describe('Ingredient Matcher & Normalization', () => {
  it('should singularize plurals correctly', () => {
    expect(normalizeIngredient('Onions')).toBe('onion');
    expect(normalizeIngredient('Tomatoes ')).toBe('tomato');
    expect(normalizeIngredient('blueberries')).toBe('blueberry');
    expect(normalizeIngredient('Rice')).toBe('rice');
  });

  it('should match ingredients ignoring case and plurals', () => {
    expect(isMatch('Onions', ['onion', 'garlic'])).toBe(true);
    expect(isMatch('tomato', ['Tomatoes'])).toBe(true);
    expect(isMatch('Red Onion', ['onion'])).toBe(true);
    expect(isMatch('Garlic Cloves', ['garlic'])).toBe(true);
    expect(isMatch('salt', ['pepper'])).toBe(false);
  });

  it('should generate grocery list, segregating available and missing items', () => {
    const required: Ingredient[] = [
      { name: 'Onions', quantity: '2', estimatedPrice: 10 },
      { name: 'Tomatoes', quantity: '1', estimatedPrice: 15 },
      { name: 'Eggs', quantity: '4', estimatedPrice: 20 },
      { name: 'Rice', quantity: '100g', estimatedPrice: 15 }
    ];
    const available = ['rice', 'onions'];

    const result = generateGroceryList(required, available);

    // Rice and Onions should be available
    expect(result.alreadyAvailable.map(x => x.toLowerCase())).toContain('rice');
    expect(result.alreadyAvailable.map(x => x.toLowerCase())).toContain('onions');
    
    // Tomatoes and Eggs should be need-to-buy
    expect(result.needToBuy.some(x => x.name.toLowerCase() === 'tomatoes')).toBe(true);
    expect(result.needToBuy.some(x => x.name.toLowerCase() === 'eggs')).toBe(true);
    
    // Total cost = 15 (tomatoes) + 20 (eggs) = 35
    expect(result.totalCost).toBe(35);
  });

  it('should de-duplicate and merge duplicate missing required ingredients', () => {
    const required: Ingredient[] = [
      { name: 'Milk', quantity: '200ml', estimatedPrice: 20 },
      { name: 'Milk', quantity: '300ml', estimatedPrice: 30 }
    ];
    const available: string[] = [];

    const result = generateGroceryList(required, available);
    
    expect(result.needToBuy).toHaveLength(1);
    expect(result.needToBuy[0].name).toBe('Milk');
    expect(result.needToBuy[0].estimatedPrice).toBe(50);
    expect(result.needToBuy[0].quantity).toBe('200ml, 300ml');
  });
});

describe('Mock Plan Customization Logic', () => {
  const basePref: PreferencesInput = {
    peopleCount: 2,
    cookingSkill: 'intermediate',
    dietaryPreferences: ['vegetarian'],
    mealsRequired: ['breakfast', 'lunch', 'dinner'],
    cuisines: ['Indian'],
    dailyBudget: 500,
    currency: 'INR',
    availableIngredients: ['rice', 'onions'],
    maxCookingTime: 30,
    allergies: []
  };

  it('should customize protein source for vegetarian dietary requirements', () => {
    const result = generateMockPlan({
      ...basePref,
      dietaryPreferences: ['vegetarian']
    });

    // Dinner should not contain Chicken, should have Paneer or Tofu
    const dinner = result.meals.dinner;
    expect(dinner).toBeDefined();
    
    const hasChicken = dinner!.ingredients.some(ing => ing.name.toLowerCase() === 'chicken');
    expect(hasChicken).toBe(false);

    const hasPaneerOrTofu = dinner!.ingredients.some(ing => 
      ing.name.toLowerCase().includes('paneer') || ing.name.toLowerCase().includes('tofu')
    );
    expect(hasPaneerOrTofu).toBe(true);
  });

  it('should substitute allergens', () => {
    const result = generateMockPlan({
      ...basePref,
      allergies: ['peanuts', 'milk']
    });

    // Check that no ingredient contains peanuts or milk
    Object.values(result.meals).forEach(meal => {
      meal?.ingredients.forEach(ing => {
        expect(ing.name.toLowerCase()).not.toContain('peanuts');
        expect(ing.name.toLowerCase()).not.toContain('milk');
      });
    });
  });

  it('should scale ingredient prices by people count', () => {
    const singleResult = generateMockPlan({ ...basePref, peopleCount: 1 });
    const doubleResult = generateMockPlan({ ...basePref, peopleCount: 2 });

    const singleCost = Object.values(singleResult.meals).reduce((sum, m) => sum + (m?.cost || 0), 0);
    const doubleCost = Object.values(doubleResult.meals).reduce((sum, m) => sum + (m?.cost || 0), 0);

    expect(doubleCost).toBeGreaterThan(singleCost);
  });
});

describe('Ingredient Substitution Rules', () => {
  it('should map appropriate substitutions for missing staples', () => {
    const subs = getMockSubstitutions(['Milk', 'Paneer', 'Eggs', 'Butter']);
    
    expect(subs).toHaveLength(4);
    
    const milkSub = subs.find(s => s.ingredient === 'Milk');
    expect(milkSub?.substitutes).toContain('Oat milk');
    
    const paneerSub = subs.find(s => s.ingredient === 'Paneer');
    expect(paneerSub?.substitutes).toContain('Tofu');
  });
});

describe('Zod Validation Schemas', () => {
  const validPayload = {
    peopleCount: '3',
    cookingSkill: 'advanced',
    dietaryPreferences: ['vegan', 'gluten-free'],
    mealsRequired: ['breakfast', 'lunch', 'dinner'],
    cuisines: ['Italian'],
    dailyBudget: '450.50',
    currency: 'USD',
    availableIngredients: 'tofu, garlic, olive oil, basil',
    maxCookingTime: '45',
    allergies: 'peanuts, sesame'
  };

  it('should validate and parse correct inputs successfully', () => {
    const result = PreferencesInputSchema.safeParse(validPayload);
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.peopleCount).toBe(3);
      expect(result.data.dailyBudget).toBe(450.50);
      expect(result.data.maxCookingTime).toBe(45);
      expect(result.data.availableIngredients).toEqual(['tofu', 'garlic', 'olive oil', 'basil']);
      expect(result.data.allergies).toEqual(['peanuts', 'sesame']);
    }
  });

  it('should reject invalid values in schema validation', () => {
    const invalidPayload = {
      ...validPayload,
      peopleCount: '-1', // negative people count
      dailyBudget: 'abc', // invalid budget
      mealsRequired: [] // empty meals array
    };

    const result = PreferencesInputSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });
});

describe('Gemini Client configuration check', () => {
  it('should throw error when api key is not initialized', async () => {
    const testPref: PreferencesInput = {
      peopleCount: 1,
      cookingSkill: 'beginner',
      dietaryPreferences: ['vegetarian'],
      mealsRequired: ['lunch'],
      cuisines: [],
      dailyBudget: 100,
      currency: 'INR',
      availableIngredients: [],
      maxCookingTime: 30,
      allergies: []
    };

    await expect(generateAIPinPlan(testPref)).rejects.toThrow('Gemini API key is not configured.');
  });
});

