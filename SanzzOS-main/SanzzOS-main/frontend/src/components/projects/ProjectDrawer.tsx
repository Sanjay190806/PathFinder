import React, { useState, useEffect } from 'react';
import { Drawer } from '../ui/Drawer';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Project, ProjectDimensionProgress } from '../../types';
import { useCareerStore } from '../../app/store/useCareerStore';

interface ProjectDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  projectKey: string;
  project: Project;
}

export const ProjectDrawer: React.FC<ProjectDrawerProps> = ({
  isOpen,
  onClose,
  projectKey,
  project
}) => {
  const updateProject = useCareerStore((s) => s.updateProject);

  const [name, setName] = useState(project.name);
  const [desc, setDesc] = useState(project.description);
  const [status, setStatus] = useState<Project['status']>(project.status);
  const [github, setGithub] = useState(project.github);
  const [demo, setDemo] = useState(project.demo);
  const [stackStr, setStackStr] = useState((project.stack || []).join(', '));
  const [bulletsStr, setBulletsStr] = useState((project.bullets || []).join('\n'));
  
  // Progress states
  const [progress, setProgress] = useState<ProjectDimensionProgress>(
    project.progress || { backend: 0, frontend: 0, ai: 0, testing: 0, docs: 0, deploy: 0 }
  );

  useEffect(() => {
    if (isOpen) {
      setName(project.name);
      setDesc(project.description);
      setStatus(project.status);
      setGithub(project.github);
      setDemo(project.demo);
      setStackStr((project.stack || []).join(', '));
      setBulletsStr((project.bullets || []).join('\n'));
      setProgress(project.progress || { backend: 0, frontend: 0, ai: 0, testing: 0, docs: 0, deploy: 0 });
    }
  }, [isOpen, project]);

  const handleSave = () => {
    const stack = stackStr.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const bullets = bulletsStr.split('\n').map(b => b.trim()).filter(b => b.length > 0);

    updateProject(projectKey, {
      name,
      description: desc,
      status,
      github,
      demo,
      stack,
      bullets,
      progress
    });
    
    onClose();
  };

  const handleDimChange = (dim: keyof ProjectDimensionProgress, val: number) => {
    setProgress(prev => ({
      ...prev,
      [dim]: val
    }));
  };

  const statusOptions = [
    { value: 'ideation', label: 'Ideation Focus' },
    { value: 'building', label: 'Building Code' },
    { value: 'testing', label: 'Testing QA' },
    { value: 'deployed', label: 'Deployed Live' },
    { value: 'archived', label: 'Archived File' }
  ];

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={`Edit Project: ${project.name}`}>
      <div className="flex flex-col gap-5 select-none pb-6">
        {/* Fields */}
        <Input label="Project Title" value={name} onChange={(e) => setName(e.target.value)} />
        
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs font-semibold text-textSecondary pl-1">Description</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="bg-bgSurface border border-border-subtle text-textPrimary text-sm rounded-xl px-4 py-2 focus:outline-none focus:border-accentBlue h-16 resize-none"
          />
        </div>

        <Select
          label="Project Status"
          options={statusOptions}
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
        />

        <Input label="Tech Stack (comma-separated)" value={stackStr} onChange={(e) => setStackStr(e.target.value)} />

        <div className="grid grid-cols-2 gap-4">
          <Input label="GitHub URL" value={github} onChange={(e) => setGithub(e.target.value)} />
          <Input label="Live Demo URL" value={demo} onChange={(e) => setDemo(e.target.value)} />
        </div>

        {/* Progress Dimensions sliders */}
        <div className="border-t border-border-subtle/50 pt-4 flex flex-col gap-3">
          <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider pl-0.5">Development Dimensions</span>
          
          {(Object.keys(progress) as Array<keyof ProjectDimensionProgress>).map((dim) => (
            <div key={dim} className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[10px] text-textSecondary capitalize font-semibold pl-0.5">
                <span>{dim} completion</span>
                <span className="font-mono text-textPrimary">{progress[dim]}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={progress[dim]}
                onChange={(e) => handleDimChange(dim, parseInt(e.target.value))}
                className="w-full h-1 bg-border-subtle rounded-lg appearance-none cursor-pointer accent-accentBlue"
              />
            </div>
          ))}
        </div>

        {/* Resume bullet logs */}
        <div className="border-t border-border-subtle/50 pt-4 flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-textSecondary uppercase tracking-wider pl-0.5">ATS Resume Bullet Logs (one per line)</label>
          <textarea
            placeholder="Designed and deployed clinical coordinator model utilizing FastAPI...\nIntegrated XGBoost metrics to analyze failing student profiles..."
            value={bulletsStr}
            onChange={(e) => setBulletsStr(e.target.value)}
            className="w-full bg-bgSurface border border-border-subtle text-textPrimary text-xs rounded-xl px-4 py-3 focus:outline-none focus:border-accentBlue h-28 resize-none"
          />
        </div>

        <div className="flex gap-2 pt-4 border-t border-border-subtle/50">
          <Button onClick={handleSave} className="flex-1 rounded-xl">Save Changes</Button>
          <Button onClick={onClose} variant="ghost" className="px-4 border border-border-subtle rounded-xl">Cancel</Button>
        </div>
      </div>
    </Drawer>
  );
};
