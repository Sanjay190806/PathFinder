import React from 'react';
import { Card } from '../ui/Card';
import { MessageSquare } from 'lucide-react';

interface CommunicationScoreCardProps {
  overallScore: number;
  clarity: number;
  confidence: number;
  structure: number;
  conciseness: number;
  technicalExplanation: number;
  storytelling: number;
}

export const CommunicationScoreCard: React.FC<CommunicationScoreCardProps> = ({
  overallScore,
  clarity,
  confidence,
  structure,
  conciseness,
  technicalExplanation,
  storytelling,
}) => {
  const getBand = (score: number) => {
    if (score >= 90) return { label: 'Fluent Leader', color: 'text-accentEmerald bg-accentEmerald/10' };
    if (score >= 75) return { label: 'Effective Speaker', color: 'text-accentBlue bg-accentBlue/10' };
    if (score >= 50) return { label: 'Intermediate', color: 'text-accentOrange bg-accentOrange/10' };
    return { label: 'Needs Practice', color: 'text-red-400 bg-red-400/10' };
  };

  const band = getBand(overallScore);

  const metrics = [
    { label: 'Clarity / Enunciation', val: clarity },
    { label: 'Confidence / Demeanor', val: confidence },
    { label: 'Structure / STAR use', val: structure },
    { label: 'Conciseness / Speed', val: conciseness },
    { label: 'Technical Depth', val: technicalExplanation },
    { label: 'Storytelling / Hooks', val: storytelling },
  ];

  return (
    <Card className="p-4.5 border-white/5 bg-[#0a0a1a]/55 flex flex-col gap-4 select-none">
      <div className="flex justify-between items-center border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4.5 w-4.5 text-accentBlue" />
          <span className="text-[10px] font-black uppercase tracking-wider text-textPrimary">Communication Profile</span>
        </div>
        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${band.color}`}>
          {band.label}
        </span>
      </div>

      <div className="flex items-center justify-around gap-4 py-1">
        <div className="relative h-20 w-20 flex items-center justify-center rounded-full border border-white/5 bg-black/45 shadow-inner">
          <div className="flex flex-col items-center select-none">
            <span className="text-lg font-black text-textPrimary">{overallScore}%</span>
            <span className="text-[7px] text-textMuted uppercase font-bold tracking-widest mt-0.5">Overall</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 text-[10px] font-semibold text-textSecondary">
          <p>• Aim for at least 75% for product/consulting roles.</p>
          <p>• Focus on structure and STAR framework.</p>
          <p>• Minimize filler words during mock session runtimes.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-[10px] font-bold uppercase tracking-wider">
        {metrics.map((m) => (
          <div key={m.label} className="p-2.5 rounded-xl border border-white/5 bg-black/45 flex flex-col gap-1">
            <span className="text-textMuted text-[8px]">{m.label}</span>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-textPrimary">{m.val} / 5</span>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 w-1.5 rounded-full ${
                      i < m.val ? 'bg-accentBlue' : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
export default CommunicationScoreCard;
