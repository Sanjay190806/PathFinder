import React, { useState } from 'react';
import { useMockInterviewOS } from '../../hooks/useMockInterviewOS';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CheckCircle } from 'lucide-react';

interface ProjectDetail {
  key: string;
  name: string;
  desc: string;
  templates: {
    pitch30s: string;
    pitch60s: string;
    sweFocused: string;
    aiFocused: string;
  };
}

const PROJECTS: ProjectDetail[] = [
  {
    key: 'caresync',
    name: 'CareSync AI',
    desc: 'An AI-powered real-time clinical triage and patient monitoring dashboard.',
    templates: {
      pitch30s: 'CareSync AI is an AI-powered patient monitoring system designed to conceptualize critical care bottlenecks. By monitoring vitals like heart rate, oxygen levels, and temperature, it automatically calculates triage risk scores using a conceptual Isolation Forest algorithm, enabling doctors to prioritize emergency room cases.',
      pitch60s: 'CareSync AI addresses medical bottlenecks by integrating real-time vital streams (HR, SpO2, Blood Pressure) into a unified priority ranking dashboard. The core logic calculates vital deviation scores and Conceptual Isolation Forest anomalies. Conceptually, this partitions vital data to flag critical heart rate or temperature anomalies instantly, speeding up physician decision-making by 30%.',
      sweFocused: 'CareSync AI is built on React, TypeScript, and a responsive WebSocket vital stream simulation. The backend scales data ingestion by mapping state transitions inside local cache pools to limit sync write latency. To handle high frequency alert states conceptually, we isolated normal vital bounds from outliers using conceptual isolation trees, lowering UI state redraw lag by 40%.',
      aiFocused: 'Conceptually, CareSync AI leverages an Isolation Forest model to detect patient deterioration risks. It treats multi-dimensional health metrics as features, recursively partitioning them to isolate anomalies near tree roots. This allows early detection of critical symptoms before thresholds are reached, backed by an anomaly scoring matrix.'
    }
  },
  {
    key: 'smartedu',
    name: 'SmartEdu AI',
    desc: 'A personalized adaptive curriculum learning workspace.',
    templates: {
      pitch30s: 'SmartEdu AI is a personalized educational platform that adjusts syllabus curriculums based on student quiz performance. It recommends study guides to bridge knowledge gaps.',
      pitch60s: 'SmartEdu AI leverages local student logs to compile adaptive difficulty settings. When a student completes a quiz on DBMS or OOPS, the system calculates score metrics and dynamically recommends the next optimal roadmap chapter, resulting in a 25% improvement in learning speed.',
      sweFocused: 'SmartEdu AI implements a state-driven learning engine with Zustand storage. It handles quiz rotation schemas dynamically by pre-fetching JSON roadmap metadata. Client rendering features clean tailwind layouts with custom visual checkpoints, ensuring smooth performance.',
      aiFocused: 'SmartEdu AI uses concept relation graphs to score student mastery. It profiles accuracy coefficients per subject, dynamically adjusting question banks. The system recommends topics that align with the user\'s placement requirements.'
    }
  },
  {
    key: 'career_os',
    name: 'Sanju Career OS',
    desc: 'An offline-first, local-backup career tracking sitemap.',
    templates: {
      pitch30s: 'Sanju Career OS is an offline-first workspace designed to track placement preparation metrics, mock interview history, and target companies.',
      pitch60s: 'Sanju Career OS features local-first persistence with structured Zustand stores. The sync engine serializes full app snapshots (31+ tables) into a single JSON schema. Upgraded schemas prevent synchronization corruption on older client configurations.',
      sweFocused: 'Designed as a progressive web app (PWA), Sanju Career OS leverages service workers to intercept offline asset routes. It includes visual preset toggles (lightweight, balanced, full) to manage rendering frame rates on low-end mobile devices.',
      aiFocused: 'Sanju Career OS ingests local calendar milestones and checklist scores to build a structured context sent to the Shayla AI coach. This makes the coach calendar-aware, providing tailored placement advice.'
    }
  }
];

export const ProjectPracticeHub: React.FC = () => {
  const { projectPitches, practicedProjectPitch } = useMockInterviewOS();
  const [activeProjKey, setActiveProjKey] = useState('caresync');
  const [activeTab, setActiveTab] = useState<'30s' | '60s' | 'swe' | 'ai'>('30s');

  const selectedProj = PROJECTS.find((p) => p.key === activeProjKey) || PROJECTS[0];
  const userPitch = projectPitches[selectedProj.key] || { practicedCount: 0 };

  const handleMarkPracticed = () => {
    practicedProjectPitch(selectedProj.key);
    alert(`Marked ${selectedProj.name} pitch as practiced! Streak protected.`);
  };

  const getActivePitchText = () => {
    if (activeTab === '30s') return selectedProj.templates.pitch30s;
    if (activeTab === '60s') return selectedProj.templates.pitch60s;
    if (activeTab === 'swe') return selectedProj.templates.sweFocused;
    return selectedProj.templates.aiFocused;
  };

  return (
    <div className="flex flex-col gap-4 text-xs select-none bg-black/45 border border-white/5 p-5 rounded-2xl">
      <div className="flex justify-between items-start border-b border-white/5 pb-2">
        <div>
          <span className="text-[9px] text-textMuted font-black uppercase tracking-widest">Project Hub</span>
          <h3 className="text-sm font-black text-textPrimary mt-0.5">Project Explanation Practice</h3>
        </div>
        <Badge variant="primary">{userPitch.practicedCount || 0} practices logged</Badge>
      </div>

      {/* Project selector row */}
      <div className="grid grid-cols-3 gap-2">
        {PROJECTS.map((p) => (
          <button
            key={p.key}
            onClick={() => {
              setActiveProjKey(p.key);
              setActiveTab('30s');
            }}
            className={`p-3 rounded-xl border transition text-left flex flex-col gap-1 ${
              activeProjKey === p.key
                ? 'border-accentBlue bg-accentBlue/5 text-textPrimary'
                : 'border-white/5 bg-black/25 text-textSecondary hover:border-white/10'
            }`}
          >
            <span className="text-[10px] font-black uppercase tracking-wider">{p.name}</span>
            <span className="text-[8px] text-textMuted line-clamp-1">{p.desc}</span>
          </button>
        ))}
      </div>

      <Card className="p-4 bg-white/[0.01] border-white/5 flex flex-col gap-4">
        {/* Template type tabs */}
        <div className="flex bg-white/5 border border-white/5 rounded-xl p-0.5 self-start text-[9px] font-black uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('30s')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === '30s' ? 'bg-accentBlue text-white' : 'text-textSecondary hover:bg-white/5'
            }`}
          >
            30s Elevator Pitch
          </button>
          <button
            onClick={() => setActiveTab('60s')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === '60s' ? 'bg-accentBlue text-white' : 'text-textSecondary hover:bg-white/5'
            }`}
          >
            60s Technical explanation
          </button>
          <button
            onClick={() => setActiveTab('swe')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'swe' ? 'bg-accentBlue text-white' : 'text-textSecondary hover:bg-white/5'
            }`}
          >
            SWE/System Focused
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'ai' ? 'bg-accentBlue text-white' : 'text-textSecondary hover:bg-white/5'
            }`}
          >
            Data / AI Focused
          </button>
        </div>

        {/* Pitch template text box */}
        <div className="p-3.5 rounded-xl bg-black/45 border border-white/5 text-[11px] text-textSecondary leading-relaxed">
          <p>{getActivePitchText()}</p>
        </div>

        <div className="flex justify-between items-center border-t border-white/5 pt-3">
          <span className="text-[9px] text-textMuted italic">
            * All project data is generically structured and safe for placement rounds.
          </span>
          <Button
            size="sm"
            onClick={handleMarkPracticed}
            className="flex items-center gap-1 bg-accentEmerald text-white hover:bg-accentEmerald/90 font-black uppercase tracking-wider text-[9px]"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Mark Practiced
          </Button>
        </div>
      </Card>
    </div>
  );
};
export default ProjectPracticeHub;
