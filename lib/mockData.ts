import { PreferencesInput, CookingPlanResult, MealPlan, Substitution } from '../types';

// Static lists of dishes by dietary preference and cuisine to build realistic mock responses
const MOCK_RECIPES: Record<string, Record<string, any[]>> = {
  italian: {
    breakfast: [
      {
        name: 'Italian Tomato & Herb Omelette',
        description: 'A fluffy omelette with fresh basil, cherry tomatoes, and a drizzle of olive oil.',
        cookingTime: 15,
        baseCostPerPerson: 80,
        ingredients: [
          { name: 'Eggs', quantity: '2', estimatedPrice: 15 },
          { name: 'Tomatoes', quantity: '1', estimatedPrice: 10 },
          { name: 'Olive Oil', quantity: '1 tbsp', estimatedPrice: 15 },
          { name: 'Basil', quantity: '5 leaves', estimatedPrice: 10 },
          { name: 'Cheese', quantity: '30g', estimatedPrice: 30 }
        ],
        tasks: ['Whisk eggs with herbs', 'Dice tomatoes', 'Heat oil and cook omelette', 'Sprinkle cheese and fold']
      },
      {
        name: 'Avocado Caprese Toast',
        description: 'Toasted whole wheat bread topped with mashed avocado, sliced tomatoes, mozzarella, and balsamic glaze.',
        cookingTime: 10,
        baseCostPerPerson: 100,
        ingredients: [
          { name: 'Bread', quantity: '2 slices', estimatedPrice: 20 },
          { name: 'Avocado', quantity: '0.5', estimatedPrice: 40 },
          { name: 'Tomatoes', quantity: '1', estimatedPrice: 10 },
          { name: 'Mozzarella', quantity: '30g', estimatedPrice: 30 }
        ],
        tasks: ['Toast bread', 'Mash avocado and spread on toast', 'Slice tomatoes and mozzarella', 'Assemble and top with balsamic']
      }
    ],
    lunch: [
      {
        name: 'Creamy Pesto Pasta',
        description: 'Al dente pasta tossed in rich basil pesto sauce, topped with cherry tomatoes and parmesan.',
        cookingTime: 20,
        baseCostPerPerson: 120,
        ingredients: [
          { name: 'Pasta', quantity: '100g', estimatedPrice: 30 },
          { name: 'Pesto Sauce', quantity: '2 tbsp', estimatedPrice: 40 },
          { name: 'Cream', quantity: '30ml', estimatedPrice: 20 },
          { name: 'Parmesan Cheese', quantity: '15g', estimatedPrice: 30 }
        ],
        tasks: ['Boil pasta in salted water', 'Prepare pesto and cream sauce base', 'Drain pasta and toss in sauce', 'Garnish with parmesan']
      }
    ],
    dinner: [
      {
        name: 'Tuscan Garlic Chicken / Tofu',
        description: 'Pan-seared protein cooked in a savory garlic, spinach, and sun-dried tomato cream sauce.',
        cookingTime: 25,
        baseCostPerPerson: 180,
        ingredients: [
          { name: 'Chicken (or Tofu for Veg)', quantity: '150g', estimatedPrice: 80 },
          { name: 'Spinach', quantity: '50g', estimatedPrice: 15 },
          { name: 'Cream', quantity: '50ml', estimatedPrice: 30 },
          { name: 'Garlic', quantity: '3 cloves', estimatedPrice: 10 },
          { name: 'Sun-dried Tomatoes', quantity: '4 pieces', estimatedPrice: 45 }
        ],
        tasks: ['Sear protein until golden', 'Sauté minced garlic and spinach', 'Pour cream and add sun-dried tomatoes', 'Simmer protein in sauce']
      }
    ]
  },
  indian: {
    breakfast: [
      {
        name: 'Masala Oats Poha',
        description: 'A nutritious breakfast made with flattened rice (poha) or oats, tempered with mustard seeds, curry leaves, and onions.',
        cookingTime: 15,
        baseCostPerPerson: 40,
        ingredients: [
          { name: 'Poha (or Oats)', quantity: '75g', estimatedPrice: 15 },
          { name: 'Onions', quantity: '1 small', estimatedPrice: 5 },
          { name: 'Peanuts', quantity: '1 tbsp', estimatedPrice: 10 },
          { name: 'Curry Leaves', quantity: '1 sprig', estimatedPrice: 2 },
          { name: 'Mustard Seeds', quantity: '0.5 tsp', estimatedPrice: 3 },
          { name: 'Turmeric & Green Chillies', quantity: '1 pinch', estimatedPrice: 5 }
        ],
        tasks: ['Rinse poha or toast oats', 'Sauté peanuts, mustard seeds, and curry leaves', 'Add chopped onions and green chillies', 'Mix in poha, turmeric, and steam for 3 mins']
      },
      {
        name: 'Paneer / Egg Bhurji with Toast',
        description: 'Scrambled paneer (or eggs) cooked with onions, tomatoes, and Indian spices, served with whole wheat bread.',
        cookingTime: 15,
        baseCostPerPerson: 70,
        ingredients: [
          { name: 'Paneer (or Eggs)', quantity: '100g (or 2 eggs)', estimatedPrice: 45 },
          { name: 'Onions', quantity: '1 small', estimatedPrice: 5 },
          { name: 'Tomatoes', quantity: '1 small', estimatedPrice: 5 },
          { name: 'Spices (Turmeric, Garam Masala)', quantity: '1 tsp', estimatedPrice: 5 },
          { name: 'Bread', quantity: '2 slices', estimatedPrice: 10 }
        ],
        tasks: ['Chop onions and tomatoes', 'Sauté onions until translucent, then add tomatoes and spices', 'Crumble paneer (or scramble eggs) into the pan', 'Toast bread and serve hot']
      }
    ],
    lunch: [
      {
        name: 'Dal Tadka & Steamed Rice',
        description: 'Yellow lentils tempered with ghee, cumin seeds, garlic, and red chillies, served with hot basmati rice.',
        cookingTime: 25,
        baseCostPerPerson: 50,
        ingredients: [
          { name: 'Lentils (Dal)', quantity: '80g', estimatedPrice: 15 },
          { name: 'Rice', quantity: '100g', estimatedPrice: 15 },
          { name: 'Ghee', quantity: '1 tbsp', estimatedPrice: 10 },
          { name: 'Cumin Seeds & Garlic', quantity: '1 tsp', estimatedPrice: 5 },
          { name: 'Onions & Tomatoes', quantity: '0.5 each', estimatedPrice: 5 }
        ],
        tasks: ['Pressure cook lentils with turmeric', 'Wash and cook rice', 'Prepare tempering (tadka) with ghee, cumin, garlic, and onions', 'Pour tempering over cooked lentils and serve over rice']
      }
    ],
    dinner: [
      {
        name: 'Paneer / Chicken Butter Masala & Roti',
        description: 'A rich and creamy tomato-butter gravy cooked with protein, served with freshly made whole wheat flatbreads.',
        cookingTime: 30,
        baseCostPerPerson: 130,
        ingredients: [
          { name: 'Paneer (or Chicken)', quantity: '120g', estimatedPrice: 60 },
          { name: 'Butter', quantity: '1 tbsp', estimatedPrice: 10 },
          { name: 'Tomato Puree', quantity: '100ml', estimatedPrice: 15 },
          { name: 'Cream', quantity: '2 tbsp', estimatedPrice: 15 },
          { name: 'Wheat Flour (Atta)', quantity: '100g', estimatedPrice: 10 },
          { name: 'Garlic & Ginger Paste', quantity: '1 tsp', estimatedPrice: 5 },
          { name: 'Spices', quantity: '1 tsp', estimatedPrice: 15 }
        ],
        tasks: ['Knead wheat flour dough and let rest', 'Sauté ginger-garlic paste, add tomato puree and spices', 'Simmer protein in the gravy, finish with butter and cream', 'Roll out dough and cook flatbreads on a griddle']
      }
    ]
  },
  mexican: {
    breakfast: [
      {
        name: 'Breakfast Breakfast Burrito',
        description: 'Scrambled eggs, black beans, salsa, and avocado wrapped in a warm flour tortilla.',
        cookingTime: 15,
        baseCostPerPerson: 70,
        ingredients: [
          { name: 'Eggs', quantity: '2', estimatedPrice: 15 },
          { name: 'Black Beans', quantity: '50g', estimatedPrice: 15 },
          { name: 'Tortilla', quantity: '1 large', estimatedPrice: 15 },
          { name: 'Avocado', quantity: '0.25', estimatedPrice: 20 },
          { name: 'Salsa', quantity: '2 tbsp', estimatedPrice: 5 }
        ],
        tasks: ['Scramble eggs', 'Warm black beans and tortilla', 'Slice avocado', 'Assemble fillings in tortilla, roll, and serve']
      }
    ],
    lunch: [
      {
        name: 'Deconstructed Taco Bowl',
        description: 'Rice topped with seasoned beans (or chicken), sweet corn, bell peppers, salsa, and cilantro lime dressing.',
        cookingTime: 20,
        baseCostPerPerson: 85,
        ingredients: [
          { name: 'Rice', quantity: '100g', estimatedPrice: 15 },
          { name: 'Beans (or Chicken)', quantity: '100g', estimatedPrice: 30 },
          { name: 'Corn & Peppers', quantity: '50g', estimatedPrice: 20 },
          { name: 'Salsa', quantity: '2 tbsp', estimatedPrice: 10 },
          { name: 'Lime & Cilantro', quantity: '1 tbsp', estimatedPrice: 10 }
        ],
        tasks: ['Cook rice', 'Season beans or cook chicken', 'Sauté bell peppers and corn', 'Layer rice, toppings, and dress with lime/cilantro']
      }
    ],
    dinner: [
      {
        name: 'Sizzling Fajitas',
        description: 'Sautéed bell peppers, onions, and sliced protein seasoned with Mexican spices, served with warm tortillas.',
        cookingTime: 25,
        baseCostPerPerson: 140,
        ingredients: [
          { name: 'Chicken (or Paneer)', quantity: '150g', estimatedPrice: 70 },
          { name: 'Bell Peppers', quantity: '1', estimatedPrice: 20 },
          { name: 'Onions', quantity: '1', estimatedPrice: 10 },
          { name: 'Tortillas', quantity: '3 small', estimatedPrice: 25 },
          { name: 'Spices', quantity: '1 tbsp', estimatedPrice: 15 }
        ],
        tasks: ['Slice protein, peppers, and onions into strips', 'Sauté protein with fajita seasoning', 'Add peppers and onions, cook until crisp-tender', 'Warm tortillas and serve with lime']
      }
    ]
  }
};

// Generic fallback recipe if selection doesn't match
const DEFAULT_RECIPES = {
  breakfast: {
    name: 'Vegetable Avocado Toast',
    description: 'Crisp whole wheat toast topped with mashed avocado, tomatoes, sliced cucumber, and sesame seeds.',
    cookingTime: 10,
    baseCostPerPerson: 60,
    ingredients: [
      { name: 'Bread', quantity: '2 slices', estimatedPrice: 15 },
      { name: 'Avocado', quantity: '0.5', estimatedPrice: 30 },
      { name: 'Tomatoes', quantity: '0.5', estimatedPrice: 5 },
      { name: 'Cucumber', quantity: '30g', estimatedPrice: 5 },
      { name: 'Seeds (Sesame/Chia)', quantity: '1 tsp', estimatedPrice: 5 }
    ],
    tasks: ['Toast bread slices', 'Mash avocado and spread', 'Layer sliced cucumber and tomatoes', 'Sprinkle with seeds']
  },
  lunch: {
    name: 'Garden Salad Bowl with Chickpeas',
    description: 'A fresh, crisp bowl of salad greens, tomatoes, cucumbers, and seasoned roasted chickpeas with lemon-tahini dressing.',
    cookingTime: 15,
    baseCostPerPerson: 80,
    ingredients: [
      { name: 'Chickpeas', quantity: '100g', estimatedPrice: 20 },
      { name: 'Salad Greens', quantity: '50g', estimatedPrice: 25 },
      { name: 'Tomatoes & Cucumbers', quantity: '1 each', estimatedPrice: 15 },
      { name: 'Olive Oil & Lemon', quantity: '1 tbsp each', estimatedPrice: 20 }
    ],
    tasks: ['Rinse and dry chickpeas', 'Toss chickpeas with salt and olive oil, toast in a pan', 'Chop vegetables', 'Mix salad components and drizzle dressing']
  },
  dinner: {
    name: 'Vegetable Fried Rice / Stir-Fry',
    description: 'Stir-fried jasmine rice loaded with carrots, peas, spring onions, and tofu, seasoned with soy sauce.',
    cookingTime: 20,
    baseCostPerPerson: 90,
    ingredients: [
      { name: 'Rice', quantity: '120g', estimatedPrice: 15 },
      { name: 'Tofu (or Egg)', quantity: '100g', estimatedPrice: 35 },
      { name: 'Mixed Vegetables (Carrot, Peas)', quantity: '80g', estimatedPrice: 20 },
      { name: 'Soy Sauce & Garlic', quantity: '2 tbsp', estimatedPrice: 20 }
    ],
    tasks: ['Cook rice and let cool', 'Sauté tofu until golden', 'Add chopped vegetables and garlic, stir fry for 5 mins', 'Add rice, soy sauce, and stir fry on high heat']
  },
  snacks: {
    name: 'Mixed Fruit & Nut Bowl',
    description: 'A handful of almonds and walnuts paired with sliced apples and banana slices.',
    cookingTime: 5,
    baseCostPerPerson: 40,
    ingredients: [
      { name: 'Apple', quantity: '1', estimatedPrice: 25 },
      { name: 'Banana', quantity: '1', estimatedPrice: 10 },
      { name: 'Almonds & Walnuts', quantity: '30g', estimatedPrice: 35 }
    ],
    tasks: ['Slice apple and banana', 'Combine in a bowl with nuts']
  }
};

/**
 * Generates suggested substitutions for missing ingredients
 */
export function getMockSubstitutions(missing: string[]): Substitution[] {
  const commonSubs: Record<string, { substitutes: string[]; reason: string }> = {
    milk: { substitutes: ['Oat milk', 'Almond milk', 'Soy milk'], reason: 'Plant-based alternatives to make it dairy-free or vegan.' },
    paneer: { substitutes: ['Tofu', 'Tempeh', 'Extra-firm Ricotta'], reason: 'Tofu is a great high-protein vegan replacement for paneer.' },
    eggs: { substitutes: ['Silken tofu', 'Flaxseed meal (1 tbsp + 3 tbsp water)', 'Applesauce'], reason: 'Tofu mimics scramble texture, while flaxseed binds baking items.' },
    butter: { substitutes: ['Olive oil', 'Coconut oil', 'Margarine'], reason: 'Olive oil is a healthier, heart-safe plant fats alternative.' },
    cheese: { substitutes: ['Nutritional yeast', 'Vegan cheese', 'Cashew cheese'], reason: 'Dairy-free alternatives with similar savory, cheesy flavors.' },
    chicken: { substitutes: ['Tofu', 'Seitan', 'Jackfruit', 'Chickpeas'], reason: 'High-protein plant substitutes that absorb marinades beautifully.' },
    cream: { substitutes: ['Coconut cream', 'Cashew cream', 'Pureed silken tofu'], reason: 'Plant-based thickeners for rich, creamy textures.' },
    pasta: { substitutes: ['Zucchini noodles (Zoodles)', 'Gluten-free pasta', 'Spaghetti squash'], reason: 'Lower carb or gluten-free alternatives.' },
    bread: { substitutes: ['Gluten-free bread', 'Lettuce wraps', 'Tortillas'], reason: 'Gluten-free or lighter shell alternatives.' },
    rice: { substitutes: ['Cauliflower rice', 'Quinoa', 'Brown rice'], reason: 'Higher fiber or lower carb grain alternatives.' },
  };

  const subs: Substitution[] = [];
  
  for (const m of missing) {
    const key = m.toLowerCase();
    let found = false;
    for (const [subKey, val] of Object.entries(commonSubs)) {
      if (key.includes(subKey) || subKey.includes(key)) {
        subs.push({
          ingredient: m,
          substitutes: val.substitutes,
          reason: val.reason,
        });
        found = true;
        break;
      }
    }
    if (!found) {
      // General fallback substitution
      subs.push({
        ingredient: m,
        substitutes: [`Organic ${m}`, 'Alternative brand swap'],
        reason: 'General alternative swap. Check local grocer for similar varieties.',
      });
    }
  }

  return subs;
}

/**
 * Generates the mock cooking plan
 */
export function generateMockPlan(preferences: PreferencesInput): CookingPlanResult {
  const cuisine = preferences.cuisines.length > 0 ? preferences.cuisines[0].toLowerCase() : 'indian';
  const selectCuisine = MOCK_RECIPES[cuisine] ? cuisine : 'indian';
  const recipes = MOCK_RECIPES[selectCuisine];

  const resultMeals: Record<string, MealPlan> = {};
  const isVegan = preferences.dietaryPreferences.includes('vegan');
  const isVegetarian = preferences.dietaryPreferences.includes('vegetarian') || isVegan;
  const isDairyFree = preferences.dietaryPreferences.includes('dairy-free') || isVegan;
  const isGlutenFree = preferences.dietaryPreferences.includes('gluten-free');

  const mealTypes = preferences.mealsRequired;

  for (const mealType of mealTypes) {
    let baseRecipe = recipes[mealType] ? recipes[mealType][0] : DEFAULT_RECIPES[mealType as keyof typeof DEFAULT_RECIPES];
    
    // Customize recipe name and details for allergies and dietaries
    let recipeName = baseRecipe.name;
    let recipeDesc = baseRecipe.description;
    let recipeIngredients = JSON.parse(JSON.stringify(baseRecipe.ingredients)); // deep clone
    let recipeTasks = [...baseRecipe.tasks];

    // Modify recipe ingredients based on dietary restrictions
    recipeIngredients = recipeIngredients.map((ing: any) => {
      let name = ing.name;
      let price = ing.estimatedPrice;
      let quantity = ing.quantity;

      // Apply vegan/vegetarian overrides
      if (isVegan || isVegetarian) {
        if (name.toLowerCase() === 'chicken') {
          name = 'Tofu';
          price = Math.max(10, Math.floor(price * 0.7)); // tofu is typically cheaper
        }
        if (isVegan) {
          if (name.toLowerCase() === 'eggs') {
            name = 'Tofu Scramble';
          }
          if (name.toLowerCase().includes('cheese') || name.toLowerCase().includes('mozzarella') || name.toLowerCase().includes('parmesan')) {
            name = `Vegan ${name}`;
          }
          if (name.toLowerCase() === 'milk') {
            name = 'Almond Milk';
          }
          if (name.toLowerCase() === 'butter' || name.toLowerCase() === 'ghee') {
            name = 'Olive Oil';
          }
          if (name.toLowerCase() === 'cream') {
            name = 'Coconut Cream';
          }
        }
      }

      if (isDairyFree) {
        if (name.toLowerCase() === 'milk') {
          name = 'Oat Milk';
        }
        if (name.toLowerCase() === 'butter' || name.toLowerCase() === 'ghee') {
          name = 'Olive Oil';
        }
        if (name.toLowerCase() === 'cream') {
          name = 'Coconut Cream';
        }
        if (name.toLowerCase().includes('cheese') || name.toLowerCase().includes('mozzarella')) {
          name = 'Dairy-free Cheese';
        }
      }

      if (isGlutenFree) {
        if (name.toLowerCase() === 'bread') {
          name = 'Gluten-free Bread';
        }
        if (name.toLowerCase() === 'pasta') {
          name = 'Gluten-free Pasta';
        }
        if (name.toLowerCase() === 'wheat flour (atta)') {
          name = 'Gluten-free Flour Mix';
        }
      }

      // Check allergies
      for (const allergy of preferences.allergies) {
        if (name.toLowerCase().includes(allergy.toLowerCase())) {
          // Swap out the allergen
          if (allergy.toLowerCase() === 'nuts' || allergy.toLowerCase() === 'peanuts' || allergy.toLowerCase() === 'almonds') {
            name = 'Sunflower Seeds';
            price = Math.max(5, Math.floor(price * 0.6));
          } else if (allergy.toLowerCase() === 'dairy' || allergy.toLowerCase() === 'milk') {
            name = 'Coconut Milk';
          } else if (allergy.toLowerCase() === 'soy') {
            name = 'Chickpea flour / Chickpeas (soy replacement)';
          } else if (allergy.toLowerCase() === 'eggs') {
            name = 'Mashed Avocado';
          } else {
            name = `${name} (Allergen-free substitute)`;
          }
        }
      }

      // Adjust cost for people count
      const adjustedPrice = Math.round(price * preferences.peopleCount);
      return {
        name,
        quantity,
        estimatedPrice: adjustedPrice
      };
    });

    // Recalculate cost of this meal
    const mealCost = recipeIngredients.reduce((sum: number, ing: any) => sum + ing.estimatedPrice, 0);

    resultMeals[mealType] = {
      name: recipeName,
      description: recipeDesc,
      cookingTime: baseRecipe.cookingTime,
      cost: mealCost,
      ingredients: recipeIngredients,
      tasks: recipeTasks
    };
  }

  // Generate budget suggestions if needed
  const totalCost = Object.values(resultMeals).reduce((sum, m) => sum + m.cost, 0);
  const budgetSuggestions: string[] = [];
  if (totalCost > preferences.dailyBudget) {
    budgetSuggestions.push('Substitute Paneer/Chicken with seasonal vegetables or lentils to save costs.');
    budgetSuggestions.push('Use generic brands instead of premium organic options for staples like grains and milk.');
    budgetSuggestions.push('Adjust quantities: reduce serving sizes slightly to fit within the daily budget constraint.');
  }

  // Suggested substitutions are generated dynamically based on what's missing later,
  // but we initialize a default selection
  return {
    meals: resultMeals,
    suggestedSubstitutions: [], // will be filled during grocery matching
    budgetSuggestions: budgetSuggestions.length > 0 ? budgetSuggestions : [
      'Your meal selections are cost-optimized. Try batch-cooking grains to save time and energy.',
      'Purchase staple ingredients in bulk to lower the average price per meal.'
    ]
  };
}
