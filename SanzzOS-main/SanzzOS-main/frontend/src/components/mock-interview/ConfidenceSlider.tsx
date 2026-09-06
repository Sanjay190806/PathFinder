import React from 'react';

interface ConfidenceSliderProps {
  value: number;
  onChange: (val: number) => void;
}

const RATINGS = [
  { value: 1, label: 'Unprepared', color: '#EF4444' },
  { value: 2, label: 'Struggling', color: '#F97316' },
  { value: 3, label: 'Moderate', color: '#3B82F6' },
  { value: 4, label: 'Confident', color: '#10B981' },
  { value: 5, label: 'Mastered', color: '#10B981' },
];

export const ConfidenceSlider: React.FC<ConfidenceSliderProps> = ({ value, onChange }) => {
  const currentRating = RATINGS.find((r) => r.value === value) || RATINGS[2];

  return (
    <div className="flex flex-col gap-2.5 text-xs select-none">
      <div className="flex justify-between items-center">
        <span className="text-textSecondary">Rate Answer Confidence:</span>
        <span
          className="px-2 py-0.5 rounded font-black text-[9px] uppercase tracking-wider"
          style={{ backgroundColor: `${currentRating.color}15`, color: currentRating.color }}
        >
          {currentRating.label}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        {RATINGS.map((r) => (
          <button
            key={r.value}
            type="button"
            onClick={() => onChange(r.value)}
            className={`flex-1 h-8 rounded-lg border text-xs font-semibold transition ${
              value === r.value
                ? 'border-accentBlue bg-accentBlue/25 text-textPrimary'
                : 'border-white/5 hover:border-white/10 text-textMuted'
            }`}
          >
            {r.value}
          </button>
        ))}
      </div>
    </div>
  );
};
export default ConfidenceSlider;
