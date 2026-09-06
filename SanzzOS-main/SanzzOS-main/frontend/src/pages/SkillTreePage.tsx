import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useCareerStore } from '../app/store/useCareerStore';
import { SKILL_TREE_DATA } from '../data/skillTree';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SectionHeader } from '../components/ui/SectionHeader';
import { 
  GitFork, 
  Lock, 
  Unlock, 
  Award, 
  CheckSquare,
  Square,
  ChevronRight,
  Flame,
  Star
} from 'lucide-react';

interface SkillNodeExtended {
  id: string;
  title: string;
  group: string;
  goal: string;
  why: string;
  whatToDo: string[];
  practiceTarget: string;
  miniBoss: string;
  status: 'locked' | 'unlocked' | 'learning' | 'completed' | 'interview-ready';
}

export const SkillTreePage: React.FC = () => {
  const skillTree = useCareerStore((s) => s.skillTree || {});
  const updateSkillNode = useCareerStore((s) => s.updateSkillNode);

  const [activeGroup, setActiveGroup] = useState<string>('Java DSA');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({});

  // Parse all nodes from SKILL_TREE_DATA
  const nodes = useMemo<SkillNodeExtended[]>(() => {
    return Object.entries(SKILL_TREE_DATA).map(([key, data]) => {
      const [group] = key.split('::');
      const status = skillTree[key] || (key === 'Java DSA::Arrays' ? 'unlocked' : 'locked');
      return {
        id: key,
        group,
        ...data,
        status
      };
    });
  }, [skillTree]);

  // Group headers
  const groups = useMemo(() => {
    return Array.from(new Set(nodes.map((n) => n.group)));
  }, [nodes]);

  const filteredNodes = useMemo(() => {
    return nodes.filter((n) => n.group === activeGroup);
  }, [nodes, activeGroup]);

  const selectedNode = useMemo(() => {
    return nodes.find((n) => n.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  const handleStatusChange = (id: string, newStatus: SkillNodeExtended['status']) => {
    updateSkillNode(id, newStatus);

    // Auto unlock next nodes in the group if we complete or set interview ready!
    if (newStatus === 'completed' || newStatus === 'interview-ready') {
      const groupNodes = nodes.filter((n) => n.group === activeGroup);
      const currentIndex = groupNodes.findIndex((n) => n.id === id);
      if (currentIndex !== -1 && currentIndex + 1 < groupNodes.length) {
        const nextNode = groupNodes[currentIndex + 1];
        if (nextNode.status === 'locked') {
          updateSkillNode(nextNode.id, 'unlocked');
        }
      }
    }
  };

  const getStatusColor = (status: SkillNodeExtended['status']) => {
    switch (status) {
      case 'interview-ready':
        return 'text-accentGold bg-accentGold/10 border-accentGold/20 shadow-glow-yellow/5';
      case 'completed':
        return 'text-accentEmerald bg-accentEmerald/10 border-accentEmerald/20';
      case 'learning':
        return 'text-accentBlue bg-accentBlue/10 border-accentBlue/20 animate-pulse';
      case 'unlocked':
        return 'text-textSecondary bg-white/5 border-white/10';
      case 'locked':
      default:
        return 'text-textMuted bg-white/[0.02] border-white/5 opacity-55';
    }
  };

  const getStatusIcon = (status: SkillNodeExtended['status']) => {
    switch (status) {
      case 'interview-ready':
        return <Star className="h-4 w-4" />;
      case 'completed':
        return <Award className="h-4 w-4" />;
      case 'learning':
        return <Flame className="h-4 w-4 animate-bounce" />;
      case 'unlocked':
        return <Unlock className="h-4 w-4" />;
      case 'locked':
      default:
        return <Lock className="h-4 w-4" />;
    }
  };

  const handleToggleChecklistItem = (nodeId: string, idx: number) => {
    const key = `${nodeId}_${idx}`;
    setChecklistState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Ambient particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;
    const parent = canvas.parentElement;
    let w = (canvas.width = parent?.offsetWidth || window.innerWidth);
    let h = (canvas.height = parent?.offsetHeight || window.innerHeight);
    const onResize = () => {
      if (!canvas || !canvas.parentElement) return;
      w = canvas.width = canvas.parentElement.offsetWidth;
      h = canvas.height = canvas.parentElement.offsetHeight;
    };
    window.addEventListener('resize', onResize);

    const colors = ['#f97316', '#eab308', '#a855f7', '#dc2626'];
    const particles = Array.from({ length: 25 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2,
      size: Math.random() * 1.5 + 0.4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.12 + 0.03
    }));

    const render = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 5; ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;
      animId = requestAnimationFrame(render);
    };
    render();
    return () => { window.removeEventListener('resize', onResize); cancelAnimationFrame(animId); };
  }, []);

  return (
    <div className="workspace-page flex flex-col gap-6 pb-12 select-none relative overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-60" />

      <div className="relative z-10 flex flex-col gap-6 w-full">
        <SectionHeader 
          title="🍥 Naruto Domain Expansion Skill Tree"
          subtitle="Progressive ninja way roadmap unlocking chakra milestones from Genin basic DSA up to Hokage mock interview readiness."
        />

        {/* Group Navigation Bar */}
        <div className="flex gap-2 pb-2 overflow-x-auto border-b border-orange-500/20">
          {groups.map((group) => {
            const groupNodes = nodes.filter((n) => n.group === group);
            const completed = groupNodes.filter((n) => n.status === 'completed' || n.status === 'interview-ready').length;
            const percent = Math.round((completed / groupNodes.length) * 100);

            return (
              <button
                key={group}
                onClick={() => {
                  setActiveGroup(group);
                  setSelectedNodeId(null);
                }}
                className={`h-12 px-5 rounded-2xl text-xs font-bold transition flex flex-col justify-center items-start whitespace-nowrap border ${
                  activeGroup === group
                    ? 'bg-orange-500/20 border-orange-500 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.2)]'
                    : 'bg-black/40 border-white/10 text-textSecondary hover:bg-white/10 hover:border-orange-500/30'
                }`}
              >
                <span>{group}</span>
                <span className="text-[9px] opacity-75 mt-0.5 font-mono">{percent}% Mastery ({completed}/{groupNodes.length})</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1.7fr] gap-6 items-start">
          {/* Left: Interactive Visual Flow Nodes */}
          <div className="flex flex-col gap-3.5">
            <h3 className="text-sm font-black text-orange-400 uppercase tracking-wider pl-1 font-mono">⚡ Ninja Way Milestones</h3>
            
            <div className="flex flex-col gap-4 relative pl-3 border-l border-orange-500/20">
              {filteredNodes.map((node) => {
                const isSelected = selectedNodeId === node.id;
                
                return (
                  <div key={node.id} className="relative group">
                    {/* Tree connector bullet */}
                    <div className={`absolute -left-[17px] top-[14px] h-2 w-2 rounded-full border transition ${
                      node.status === 'interview-ready' || node.status === 'completed'
                        ? 'bg-emerald-400 border-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                        : node.status === 'learning'
                        ? 'bg-orange-500 border-orange-500 animate-ping'
                        : 'bg-black border-white/20'
                    }`} />

                    <Card 
                      onClick={() => setSelectedNodeId(node.id)}
                      className={`p-3.5 border transition cursor-pointer flex justify-between items-center bg-black/70 backdrop-blur-md ${
                        isSelected
                          ? 'border-orange-500 bg-orange-500/10 ring-1 ring-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.2)]'
                          : 'border-white/10 hover:border-orange-500/40 hover:bg-white/[0.04]'
                      } ${node.status === 'locked' ? 'pointer-events-none opacity-60' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl border ${getStatusColor(node.status)}`}>
                          {getStatusIcon(node.status)}
                        </div>
                        <div>
                          <h4 className="font-black text-white text-xs font-mono">{node.title}</h4>
                          <span className="text-[9px] text-orange-400 uppercase font-bold tracking-wider mt-0.5 block font-mono">{node.status}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-textMuted group-hover:text-orange-400 transition">
                        <span className="text-[9px] font-bold font-mono">Inspect</span>
                        <ChevronRight className="h-4.5 w-4.5" />
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Detail Drawer Panel */}
          <div className="lg:sticky lg:top-4">
            {selectedNode ? (
              <Card className="p-5 border border-orange-500/40 bg-black/80 backdrop-blur-md flex flex-col gap-4 shadow-[0_0_20px_rgba(249,115,22,0.15)]" style={{ border: '1px solid rgba(249,115,22,0.3)', background: 'rgba(12,10,15,0.9)' }}>
                <div className="flex justify-between items-start border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider font-mono">{selectedNode.group}</span>
                    <h3 className="font-black text-white text-lg mt-0.5">{selectedNode.title}</h3>
                  </div>
                  <Badge variant={
                    selectedNode.status === 'interview-ready' ? 'warning' : 
                    selectedNode.status === 'completed' ? 'success' : 
                    selectedNode.status === 'learning' ? 'primary' : 'neutral'
                  }>
                    {selectedNode.status.toUpperCase()}
                  </Badge>
                </div>

                {/* Status Controls */}
                <div className="flex flex-wrap gap-2 bg-white/[0.02] border border-white/10 p-3 rounded-2xl">
                  <span className="text-[10px] font-bold text-orange-300 uppercase tracking-wider block w-full pl-1 mb-1 font-mono">⚡ Update Ninja Rank Status:</span>
                  
                  <button
                    onClick={() => handleStatusChange(selectedNode.id, 'unlocked')}
                    className={`h-7 px-3 rounded-lg text-[10px] font-bold transition font-mono ${
                      selectedNode.status === 'unlocked' ? 'bg-white/10 text-white' : 'text-textSecondary hover:bg-white/5'
                    }`}
                  >
                    Unlocked
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedNode.id, 'learning')}
                    className={`h-7 px-3 rounded-lg text-[10px] font-bold transition font-mono ${
                      selectedNode.status === 'learning' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' : 'text-textSecondary hover:bg-white/5'
                    }`}
                  >
                    Learning
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedNode.id, 'completed')}
                    className={`h-7 px-3 rounded-lg text-[10px] font-bold transition font-mono ${
                      selectedNode.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-textSecondary hover:bg-white/5'
                    }`}
                  >
                    Completed
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedNode.id, 'interview-ready')}
                    className={`h-7 px-3 rounded-lg text-[10px] font-bold transition font-mono ${
                      selectedNode.status === 'interview-ready' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' : 'text-textSecondary hover:bg-white/5'
                    }`}
                  >
                    Hokage Ready
                  </button>
                </div>

                {/* Goal & Why */}
                <div className="flex flex-col gap-3 text-xs leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/5">
                  <div>
                    <span className="font-bold text-orange-400 uppercase tracking-wider text-[10px] font-mono">Chakra Goal</span>
                    <p className="text-white mt-1 font-medium">{selectedNode.goal}</p>
                  </div>
                  <div className="pt-2 border-t border-white/5">
                    <span className="font-bold text-purple-400 uppercase tracking-wider text-[10px] font-mono">Why this scroll matters</span>
                    <p className="text-gray-300 mt-1 italic">"{selectedNode.why}"</p>
                  </div>
                </div>

                {/* What to do Checklist */}
                <div className="border-t border-white/10 pt-4 flex flex-col gap-2.5">
                  <span className="font-bold text-orange-400 uppercase tracking-wider text-[10px] block font-mono">🔥 Mission Objectives Checklist:</span>
                  <div className="flex flex-col gap-2 text-xs">
                    {selectedNode.whatToDo.map((task, idx) => {
                      const isChecked = checklistState[`${selectedNode.id}_${idx}`] || false;
                      return (
                        <div 
                          key={idx}
                          onClick={() => handleToggleChecklistItem(selectedNode.id, idx)}
                          className="flex items-start gap-2.5 cursor-pointer bg-white/[0.02] hover:bg-white/[0.06] p-3 rounded-xl border border-white/10 transition"
                        >
                          {isChecked ? (
                            <CheckSquare className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
                          ) : (
                            <Square className="h-4.5 w-4.5 text-orange-400/60 shrink-0 mt-0.5" />
                          )}
                          <span className={`leading-normal font-medium ${isChecked ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                            {task}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Practice Target & Mini Boss */}
                <div className="border-t border-white/10 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-white/[0.02] p-3 rounded-xl border border-white/5">
                  <div>
                    <span className="font-bold text-orange-400 uppercase tracking-wider text-[10px] block font-mono">Practice Target</span>
                    <p className="text-white mt-1.5 font-bold font-mono">{selectedNode.practiceTarget}</p>
                  </div>
                  <div>
                    <span className="font-bold text-red-400 uppercase tracking-wider text-[10px] block font-mono">Mini Boss Challenge</span>
                    <p className="text-red-300 mt-1.5 font-bold font-mono">{selectedNode.miniBoss}</p>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-10 text-center border border-orange-500/20 bg-black/60 backdrop-blur-md text-textSecondary text-xs">
                <GitFork className="h-10 w-10 text-orange-400 mx-auto mb-3 animate-pulse" />
                <span className="font-mono text-gray-300">Select any unlocked Hokage milestone scroll from the left tree map to inspect chakra goals, timed mini-boss objectives, and practice checklists.</span>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
