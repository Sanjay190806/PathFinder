import React from 'react';
import { CategoryAnalytics } from '../../types/analytics';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';

export const FocusBalanceCard: React.FC<{ categories: CategoryAnalytics[] }> = ({ categories }) => (
  <Card>
    <h3 className="mb-4 text-lg font-semibold text-textPrimary">Focus balance</h3>
    <div className="space-y-3">
      {categories.map((category) => (
        <div key={category.category}>
          <div className="mb-1 flex justify-between text-xs">
            <span className="capitalize text-textPrimary">{category.category.replace('_', ' ')}</span>
            <span className="text-textSecondary">{category.hours.toFixed(1)}h</span>
          </div>
          <ProgressBar value={category.mastery} />
        </div>
      ))}
    </div>
  </Card>
);
