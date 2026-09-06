import React, { useState } from 'react';
import { useMockInterviewOS } from '../../hooks/useMockInterviewOS';
import { Button } from '../ui/Button';

export const CommunicationPracticeForm: React.FC = () => {
  const { addSpeakingLog } = useMockInterviewOS();

  const [topic, setTopic] = useState('');
  const [clarity, setClarity] = useState(3);
  const [confidence, setConfidence] = useState(3);
  const [structure, setStructure] = useState(3);
  const [conciseness, setConciseness] = useState(3);
  const [techExp, setTechExp] = useState(3);
  const [storytelling, setStorytelling] = useState(3);

  const [fillerWordCount, setFillerWordCount] = useState(0);
  const [pacingNotes, setPacingNotes] = useState('');
  const [nervousNotes, setNervousNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    const sumMetrics = clarity + confidence + structure + conciseness + techExp + storytelling;
    const avgScore = sumMetrics / 6;
    const percentScore = Math.round((avgScore / 5) * 100);

    addSpeakingLog({
      topic,
      clarity,
      confidence,
      structure,
      conciseness,
      technicalExplanation: techExp,
      storytelling,
      fillerWordAwareness: Math.max(5 - Math.floor(fillerWordCount / 2), 0), // rating maps higher for fewer fillers
      speakingPaceNotes: pacingNotes || undefined,
      nervousnessNotes: nervousNotes || undefined,
      overallScore: percentScore,
    });

    alert(`Speaking drill logged! Overall performance: ${percentScore}%`);
    setTopic('');
    setFillerWordCount(0);
    setPacingNotes('');
    setNervousNotes('');
  };

  const METRICS = [
    { label: 'Clarity / Enunciation', val: clarity, setVal: setClarity },
    { label: 'Confidence / Speed', val: confidence, setVal: setConfidence },
    { label: 'Structure / STAR', val: structure, setVal: setStructure },
    { label: 'Conciseness / Density', val: conciseness, setVal: setConciseness },
    { label: 'Technical Depth', val: techExp, setVal: setTechExp },
    { label: 'Storytelling / Hooks', val: storytelling, setVal: setStorytelling },
  ];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs select-none bg-black/45 border border-white/5 p-5 rounded-2xl">
      <div className="border-b border-white/5 pb-2">
        <span className="text-[9px] text-textMuted font-black uppercase tracking-widest">Manual Speech Logger</span>
        <h3 className="text-sm font-black text-textPrimary mt-0.5">Log Speaking Practice Drill</h3>
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <label className="block text-[9px] font-bold text-textMuted uppercase mb-1">Topic Practiced</label>
          <input
            type="text"
            required
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. CareSync AI Architecture Walkthrough"
            className="w-full h-9 px-3 rounded-xl border border-white/5 bg-black/45 text-textPrimary focus:outline-none"
          />
        </div>

        {/* 6 metrics selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
          {METRICS.map((m) => (
            <div key={m.label} className="flex flex-col gap-1.5 p-2 border border-white/5 bg-white/[0.01] rounded-xl">
              <span className="text-[9px] font-bold text-textSecondary uppercase">{m.label}</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => m.setVal(idx)}
                    className={`flex-1 h-7 rounded text-[10px] font-bold transition ${
                      m.val === idx
                        ? 'bg-[#3B82F6] text-white'
                        : 'bg-black/45 text-textMuted hover:bg-black/60'
                    }`}
                  >
                    {idx}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-[9px] font-bold text-textMuted uppercase mb-1">Filler Word Count</label>
            <input
              type="number"
              min={0}
              value={fillerWordCount}
              onChange={(e) => setFillerWordCount(Number(e.target.value))}
              className="w-full h-8 px-2 rounded-xl border border-white/5 bg-black/45 text-textPrimary focus:outline-none"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-[9px] font-bold text-textMuted uppercase mb-1">Pacing Notes</label>
            <input
              type="text"
              value={pacingNotes}
              onChange={(e) => setPacingNotes(e.target.value)}
              placeholder="e.g. Spoke at ~130 words per minute. Good breathing."
              className="w-full h-8 px-3 rounded-xl border border-white/5 bg-black/45 text-textPrimary focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-[9px] font-bold text-textMuted uppercase mb-1">Nervousness Symptoms / Body Language</label>
          <input
            type="text"
            value={nervousNotes}
            onChange={(e) => setNervousNotes(e.target.value)}
            placeholder="e.g. Fidgeting with hands. Maintain eye contact."
            className="w-full h-8 px-3 rounded-xl border border-white/5 bg-black/45 text-textPrimary focus:outline-none"
          />
        </div>

        <Button
          type="submit"
          className="w-full h-10 bg-accentBlue text-white hover:bg-accentBlue/90 rounded-xl font-black uppercase tracking-widest text-[9px] mt-2"
        >
          Submit Drill Log
        </Button>
      </div>
    </form>
  );
};
export default CommunicationPracticeForm;
