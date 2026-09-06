import React, { useState, useMemo, useEffect, useRef } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Drawer } from '../components/ui/Drawer';
import { useCareerStore } from '../app/store/useCareerStore';
import { SavedChatSession } from '../types';
import { Search, Calendar, MessageSquare, Trash2, ArrowRight } from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const dailyLogs = useCareerStore((s) => s.dailyLogs);
  const chatHistory = useCareerStore((s) => s.chatHistory || []);
  const deleteChatSession = useCareerStore((s) => s.deleteChatSession);

  const [activeTab, setActiveTab] = useState<'logs' | 'chats'>('logs');
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSession, setSelectedSession] = useState<SavedChatSession | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Study Logs list mapping
  const logsList = useMemo(() => {
    return Object.keys(dailyLogs).map(day => ({
      day: parseInt(day),
      ...dailyLogs[day]
    })).sort((a, b) => b.day - a.day);
  }, [dailyLogs]);

  // Apply filters to Study Logs
  const filteredLogs = useMemo(() => {
    return logsList.filter(log => {
      const matchesSearch = log.note?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [logsList, searchTerm, statusFilter]);

  // Apply filters to Chat Sessions
  const filteredChats = useMemo(() => {
    return chatHistory.filter(session => {
      const matchesSearch = session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.messages.some(m => m.content.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesSearch;
    });
  }, [chatHistory, searchTerm]);

  const getStatusVariant = (status: string): "success" | "warning" | "danger" | "neutral" => {
    if (status === 'completed') return 'success';
    if (status === 'partial') return 'warning';
    if (status === 'missed') return 'danger';
    return 'neutral';
  };

  const handleOpenSession = (session: SavedChatSession) => {
    setSelectedSession(session);
    setDrawerOpen(true);
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this chat session?")) {
      deleteChatSession(id);
    }
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

    const colors = ['#dc2626', '#eab308', '#a855f7', '#3b82f6'];
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
    <div className="flex flex-col gap-6 fade-in pb-10 select-none relative overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-60" />

      <div className="relative z-10 flex flex-col gap-6 w-full">
        <SectionHeader
          title="⏳ Tokyo Revengers Time Leap Archives"
          subtitle="Review your past study logs, reflection telemetry, and saved Shayla AI mentor memory sessions across timelines."
        />

        {/* Tabs */}
        <div className="flex border-b border-red-500/30 gap-2">
          <button
            onClick={() => { setActiveTab('logs'); setSearchTerm(''); }}
            className={`px-4 py-2.5 text-xs font-bold transition border-b-2 -mb-[2px] font-mono ${
              activeTab === 'logs' ? 'border-red-500 text-red-400 shadow-[0_4px_10px_rgba(220,38,38,0.3)]' : 'border-transparent text-textMuted hover:text-white'
            }`}
          >
            🔥 Study Logs Timeline
          </button>
          <button
            onClick={() => { setActiveTab('chats'); setSearchTerm(''); }}
            className={`px-4 py-2.5 text-xs font-bold transition border-b-2 -mb-[2px] font-mono ${
              activeTab === 'chats' ? 'border-red-500 text-red-400 shadow-[0_4px_10px_rgba(220,38,38,0.3)]' : 'border-transparent text-textMuted hover:text-white'
            }`}
          >
            ⚡ AI Chat Memory ({chatHistory.length})
          </button>
        </div>

      {/* Filter panel */}
      <div className="flex flex-wrap items-center gap-4 bg-bgSurface/40 p-4 rounded-2xl border border-border-subtle">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-textMuted" />
          <input
            type="text"
            placeholder={activeTab === 'logs' ? "Search notes..." : "Search chat content..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded-xl border border-border-subtle bg-bgSurface/60 text-xs text-textPrimary placeholder:text-textMuted focus:outline-none focus:border-accentBlue"
          />
        </div>

        {activeTab === 'logs' && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-xl border border-border-subtle bg-bgSurface/60 text-xs text-textPrimary focus:outline-none focus:border-accentBlue min-w-[150px]"
          >
            <option value="all">All statuses</option>
            <option value="completed">Completed</option>
            <option value="partial">Partial</option>
            <option value="missed">Missed</option>
            <option value="recovery">Frozen/Recovery</option>
          </select>
        )}
      </div>

      {/* Logs View */}
      {activeTab === 'logs' && (
        <div className="flex flex-col gap-4">
          {filteredLogs.length === 0 ? (
            <div className="glass-card p-12 text-center text-xs text-textSecondary">
              No matching study logs found.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <Card key={log.day} className="p-5 flex flex-col gap-3 border-white/5 bg-bgSurface/40">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-lg bg-white/5 p-2 text-textMuted">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-textPrimary text-sm">Day {log.day} Study Log</h4>
                      <span className="text-[10px] text-textMuted font-medium mt-0.5 block">
                        Saved: {log.savedAt ? new Date(log.savedAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">
                      {['😴', '😐', '🙂', '😊', '🔥'][(log.mood || 3) - 1]}
                    </span>
                    <Badge variant={getStatusVariant(log.status)}>{log.status}</Badge>
                  </div>
                </div>

                {log.note && (
                  <p className="text-xs text-textSecondary bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                    {log.note}
                  </p>
                )}
                <div className="flex flex-wrap gap-3 mt-1 text-[10px] text-textMuted font-bold">
                  <span>🎯 Solved: {log.counts?.leetcode || 0} LC, {log.counts?.skillrack || 0} SkillRack, {log.counts?.sql || 0} SQL</span>
                  <span>⏱️ Focus: {log.focusMinutes || 0} mins</span>
                  <span className="text-accentEmerald">⭐ XP: +{log.xpEarned || 0} XP</span>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Chats View */}
      {activeTab === 'chats' && (
        <div className="flex flex-col gap-4">
          {filteredChats.length === 0 ? (
            <div className="glass-card p-12 text-center text-xs text-textSecondary">
              No saved chat sessions found.
            </div>
          ) : (
            filteredChats.map((session) => (
              <div
                key={session.id}
                onClick={() => handleOpenSession(session)}
                className="p-5 rounded-2xl border border-white/5 bg-bgSurface/40 hover:border-accentBlue/30 hover:bg-bgSurface transition duration-150 cursor-pointer flex justify-between items-center group"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-accentPurple/10 p-2 text-accentPurple group-hover:bg-accentPurple/25 transition">
                    <MessageSquare className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-textPrimary text-sm group-hover:text-accentBlue transition line-clamp-1">{session.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-textMuted font-medium">
                        {new Date(session.savedAt).toLocaleDateString()} at {new Date(session.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-textMuted">•</span>
                      <span className="text-[10px] text-accentPurple font-bold">{session.messages.length} messages</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleDeleteSession(session.id, e)}
                    className="p-2 text-textMuted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                    title="Delete session"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <ArrowRight className="h-4.5 w-4.5 text-textMuted group-hover:translate-x-0.5 group-hover:text-accentBlue transition duration-150" />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Chat Session Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedSession?.title || "Chat Detail"}
      >
        {selectedSession && (
          <div className="flex flex-col gap-4 p-1">
            <span className="text-[10px] text-textMuted font-medium block">
              Saved on {new Date(selectedSession.savedAt).toLocaleString()}
            </span>
            <div className="flex flex-col gap-3 mt-2 overflow-y-auto max-h-[70vh] pr-1">
              {selectedSession.messages.map((m, idx) => (
                <div
                  key={m.id || idx}
                  className={`flex flex-col gap-1 max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-accentBlue text-white self-end rounded-br-none'
                      : 'bg-white/[0.04] border border-white/5 text-textSecondary self-start rounded-bl-none'
                  }`}
                >
                  <span className="text-[8px] font-bold opacity-60 block uppercase tracking-wider">
                    {m.role === 'user' ? 'You' : 'Shayla AI'}
                  </span>
                  <div className="whitespace-pre-wrap mt-0.5 font-medium">{m.content}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Drawer>
      </div>
    </div>
  );
};
