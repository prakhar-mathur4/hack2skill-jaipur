import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CookingChecklist from '../../components/CookingChecklist';
import { CookingChecklistItem } from '../../types';

describe('CookingChecklist Component', () => {
  const mockItems: CookingChecklistItem[] = [
    { id: 'b-0', category: 'Breakfast', task: 'Chop onions', completed: false },
    { id: 'b-1', category: 'Breakfast', task: 'Whisk eggs', completed: true },
    { id: 'l-0', category: 'Lunch', task: 'Wash rice', completed: false },
  ];

  it('renders progress bar and grouped category items', () => {
    render(<CookingChecklist items={mockItems} onToggleTask={vi.fn()} />);

    // Renders the categories
    expect(screen.getByText('Breakfast')).toBeInTheDocument();
    expect(screen.getByText('Lunch')).toBeInTheDocument();

    // Renders the items
    expect(screen.getByText('Chop onions')).toBeInTheDocument();
    expect(screen.getByText('Whisk eggs')).toBeInTheDocument();
    expect(screen.getByText('Wash rice')).toBeInTheDocument();

    // Computes progress: 1 / 3 = 33%
    expect(screen.getByText('33% Done')).toBeInTheDocument();
  });

  it('triggers onToggleTask callback when a task button is clicked', () => {
    const handleToggle = vi.fn();
    render(<CookingChecklist items={mockItems} onToggleTask={handleToggle} />);

    const chopButton = screen.getByRole('button', { name: /Chop onions/i });
    fireEvent.click(chopButton);

    expect(handleToggle).toHaveBeenCalledTimes(1);
    expect(handleToggle).toHaveBeenCalledWith('b-0');
  });

  it('displays completion message when all tasks are complete', () => {
    const allCompleted = mockItems.map(item => ({ ...item, completed: true }));
    render(<CookingChecklist items={allCompleted} onToggleTask={vi.fn()} />);

    expect(screen.getByText('100% Done')).toBeInTheDocument();
    expect(screen.getByText(/Congratulations! All steps are complete/i)).toBeInTheDocument();
  });

  it('renders team filter and triggers onAssignTask when dropdown changes', () => {
    const handleAssign = vi.fn();
    const team = ['Self', 'Helper', 'Prakhar'];
    
    render(
      <CookingChecklist 
        items={mockItems} 
        onToggleTask={vi.fn()} 
        teamMembers={team} 
        onAssignTask={handleAssign} 
      />
    );

    // Verify filter buttons exist
    expect(screen.getByRole('button', { name: 'All Crew' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Self' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Helper' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Prakhar' })).toBeInTheDocument();

    // Verify select dropdown exists
    const selectElements = screen.getAllByRole('combobox');
    expect(selectElements.length).toBe(3); // one select per task item
    
    // Change assignment
    fireEvent.change(selectElements[0], { target: { value: 'Prakhar' } });
    expect(handleAssign).toHaveBeenCalledWith('b-0', 'Prakhar');
  });

  it('filters task list by assignee', () => {
    const itemsWithAssignees: CookingChecklistItem[] = [
      { id: 'b-0', category: 'Breakfast', task: 'Chop onions', completed: false, assignee: 'Self' },
      { id: 'b-1', category: 'Breakfast', task: 'Whisk eggs', completed: true, assignee: 'Helper' },
      { id: 'l-0', category: 'Lunch', task: 'Wash rice', completed: false, assignee: 'Self' },
    ];

    render(
      <CookingChecklist 
        items={itemsWithAssignees} 
        onToggleTask={vi.fn()} 
        teamMembers={['Self', 'Helper']} 
        onAssignTask={vi.fn()} 
      />
    );

    // Initial render shows all tasks
    expect(screen.getByText('Chop onions')).toBeInTheDocument();
    expect(screen.getByText('Whisk eggs')).toBeInTheDocument();
    expect(screen.getByText('Wash rice')).toBeInTheDocument();

    // Click on 'Helper' filter
    const helperFilterButton = screen.getByRole('button', { name: 'Helper' });
    fireEvent.click(helperFilterButton);

    // Now it should only display 'Whisk eggs' (assigned to Helper)
    expect(screen.queryByText('Chop onions')).not.toBeInTheDocument();
    expect(screen.getByText('Whisk eggs')).toBeInTheDocument();
    expect(screen.queryByText('Wash rice')).not.toBeInTheDocument();
  });
});
