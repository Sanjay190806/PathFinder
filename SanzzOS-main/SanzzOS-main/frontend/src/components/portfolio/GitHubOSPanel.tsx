import React, { useState } from 'react';
import { usePortfolioOS } from '../../hooks/usePortfolioOS';
import { Button } from '../ui/Button';
import { ShieldCheck, Trash2 } from 'lucide-react';

export const GitHubOSPanel: React.FC = () => {
  const { githubRepos, addGithubRepo, updateGithubRepo, deleteGithubRepo } = usePortfolioOS();
  const [newRepoName, setNewRepoName] = useState('');
  const [activeRepoId, setActiveRepoId] = useState(githubRepos[0]?.id || '');

  const activeRepo = githubRepos.find((r) => r.id === activeRepoId) || githubRepos[0] || null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRepoName.trim()) return;
    addGithubRepo(newRepoName);
    setNewRepoName('');
  };

  const handleCheckboxToggle = (field: keyof Omit<typeof activeRepo, 'id' | 'repoName' | 'completedTasks'>) => {
    if (!activeRepo) return;
    updateGithubRepo(activeRepo.id, {
      [field]: !activeRepo[field],
    });
  };

  const PROFILE_CHECKLIST = [
    { label: 'Set consistent professional username across platforms' },
    { label: 'Clean profile bio detailing SWE / AI focus keywords' },
    { label: 'Pinned repositories showcasing best case studies (CareSync, SmartEdu)' },
    { label: 'Link recruiter public portfolio URL directly in website field' },
    { label: 'Expose LinkedIn credentials contact link inside summary context' },
  ];

  const REPO_CHECKS = [
    { key: 'cleanReadme', label: 'Clean README profile detailing objective' },
    { key: 'stackListed', label: 'Tech Stack (React, Zustand, Node) explicitly declared' },
    { key: 'setupInstructions', label: 'Detailed local clone setup instructions included' },
    { key: 'screenshots', label: 'UI screenshots or video link showcase' },
    { key: 'demoLink', label: 'Hosting deploy link visible' },
    { key: 'envExample', label: 'Environment variables example template included' },
    { key: 'gitignoreCheck', label: '.gitignore active (no actual database secrets or values)' },
    { key: 'secretSafetyCheck', label: 'Verifiable secret check (run local git leak scanner)' },
  ] as const;

  return (
    <div className="flex flex-col gap-5 text-xs select-none">
      {/* Profile Checklist section */}
      <div className="flex flex-col gap-3 bg-black/45 border border-white/5 p-5 rounded-2xl">
        <span className="text-[9px] text-textMuted font-black uppercase tracking-widest border-b border-white/5 pb-2">
          Global GitHub Profile Checklist
        </span>
        <div className="flex flex-col gap-2">
          {PROFILE_CHECKLIST.map((chk, idx) => (
            <div key={idx} className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.01]">
              <ShieldCheck className="h-4.5 w-4.5 text-accentBlue" />
              <span className="font-semibold text-textSecondary">{chk.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Repo Checklist section */}
      <div className="flex flex-col gap-4 bg-black/45 border border-white/5 p-5 rounded-2xl">
        <div className="flex justify-between items-center border-b border-white/5 pb-2">
          <span className="text-[9px] text-textMuted font-black uppercase tracking-widest">
            Repository-Specific Readiness OS
          </span>
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              required
              value={newRepoName}
              onChange={(e) => setNewRepoName(e.target.value)}
              placeholder="e.g. CareSync-AI-Server"
              className="h-8 px-2 rounded-lg border border-white/5 bg-black/35 text-textPrimary focus:outline-none"
            />
            <Button size="sm" type="submit">Add Repo</Button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Repo selector list */}
          <div className="md:col-span-1 flex flex-col gap-1.5 max-h-[220px] overflow-y-auto scrollbar-thin">
            {githubRepos.map((repo) => (
              <button
                key={repo.id}
                onClick={() => setActiveRepoId(repo.id)}
                className={`p-2.5 rounded-xl border text-left font-bold transition flex items-center justify-between ${
                  activeRepoId === repo.id || (!activeRepoId && githubRepos[0]?.id === repo.id)
                    ? 'border-accentBlue bg-accentBlue/5 text-textPrimary'
                    : 'border-white/5 bg-black/25 text-textSecondary hover:border-white/10'
                }`}
              >
                <span className="truncate max-w-[90px]">{repo.repoName}</span>
                <Trash2
                  className="h-3.5 w-3.5 hover:text-red-400 text-textMuted shrink-0 ml-1.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Delete this repo checklist?')) deleteGithubRepo(repo.id);
                  }}
                />
              </button>
            ))}
          </div>

          {/* Repo check items */}
          <div className="md:col-span-3">
            {activeRepo ? (
              <div className="flex flex-col gap-2.5">
                <h4 className="text-xs font-black text-textPrimary uppercase tracking-wider pl-1 mb-1">
                  {activeRepo.repoName} Checklist
                </h4>

                <div className="grid grid-cols-1 gap-2">
                  {REPO_CHECKS.map((chk) => {
                    const isChecked = !!activeRepo[chk.key];
                    return (
                      <label
                        key={chk.key}
                        className={`flex items-center gap-3 p-2.5 rounded-xl border transition cursor-pointer select-none ${
                          isChecked
                            ? 'border-accentEmerald/20 bg-accentEmerald/5 text-textMuted'
                            : 'border-white/5 bg-black/25 hover:border-white/10 text-textPrimary font-semibold'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleCheckboxToggle(chk.key)}
                          className="rounded bg-black/45 border-white/5 text-accentBlue focus:ring-0 cursor-pointer"
                        />
                        <span className={`text-[10px] ${isChecked ? 'line-through opacity-55' : ''}`}>
                          {chk.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-xs text-textMuted text-center py-10">Add or select a repository to edit checklist.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default GitHubOSPanel;
