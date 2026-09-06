import React from 'react';

interface StatusChipProps {
  status: 'wishlist' | 'applied' | 'oa' | 'interview' | 'hr' | 'offer' | 'rejected' | 'ghosted' | string;
}

export const StatusChip: React.FC<StatusChipProps> = ({ status }) => {
  const getColors = (st: string) => {
    const s = st.toLowerCase();
    if (s.includes('wish')) return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    if (s.includes('appl')) return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    if (s.includes('oa') || s.includes('test')) return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
    if (s.includes('interview')) return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
    if (s.includes('hr')) return 'text-pink-400 bg-pink-400/10 border-pink-400/20';
    if (s.includes('offer') || s.includes('select')) return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    if (s.includes('reject')) return 'text-red-400 bg-red-400/10 border-red-400/20';
    return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
  };

  const colors = getColors(status);

  return (
    <div className={`inline-flex items-center px-2 py-0.5 rounded-lg border text-[9px] font-extrabold uppercase tracking-widest ${colors}`}>
      {status}
    </div>
  );
};
export default StatusChip;
