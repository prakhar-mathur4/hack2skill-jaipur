import { NextResponse } from 'next/server';
import { PreferencesInputSchema } from '../../../utils/validators';
import { generateAIPinPlan } from '../../../lib/gemini';
import { generateMockPlan, getMockSubstitutions } from '../../../lib/mockData';
import { generateGroceryList } from '../../../utils/ingredientMatcher';
import { CookingPlanResult, FullCookingDashboardData, Ingredient } from '../../../types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. Validate incoming preferences using Zod
    const validationResult = PreferencesInputSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid preferences format', 
          details: validationResult.error.issues.map(err => `${err.path.join('.')}: ${err.message}`) 
        },
        { status: 400 }
      );
    }

    const preferences = validationResult.data;
    
    // 2. Call Gemini AI if key is present (client header or server env), otherwise fallback to local mock engine
    const userApiKey = request.headers.get('x-gemini-api-key') || undefined;
    const activeKey = userApiKey || process.env.GEMINI_API_KEY;
    let planResult: CookingPlanResult;
    let isMock = false;

    if (activeKey) {
      try {
        planResult = await generateAIPinPlan(preferences, userApiKey);
      } catch (aiError) {
        console.error('Failed to generate AI plan, falling back to mock:', aiError);
        planResult = generateMockPlan(preferences);
        isMock = true;
      }
    } else {
      planResult = generateMockPlan(preferences);
      isMock = true;
    }

    // 3. Extract all required ingredients from all generated meals
    const requiredIngredients: Ingredient[] = [];
    Object.values(planResult.meals).forEach(meal => {
      if (meal && meal.ingredients) {
        requiredIngredients.push(...meal.ingredients);
      }
    });

    // 4. Generate the grocery list (Already Available vs Need to Buy)
    const groceryList = generateGroceryList(requiredIngredients, preferences.availableIngredients);

    // 5. Generate ingredient substitutions for missing items
    const missingIngredientNames = groceryList.needToBuy.map(item => item.name);
    
    // Merge AI generated substitutions with our local rules to ensure complete coverage
    const substitutions = getMockSubstitutions(missingIngredientNames);
    
    // If AI provided any custom substitutions, prepend them (avoiding duplicates)
    if (planResult.suggestedSubstitutions && planResult.suggestedSubstitutions.length > 0) {
      planResult.suggestedSubstitutions.forEach(aiSub => {
        const exists = substitutions.some(
          s => s.ingredient.toLowerCase() === aiSub.ingredient.toLowerCase()
        );
        if (!exists) {
          substitutions.unshift({
            ingredient: aiSub.ingredient,
            substitutes: aiSub.substitutes,
            reason: aiSub.reason,
          });
        }
      });
    }

    // 6. Calculate Budget Feasibility
    const totalEstimatedCost = Object.values(planResult.meals).reduce(
      (sum, meal) => sum + (meal?.cost || 0), 
      0
    );
    const status: 'within_budget' | 'over_budget' = totalEstimatedCost <= preferences.dailyBudget ? 'within_budget' : 'over_budget';
    const difference = Math.abs(totalEstimatedCost - preferences.dailyBudget);

    // Default suggestions if over budget
    const defaultOverBudgetSuggestions = [
      'Cheaper swaps: Swap chicken/paneer for beans, chickpeas, or seasonal squash.',
      'Simpler alternatives: Opt for a single pot meal like fried rice or khichdi.',
      'Reduced quantities: Reduce meal portions slightly or cook for fewer extra portions.'
    ];

    const budgetAnalysis = {
      dailyBudget: preferences.dailyBudget,
      totalEstimatedCost: parseFloat(totalEstimatedCost.toFixed(2)),
      status,
      difference: parseFloat(difference.toFixed(2)),
      optimizationSuggestions: status === 'over_budget' 
        ? (planResult.budgetSuggestions && planResult.budgetSuggestions.length > 0
            ? planResult.budgetSuggestions
            : defaultOverBudgetSuggestions)
        : ['✅ Your daily plan fits perfectly within your budget. No optimizations needed!']
    };

    // 7. Generate a structured cooking checklist task list
    const cookingChecklist: any[] = [];
    const mealCategories = ['breakfast', 'lunch', 'dinner', 'snacks'];
    
    mealCategories.forEach(cat => {
      const meal = planResult.meals[cat as keyof typeof planResult.meals];
      if (meal && meal.tasks) {
        meal.tasks.forEach((task, idx) => {
          cookingChecklist.push({
            id: `${cat}-${idx}`,
            category: cat.charAt(0).toUpperCase() + cat.slice(1),
            task,
            completed: false
          });
        });
      }
    });

    const responseData: FullCookingDashboardData & { isMock: boolean } = {
      preferences,
      meals: planResult.meals,
      groceryList,
      substitutions,
      budgetAnalysis,
      cookingChecklist,
      isMock
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Unhandled API error:', error);
    return NextResponse.json(
      { error: 'An unexpected server error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
