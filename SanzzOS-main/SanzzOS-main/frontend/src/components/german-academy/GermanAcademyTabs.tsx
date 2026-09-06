import React from 'react';

export type GermanAcademyTab =
  | 'academy'
  | 'lessons'
  | 'vocabulary'
  | 'speaking'
  | 'listening'
  | 'stories'
  | 'conversation'
  | 'review'
  | 'progress';

const tabs: { id: GermanAcademyTab; label: string }[] = [
  { id: 'academy', label: 'Academy' },
  { id: 'lessons', label: 'Lessons' },
  { id: 'vocabulary', label: 'Vocabulary' },
  { id: 'speaking', label: 'Speaking' },
  { id: 'listening', label: 'Listening' },
  { id: 'stories', label: 'Stories' },
  { id: 'conversation', label: 'Conversation' },
  { id: 'review', label: 'Review' },
  { id: 'progress', label: 'Progress' },
];

export const GermanAcademyTabs: React.FC<{
  activeTab: GermanAcademyTab;
  onTabChange: (tab: GermanAcademyTab) => void;
}> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex gap-2 overflow-x-auto border-b border-border-subtle pb-3">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === tab.id
              ? 'border border-accentBlue/25 bg-accentBlue/10 text-accentBlue'
              : 'text-textSecondary hover:text-textPrimary'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

