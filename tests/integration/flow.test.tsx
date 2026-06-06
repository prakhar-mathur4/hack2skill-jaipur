import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Home from '../../app/page';

// Mock window.confirm and window.print
beforeEach(() => {
  vi.spyOn(window, 'confirm').mockImplementation(() => true);
  vi.spyOn(window, 'print').mockImplementation(() => {});
  localStorage.clear();
});

describe('End-to-End Home Page Flow', () => {
  it('navigates through initial form entry to full dashboard display', async () => {
    // 1. Mock the API fetch response
    const mockApiResponse = {
      preferences: {
        peopleCount: 2,
        cookingSkill: 'intermediate',
        dietaryPreferences: ['vegetarian'],
        mealsRequired: ['breakfast', 'lunch'],
        cuisines: ['Indian'],
        dailyBudget: 500,
        currency: 'INR',
        availableIngredients: ['rice', 'onions'],
        maxCookingTime: 30,
        allergies: []
      },
      meals: {
        breakfast: {
          name: 'Idli Sambar',
          description: 'Steamed rice cakes served with lentil soup.',
          cookingTime: 20,
          cost: 100,
          ingredients: [
            { name: 'Rice', quantity: '100g', estimatedPrice: 20 },
            { name: 'Lentils', quantity: '50g', estimatedPrice: 30 },
            { name: 'Onions', quantity: '1', estimatedPrice: 10 }
          ],
          tasks: ['Steam idlis', 'Boil lentils', 'Tempering']
        },
        lunch: {
          name: 'Dal Rice',
          description: 'Spiced lentils served over rice.',
          cookingTime: 15,
          cost: 120,
          ingredients: [
            { name: 'Rice', quantity: '150g', estimatedPrice: 30 },
            { name: 'Lentils', quantity: '60g', estimatedPrice: 40 }
          ],
          tasks: ['Wash rice', 'Cook dal']
        }
      },
      groceryList: {
        alreadyAvailable: ['Rice', 'Onions'],
        needToBuy: [
          { name: 'Lentils', quantity: '50g, 60g', estimatedPrice: 70 }
        ],
        totalCost: 70
      },
      substitutions: [
        { ingredient: 'Lentils', substitutes: ['Chickpeas', 'Beans'], reason: 'High protein alternatives' }
      ],
      budgetAnalysis: {
        dailyBudget: 500,
        totalEstimatedCost: 220,
        status: 'within_budget',
        difference: 280,
        optimizationSuggestions: ['✅ Your daily plan fits perfectly within your budget. No optimizations needed!']
      },
      cookingChecklist: [
        { id: 'breakfast-0', category: 'Breakfast', task: 'Steam idlis', completed: false },
        { id: 'breakfast-1', category: 'Breakfast', task: 'Boil lentils', completed: false },
        { id: 'lunch-0', category: 'Lunch', task: 'Wash rice', completed: false }
      ],
      isMock: true
    };

    const fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockApiResponse),
      } as Response)
    );
    vi.stubGlobal('fetch', fetchMock);

    // 2. Render the home page (starts with form view since localStorage is empty)
    render(<Home />);

    expect(screen.getByText('ChefFlow')).toBeInTheDocument();
    expect(screen.getByText('How ChefFlow works')).toBeInTheDocument();

    // 3. Submit preferences
    const submitBtn = screen.getByRole('button', { name: /Generate My Cooking Plan/i });
    fireEvent.click(submitBtn);

    // Verify loading state appears
    expect(screen.getByText(/Analyzing ingredients & planning meals.../i)).toBeInTheDocument();

    // 4. Wait for dashboard widgets to populate
    await waitFor(() => {
      expect(screen.getByText('Meal Planning Dashboard')).toBeInTheDocument();
    });

    // Verify Preferences summary display
    expect(screen.getByText(/Active Plan Summary:/i)).toBeInTheDocument();
    expect(screen.getByText(/• For 2 people/i)).toBeInTheDocument();

    // Verify Meal plans render active tab (Breakfast starts)
    expect(screen.getByText('Idli Sambar')).toBeInTheDocument();
    expect(screen.getByText('Steamed rice cakes served with lentil soup.')).toBeInTheDocument();

    // Verify Grocery segregation lists
    expect(screen.getByText('Smart Grocery List')).toBeInTheDocument();
    expect(screen.getAllByText('Lentils').length).toBeGreaterThan(0); // Need to buy
    expect(screen.getAllByText('Rice').length).toBeGreaterThan(0); // Already available

    // Verify Substitutions list
    expect(screen.getByText('Ingredient Substitutions')).toBeInTheDocument();
    expect(screen.getByText('High protein alternatives')).toBeInTheDocument();

    // Verify Budget analysis outputs
    expect(screen.getByText('Budget Feasibility Analysis')).toBeInTheDocument();
    expect(screen.getAllByText(/Within Budget/i).length).toBeGreaterThan(0);

    // Verify Checklist task triggers
    expect(screen.getByText('Interactive Cooking To-Do List')).toBeInTheDocument();
    const taskBtn = screen.getByRole('button', { name: /Steam idlis/i });
    expect(taskBtn).toBeInTheDocument();
    
    // Toggle task
    fireEvent.click(taskBtn);
    
    // Check checklist progress update (1 out of 3 = 33% done)
    expect(screen.getByText('33% Done')).toBeInTheDocument();

    // 5. Test Reset plan
    const resetBtn = screen.getByRole('button', { name: /Reset Plan/i });
    fireEvent.click(resetBtn);

    // Verify we are back to form entry
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Generate My Cooking Plan/i })).toBeInTheDocument();
      expect(screen.queryByText('Meal Planning Dashboard')).not.toBeInTheDocument();
    });
  });
});
