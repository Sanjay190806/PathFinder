import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useCareerStore } from '../../app/store/useCareerStore';
import { useDailyLogStore } from '../../app/store/useDailyLogStore';
import { ROADMAP } from '../../data/roadmap';
import { CS_SUBJECTS } from '../../data/csSubjects';
import { Sparkles, Trophy, CheckCircle } from 'lucide-react';
import { playXPDing } from '../../utils/timerSounds';
import { launchBurst } from '../../utils/confetti';

interface Quest {
  id: string;
  title: string;
  description: string;
  targetStr: string;
  progressStr: string;
  isCompleted: boolean;
}

export const DailyQuestsCard: React.FC = () => {
  const selectedDay = useDailyLogStore((s) => s.selectedDay);
  const dailyLogs = useCareerStore((s) => s.dailyLogs);
  const problemLogs = useCareerStore((s) => s.problemLogs);
  const csCoreProgress = useCareerStore((s) => s.csCoreProgress || {});
  const updateDailyLog = useCareerStore((s) => s.updateDailyLog);
  const awardXP = useCareerStore((s) => s.awardXP);

  const currentLog = dailyLogs[selectedDay] || {
    counts: {},
    lcStatus: [],
    mood: 3,
    energy: 3,
    distractions: 0,
    questsClaimed: []
  };

  const currentCounts = currentLog.counts || {};
  const todayLC = currentLog.lcStatus?.length || 0;
  const claimedQuests = currentLog.questsClaimed || [];

  // Determine CS Topic status
  const getCSCoreTargetForDay = (day: number) => {
    const subjects = ['dbms', 'os', 'cn', 'oop'];
    const subjectId = subjects[(day - 1) % 4];
    const subject = CS_SUBJECTS.find((s) => s.id === subjectId) || CS_SUBJECTS[0];
    const topicIdx = Math.floor((day - 1) / 4) % subject.topics.length;
    const topic = subject.topics[topicIdx] || subject.topics[0];
    return { subjectId: subject.id, topicName: topic.name };
  };
  const csTarget = getCSCoreTargetForDay(selectedDay);
  const topicProgress = csCoreProgress[csTarget.subjectId]?.[csTarget.topicName] || { completed: false };

  // Helper: check if any Medium/Hard solved today
  const hasMediumOrHardSolved = () => {
    const roadmapProblems = ROADMAP[String(selectedDay)] || [];
    return roadmapProblems.some((_, idx) => {
      const key = `d_${selectedDay}_${idx}`;
      const solved = problemLogs[key]?.solved;
      return solved;
    });
  };

  // Generate Quests
  const quests: Quest[] = [];

  // Quest 1: DSA focus
  if (selectedDay % 3 === 0) {
    quests.push({
      id: 'q_dsa_mh',
      title: '🕷️ Web Crawler Challenge',
      description: 'Solve at least 1 LeetCode challenge scheduled for today',
      targetStr: '1 solved',
      progressStr: hasMediumOrHardSolved() ? '1/1' : '0/1',
      isCompleted: hasMediumOrHardSolved()
    });
  } else if (selectedDay % 3 === 1) {
    quests.push({
      id: 'q_dsa_1',
      title: '🕷️ Web Patrol Action',
      description: 'Log 1 or more LeetCode problems solved today',
      targetStr: '1 problem',
      progressStr: `${todayLC}/1`,
      isCompleted: todayLC >= 1
    });
  } else {
    quests.push({
      id: 'q_dsa_2',
      title: '🕷️ Spider-Verse Combo',
      description: 'Log 2 or more LeetCode problems solved today',
      targetStr: '2 problems',
      progressStr: `${todayLC}/2`,
      isCompleted: todayLC >= 2
    });
  }

  // Quest 2: Placement focus
  if (selectedDay % 3 === 0) {
    const projectMinutes = currentCounts.project || 0;
    quests.push({
      id: 'q_place_proj',
      title: '🚀 Forge Unleashed',
      description: 'Log at least 30 minutes of active Project coding',
      targetStr: '30 mins',
      progressStr: `${projectMinutes}/30 min`,
      isCompleted: projectMinutes >= 30
    });
  } else if (selectedDay % 3 === 1) {
    const sqlCount = currentCounts.sql || 0;
    quests.push({
      id: 'q_place_sql',
      title: '🗄️ Database Breaker',
      description: 'Practice and complete at least 5 SQL queries',
      targetStr: '5 queries',
      progressStr: `${sqlCount}/5`,
      isCompleted: sqlCount >= 5
    });
  } else {
    const srCount = currentCounts.skillrack || 0;
    quests.push({
      id: 'q_place_sr',
      title: '⚡ SkillRack Overdrive',
      description: 'Log 10 or more SkillRack challenges solved today',
      targetStr: '10 problems',
      progressStr: `${srCount}/10`,
      isCompleted: srCount >= 10
    });
  }

  // Quest 3: Consistency/German/Shayla focus
  if (selectedDay % 3 === 0) {
    const loggedReflection = currentLog.mood !== undefined && currentLog.distractions !== undefined && currentLog.note !== '';
    quests.push({
      id: 'q_checkin',
      title: '🦇 Dark Knight Reflection',
      description: 'Add reflection logs and rate your mood/distractions',
      targetStr: 'Reflection complete',
      progressStr: loggedReflection ? 'Yes' : 'No',
      isCompleted: loggedReflection
    });
  } else if (selectedDay % 3 === 1) {
    const germanMins = currentCounts.german || 0;
    quests.push({
      id: 'q_german',
      title: '🇩🇪 Shinigami Tongue',
      description: 'Study vocabulary flashcards or lessons for 10 minutes',
      targetStr: '10 mins',
      progressStr: `${germanMins}/10 min`,
      isCompleted: germanMins >= 10
    });
  } else {
    quests.push({
      id: 'q_cscore',
      title: '📚 Archive Revision',
      description: 'Revise and mark today\'s CS Core target topic as completed',
      targetStr: '1 topic revised',
      progressStr: topicProgress.completed ? '1/1' : '0/1',
      isCompleted: topicProgress.completed
    });
  }

  const handleClaim = (questId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    if (claimedQuests.includes(questId)) return;

    // Trigger feedback sound and confetti burst
    playXPDing(0.5);
    launchBurst(event.currentTarget, 20);

    // Award main XP
    awardXP(50);

    // Update claimed status
    updateDailyLog(selectedDay, {
      questsClaimed: [...claimedQuests, questId]
    });
  };

  const claimedCount = quests.filter(q => claimedQuests.includes(q.id)).length;

  return (
    <Card className="flex flex-col gap-3 relative overflow-hidden"
      style={{ border: '1px solid rgba(234,179,8,0.15)', background: 'rgba(10,5,0,0.8)' }}>
      {/* Background logo */}
      <div className="absolute top-0 right-0 text-[64px] opacity-[0.02] pointer-events-none select-none">🏆</div>

      {/* Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-2">
        <div className="flex items-center gap-1.5">
          <Trophy className="h-4 w-4 text-yellow-500" />
          <span className="text-[10px] font-black uppercase tracking-wider text-white/80">
            Daily Quests (Day {selectedDay})
          </span>
        </div>
        <Badge variant="warning" className="bg-yellow-950/40 text-yellow-400 border border-yellow-500/20 font-mono text-[9px]">
          {claimedCount}/3 claimed
        </Badge>
      </div>

      {/* Quest list */}
      <div className="flex flex-col gap-2">
        {quests.map((q) => {
          const isClaimed = claimedQuests.includes(q.id);

          return (
            <div
              key={q.id}
              className={`flex items-center justify-between gap-3 p-2.5 rounded-xl border transition-all duration-300 ${
                isClaimed
                  ? 'border-yellow-500/25 bg-yellow-950/5 opacity-60'
                  : q.isCompleted
                  ? 'border-green-500/30 bg-green-950/15 shadow-[0_0_8px_rgba(34,197,94,0.1)]'
                  : 'border-white/5 bg-white/[0.01]'
              }`}
            >
              <div className="flex flex-col gap-0.5 max-w-[70%]">
                <span className="text-[11px] font-black text-white">{q.title}</span>
                <span className="text-[9px] text-textMuted leading-relaxed">{q.description}</span>
                <span className="text-[8px] font-mono text-white/30 uppercase mt-0.5">
                  Target: {q.targetStr} • Progress: {q.progressStr}
                </span>
              </div>

              <div className="shrink-0 flex items-center">
                {isClaimed ? (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-yellow-500 font-mono">
                    <CheckCircle className="h-3.5 w-3.5" /> Claimed
                  </div>
                ) : q.isCompleted ? (
                  <button
                    onClick={(e) => handleClaim(q.id, e)}
                    className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest font-mono bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:from-yellow-400 hover:to-orange-400 active:scale-95 shadow-glow-yellow transition flex items-center gap-1"
                  >
                    Claim +50 XP <Sparkles className="h-2.5 w-2.5" />
                  </button>
                ) : (
                  <div className="text-[9px] font-black uppercase tracking-widest font-mono text-white/30 border border-white/5 px-2.5 py-1.5 rounded-lg">
                    In Progress
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
