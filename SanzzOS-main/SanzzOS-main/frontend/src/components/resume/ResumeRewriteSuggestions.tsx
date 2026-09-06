import React from 'react';
export const ResumeRewriteSuggestions: React.FC<{ bullets: string[] }> = ({ bullets }) => <div className="grid gap-2">{bullets.map((bullet) => <p key={bullet} className="rounded-lg border border-border-subtle bg-bgBase/40 p-3 text-sm text-textSecondary">{bullet}</p>)}</div>;
