import React, { useState } from 'react';
import { MockSessionType, InterviewQuestionCategory } from '../../types/mockInterview';
import { Button } from '../ui/Button';
import { ShieldCheck } from 'lucide-react';

interface MockSessionSetupProps {
  onStart: (config: {
    sessionType: MockSessionType;
    targetRole: string;
    targetCompany: string;
    durationMins: number;
    selectedCategories: InterviewQuestionCategory[];
  }) => void;
}

const SESSION_TYPES: MockSessionType[] = [
  'HR mock',
  'Technical mock',
  'Project explanation',
  'Resume walkthrough',
  'SQL interview',
  'Java DSA interview',
  'Product analyst interview',
  'Data analyst interview',
  'Full placement mock',
];

const CATEGORIES: InterviewQuestionCategory[] = [
  'HR',
  'Behavioral',
  'Technical',
  'Java DSA',
  'SQL',
  'Project Explanation',
  'Resume',
  'Product Thinking',
  'Analytics',
];

export const MockSessionSetup: React.FC<MockSessionSetupProps> = ({ onStart }) => {
  const [sessionType, setSessionType] = useState<MockSessionType>('Technical mock');
  const [targetRole, setTargetRole] = useState('SWE Intern');
  const [targetCompany, setTargetCompany] = useState('Zoho');
  const [duration, setDuration] = useState(30);
  const [selectedCats, setSelectedCats] = useState<InterviewQuestionCategory[]>(['Technical', 'Java DSA']);

  const handleToggleCategory = (cat: InterviewQuestionCategory) => {
    if (selectedCats.includes(cat)) {
      setSelectedCats(selectedCats.filter((c) => c !== cat));
    } else {
      setSelectedCats([...selectedCats, cat]);
    }
  };

  const handleStart = () => {
    if (selectedCats.length === 0) {
      alert('Please select at least one question category!');
      return;
    }
    onStart({
      sessionType,
      targetRole,
      targetCompany,
      durationMins: duration,
      selectedCategories: selectedCats,
    });
  };

  return (
    <div className="flex flex-col gap-5 text-xs select-none max-w-lg mx-auto bg-black/45 border border-white/5 p-6 rounded-3xl">
      <div className="border-b border-white/5 pb-2">
        <span className="text-[9px] text-textMuted font-black uppercase tracking-widest">Simulator Setup</span>
        <h3 className="text-base font-black text-textPrimary mt-0.5">Setup Mock Practice Session</h3>
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[9px] font-bold text-textMuted uppercase mb-1">Session Type</label>
            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value as any)}
              className="w-full h-9 px-2 rounded-xl border border-white/5 bg-black/45 text-textPrimary focus:outline-none"
            >
              {SESSION_TYPES.map((t) => (
                <option key={t} value={t} className="bg-[#0c0c1e]">{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[9px] font-bold text-textMuted uppercase mb-1">Target Company</label>
            <input
              type="text"
              required
              value={targetCompany}
              onChange={(e) => setTargetCompany(e.target.value)}
              placeholder="e.g. Zoho, Mu Sigma"
              className="w-full h-9 px-3 rounded-xl border border-white/5 bg-black/45 text-textPrimary focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[9px] font-bold text-textMuted uppercase mb-1">Target Role</label>
            <input
              type="text"
              required
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. AI Product Intern"
              className="w-full h-9 px-3 rounded-xl border border-white/5 bg-black/45 text-textPrimary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-textMuted uppercase mb-1">Session Duration (minutes)</label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full h-9 px-2 rounded-xl border border-white/5 bg-black/45 text-textPrimary focus:outline-none"
            >
              <option value={15} className="bg-[#0c0c1e]">15 Minutes</option>
              <option value={30} className="bg-[#0c0c1e]">30 Minutes</option>
              <option value={45} className="bg-[#0c0c1e]">45 Minutes</option>
              <option value={60} className="bg-[#0c0c1e]">60 Minutes</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[9px] font-bold text-textMuted uppercase mb-1.5">Question Categories</label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => {
              const isChecked = selectedCats.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleToggleCategory(cat)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition select-none ${
                    isChecked
                      ? 'border-accentBlue bg-accentBlue/5 text-textPrimary font-bold'
                      : 'border-white/5 bg-black/25 text-textSecondary hover:border-white/10'
                  }`}
                >
                  <span>{cat}</span>
                  {isChecked && <ShieldCheck className="h-4 w-4 text-accentBlue" />}
                </button>
              );
            })}
          </div>
        </div>

        <Button
          onClick={handleStart}
          className="w-full h-11 bg-accentBlue text-white hover:bg-accentBlue/90 rounded-2xl font-black uppercase tracking-widest text-xs mt-3 shadow-glow-blue/15"
        >
          Start Mock Session
        </Button>
      </div>
    </div>
  );
};
export default MockSessionSetup;
