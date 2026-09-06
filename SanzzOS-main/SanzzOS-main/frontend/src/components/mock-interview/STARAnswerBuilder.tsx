import React from 'react';

interface STARAnswerBuilderProps {
  situation: string;
  task: string;
  action: string;
  result: string;
  onChange: (fields: { situation: string; task: string; action: string; result: string }) => void;
}

export const STARAnswerBuilder: React.FC<STARAnswerBuilderProps> = ({
  situation,
  task,
  action,
  result,
  onChange,
}) => {
  const handleChange = (key: string, value: string) => {
    onChange({
      situation,
      task,
      action,
      result,
      [key]: value,
    });
  };

  return (
    <div className="flex flex-col gap-3 border border-white/5 bg-black/45 p-4 rounded-2xl text-xs">
      <div className="border-b border-white/5 pb-1 mb-1">
        <span className="text-[10px] font-black text-accentBlue uppercase tracking-widest">STAR Framework Builder</span>
      </div>

      <div className="grid gap-3">
        <div>
          <label className="block text-[9px] font-bold text-textMuted uppercase mb-1">Situation</label>
          <textarea
            value={situation}
            onChange={(e) => handleChange('situation', e.target.value)}
            placeholder="What was the background, company, project, or context?"
            className="w-full min-h-[50px] px-3 py-2 rounded-xl border border-white/5 bg-black/35 text-textPrimary placeholder:text-textMuted focus:outline-none focus:border-accentBlue resize-none"
          />
        </div>

        <div>
          <label className="block text-[9px] font-bold text-textMuted uppercase mb-1">Task</label>
          <textarea
            value={task}
            onChange={(e) => handleChange('task', e.target.value)}
            placeholder="What was your target mission, bottleneck, or objective?"
            className="w-full min-h-[50px] px-3 py-2 rounded-xl border border-white/5 bg-black/35 text-textPrimary placeholder:text-textMuted focus:outline-none focus:border-accentBlue resize-none"
          />
        </div>

        <div>
          <label className="block text-[9px] font-bold text-textMuted uppercase mb-1">Action</label>
          <textarea
            value={action}
            onChange={(e) => handleChange('action', e.target.value)}
            placeholder="What technical steps did you take? What algorithm did you implement?"
            className="w-full min-h-[60px] px-3 py-2 rounded-xl border border-white/5 bg-black/35 text-textPrimary placeholder:text-textMuted focus:outline-none focus:border-accentBlue resize-none"
          />
        </div>

        <div>
          <label className="block text-[9px] font-bold text-textMuted uppercase mb-1">Result</label>
          <textarea
            value={result}
            onChange={(e) => handleChange('result', e.target.value)}
            placeholder="What was the impact? Speed gains? Consistency streak? Metrics?"
            className="w-full min-h-[50px] px-3 py-2 rounded-xl border border-white/5 bg-black/35 text-textPrimary placeholder:text-textMuted focus:outline-none focus:border-accentBlue resize-none"
          />
        </div>
      </div>
    </div>
  );
};
export default STARAnswerBuilder;
