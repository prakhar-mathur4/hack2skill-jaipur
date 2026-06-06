import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PreferencesForm from '../../components/PreferencesForm';

describe('PreferencesForm Component', () => {
  it('renders all preference fields correctly', () => {
    render(<PreferencesForm onSubmit={vi.fn()} isLoading={false} />);
    
    // Check main elements
    expect(screen.getByLabelText(/Number of People/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cooking Skill Level/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Daily Budget limit/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Currency/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Max Cook Time per Meal/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Available Ingredients/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Generate My Cooking Plan/i })).toBeInTheDocument();
  });

  it('triggers form validation when budget is invalid', async () => {
    const handleSubmit = vi.fn();
    render(<PreferencesForm onSubmit={handleSubmit} isLoading={false} />);
    
    const budgetInput = screen.getByLabelText(/Daily Budget limit/i);
    fireEvent.change(budgetInput, { target: { value: '-10' } });
    
    const form = screen.getByLabelText(/Number of People/i).closest('form')!;
    fireEvent.submit(form);

    const errorMsg = await screen.findByText(/Budget must be a positive number/i);
    expect(errorMsg).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('submits correctly with standard form inputs', () => {
    const handleSubmit = vi.fn();
    render(<PreferencesForm onSubmit={handleSubmit} isLoading={false} />);
    
    // Check that we can fill out and submit
    const peopleInput = screen.getByLabelText(/Number of People/i);
    fireEvent.change(peopleInput, { target: { value: '4' } });

    const budgetInput = screen.getByLabelText(/Daily Budget limit/i);
    fireEvent.change(budgetInput, { target: { value: '800' } });

    const submitBtn = screen.getByRole('button', { name: /Generate My Cooking Plan/i });
    fireEvent.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith(expect.objectContaining({
      peopleCount: 4,
      dailyBudget: 800,
      cookingSkill: 'intermediate',
      currency: 'INR'
    }));
  });
});
