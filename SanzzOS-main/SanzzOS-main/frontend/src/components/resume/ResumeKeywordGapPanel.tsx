import React from 'react';
export const ResumeKeywordGapPanel: React.FC<{ gaps: string[] }> = ({ gaps }) => <div className="flex flex-wrap gap-2">{gaps.length ? gaps.map((gap) => <span key={gap} className="rounded-full border border-border-subtle px-3 py-1 text-xs text-textSecondary">{gap}</span>) : <span className="text-sm text-textSecondary">No obvious role keyword gaps.</span>}</div>;
