import React, { useState } from 'react';
import { usePortfolioOS } from '../../hooks/usePortfolioOS';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Copy } from 'lucide-react';

interface TemplateOption {
  type: string;
  label: string;
  hook: string;
  story: string;
  details: string;
  skills: string[];
  hashtags: string[];
}

const TEMPLATES: TemplateOption[] = [
  {
    type: 'project_launch',
    label: 'Project Launch Post',
    hook: 'Thrilled to launch my latest engineering project, CareSync AI!',
    story: 'I built this to address emergency room vital data overload bottlenecks, designing a conceptual Vital Anomaly scoring index system.',
    details: 'The tech stack includes React, Zustand for state sync, and responsive styles.',
    skills: ['React', 'Zustand', 'Data Structures'],
    hashtags: ['reactjs', 'softwareengineering', 'careerdevelopment'],
  },
  {
    type: 'learning_milestone',
    label: 'Learning Milestone',
    hook: 'Consistency pays off! Completed 30 days of daily SQL Joins and Java DSA.',
    story: 'Setting structured daily targets in my Planner OS helped me master matrix structures and database normalizations.',
    details: 'Drilled 40+ mock interview challenges with 4.5+ average self confidence.',
    skills: ['SQL', 'Java DSA', 'Mock Interview'],
    hashtags: ['learningjourney', 'datastructures', 'careerpreparation'],
  }
];

export const LinkedInDraftBuilder: React.FC = () => {
  const { linkedinDrafts, addLinkedinDraft, deleteLinkedinDraft } = usePortfolioOS();

  const [hook, setHook] = useState('');
  const [story, setStory] = useState('');
  const [details, setDetails] = useState('');
  const [skillsText, setSkillsText] = useState('React, TypeScript');
  const [hashtagsText, setHashtagsText] = useState('swe, webdev');
  const [gratitude, setGratitude] = useState('Shoutout to my review coaches for support!');

  const applyTemplate = (t: TemplateOption) => {
    setHook(t.hook);
    setStory(t.story);
    setDetails(t.details);
    setSkillsText(t.skills.join(', '));
    setHashtagsText(t.hashtags.join(', '));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hook.trim()) return;

    addLinkedinDraft({
      type: 'manual',
      hook,
      story,
      details,
      skills: skillsText.split(',').map((s) => s.trim()),
      gratitude,
      callToConnect: 'Check out the details below and let me know your feedback!',
      hashtags: hashtagsText.split(',').map((h) => h.trim().replace('#', '')),
    });

    alert('LinkedIn draft saved!');
    setHook('');
    setStory('');
    setDetails('');
  };

  const copyDraftContent = (d: typeof linkedinDrafts[0]) => {
    const formatted = `
${d.hook}

${d.story}

💡 Technical details:
- ${d.details}
- Key Skills: ${d.skills.join(', ')}

${d.gratitude}

👇 ${d.callToConnect}

${d.hashtags.map((h) => `#${h}`).join(' ')}
    `.trim();
    navigator.clipboard.writeText(formatted);
    alert('LinkedIn draft copied to clipboard!');
  };

  return (
    <div className="flex flex-col gap-5 text-xs select-none">
      {/* Create draft box */}
      <form onSubmit={handleSave} className="flex flex-col gap-3.5 bg-black/45 border border-white/5 p-5 rounded-2xl">
        <div className="flex justify-between items-center border-b border-white/5 pb-2">
          <span className="text-[9px] text-textMuted font-black uppercase tracking-widest">
            Post Drafter Assistant
          </span>
          <div className="flex gap-1.5">
            {TEMPLATES.map((t) => (
              <button
                key={t.type}
                type="button"
                onClick={() => applyTemplate(t)}
                className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-[8px] font-bold uppercase tracking-wider transition"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[9px] font-bold text-textMuted uppercase mb-1">Attention Hook</label>
            <input
              type="text"
              required
              value={hook}
              onChange={(e) => setHook(e.target.value)}
              placeholder="Excited to share..."
              className="w-full h-8 px-3 rounded-xl border border-white/5 bg-black/45 text-textPrimary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-textMuted uppercase mb-1">Project / Story Walkthrough</label>
            <input
              type="text"
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="I engineered this because..."
              className="w-full h-8 px-3 rounded-xl border border-white/5 bg-black/45 text-textPrimary focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[9px] font-bold text-textMuted uppercase mb-1">Technical Stack Details</label>
            <input
              type="text"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="React, TypeScript, WebSocket simulation streams..."
              className="w-full h-8 px-3 rounded-xl border border-white/5 bg-black/45 text-textPrimary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-textMuted uppercase mb-1">Skills (comma separated)</label>
            <input
              type="text"
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              className="w-full h-8 px-3 rounded-xl border border-white/5 bg-black/45 text-textPrimary focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[9px] font-bold text-textMuted uppercase mb-1">Gratitudes / Mentions</label>
            <input
              type="text"
              value={gratitude}
              onChange={(e) => setGratitude(e.target.value)}
              className="w-full h-8 px-3 rounded-xl border border-white/5 bg-black/45 text-textPrimary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-textMuted uppercase mb-1">Hashtags (comma separated)</label>
            <input
              type="text"
              value={hashtagsText}
              onChange={(e) => setHashtagsText(e.target.value)}
              className="w-full h-8 px-3 rounded-xl border border-white/5 bg-black/45 text-textPrimary focus:outline-none font-mono"
            />
          </div>
        </div>

        <Button type="submit" className="w-full bg-accentBlue text-white hover:bg-accentBlue/90 uppercase font-black tracking-widest text-[9px] h-9 mt-1">
          Save Draft Post
        </Button>
      </form>

      {/* List of drafts */}
      <div className="flex flex-col gap-2.5">
        <span className="text-[9px] font-black text-textMuted uppercase tracking-wider pl-1">Saved LinkedIn Drafts</span>
        {linkedinDrafts.map((d) => (
          <Card key={d.id} className="p-3 bg-black/45 border-white/5 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black text-textPrimary leading-normal line-clamp-1">{d.hook}</span>
              <button onClick={() => deleteLinkedinDraft(d.id)} className="text-textMuted hover:text-red-400 font-bold uppercase tracking-wider text-[8px]">
                Delete
              </button>
            </div>
            
            <p className="text-[10px] text-textSecondary leading-relaxed italic">{d.story}</p>
            
            <div className="flex gap-2 justify-end border-t border-white/5 pt-2 mt-1">
              <Button size="sm" onClick={() => copyDraftContent(d)} className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider">
                <Copy className="h-3 w-3" /> Copy Full Post
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
export default LinkedInDraftBuilder;
