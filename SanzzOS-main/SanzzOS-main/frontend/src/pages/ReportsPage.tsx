import React, { useState, useMemo, useEffect } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ShaylaPromptButton } from '../components/ai/ShaylaPromptButton';
import { useCareerStore } from '../app/store/useCareerStore';
import { getTodayDay, getDateForDay } from '../utils/dateUtils';
import { WeeklyReview } from '../types';
import { FileText, Save, Clipboard } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const careerState = useCareerStore((s) => s);
  const { dailyLogs, userProfile, weeklyReviews = {}, saveWeeklyReview } = careerState;

  const todayDay = getTodayDay(userProfile.startDate);
  const currentWeekNum = Math.ceil(todayDay / 7);

  const [selectedWeek, setSelectedWeek] = useState<number>(Math.min(currentWeekNum, 26));

  // Text inputs
  const [wins, setWins] = useState('');
  const [problems, setProblems] = useState('');
  const [recoveryPlan, setRecoveryPlan] = useState('');
  const [nextWeekMission, setNextWeekMission] = useState('');

  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  // Key for storage (e.g. "2026-Week-12")
  const weekKey = useMemo(() => {
    return `${userProfile.startDate.substring(0, 4)}-Week-${selectedWeek}`;
  }, [selectedWeek, userProfile.startDate]);

  // Load existing review if available
  useEffect(() => {
    const existing = weeklyReviews[weekKey];
    if (existing) {
      setWins(existing.wins || '');
      setProblems(existing.problems || '');
      setRecoveryPlan(existing.recoveryPlan || '');
      setNextWeekMission(existing.nextWeekMission || '');
    } else {
      setWins('');
      setProblems('');
      setRecoveryPlan('');
      setNextWeekMission('');
    }
  }, [weekKey, weeklyReviews]);

  // Selected week day range
  const weekDayRange = useMemo(() => {
    const startDay = (selectedWeek - 1) * 7 + 1;
    const endDay = Math.min(selectedWeek * 7, 184);
    
    const startDateObj = getDateForDay(startDay, userProfile.startDate);
    const endDateObj = getDateForDay(endDay, userProfile.startDate);
    
    const fmt = (d: Date) => d.toLocaleDateString('default', { month: 'short', day: 'numeric' });
    return {
      startDay,
      endDay,
      dateRangeStr: `${fmt(startDateObj)} – ${fmt(endDateObj)}`
    };
  }, [selectedWeek, userProfile.startDate]);

  // Automatically aggregate actual metrics from logs in this week
  const weekMetrics = useMemo(() => {
    let skillrackActual = 0;
    let leetcodeActual = 0;
    let aptitudeActual = 0;
    let sqlActual = 0;
    let cscoreActual = 0;
    let mocksActual = 0;
    
    let perfectDays = 0;
    let freezesUsed = 0;
    let studyMinutes = 0;

    for (let d = weekDayRange.startDay; d <= weekDayRange.endDay; d++) {
      const log = dailyLogs[d];
      if (log) {
        const c = log.counts || {};
        skillrackActual += c.skillrack || 0;
        leetcodeActual += c.leetcode || 0;
        aptitudeActual += c.aptitude || 0;
        sqlActual += c.sql || 0;
        cscoreActual += c.cscore || 0;
        
        mocksActual += (c.mockTechnical || 0) + (c.mockHR || 0) + (c.mockCoding || 0) + (c.mockProject || 0);

        studyMinutes += log.focusMinutes || 0;
        if (log.completionType === 'perfect') perfectDays++;
        if (log.freezeUsed) freezesUsed++;
      }
    }

    return {
      skillrackActual,
      skillrackTarget: 70,
      leetcodeActual,
      leetcodeTarget: 14,
      aptitudeActual,
      aptitudeTarget: 210, // 30m daily target
      sqlActual,
      sqlTarget: 140, // 20m daily target
      cscoreActual,
      cscoreTarget: 7, // 1 topic per day
      mocksActual,
      mocksTarget: 1, // 1 mock per week
      perfectDays,
      freezesUsed,
      studyMinutes
    };
  }, [dailyLogs, weekDayRange]);

  // Automatically suggest recovery plan if freeze is used
  useEffect(() => {
    if (weekMetrics.freezesUsed > 0 && !recoveryPlan) {
      setRecoveryPlan(`Streak Freeze protection was used ${weekMetrics.freezesUsed} time(s). Executing Recovery Quests (1.5x counters) next session.`);
    }
  }, [weekMetrics.freezesUsed, recoveryPlan]);

  const reportMarkdown = useMemo(() => {
    return `# Sanju Career OS — Placement Prep Weekly Review [Week ${selectedWeek}]
*Timeline: ${weekDayRange.dateRangeStr} (Days ${weekDayRange.startDay} to ${weekDayRange.endDay})*
*Generated: ${new Date().toLocaleDateString()}*

## 1. Metric Summary (Target vs Actual)
| Metric Checklist | Weekly Target | Weekly Actual | Completion % | Status |
| :--- | :---: | :---: | :---: | :---: |
| **LeetCode Problems** | ${weekMetrics.leetcodeTarget} | ${weekMetrics.leetcodeActual} | ${Math.round((weekMetrics.leetcodeActual / weekMetrics.leetcodeTarget) * 100)}% | ${weekMetrics.leetcodeActual >= weekMetrics.leetcodeTarget ? '✓ Qualified' : 'Pending'} |
| **SkillRack Solves** | ${weekMetrics.skillrackTarget} | ${weekMetrics.skillrackActual} | ${Math.round((weekMetrics.skillrackActual / weekMetrics.skillrackTarget) * 100)}% | ${weekMetrics.skillrackActual >= weekMetrics.skillrackTarget ? '✓ Qualified' : 'Pending'} |
| **Aptitude practice** | ${weekMetrics.aptitudeTarget}m | ${weekMetrics.aptitudeActual}m | ${Math.round((weekMetrics.aptitudeActual / weekMetrics.aptitudeTarget) * 100)}% | ${weekMetrics.aptitudeActual >= weekMetrics.aptitudeTarget ? '✓ Qualified' : 'Pending'} |
| **SQL Queries** | ${weekMetrics.sqlTarget}m | ${weekMetrics.sqlActual}m | ${Math.round((weekMetrics.sqlActual / weekMetrics.sqlTarget) * 100)}% | ${weekMetrics.sqlActual >= weekMetrics.sqlTarget ? '✓ Qualified' : 'Pending'} |
| **CS Core Topics** | ${weekMetrics.cscoreTarget} | ${weekMetrics.cscoreActual} | ${Math.round((weekMetrics.cscoreActual / weekMetrics.cscoreTarget) * 100)}% | ${weekMetrics.cscoreActual >= weekMetrics.cscoreTarget ? '✓ Qualified' : 'Pending'} |
| **Mock Interviews** | ${weekMetrics.mocksTarget} | ${weekMetrics.mocksActual} | ${Math.round((weekMetrics.mocksActual / weekMetrics.mocksTarget) * 100)}% | ${weekMetrics.mocksActual >= weekMetrics.mocksTarget ? '✓ Qualified' : 'Pending'} |

- **Perfect Days Achieved**: ${weekMetrics.perfectDays} days
- **Streak Freezes Protected**: ${weekMetrics.freezesUsed} occurrences
- **Total Focus Study**: ${weekMetrics.studyMinutes} minutes

## 2. Wins of the Week
${wins.trim() || '*No wins written yet.*'}

## 3. Roadblocks & Problems
${problems.trim() || '*No problems written yet.*'}

## 4. Streak Recovery Quest Plan
${recoveryPlan.trim() || '*No recovery plan necessary.*'}

## 5. Next Week Core Mission
${nextWeekMission.trim() || '*No future plan specified.*'}`;
  }, [selectedWeek, weekDayRange, weekMetrics, wins, problems, recoveryPlan, nextWeekMission]);

  const handleCopy = () => {
    navigator.clipboard.writeText(reportMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    const review: WeeklyReview = {
      weekKey,
      wins,
      problems,
      recoveryPlan,
      nextWeekMission,
      weakDsaPatterns: '',
      weakAptitudeTopics: '',
      weakCsCoreTopics: '',
      resumeProjectProgress: '',
      germanProgress: '',
      moodEnergySummary: '',
      metrics: weekMetrics,
      savedAt: new Date().toISOString()
    };
    saveWeeklyReview(weekKey, review);
    
    setSaveStatus('Saved successfully ✓');
    setTimeout(() => setSaveStatus(''), 2500);
  };

  return (
    <div className="workspace-page flex flex-col gap-6 pb-12 select-none">
      <SectionHeader
        title="Weekly Review 2.0"
        subtitle="Review targets, compile wins, and map out recovery quest loops for the next calendar week."
        actions={
          <div className="flex gap-2">
            <Button onClick={handleCopy} variant="outline" className="text-xs py-1.5 rounded-xl gap-1.5">
              <Clipboard className="h-3.5 w-3.5" />
              {copied ? "Copied ✓" : "Copy Markdown"}
            </Button>
            <Button onClick={handleSave} className="text-xs py-1.5 rounded-xl gap-1.5">
              <Save className="h-3.5 w-3.5" />
              Save Review
            </Button>
          </div>
        }
      />

      {saveStatus && (
        <div className="fixed bottom-20 right-6 z-50 bg-accentEmerald border border-accentEmerald/20 px-4 py-3 rounded-xl shadow-glow-emerald text-xs font-bold text-white">
          {saveStatus}
        </div>
      )}

      {/* Week Selector Grid */}
      <Card className="p-4 border-white/5 bg-bgCard/30 flex flex-col gap-3">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-textPrimary uppercase tracking-wider">Select Timeline Week</span>
          <span className="text-accentBlue font-bold">{weekDayRange.dateRangeStr} (Days {weekDayRange.startDay} – {weekDayRange.endDay})</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {Array.from({ length: 26 }, (_, i) => i + 1).map((w) => {
            const isSelected = selectedWeek === w;
            const isCurrent = currentWeekNum === w;
            
            return (
              <button
                key={w}
                onClick={() => setSelectedWeek(w)}
                className={`h-9 px-4 rounded-xl text-xs font-bold transition whitespace-nowrap border shrink-0 ${
                  isSelected
                    ? 'bg-accentBlue/10 border-accentBlue text-accentBlue'
                    : isCurrent
                    ? 'bg-white/5 border-accentBlue/40 text-textPrimary'
                    : 'bg-white/5 border-white/5 text-textSecondary hover:bg-white/10'
                }`}
              >
                Week {w} {isCurrent ? '• Active' : ''}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Interactive Inputs Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6 items-start">
        <div className="flex flex-col gap-6">
          {/* Metrics summary table */}
          <Card className="p-5 border-white/5 bg-bgCard/30">
            <h3 className="text-xs font-black text-textPrimary uppercase tracking-wider mb-3">Metrics summary checklist</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-textSecondary">
                <thead>
                  <tr className="border-b border-white/5 text-textMuted uppercase font-bold tracking-wider text-[10px]">
                    <th className="py-2.5">Prep Category</th>
                    <th className="py-2.5 text-center">Weekly Target</th>
                    <th className="py-2.5 text-center">Weekly Actual</th>
                    <th className="py-2.5 text-center">Completion</th>
                    <th className="py-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  <tr>
                    <td className="py-3 font-sans font-bold text-textPrimary">LeetCode Solves</td>
                    <td className="py-3 text-center">{weekMetrics.leetcodeTarget}</td>
                    <td className="py-3 text-center text-textPrimary">{weekMetrics.leetcodeActual}</td>
                    <td className="py-3 text-center">{Math.round((weekMetrics.leetcodeActual / weekMetrics.leetcodeTarget) * 100)}%</td>
                    <td className="py-3 text-right">
                      {weekMetrics.leetcodeActual >= weekMetrics.leetcodeTarget ? (
                        <span className="text-accentEmerald font-bold">✓ Met</span>
                      ) : (
                        <span className="text-red-400 font-bold">✗ Pending</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 font-sans font-bold text-textPrimary">SkillRack Challenges</td>
                    <td className="py-3 text-center">{weekMetrics.skillrackTarget}</td>
                    <td className="py-3 text-center text-textPrimary">{weekMetrics.skillrackActual}</td>
                    <td className="py-3 text-center">{Math.round((weekMetrics.skillrackActual / weekMetrics.skillrackTarget) * 100)}%</td>
                    <td className="py-3 text-right">
                      {weekMetrics.skillrackActual >= weekMetrics.skillrackTarget ? (
                        <span className="text-accentEmerald font-bold">✓ Met</span>
                      ) : (
                        <span className="text-red-400 font-bold">✗ Pending</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 font-sans font-bold text-textPrimary">Aptitude Prep</td>
                    <td className="py-3 text-center">{weekMetrics.aptitudeTarget}m</td>
                    <td className="py-3 text-center text-textPrimary">{weekMetrics.aptitudeActual}m</td>
                    <td className="py-3 text-center">{Math.round((weekMetrics.aptitudeActual / weekMetrics.aptitudeTarget) * 100)}%</td>
                    <td className="py-3 text-right">
                      {weekMetrics.aptitudeActual >= weekMetrics.aptitudeTarget ? (
                        <span className="text-accentEmerald font-bold">✓ Met</span>
                      ) : (
                        <span className="text-red-400 font-bold">✗ Pending</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 font-sans font-bold text-textPrimary">SQL Query Drills</td>
                    <td className="py-3 text-center">{weekMetrics.sqlTarget}m</td>
                    <td className="py-3 text-center text-textPrimary">{weekMetrics.sqlActual}m</td>
                    <td className="py-3 text-center">{Math.round((weekMetrics.sqlActual / weekMetrics.sqlTarget) * 100)}%</td>
                    <td className="py-3 text-right">
                      {weekMetrics.sqlActual >= weekMetrics.sqlTarget ? (
                        <span className="text-accentEmerald font-bold">✓ Met</span>
                      ) : (
                        <span className="text-red-400 font-bold">✗ Pending</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 font-sans font-bold text-textPrimary">CS Fundamentals</td>
                    <td className="py-3 text-center">{weekMetrics.cscoreTarget}</td>
                    <td className="py-3 text-center text-textPrimary">{weekMetrics.cscoreActual}</td>
                    <td className="py-3 text-center">{Math.round((weekMetrics.cscoreActual / weekMetrics.cscoreTarget) * 100)}%</td>
                    <td className="py-3 text-right">
                      {weekMetrics.cscoreActual >= weekMetrics.cscoreTarget ? (
                        <span className="text-accentEmerald font-bold">✓ Met</span>
                      ) : (
                        <span className="text-red-400 font-bold">✗ Pending</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 font-sans font-bold text-textPrimary">Mock Interviews</td>
                    <td className="py-3 text-center">{weekMetrics.mocksTarget}</td>
                    <td className="py-3 text-center text-textPrimary">{weekMetrics.mocksActual}</td>
                    <td className="py-3 text-center">{Math.round((weekMetrics.mocksActual / weekMetrics.mocksTarget) * 100)}%</td>
                    <td className="py-3 text-right">
                      {weekMetrics.mocksActual >= weekMetrics.mocksTarget ? (
                        <span className="text-accentEmerald font-bold">✓ Met</span>
                      ) : (
                        <span className="text-red-400 font-bold">✗ Pending</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-3 gap-3 border-t border-white/5 pt-4 mt-2.5 text-center text-xs">
              <div className="p-2 bg-white/5 border border-white/5 rounded-xl">
                <span className="block text-textMuted text-[9px] uppercase tracking-wider">Perfect Days</span>
                <span className="block text-base font-extrabold text-yellow-400 mt-0.5">{weekMetrics.perfectDays} / 7</span>
              </div>
              <div className="p-2 bg-white/5 border border-white/5 rounded-xl">
                <span className="block text-textMuted text-[9px] uppercase tracking-wider">Freezes Used</span>
                <span className="block text-base font-extrabold text-sky-400 mt-0.5">{weekMetrics.freezesUsed} / 1</span>
              </div>
              <div className="p-2 bg-white/5 border border-white/5 rounded-xl">
                <span className="block text-textMuted text-[9px] uppercase tracking-wider">Study Minutes</span>
                <span className="block text-base font-extrabold text-indigo-400 mt-0.5">{weekMetrics.studyMinutes}m</span>
              </div>
            </div>
          </Card>

          {/* Text reviews */}
          <Card className="p-5 border-white/5 bg-bgCard/30 flex flex-col gap-4">
            <h3 className="text-xs font-black text-textPrimary uppercase tracking-wider pl-0.5">Wins, Obstacles, and Strategy</h3>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-textMuted uppercase tracking-wider pl-0.5">Wins of the Week</label>
              <textarea
                value={wins}
                onChange={(e) => setWins(e.target.value)}
                placeholder="What did you execute well? (e.g. solved Kadane algorithm without template, finished smartedu api integration)..."
                className="w-full min-h-[70px] p-2.5 text-xs text-textPrimary placeholder:text-textMuted bg-bgSurface border border-border-subtle focus:outline-none rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-textMuted uppercase tracking-wider pl-0.5">Roadblocks & Problems</label>
              <textarea
                value={problems}
                onChange={(e) => setProblems(e.target.value)}
                placeholder="What slowed you down? (e.g. recursion tree tracing took too long, missed 2 days due to college exams)..."
                className="w-full min-h-[70px] p-2.5 text-xs text-textPrimary placeholder:text-textMuted bg-bgSurface border border-border-subtle focus:outline-none rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-textMuted uppercase tracking-wider pl-0.5">Streak Recovery Quest Plan</label>
              <textarea
                value={recoveryPlan}
                onChange={(e) => setRecoveryPlan(e.target.value)}
                placeholder="If you used freeze, write recovery task details (e.g. do 15 SkillRack next day, double leetcode)..."
                className="w-full min-h-[70px] p-2.5 text-xs text-textPrimary placeholder:text-textMuted bg-bgSurface border border-border-subtle focus:outline-none rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-textMuted uppercase tracking-wider pl-0.5">Next Week Core Mission</label>
              <textarea
                value={nextWeekMission}
                onChange={(e) => setNextWeekMission(e.target.value)}
                placeholder="Identify key syllabus topic to lock down next week (e.g. master HashMap problems, lock PayPal test models)..."
                className="w-full min-h-[70px] p-2.5 text-xs text-textPrimary placeholder:text-textMuted bg-bgSurface border border-border-subtle focus:outline-none rounded-xl"
              />
            </div>
          </Card>
        </div>

        {/* Right side: Markdown preview & AI advisor review */}
        <div className="flex flex-col gap-6 lg:sticky lg:top-4">
          <Card className="flex flex-wrap items-center justify-between gap-3 border-accentPurple/20 bg-accentPurple/10 p-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accentPurple">Shayla AI Mentor</p>
              <h3 className="mt-1 text-base font-semibold text-textPrimary">Review workspace</h3>
            </div>
            <ShaylaPromptButton prompt={`Review this weekly placement preparation report. Grade my week, identify gaps, and recommend specific Java DSA, SkillRack, or CS Core practice paths:\n\n${reportMarkdown}`}>
              Review weekly report
            </ShaylaPromptButton>
          </Card>

          <Card className="p-5 border-white/5 bg-bgCard/30 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-textPrimary">
              <FileText className="h-4.5 w-4.5 text-accentBlue" />
              <h3 className="text-xs font-bold uppercase tracking-wider">Markdown Export Output</h3>
            </div>
            <textarea
              readOnly
              value={reportMarkdown}
              className="w-full bg-bgSurface border border-border-subtle text-textPrimary text-xs rounded-xl p-4 font-mono h-[300px] resize-none focus:outline-none"
            />
          </Card>
        </div>
      </div>
    </div>
  );
};
