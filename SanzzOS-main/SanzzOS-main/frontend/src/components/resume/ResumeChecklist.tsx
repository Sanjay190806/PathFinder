import React from 'react';
import { Card } from '../ui/Card';
import { useCareerStore } from '../../app/store/useCareerStore';

export const ResumeChecklist: React.FC = () => {
  const resume = useCareerStore((s) => s.resume);
  const updateResume = useCareerStore((s) => s.updateResume);

  const sections = resume.sections || { contact: 0, education: 0, skills: 0, projects: 0, achievements: 0, formatting: 0 };

  const checklists = [
    { key: 'contact' as const, label: 'Contact Details', desc: 'Email, GitHub, LinkedIn, Portfolio, Phone' },
    { key: 'education' as const, label: 'Education Profile', desc: 'College GPA, B.E. Degree info, batch years' },
    { key: 'skills' as const, label: 'Core Technical Skills', desc: 'Languages (Java), frameworks (React), tools' },
    { key: 'projects' as const, label: 'Portfolio Projects', desc: '2+ projects showing 3+ bullet descriptors' },
    { key: 'achievements' as const, label: 'Achievements List', desc: 'Certificates, hackathons, awards details' },
    { key: 'formatting' as const, label: 'Formatting Rules', desc: '1-page layout, standard ATS margins & fonts' }
  ];

  const handleToggle = (key: keyof typeof sections) => {
    const currentVal = sections[key];
    const newVal = currentVal === 100 ? 0 : 100;
    
    updateResume({
      sections: {
        ...sections,
        [key]: newVal
      }
    });
  };

  return (
    <Card className="flex flex-col gap-4">
      <div>
        <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider block pl-0.5">Resume Completeness Checklist</span>
      </div>

      <div className="flex flex-col gap-3">
        {checklists.map((item) => {
          const isDone = sections[item.key] === 100;
          return (
            <div
              key={item.key}
              onClick={() => handleToggle(item.key)}
              className={`flex items-start justify-between p-3 rounded-xl border transition cursor-pointer select-none ${
                isDone 
                  ? 'border-accentEmerald/30 bg-accentEmerald/5' 
                  : 'border-border-subtle bg-bgSurface/40 hover:border-border-accent'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={isDone}
                  readOnly
                  className="w-4 h-4 rounded border-border-subtle bg-bgSurface text-accentBlue focus:ring-accentBlue/30 focus:ring-1 mt-0.5"
                />
                <div>
                  <span className={`text-xs font-bold ${isDone ? 'text-textSecondary line-through' : 'text-textPrimary'}`}>
                    {item.label}
                  </span>
                  <p className="text-[10px] text-textMuted mt-0.5">{item.desc}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
