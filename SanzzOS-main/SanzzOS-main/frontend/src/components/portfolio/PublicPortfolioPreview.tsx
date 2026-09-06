import React from 'react';
import { usePortfolioOS } from '../../hooks/usePortfolioOS';
import { Card } from '../ui/Card';
import { Building2, Mail, ExternalLink, User } from 'lucide-react';

export const PublicPortfolioPreview: React.FC = () => {
  const { visibility, profile, caseStudies } = usePortfolioOS();

  const isPublic = (key: keyof typeof visibility) => {
    return visibility[key] !== 'private';
  };

  const getVisibilityBadge = (key: keyof typeof visibility) => {
    const val = visibility[key];
    if (val === 'public') return <span className="px-1.5 py-0.5 rounded bg-accentEmerald/10 text-accentEmerald text-[7px] font-black uppercase">Public Ready</span>;
    if (val === 'preview') return <span className="px-1.5 py-0.5 rounded bg-accentOrange/10 text-accentOrange text-[7px] font-black uppercase">Preview Only</span>;
    return <span className="px-1.5 py-0.5 rounded bg-red-400/10 text-red-400 text-[7px] font-black uppercase">Hidden</span>;
  };

  return (
    <div className="flex flex-col gap-5 text-xs select-none max-w-2xl mx-auto bg-black/45 border border-white/5 p-6 rounded-3xl relative overflow-hidden">
      <div className="border-b border-white/5 pb-2 flex justify-between items-center">
        <div>
          <span className="text-[9px] text-textMuted font-black uppercase tracking-widest">Mock Recruiter View</span>
          <h3 className="text-base font-black text-textPrimary mt-0.5">Recruiter Public Portfolio Preview</h3>
        </div>
        <span className="text-[8px] text-textMuted italic">* Standard standalone portfolio layout mockup</span>
      </div>

      {/* Profile Header */}
      {isPublic('profileSummary') ? (
        <div className="flex flex-col md:flex-row gap-4 items-start border-b border-white/5 pb-4">
          <div className="h-14 w-14 rounded-2xl bg-accentBlue/10 border border-accentBlue/25 flex items-center justify-center text-accentBlue shrink-0">
            <User className="h-7 w-7" />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black text-textPrimary">Sanju Career Portfolio</h4>
              {getVisibilityBadge('profileSummary')}
            </div>
            <span className="text-[10px] text-accentBlue uppercase font-black tracking-wider">{profile.targetRole}</span>
            <p className="text-[10px] text-textSecondary leading-relaxed mt-1">{profile.recruiterBio}</p>
          </div>
        </div>
      ) : (
        <Card className="p-3 bg-red-500/5 border-red-500/10 text-center text-textMuted">
          Bio summary section is private (hidden from recruiters).
        </Card>
      )}

      {/* Projects Showcase list */}
      {isPublic('projects') ? (
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center border-b border-white/5 pb-1">
            <span className="text-[9px] font-black text-textPrimary uppercase tracking-wider">Featured Engineering Case Studies</span>
            {getVisibilityBadge('projects')}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.values(caseStudies).length === 0 ? (
              <p className="text-[10px] text-textMuted text-center py-4 md:col-span-2">No detailed project case studies published yet.</p>
            ) : (
              Object.values(caseStudies).map((study) => (
                <Card key={study.id} className="p-3.5 bg-white/[0.01] border-white/5 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-textPrimary truncate">{study.title}</span>
                    <span className="text-[8px] px-1.5 py-0.2 rounded bg-accentBlue/10 text-accentBlue font-bold uppercase tracking-wider">{study.projectKey}</span>
                  </div>
                  <p className="text-[9px] text-textSecondary line-clamp-2 leading-relaxed">{study.oneLineSummary || 'Click build case study to compile detailed walkthrough details.'}</p>
                  
                  {isPublic('caseStudies') && (
                    <div className="flex gap-2.5 border-t border-white/5 pt-2 mt-1">
                      {study.githubLink && (
                        <a href={study.githubLink} target="_blank" rel="noreferrer" className="flex items-center gap-0.5 text-textMuted hover:text-textPrimary text-[8px] uppercase tracking-wider font-bold">
                          Codebase <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                      {study.demoLink && (
                        <a href={study.demoLink} target="_blank" rel="noreferrer" className="flex items-center gap-0.5 text-accentBlue hover:text-accentBlue/90 text-[8px] uppercase tracking-wider font-bold">
                          Live Demo <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>
      ) : (
        <Card className="p-3 bg-red-500/5 border-red-500/10 text-center text-textMuted">
          Projects showcase is hidden.
        </Card>
      )}

      {/* Social / Contact links */}
      {isPublic('contactLinks') ? (
        <div className="flex flex-wrap items-center gap-4 border-t border-white/5 pt-3.5">
          <span className="text-[8px] font-bold text-textMuted uppercase tracking-widest">Connect:</span>
          <div className="flex items-center gap-1 text-[9px] text-textSecondary font-semibold">
            <Mail className="h-4 w-4 text-accentBlue" />
            <span>sanzz.dev@career.os</span>
          </div>
          <div className="flex items-center gap-1 text-[9px] text-textSecondary font-semibold">
            <Building2 className="h-4 w-4 text-accentBlue" />
            <span>Chennai, TN</span>
          </div>
          {getVisibilityBadge('contactLinks')}
        </div>
      ) : (
        <div className="text-center text-[9px] text-textMuted italic">
          * Contact links are private. Recruiters will require approval to view contact credentials.
        </div>
      )}
    </div>
  );
};
export default PublicPortfolioPreview;
