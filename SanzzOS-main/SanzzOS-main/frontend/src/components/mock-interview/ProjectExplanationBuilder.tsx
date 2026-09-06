import React from 'react';

interface ProjectExplanationBuilderProps {
  problem: string;
  users: string;
  solution: string;
  techStack: string;
  aiDataPart: string;
  myContribution: string;
  impact: string;
  whatILearned: string;
  nextImprovement: string;
  onChange: (fields: {
    problem: string;
    users: string;
    solution: string;
    techStack: string;
    aiDataPart: string;
    myContribution: string;
    impact: string;
    whatILearned: string;
    nextImprovement: string;
  }) => void;
}

export const ProjectExplanationBuilder: React.FC<ProjectExplanationBuilderProps> = ({
  problem,
  users,
  solution,
  techStack,
  aiDataPart,
  myContribution,
  impact,
  whatILearned,
  nextImprovement,
  onChange,
}) => {
  const handleChange = (key: string, value: string) => {
    onChange({
      problem,
      users,
      solution,
      techStack,
      aiDataPart,
      myContribution,
      impact,
      whatILearned,
      nextImprovement,
      [key]: value,
    });
  };

  return (
    <div className="flex flex-col gap-3 border border-white/5 bg-black/45 p-4 rounded-2xl text-xs max-h-[500px] overflow-y-auto scrollbar-thin">
      <div className="border-b border-white/5 pb-1 mb-1">
        <span className="text-[10px] font-black text-accentPurple uppercase tracking-widest">Project Structuring Builder</span>
      </div>

      <div className="grid gap-3">
        <div>
          <label className="block text-[9px] font-bold text-textMuted uppercase mb-1">Problem Statement</label>
          <textarea
            value={problem}
            onChange={(e) => handleChange('problem', e.target.value)}
            placeholder="What bottleneck does this solve?"
            className="w-full min-h-[45px] px-3 py-2 rounded-xl border border-white/5 bg-black/35 text-textPrimary focus:outline-none focus:border-accentBlue resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[9px] font-bold text-textMuted uppercase mb-1">Target Users</label>
            <input
              type="text"
              value={users}
              onChange={(e) => handleChange('users', e.target.value)}
              placeholder="e.g. Recruiters, Patients"
              className="w-full h-8 px-2 rounded-xl border border-white/5 bg-black/35 text-textPrimary focus:outline-none focus:border-accentBlue"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-textMuted uppercase mb-1">Tech Stack</label>
            <input
              type="text"
              value={techStack}
              onChange={(e) => handleChange('techStack', e.target.value)}
              placeholder="React, Node.js, Zustand"
              className="w-full h-8 px-2 rounded-xl border border-white/5 bg-black/35 text-textPrimary focus:outline-none focus:border-accentBlue"
            />
          </div>
        </div>

        <div>
          <label className="block text-[9px] font-bold text-textMuted uppercase mb-1">AI / Algorithms / Data Core</label>
          <textarea
            value={aiDataPart}
            onChange={(e) => handleChange('aiDataPart', e.target.value)}
            placeholder="Conceptual details (e.g. Isolation Forest anomaly scores, local regex parsing)"
            className="w-full min-h-[45px] px-3 py-2 rounded-xl border border-white/5 bg-black/35 text-textPrimary focus:outline-none focus:border-accentBlue resize-none"
          />
        </div>

        <div>
          <label className="block text-[9px] font-bold text-textMuted uppercase mb-1">My Specific Contribution</label>
          <textarea
            value={myContribution}
            onChange={(e) => handleChange('myContribution', e.target.value)}
            placeholder="Code modules written, sync rules established..."
            className="w-full min-h-[45px] px-3 py-2 rounded-xl border border-white/5 bg-black/35 text-textPrimary focus:outline-none focus:border-accentBlue resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[9px] font-bold text-textMuted uppercase mb-1">Impact / Metric Gains</label>
            <input
              type="text"
              value={impact}
              onChange={(e) => handleChange('impact', e.target.value)}
              placeholder="e.g. 30% speedups"
              className="w-full h-8 px-2 rounded-xl border border-white/5 bg-black/35 text-textPrimary focus:outline-none focus:border-accentBlue"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-textMuted uppercase mb-1">Key Learning Lesson</label>
            <input
              type="text"
              value={whatILearned}
              onChange={(e) => handleChange('whatILearned', e.target.value)}
              placeholder="e.g. Local state persistence"
              className="w-full h-8 px-2 rounded-xl border border-white/5 bg-black/35 text-textPrimary focus:outline-none focus:border-accentBlue"
            />
          </div>
        </div>

        <div>
          <label className="block text-[9px] font-bold text-textMuted uppercase mb-1">Next Improvement planned</label>
          <input
            type="text"
            value={nextImprovement}
            onChange={(e) => handleChange('nextImprovement', e.target.value)}
            placeholder="e.g. Implement full SQL backend replication"
            className="w-full h-8 px-2 rounded-xl border border-white/5 bg-black/35 text-textPrimary focus:outline-none focus:border-accentBlue"
          />
        </div>
      </div>
    </div>
  );
};
export default ProjectExplanationBuilder;
