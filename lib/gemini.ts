import { GoogleGenerativeAI } from '@google/generative-ai';
import { PreferencesInput, CookingPlanResult } from '../types';
import { CookingPlanResponseSchema } from '../utils/validators';

const apiKey = process.env.GEMINI_API_KEY || '';

// Initialize Gemini API client
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Response Schema for Structured JSON Output
const responseSchema = {
  type: 'object',
  properties: {
    meals: {
      type: 'object',
      properties: {
        breakfast: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            cookingTime: { type: 'number', description: 'Cooking time in minutes' },
            cost: { type: 'number', description: 'Estimated cost of ingredients in the specified currency' },
            ingredients: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  quantity: { type: 'string' },
                  estimatedPrice: { type: 'number' }
                },
                required: ['name', 'quantity', 'estimatedPrice']
              }
            },
            tasks: {
              type: 'array',
              items: { type: 'string' },
              description: 'Chronological cooking checklist steps for this dish'
            }
          },
          required: ['name', 'description', 'cookingTime', 'cost', 'ingredients', 'tasks']
        },
        lunch: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            cookingTime: { type: 'number' },
            cost: { type: 'number' },
            ingredients: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  quantity: { type: 'string' },
                  estimatedPrice: { type: 'number' }
                },
                required: ['name', 'quantity', 'estimatedPrice']
              }
            },
            tasks: {
              type: 'array',
              items: { type: 'string' }
            }
          },
          required: ['name', 'description', 'cookingTime', 'cost', 'ingredients', 'tasks']
        },
        dinner: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            cookingTime: { type: 'number' },
            cost: { type: 'number' },
            ingredients: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  quantity: { type: 'string' },
                  estimatedPrice: { type: 'number' }
                },
                required: ['name', 'quantity', 'estimatedPrice']
              }
            },
            tasks: {
              type: 'array',
              items: { type: 'string' }
            }
          },
          required: ['name', 'description', 'cookingTime', 'cost', 'ingredients', 'tasks']
        },
        snacks: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            cookingTime: { type: 'number' },
            cost: { type: 'number' },
            ingredients: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  quantity: { type: 'string' },
                  estimatedPrice: { type: 'number' }
                },
                required: ['name', 'quantity', 'estimatedPrice']
              }
            },
            tasks: {
              type: 'array',
              items: { type: 'string' }
            }
          },
          required: ['name', 'description', 'cookingTime', 'cost', 'ingredients', 'tasks']
        }
      }
    },
    suggestedSubstitutions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          ingredient: { type: 'string' },
          substitutes: { type: 'array', items: { type: 'string' } },
          reason: { type: 'string' }
        },
        required: ['ingredient', 'substitutes', 'reason']
      }
    },
    budgetSuggestions: {
      type: 'array',
      items: { type: 'string' }
    }
  },
  required: ['meals', 'suggestedSubstitutions']
};

/**
 * Calls Gemini API to generate a structured meal plan.
 */
export async function generateAIPinPlan(preferences: PreferencesInput, userApiKey?: string): Promise<CookingPlanResult> {
  const activeKey = userApiKey || process.env.GEMINI_API_KEY || '';
  if (!activeKey) {
    throw new Error('Gemini API key is not configured.');
  }

  const genAI = new GoogleGenerativeAI(activeKey);

  // Use gemini-2.5-flash as the standard model for fast, structured generation
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: responseSchema as any,
    },
  });

  const systemPrompt = `You are a culinary planner. Create a personalized meal plan for a single day based on user preferences.
Strict rules:
1. Respect all dietary preferences (${preferences.dietaryPreferences.join(', ')}). Under no circumstances include non-vegetarian ingredients if vegetarian, vegan, or eggetarian is selected. If vegan is selected, make all dishes strictly plant-based and dairy-free.
2. NEVER include any allergens or ingredients containing allergens: ${preferences.allergies.join(', ')}.
3. Optimize for the cooking skill level: ${preferences.cookingSkill}. Beginner should have simple steps, while Advanced can have gourmet or technical preparation steps.
4. Try to incorporate the user's available ingredients: ${preferences.availableIngredients.join(', ')}.
5. Keep within the daily budget of ${preferences.currency} ${preferences.dailyBudget}. If it is impossible to stay within the budget, generate realistic meal plans anyway, but populate "budgetSuggestions" with optimization tips.
6. The cooking time of any individual meal must not exceed ${preferences.maxCookingTime} minutes.
7. Output details matching the requested JSON structure exactly.`;

  const userPrompt = `Generate the daily meal plan for ${preferences.peopleCount} people.
Cuisine preferences: ${preferences.cuisines.join(', ') || 'No specific cuisine preferences, select standard healthy choices'}.
Meals required: ${preferences.mealsRequired.join(', ')}.
Daily Budget: ${preferences.currency} ${preferences.dailyBudget}.
Available Ingredients: ${preferences.availableIngredients.join(', ')}.
Maximum Cooking Time per Meal: ${preferences.maxCookingTime} minutes.
Allergies to avoid: ${preferences.allergies.join(', ') || 'None'}.`;

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      systemInstruction: systemPrompt,
    });

    const responseText = result.response.text();
    if (!responseText) {
      throw new Error('Empty response received from Gemini API.');
    }

    const parsedJson = JSON.parse(responseText);
    
    // Validate the response with Zod
    const validatedResult = CookingPlanResponseSchema.parse(parsedJson);
    return validatedResult as CookingPlanResult;
  } catch (error) {
    console.error('Error generating AI plan:', error);
    throw error;
  }
}
