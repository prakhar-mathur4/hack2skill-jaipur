import { GroceryList, GroceryItem, Ingredient } from '../types';

/**
 * Normalizes an ingredient name for comparison.
 * Trims, lowercases, and performs basic singularization.
 */
export function normalizeIngredient(name: string): string {
  let normalized = name.trim().toLowerCase();
  
  // Basic singularization rules
  if (normalized.endsWith('ies')) {
    normalized = normalized.slice(0, -3) + 'y'; // e.g. berries -> berry
  } else if (normalized.endsWith('oes')) {
    normalized = normalized.slice(0, -2); // e.g. tomatoes -> tomato
  } else if (normalized.endsWith('s') && !normalized.endsWith('ss') && !normalized.endsWith('us') && !normalized.endsWith('is')) {
    normalized = normalized.slice(0, -1); // e.g. onions -> onion
  }
  
  return normalized;
}

/**
 * Checks if a required ingredient matches any available ingredient.
 */
export function isMatch(required: string, availableList: string[]): boolean {
  const reqNorm = normalizeIngredient(required);
  
  for (const avail of availableList) {
    const availNorm = normalizeIngredient(avail);
    
    // 1. Exact match
    if (reqNorm === availNorm) return true;
    
    // 2. Substring matching (e.g., "red onion" matches "onion" or vice-versa)
    if (reqNorm.includes(availNorm) || availNorm.includes(reqNorm)) {
      // Avoid false positives for very short words (like "oil" matching "soil")
      if (availNorm.length > 2 && reqNorm.length > 2) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Processes required ingredients against available ones to generate a GroceryList.
 */
export function generateGroceryList(
  requiredIngredients: Ingredient[],
  availableIngredients: string[]
): GroceryList {
  const normalizedAvailable = availableIngredients.map(normalizeIngredient);
  
  const alreadyAvailableSet = new Set<string>();
  const needToBuyMap = new Map<string, GroceryItem>();
  let totalCost = 0;
  
  for (const ing of requiredIngredients) {
    const normName = normalizeIngredient(ing.name);
    
    // Check if it's already available
    if (isMatch(normName, normalizedAvailable)) {
      // Find the name we want to display for available
      alreadyAvailableSet.add(ing.name.toLowerCase());
    } else {
      // If it's missing, add it to needToBuy. De-duplicate by normalized name.
      const existing = needToBuyMap.get(normName);
      if (existing) {
        // If it exists, combine estimated price
        existing.estimatedPrice = parseFloat((existing.estimatedPrice + ing.estimatedPrice).toFixed(2));
        
        // Merge quantities if they are different
        if (existing.quantity !== ing.quantity) {
          existing.quantity = `${existing.quantity}, ${ing.quantity}`;
        }
      } else {
        needToBuyMap.set(normName, {
          name: ing.name,
          quantity: ing.quantity,
          estimatedPrice: ing.estimatedPrice,
        });
      }
    }
  }
  
  const needToBuy = Array.from(needToBuyMap.values());
  totalCost = needToBuy.reduce((sum, item) => sum + item.estimatedPrice, 0);
  
  return {
    alreadyAvailable: Array.from(alreadyAvailableSet).map(name => 
      name.charAt(0).toUpperCase() + name.slice(1)
    ),
    needToBuy,
    totalCost: parseFloat(totalCost.toFixed(2)),
  };
}
