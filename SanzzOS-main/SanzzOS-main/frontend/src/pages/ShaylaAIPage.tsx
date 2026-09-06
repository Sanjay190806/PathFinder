import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useAIStore } from '../app/store/useAIStore';
import { useCareerStore } from '../app/store/useCareerStore';
import { useAISettingsStore, AIProviderName } from '../app/store/useAISettingsStore';
import { useShaylaAgentStore } from '../app/store/useShaylaAgentStore';
import { useUIStore } from '../app/store/useUIStore';
import { ChatMessage } from '../components/ai/ChatMessage';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { SectionHeader } from '../components/ui/SectionHeader';
import { buildAIContext } from '../utils/aiContextUtils';
import { aiService } from '../services/aiService';
import { ApiError } from '../services/apiClient';
import { AIMessage } from '../types';
import { parseCommandOffline, ParsedCommand } from '../utils/commandParser';
import { executeCommand } from '../utils/commandExecutor';
import { buildAgentContext } from '../utils/agentContextUtils';
import { getShaylaVoiceName, speakShaylaText } from '../utils/shaylaVoice';
import { generateDailyBriefing, generateEveningReview } from '../services/agentService';
import { SmartNotificationCenter } from '../components/shayla-agent/SmartNotificationCenter';
import { buildSmartNotifications } from '../utils/smartNotificationUtils';
import { ShaylaBriefingResult, ShaylaSmartNotification } from '../types/shaylaAgent';
import { MobileShaylaDock } from '../components/mobile/MobileShaylaDock';
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  Sparkles, PanelRightClose, PanelRight, ChevronDown, ChevronRight, 
  Send, ArrowDown, RefreshCw, Layers, Paperclip, Trash2, Loader2, FileText, Image as ImageIcon
} from 'lucide-react';

// Set up pdf.js worker using CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

const createId = (prefix = 'msg') => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
};

export const ShaylaAIPage: React.FC = () => {
  const messages = useAIStore((s) => s.messages);
  const isThinking = useAIStore((s) => s.isThinking);
  const addMessage = useAIStore((s) => s.addMessage);
  const updateMessage = useAIStore((s) => s.updateMessage);
  const setThinking = useAIStore((s) => s.setThinking);
  const consumePendingPrompt = useAIStore((s) => s.consumePendingPrompt);
  const clearChat = useAIStore((s) => s.clearChat);

  const careerState = useCareerStore((s) => s);
  const activeProvider = useAISettingsStore((s) => s.activeProvider);
  const activeModel = useAISettingsStore((s) => s.activeModel);
  const activeMode = useAISettingsStore((s) => s.activeMode);
  const activeLanguage = useAISettingsStore((s) => s.language) || 'English';
  const setLanguage = useAISettingsStore((s) => s.setLanguage);
  const setProvider = useAISettingsStore((s) => s.setProvider);
  const setModel = useAISettingsStore((s) => s.setModel);
  const setMode = useAISettingsStore((s) => s.setMode);
  const streamingEnabled = useAISettingsStore((s) => s.streamingEnabled);
  const setStreamingEnabled = useAISettingsStore((s) => s.setStreamingEnabled);
  
  const agentStore = useShaylaAgentStore((s) => s);

  // Layout UI Store settings
  const {
    shaylaChatHeight,
    shaylaRightPanelWidth,
    shaylaRightPanelCollapsed,
    shaylaAgentNotificationsCollapsed,
    shaylaQuickActionsCollapsed,
    setShaylaChatHeight,
    setShaylaRightPanelWidth,
    toggleShaylaRightPanel,
    toggleShaylaAgentNotifications,
    toggleShaylaQuickActions,
    resetShaylaLayout
  } = useUIStore();

  const [input, setInput] = useState('');
  const [attachedFile, setAttachedFile] = useState<{ name: string; type: string; content: string } | null>(null);
  const [fileParsing, setFileParsing] = useState(false);
  const [fileParsingStatus, setFileParsingStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [aiStatus, setAiStatus] = useState<{ backendOnline: boolean; groqConfigured: boolean; model: string; streamingSupported: boolean } | null>(null);
  
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sendLockRef = useRef(false);
  const quickActionLockRef = useRef(0);
  const looksLikeLocalOllamaModel = /^(qwen|gemma|llama|deepseek|mistral|phi)/i.test(activeModel);

  const [searchText, setSearchText] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [shaylaVoiceName, setShaylaVoiceName] = useState('Browser default voice');

  const speakText = (text: string) => {
    setShaylaVoiceName(speakShaylaText(text));
  };

  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const updateVoiceName = () => setShaylaVoiceName(getShaylaVoiceName());
    updateVoiceName();
    window.speechSynthesis.addEventListener?.('voiceschanged', updateVoiceName);
    return () => window.speechSynthesis.removeEventListener?.('voiceschanged', updateVoiceName);
  }, []);

  const visibleMessages = useMemo(() => {
    if (!searchText) return messages;
    return messages.filter(
      (m) =>
        m.content?.toLowerCase().includes(searchText.toLowerCase()) ||
        m.prompt?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [messages, searchText]);

  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);
  const [showDevTools, setShowDevTools] = useState(import.meta.env.DEV);
  const [morningBriefing, setMorningBriefing] = useState<ShaylaBriefingResult | null>(null);
  const [eveningReview, setEveningReview] = useState<ShaylaBriefingResult | null>(null);
  const [notifications, setNotifications] = useState<ShaylaSmartNotification[]>([]);
  const [agentLoading, setAgentLoading] = useState(false);
  const [commandDraft, setCommandDraft] = useState('');
  const [pendingCommand, setPendingCommand] = useState<ParsedCommand | null>(null);
  const [commandFeedback, setCommandFeedback] = useState<string | null>(null);

  // Accordion collapsible states
  const [widgetsExpanded, setWidgetsExpanded] = useState<Record<string, boolean>>({
    trackerContext: true,
    aiModel: true,
    agentMode: true,
    operatingPartner: true,
    commandPreview: true,
    germanGoal: false,
    memory: false
  });

  const toggleWidget = (wKey: string) => {
    setWidgetsExpanded(prev => ({ ...prev, [wKey]: !prev[wKey] }));
  };

  const providerModels: Record<AIProviderName, string[]> = {
    groq: [
      'openai/gpt-oss-20b',
      'openai/gpt-oss-120b',
      'llama-3.1-8b-instant',
      'llama-3.3-70b-versatile'
    ],
    ollama: [
      'qwen2.5-coder:latest',
      'qwen2.5-coder:7b',
      'gemma4:e4b',
      'deepseek-r1',
      'llama3',
      'mistral',
      'gemma'
    ],
    openrouter: [
      'qwen/qwen-2.5-coder-32b-instruct',
      'deepseek/deepseek-r1',
      'anthropic/claude-3.5-sonnet',
      'google/gemini-pro',
      'meta-llama/llama-3.1-70b-instruct'
    ],
    openai: [
      'gpt-4.1',
      'gpt-4.1-mini',
      'gpt-4o-mini'
    ],
    anthropic: [
      'claude-3.5-sonnet',
      'claude-3-haiku'
    ],
    gemini: [
      'gemini-1.5-pro',
      'gemini-1.5-flash'
    ],
    lmstudio: [
      'local-model'
    ]
  };

  const quickChips = [
    { label: 'Explain today\'s DSA pattern', emoji: '🕷️' },
    { label: 'Give me a hint only', emoji: '💡' },
    { label: 'Review my progress honestly', emoji: '🦇' },
    { label: 'German phrase for today', emoji: '🇩🇪' },
    { label: 'Roast my excuses professionally', emoji: '🃏' },
    { label: 'Review my resume readiness', emoji: '📄' },
  ];

  const ctx = useMemo(() => buildAIContext(careerState), [careerState]);

  const contextLength = useMemo(() => {
    return messages.reduce((acc, m) => acc + (m.content?.length || 0), 0);
  }, [messages]);

  const contextTokens = useMemo(() => {
    return Math.ceil(contextLength / 4);
  }, [contextLength]);

  const scrollToBottom = (force = false) => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const nearBottom = scrollHeight - scrollTop - clientHeight < 150;
      if (force || nearBottom) {
        chatContainerRef.current.scrollTo({
          top: scrollHeight,
          behavior: force ? 'smooth' : 'auto'
        });
      }
    }
  };

  // Joker chaos canvas ambient background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;
    let w = (canvas.width = canvas.offsetWidth);
    let h = (canvas.height = canvas.offsetHeight);
    const onResize = () => { if (!canvas) return; w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight; };
    window.addEventListener('resize', onResize);

    // Joker-palette particles: purple, green, white
    const jokerColors = ['#a855f7', '#22c55e', '#ffffff', '#ec4899', '#a855f7'];
    const particles = Array.from({ length: 35 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.18, vy: -0.15 - Math.random() * 0.3,
      size: Math.random() * 1.5 + 0.4,
      color: jokerColors[Math.floor(Math.random() * jokerColors.length)],
      alpha: Math.random() * 0.1 + 0.02,
      suit: ['♦', '♣', '♠', '♥'][Math.floor(Math.random() * 4)],
      isCard: Math.random() > 0.85,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.02
    }));

    const render = () => {
      ctx.clearRect(0, 0, w, h);

      // Diagonal chaos lines (very faint)
      ctx.strokeStyle = 'rgba(168,85,247,0.015)';
      ctx.lineWidth = 1;
      for (let i = -h; i < w + h; i += 48) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + h, h); ctx.stroke();
      }

      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.rotation += p.rotSpeed;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < 0 || p.x > w) p.vx = -p.vx;

        if (p.isCard) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.globalAlpha = p.alpha * 1.5;
          ctx.font = `${8 + p.size * 3}px serif`;
          ctx.fillStyle = p.color;
          ctx.fillText(p.suit, 0, 0);
          ctx.restore();
        } else {
          ctx.globalAlpha = p.alpha;
          ctx.shadowBlur = 4; ctx.shadowColor = p.color;
          ctx.fillStyle = p.color;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(render);
    };
    render();
    return () => { window.removeEventListener('resize', onResize); cancelAnimationFrame(animId); };
  }, []);


  const triggerDynamicGreeting = async () => {
    if (isThinking || sendLockRef.current) return;
    sendLockRef.current = true;
    setThinking(true);

    const assistantMsgId = 'shayla-intro';
    updateMessage(assistantMsgId, {
      content: '',
      status: 'streaming'
    });

    const greetingSystemInstruction = `Write a personalized, tracker-aware welcome message for Sanju K in your signature German-English bestie style. 
Look at his real-time tracker context:
- Today is Day ${ctx.currentDay || 1}/180
- Current Streak: ${ctx.currentStreak || 0} days
- LeetCode Solved: ${ctx.leetcodeSolved || 0}/360
- German XP: ${ctx.germanXP || 0}
- Current German Level: ${ctx.germanLevel || 'A1 Beginner'}
- Completed Tasks Today: ${ctx.completedTasks?.length || 0}
- Remaining Tasks: ${ctx.missedTasks?.length || 0}

Acknowledge his consistency and then ask 1 or 2 warm, personal questions to check in on his feelings, emotional state, energy levels, and today's study mood. Do not list raw data dryly, blend it into a cozy greeting. Keep it concise.`;

    const outboundMessages: AIMessage[] = [
      {
        role: 'user',
        content: greetingSystemInstruction
      }
    ];

    const startTime = Date.now();
    try {
      if (streamingEnabled) {
        let streamingReply = '';
        try {
          await aiService.sendMessageStream(
            outboundMessages,
            ctx,
            (token) => {
              streamingReply += token;
              updateMessage(assistantMsgId, {
                content: streamingReply,
                status: 'streaming'
              });
            }
          );
          setLatencyMs(Date.now() - startTime);
          updateMessage(assistantMsgId, {
            content: streamingReply,
            status: 'complete'
          });
          if (voiceEnabled) speakText(streamingReply);
        } catch (streamError) {
          const response = await aiService.sendMessage(outboundMessages, ctx);
          setLatencyMs(Date.now() - startTime);
          updateMessage(assistantMsgId, {
            content: response.reply,
            status: 'complete'
          });
          if (voiceEnabled) speakText(response.reply);
        }
      } else {
        const response = await aiService.sendMessage(outboundMessages, ctx);
        setLatencyMs(Date.now() - startTime);
        updateMessage(assistantMsgId, {
          content: response.reply,
          status: 'complete'
        });
        if (voiceEnabled) speakText(response.reply);
      }
    } catch (error) {
      console.error('Failed to generate dynamic greeting:', error);
      const defaultText = "Hallo Sanju! Ich bin Shayla. Your tracker is loaded and ready. Wie geht es dir heute? (How are you doing today?) Ready to crush some Java DSA and German?";
      updateMessage(assistantMsgId, {
        content: defaultText,
        status: 'complete'
      });
      if (voiceEnabled) speakText(defaultText);
    } finally {
      setThinking(false);
      sendLockRef.current = false;
    }
  };

  useEffect(() => {
    if (messages.length === 1 && messages[0].id === 'shayla-intro' && messages[0].content.startsWith('Hallo Sanju, ich bin Shayla - your German learning companion')) {
      const timer = setTimeout(() => {
        triggerDynamicGreeting();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  useEffect(() => {
    // Generate a fresh session check-in from Shayla on mount if the last message isn't a pending/streaming one
    const checkAndTriggerGreeting = async () => {
      // If we have history, check if we need a fresh greeting
      if (messages.length > 1) {
        const lastMsg = messages[messages.length - 1];
        const isLastFromUser = lastMsg.role === 'user';
        
        // Trigger a fresh context check-in if last message is from user, or if last activity was > 2 hours ago
        const lastTime = lastMsg.createdAt ? new Date(lastMsg.createdAt).getTime() : 0;
        const timeElapsed = Date.now() - lastTime;
        
        if (isLastFromUser || timeElapsed > 1000 * 60 * 60 * 2) {
          const newMsgId = `shayla-checkin-${Date.now()}`;
          addMessage({
            id: newMsgId,
            role: 'assistant',
            content: 'Thinking...',
            status: 'streaming',
            createdAt: new Date().toISOString()
          });
          
          setThinking(true);
          
          const checkinInstruction = `Hi there! Write a short, personalized, tracker-aware check-in message for Sanju K.
Context:
- Today is Day ${ctx.currentDay || 1}/180
- Current Streak: ${ctx.currentStreak || 0} days
- LeetCode Solved: ${ctx.leetcodeSolved || 0}/360
- German XP: ${ctx.germanXP || 0}
- Current German Level: ${ctx.germanLevel || 'A1 Beginner'}
- Completed Tasks Today: ${ctx.completedTasks?.length || 0}

Ask him 1-2 personalized questions about his progress today, how he is feeling, or how his energy levels are. Keep it short, encouraging, and write in your signature German-English bestie style.`;

          try {
            const outbound = [{ role: 'user' as const, content: checkinInstruction }];
            let reply = '';
            if (streamingEnabled) {
              await aiService.sendMessageStream(outbound, ctx, (token) => {
                reply += token;
                updateMessage(newMsgId, { content: reply, status: 'streaming' });
              });
              updateMessage(newMsgId, { content: reply, status: 'complete' });
              if (voiceEnabled) speakText(reply);
            } else {
              const res = await aiService.sendMessage(outbound, ctx);
              updateMessage(newMsgId, { content: res.reply, status: 'complete' });
              if (voiceEnabled) speakText(res.reply);
            }
          } catch (e) {
            const fallbackCheckin = "Hallo Sanju! Hope you're having an awesome day. How are you feeling today? Ready to complete today's goals?";
            updateMessage(newMsgId, {
              content: fallbackCheckin,
              status: 'complete'
            });
            if (voiceEnabled) speakText(fallbackCheckin);
          } finally {
            setThinking(false);
          }
        }
      }
    };
    
    const timer = setTimeout(() => {
      checkAndTriggerGreeting();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Scroll detection
  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const nearBottom = scrollHeight - scrollTop - clientHeight < 150;
      setShowScrollBottomBtn(!nearBottom && scrollHeight > clientHeight);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  useEffect(() => {
    let mounted = true;
    aiService.getStatus()
      .then((status) => {
        if (mounted) setAiStatus(status);
      })
      .catch(() => {
        if (mounted) {
          setAiStatus({
            backendOnline: false,
            groqConfigured: false,
            model: 'unknown',
            streamingSupported: false
          });
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const rawNotifications = buildSmartNotifications(buildAgentContext(careerState));
    const activeNotifications = rawNotifications.filter(
      (n) => !agentStore.dismissedNotifications.includes(n.id)
    );
    setNotifications(activeNotifications);
  }, [careerState, agentStore.dismissedNotifications]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileParsing(true);
    setFileParsingStatus('Reading file properties...');

    try {
      const extension = file.name.split('.').pop()?.toLowerCase();
      
      if (extension === 'pdf') {
        setFileParsingStatus('Extracting text from PDF pages...');
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        let text = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
          setFileParsingStatus(`Extracting PDF text (page ${i}/${pdf.numPages})...`);
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          text += pageText + '\n';
        }
        
        setAttachedFile({
          name: file.name,
          type: 'pdf',
          content: text.trim()
        });
      } else if (['png', 'jpg', 'jpeg', 'webp'].includes(extension || '')) {
        setFileParsingStatus('Running local OCR text extraction...');
        const result = await Tesseract.recognize(file, 'eng');
        const text = result.data.text || '';
        
        setAttachedFile({
          name: file.name,
          type: 'image',
          content: text.trim()
        });
      } else {
        // Treat as plain text (.txt, .md, .js, .json etc.)
        setFileParsingStatus('Reading plain text file...');
        const text = await file.text();
        setAttachedFile({
          name: file.name,
          type: 'text',
          content: text.trim()
        });
      }
    } catch (err: any) {
      console.error('File parsing error:', err);
      alert(`Failed to load file: ${err?.message || 'Unknown parsing issue'}`);
    } finally {
      setFileParsing(false);
      setFileParsingStatus('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachedFile = () => {
    setAttachedFile(null);
  };

  const handleSend = async (text: string) => {
    const prompt = text.trim();
    if ((!prompt && !attachedFile) || isThinking || sendLockRef.current) return;

    sendLockRef.current = true;

    let finalPrompt = prompt;
    if (attachedFile) {
      finalPrompt = `[Document Attachment: ${attachedFile.name}]\n-------------------------------------\n${attachedFile.content}\n-------------------------------------\nUser Message: ${prompt || 'Please analyze this attached file.'}`;
    }

    const userMsg: AIMessage = {
      id: createId('user'),
      role: 'user',
      content: finalPrompt,
      status: 'sent',
      createdAt: new Date().toISOString()
    };
    const assistantMsgId = createId('assistant');
    const outboundMessages = [...useAIStore.getState().messages.filter((message) => message.status !== 'failed' && message.status !== 'streaming'), userMsg];

    addMessage(userMsg);
    addMessage({
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      status: 'streaming',
      prompt: prompt || 'Analyze attached file',
      createdAt: new Date().toISOString()
    });
    setThinking(true);
    setInput('');
    setAttachedFile(null);
    if (inputRef.current) {
      inputRef.current.style.height = '48px'; // Reset composer height
    }
    
    // Force scroll to bottom for the new message
    setTimeout(() => scrollToBottom(true), 50);

    const startTime = Date.now();
    try {
      if (streamingEnabled) {
        let streamingReply = '';
        try {
          await aiService.sendMessageStream(
            outboundMessages,
            ctx,
            (token) => {
              streamingReply += token;
              updateMessage(assistantMsgId, {
                content: streamingReply,
                status: 'streaming'
              });
            }
          );
          setLatencyMs(Date.now() - startTime);
          updateMessage(assistantMsgId, {
            content: streamingReply,
            status: 'complete'
          });
          if (voiceEnabled) speakText(streamingReply);
        } catch (streamError) {
          if (streamError instanceof ApiError && (streamError.code === 'groq_rate_limited' || streamError.code === 'ai_rate_limited' || streamError.code === 'provider_rate_limited' || streamError.status === 429)) {
            const errorContent = 'Groq is rate-limited right now. Wait 1-2 minutes or switch to a lighter model.';
            updateMessage(assistantMsgId, {
              content: errorContent,
              status: 'failed',
              error: errorContent
            });
            setThinking(false);
            sendLockRef.current = false;
            return;
          }

          // Fallback to standard chat on other streaming failures
          const response = await aiService.sendMessage(outboundMessages, ctx);
          setLatencyMs(Date.now() - startTime);
          updateMessage(assistantMsgId, {
            content: response.reply,
            status: 'complete'
          });
          if (voiceEnabled) speakText(response.reply);
        }
      } else {
        const response = await aiService.sendMessage(outboundMessages, ctx);
        setLatencyMs(Date.now() - startTime);
        updateMessage(assistantMsgId, {
          content: response.reply,
          status: 'complete'
        });
        if (voiceEnabled) speakText(response.reply);
      }
    } catch (fallbackError: any) {
      const errorContent = fallbackError instanceof ApiError && (fallbackError.code === 'groq_rate_limited' || fallbackError.code === 'ai_rate_limited' || fallbackError.code === 'provider_rate_limited')
        ? 'Groq is rate-limited right now. Wait 1-2 minutes or switch to a lighter model.'
        : fallbackError instanceof ApiError && fallbackError.code === 'ai_payload_too_large'
          ? 'This chat thread is too long. Start a new chat or clear history.'
          : fallbackError instanceof ApiError
            ? fallbackError.message
            : fallbackError?.message || 'Shayla backend is not reachable.';
      
      updateMessage(assistantMsgId, {
        content: errorContent,
        status: 'failed',
        error: errorContent
      });
    } finally {
      setThinking(false);
      sendLockRef.current = false;
    }
  };

  const handleQuickChip = (chip: string) => {
    if (isThinking || sendLockRef.current) return;
    const now = Date.now();
    if (now - quickActionLockRef.current < 300) return;
    quickActionLockRef.current = now;
    setInput(chip);
    inputRef.current?.focus();
    if (inputRef.current) {
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 180)}px`;
    }
  };

  const handleRetry = (message: AIMessage) => {
    if (message.prompt) {
      handleSend(message.prompt);
      return;
    }
    if (message.content) {
      setInput(message.content);
      inputRef.current?.focus();
    }
  };

  const handleEdit = (message: AIMessage) => {
    const draft = message.prompt || message.content || '';
    setInput(draft);
    inputRef.current?.focus();
  };

  useEffect(() => {
    const pending = consumePendingPrompt();
    if (pending) {
      setInput('');
      handleSend(pending);
    }
  }, [consumePendingPrompt]);

  const generateAgentBriefing = async (kind: 'morning' | 'recovery' | 'evening') => {
    setAgentLoading(true);
    try {
      const snapshot = buildAgentContext(careerState);
      const aiBody = {
        provider: activeProvider,
        model: activeModel,
        mode: activeMode,
        streaming: aiStatus?.streamingSupported ?? true,
      };

      if (kind === 'evening') {
        const result = await generateEveningReview(snapshot, aiBody);
        setEveningReview(result);
        agentStore.recordEveningReview({
          id: `review-${Date.now()}`,
          kind: 'evening',
          title: result.title,
          summary: result.summary,
          generatedAt: result.generatedAt,
          fallbackUsed: result.fallbackUsed,
        });
        return;
      }

      const result = await generateDailyBriefing(kind, snapshot, aiBody);
      setMorningBriefing(result);
      agentStore.recordBriefing({
        id: `briefing-${Date.now()}`,
        kind,
        title: result.title,
        summary: result.summary,
        generatedAt: result.generatedAt,
        fallbackUsed: result.fallbackUsed,
      });
    } finally {
      setAgentLoading(false);
    }
  };

  const previewCommand = (text: string) => {
    const parsed = parseCommandOffline(text);
    setCommandDraft(text);
    setPendingCommand(parsed);
    setCommandFeedback(parsed ? 'Preview ready. Review the action before applying.' : 'No safe tracker command found. Try: Add TCS application, Log 45 minutes German, or Create a 2-hour low-energy plan.');
  };

  const applyPendingCommand = () => {
    if (!pendingCommand) return;
    const success = executeCommand(pendingCommand);
    setCommandFeedback(success ? `Applied: ${pendingCommand.summary}` : 'Could not apply this command. No tracker data was changed.');
    if (success) {
      setPendingCommand(null);
      setCommandDraft('');
    }
  };

  const cancelPendingCommand = () => {
    setPendingCommand(null);
    setCommandFeedback('Cancelled. No tracker data was changed.');
  };

  const loadPartnerPrompt = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
    if (inputRef.current) {
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 180)}px`;
    }
  };

  const operatingPartnerActions = [
    { title: 'What should I do now?', detail: 'Turn current progress into one next move.', action: () => previewCommand('what should I do now') },
    { title: 'Weekly career review', detail: 'Build a week-level reflection and priority reset.', action: () => previewCommand('generate weekly review') },
    { title: 'Burnout warning', detail: 'Check missed work, load, recovery, and consistency risk.', action: () => loadPartnerPrompt('Check my burnout risk from my tracker data. Tell me what to reduce, what to keep, and whether I should switch to a recovery day.') },
    { title: 'Placement readiness coaching', detail: 'Coach DSA, CS core, aptitude, resume, projects, and communication.', action: () => loadPartnerPrompt('Coach my placement readiness. Break down DSA, CS core, aptitude, resume, projects, communication, and application momentum. Give me the next 3 actions.') },
    { title: 'Resume/project review', detail: 'Use chat plus attachments for resume and project feedback.', action: () => loadPartnerPrompt('Review my resume or project explanation for recruiter impact. Give specific fixes and stronger bullet versions.') },
    { title: 'German speaking prompts', detail: 'Practice interview-safe German speaking reps.', action: () => loadPartnerPrompt('Give me 5 German speaking prompts for a software placement interview. Include short model answers at my current level.') },
  ];

  const commandSamples = [
    'Add TCS application',
    'Mark arrays completed',
    'Create a 2-hour low-energy plan',
    'Log 45 minutes German',
  ];

  // Resize dragging mechanics
  const [draggingWidth, setDraggingWidth] = useState(false);
  const [draggingHeight, setDraggingHeight] = useState(false);
  
  const resizeStartRef = useRef<{ x: number; y: number; startW: number; startH: number } | null>(null);

  const startWidthResize = (e: React.MouseEvent) => {
    e.preventDefault();
    resizeStartRef.current = { x: e.clientX, y: e.clientY, startW: shaylaRightPanelWidth, startH: shaylaChatHeight };
    setDraggingWidth(true);
  };


  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggingWidth && resizeStartRef.current) {
        const deltaX = resizeStartRef.current.x - e.clientX;
        // Clamp between 260px and 600px
        const newW = Math.min(600, Math.max(260, resizeStartRef.current.startW + deltaX));
        setShaylaRightPanelWidth(newW);
      }
    };

    const handleMouseUp = () => {
      setDraggingWidth(false);
      setDraggingHeight(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    if (draggingWidth || draggingHeight) {
      document.body.style.cursor = draggingWidth ? 'col-resize' : 'ns-resize';
      document.body.style.userSelect = 'none';
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingWidth, draggingHeight, setShaylaRightPanelWidth, setShaylaChatHeight]);

  return (
    <div className="fade-in flex flex-col gap-2 relative z-10" style={{ height: '100%', minHeight: 0 }}>
      <MobileShaylaDock />
      <SectionHeader
        title="Shayla AI Mentor"
        subtitle="German learning companion - Java DSA guide - resume reviewer - project coach - daily accountability partner"
        actions={
          <div className="flex items-center gap-1.5">
            <Button onClick={toggleShaylaRightPanel} variant="ghost" className="rounded-xl p-2 text-textMuted" title="Toggle Right Dashboard">
              {shaylaRightPanelCollapsed ? <PanelRight className="h-4 w-4" /> : <PanelRightClose className="h-4 w-4" />}
            </Button>
            <Button onClick={resetShaylaLayout} variant="ghost" className="rounded-xl py-1 text-xs h-[28px] text-textMuted" title="Reset Layout Sizes">
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        }
      />

      {/* Main Workspace Frame — fixed calculated height so it always fills the screen */}
      <div className="flex items-stretch w-full" style={{ flex: 1, gap: 0, height: 0, minHeight: 'calc(100vh - 190px)' }}>
        
        {/* LEFT PANEL: Chat Workspace — fills flex */}
        <Card 
          className="shayla-chat-card flex flex-col overflow-hidden relative z-10"
          style={{ flex: 1, minWidth: 0, minHeight: 0, border: '1px solid rgba(168,85,247,0.15)', background: 'rgba(5,0,12,0.85)' }}
        >
          {/* Joker chaos canvas background */}
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-40" />

          {/* ── CINEMATIC CHAT HEADER ── */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b p-4 shrink-0" style={{ borderColor: 'rgba(168,85,247,0.15)', background: 'linear-gradient(135deg, rgba(30,5,45,0.9) 0%, rgba(5,15,30,0.9) 60%, rgba(0,10,5,0.9) 100%)' }}>
            {/* Joker watermark */}
            <div className="absolute top-1 right-16 text-[48px] opacity-[0.04] pointer-events-none select-none">🃏</div>
            {/* Scanline overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0) 50%, rgba(0,0,0,0.15) 50%)', backgroundSize: '100% 4px' }} />

            <div className="flex flex-wrap items-center gap-3 relative z-10">
              {/* Shayla avatar ring */}
              <div className="relative shrink-0 hidden sm:flex">
                <div className="h-9 w-9 rounded-full flex items-center justify-center text-lg" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.3), rgba(34,197,94,0.2))', border: '1px solid rgba(168,85,247,0.4)', boxShadow: '0 0 16px rgba(168,85,247,0.3)' }}>
                  ✨
                </div>
                <div className="absolute inset-0 rounded-full border border-purple-400/25 animate-ping" style={{ animationDuration: '3s' }} />
              </div>

              {/* Title */}
              <div>
                <span className="text-[8px] font-black uppercase tracking-[0.3em] font-mono block" style={{ color: 'rgba(168,85,247,0.6)' }}>Neural Command · AI Mentor</span>
                <h1 className="text-sm font-black tracking-tight" style={{ background: 'linear-gradient(120deg, #fff 30%, #a855f7 60%, #22c55e 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  SHAYLA AI NEURAL CORE
                </h1>
              </div>

              {/* Provider badge */}
              <span className="text-[8px] px-2 py-0.5 rounded-full font-black font-mono uppercase tracking-wider" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', color: '#a855f7' }}>
                🃏 {activeMode} · {activeProvider}
              </span>

              {/* Provider/Model/Mode selects */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold mb-0.5 uppercase" style={{ color: 'rgba(168,85,247,0.6)' }}>Mode</span>
                  <select value={activeMode} onChange={(e) => setMode(e.target.value as any)} className="rounded-lg border px-2.5 py-1 text-xs text-white focus:outline-none" style={{ borderColor: 'rgba(168,85,247,0.2)', background: 'rgba(15,5,25,0.8)' }}>
                    <option value="Daily Coach">Daily Coach</option>
                    <option value="Deep Thinking">Deep Thinking</option>
                    <option value="German Tutor">German Tutor</option>
                    <option value="Java DSA Mentor">Java DSA Mentor</option>
                    <option value="Resume Reviewer">Resume Reviewer</option>
                    <option value="Project Coach">Project Coach</option>
                    <option value="Fast Mode">Fast Mode</option>
                    <option value="Offline Local Mode">Offline Local Mode</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold mb-0.5 uppercase" style={{ color: 'rgba(168,85,247,0.6)' }}>Provider</span>
                  <select value={activeProvider} onChange={(e) => setProvider(e.target.value as any)} className="rounded-lg border px-2.5 py-1 text-xs text-white focus:outline-none" style={{ borderColor: 'rgba(168,85,247,0.2)', background: 'rgba(15,5,25,0.8)' }}>
                    <option value="groq">Groq</option>
                    <option value="openrouter">OpenRouter</option>
                    <option value="ollama">Ollama</option>
                    <option value="lmstudio">LM Studio</option>
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="gemini">Gemini</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold mb-0.5 uppercase" style={{ color: 'rgba(168,85,247,0.6)' }}>Model</span>
                  <select value={activeModel} onChange={(e) => setModel(e.target.value)} className="rounded-lg border px-2.5 py-1 text-xs text-white focus:outline-none min-w-[120px]" style={{ borderColor: 'rgba(168,85,247,0.2)', background: 'rgba(15,5,25,0.8)' }}>
                    {(providerModels[activeProvider] || []).map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold mb-0.5 uppercase" style={{ color: 'rgba(168,85,247,0.6)' }}>Language</span>
                  <select 
                    value={activeLanguage} 
                    onChange={(e) => setLanguage(e.target.value)} 
                    className="rounded-lg border px-2.5 py-1 text-xs text-white focus:outline-none min-w-[130px]" 
                    style={{ borderColor: 'rgba(168,85,247,0.4)', background: 'rgba(25,10,35,0.9)' }}
                    title="Shayla responds strictly in this language"
                  >
                    <option value="English">🇺🇸 English</option>
                    <option value="Tamil">🇮🇳 தமிழ் (Tamil)</option>
                    <option value="German">🇩🇪 Deutsch (German)</option>
                    <option value="Hindi">🇮🇳 हिन्दी (Hindi)</option>
                    <option value="French">🇫🇷 Français (French)</option>
                    <option value="Spanish">🇪🇸 Español (Spanish)</option>
                    <option value="Telugu">🇮🇳 తెలుగు (Telugu)</option>
                    <option value="Malayalam">🇮🇳 മലയാളം (Malayalam)</option>
                    <option value="Kannada">🇮🇳 ಕನ್ನಡ (Kannada)</option>
                    <option value="Japanese">🇯🇵 日本語 (Japanese)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1.5 relative z-10">
              <Button onClick={toggleShaylaRightPanel} variant="ghost" className="rounded-xl p-2" title="Toggle Right Dashboard" style={{ color: 'rgba(168,85,247,0.7)' }}>
                {shaylaRightPanelCollapsed ? <PanelRight className="h-4 w-4" /> : <PanelRightClose className="h-4 w-4" />}
              </Button>
              <Button onClick={() => { clearChat(); setInput(''); inputRef.current?.focus(); }} variant="primary" className="rounded-xl py-1 text-xs h-[28px]" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.3), rgba(34,197,94,0.2))', border: '1px solid rgba(168,85,247,0.3)' }}>
                New Chat
              </Button>
              <Button onClick={() => clearChat()} variant="outline" className="rounded-xl py-1 text-xs h-[28px]" style={{ borderColor: 'rgba(168,85,247,0.2)', color: 'rgba(168,85,247,0.7)' }}>
                Clear
              </Button>
            </div>
          </div>

          {/* ── STATUS BAR ── */}
          <div className="relative z-10 flex flex-wrap items-center gap-3 px-4 py-2 border-b shrink-0 font-mono" style={{ borderColor: 'rgba(168,85,247,0.1)', background: 'rgba(10,0,20,0.5)' }}>
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${aiStatus?.backendOnline ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-700/30' : 'text-orange-400 bg-orange-950/40 border border-orange-700/30'}`}>
              {aiStatus?.backendOnline ? '●' : '○'} Backend {aiStatus?.backendOnline ? 'online' : 'offline'}
            </span>
            <span className="text-[9px] text-white/20">•</span>
            <span className="text-[9px] text-white/30">✨ {contextTokens.toLocaleString()} tokens</span>
            <span className="text-[9px] text-white/20">•</span>
            <span className="text-[9px] text-white/30">{latencyMs !== null ? `⚡ ${latencyMs}ms` : '⚡ N/A'}</span>
            <span className="text-[9px] text-white/20">•</span>
            
            {/* Search past messages input */}
            <div className="relative flex items-center shrink-0">
              <input
                type="text"
                placeholder="Search history..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="rounded border border-purple-500/20 bg-black/40 px-2.5 py-0.5 text-[9px] text-white focus:outline-none focus:border-purple-500/50 w-28 md:w-36 transition-all"
              />
              {searchText && (
                <button
                  onClick={() => setSearchText('')}
                  className="absolute right-1.5 text-white/40 hover:text-white text-[9px] font-bold"
                >
                  ×
                </button>
              )}
            </div>

            {/* Voice toggle button */}
            <button
              onClick={() => {
                setVoiceEnabled(!voiceEnabled);
                if (!voiceEnabled && 'speechSynthesis' in window) {
                  setShaylaVoiceName(speakShaylaText("Shayla voice mode activated. I'm here with you."));
                }
              }}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-black tracking-wider uppercase transition border ${
                voiceEnabled
                  ? 'bg-purple-950/30 border-purple-500/40 text-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.15)] animate-pulse'
                  : 'bg-white/5 border-white/5 text-white/40 hover:text-white hover:bg-white/10'
              }`}
              title="Toggle automatic voice read out"
            >
              🔊 {voiceEnabled ? 'Voice ON' : 'Voice OFF'}
            </button>
            {voiceEnabled && (
              <span className="text-[8px] text-purple-300/60 max-w-[140px] truncate" title={shaylaVoiceName}>
                Shayla voice: {shaylaVoiceName}
              </span>
            )}

            <div className="ml-auto flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={toggleShaylaQuickActions} className="h-5 px-2 py-0 text-[8px] tracking-wider rounded" style={{ background: 'rgba(168,85,247,0.08)', color: 'rgba(168,85,247,0.6)', border: '1px solid rgba(168,85,247,0.15)' }}>
                {shaylaQuickActionsCollapsed ? '🃏 Show Chips' : 'Hide Chips'}
              </Button>
            </div>
          </div>

          {activeProvider === 'ollama' && aiStatus?.backendOnline && !looksLikeLocalOllamaModel && (
            <div className="mx-4 mt-2 mb-0 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-3 text-xs text-yellow-400 shrink-0">
              Pick one of your local Ollama models.
            </div>
          )}

          {/* Quick Chips Actions */}
          {!shaylaQuickActionsCollapsed && (
            <div className="relative z-10 mx-4 mb-2 flex gap-2 overflow-x-auto border-b pb-2.5 select-none shrink-0 scrollbar-none" style={{ borderColor: 'rgba(168,85,247,0.1)' }}>
              {quickChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickChip(chip.label)}
                  disabled={isThinking}
                  className="shrink-0 whitespace-nowrap rounded-xl px-3 py-1.5 text-[10px] font-bold transition active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                  style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', color: 'rgba(200,150,255,0.85)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(168,85,247,0.18)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 10px rgba(168,85,247,0.2)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(168,85,247,0.08)'; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
                >
                  <span>{chip.emoji}</span>
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>
          )}

          {import.meta.env.DEV && (
            <div className="mx-4 mb-2 rounded-xl border border-border-subtle/50 bg-bgSurface/20 p-2 text-[10px] shrink-0 font-mono">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-accentPurple uppercase tracking-wider">DEV TOOLS</span>
                <button
                  type="button"
                  onClick={() => setShowDevTools((visible) => !visible)}
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-textSecondary transition hover:bg-white/10 hover:text-textPrimary focus:outline-none focus:ring-1 focus:ring-accentBlue"
                  aria-expanded={showDevTools}
                >
                  {showDevTools ? 'Hide Dev Tools' : 'Show Dev Tools'}
                </button>
              </div>
              {showDevTools && (
                <div className="mt-2 flex flex-wrap gap-2 items-center">
              <span className="font-bold text-accentPurple mr-2 uppercase tracking-wider">DEV TOOLS:</span>
              <button
                onClick={() => addMessage({
                  id: `user-${Date.now()}`,
                  role: 'user',
                  content: 'Test User Message',
                  createdAt: new Date().toISOString()
                })}
                className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg hover:bg-white/10 text-textPrimary transition"
              >
                Insert Test User Message
              </button>
              <button
                onClick={() => addMessage({
                  id: `msg-${Date.now()}`,
                  role: 'assistant',
                  content: 'Shayla test message visible.',
                  createdAt: new Date().toISOString()
                })}
                className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg hover:bg-white/10 text-textPrimary transition"
              >
                Insert Test Assistant Message
              </button>
              <button
                onClick={() => clearChat()}
                className="bg-red-500/10 border border-red-500/25 px-2.5 py-1 rounded-lg hover:bg-red-500/20 text-red-400 transition"
              >
                Clear Chat State
              </button>
              <button
                onClick={() => console.log('Current Messages State:', messages)}
                className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg hover:bg-white/10 text-textPrimary transition"
              >
                Print Chat State to Console
              </button>
              <button
                onClick={() => setStreamingEnabled(false)}
                className={`px-2.5 py-1 rounded-lg border transition ${
                  !streamingEnabled ? 'bg-accentBlue/20 border-accentBlue/40 text-accentBlue font-bold' : 'bg-white/5 border-white/10 text-textSecondary hover:bg-white/10'
                }`}
              >
                Toggle Streaming Off
              </button>
              <button
                onClick={() => setStreamingEnabled(true)}
                className={`px-2.5 py-1 rounded-lg border transition ${
                  streamingEnabled ? 'bg-accentBlue/20 border-accentBlue/40 text-accentBlue font-bold' : 'bg-white/5 border-white/10 text-textSecondary hover:bg-white/10'
                }`}
              >
                Toggle Streaming On
              </button>
                </div>
              )}
            </div>
          )}

          {/* Messages Listing Box (Scrollable) */}
          <div 
            ref={chatContainerRef} 
            onScroll={handleScroll}
            className="flex-1 min-h-0 overflow-y-auto scroll-smooth p-4 flex flex-col gap-[12px] select-text"
          >
            
            {messages.length <= 1 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 max-w-md mx-auto my-auto select-none relative">
                {/* Floating card suits background */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {['♦', '♣', '♠', '♥'].map((s, i) => (
                    <div key={i} className="absolute text-2xl opacity-[0.04]" style={{ left: `${20 + i * 20}%`, top: `${15 + (i % 2) * 50}%`, animation: `chaos-bounce ${2 + i * 0.5}s ease-in-out infinite`, animationDelay: `${i * 0.4}s` }}>{s}</div>
                  ))}
                </div>
                {/* Avatar ring */}
                <div className="relative mb-5">
                  <div className="h-16 w-16 rounded-full flex items-center justify-center text-2xl relative" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.25), rgba(34,197,94,0.15))', border: '1px solid rgba(168,85,247,0.4)', boxShadow: '0 0 30px rgba(168,85,247,0.25), 0 0 60px rgba(168,85,247,0.08)' }}>
                    ✨
                  </div>
                  <div className="absolute inset-0 rounded-full border-2 border-purple-400/20 animate-ping" style={{ animationDuration: '2.5s' }} />
                  <div className="absolute inset-[-6px] rounded-full border border-green-400/10 animate-ping" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }} />
                </div>
                <h4 className="font-black text-white text-sm tracking-tight">
                  <span style={{ background: 'linear-gradient(120deg, #fff, #a855f7, #22c55e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Ask Shayla anything</span>
                </h4>
                <p className="text-[10px] mt-2 leading-relaxed" style={{ color: 'rgba(180,130,255,0.5)' }}>
                  German Bestie · Joker of AI Mentors · Death Note Advisor<br />
                  <span className="opacity-60">Java DSA · German · Resume · Daily plan · Motivation</span>
                </p>
                <div className="mt-4 flex items-center gap-2 text-[8px] font-mono" style={{ color: 'rgba(168,85,247,0.4)' }}>
                  <span>🃏</span><span>Chaos Mode Active</span><span>·</span><span>🕷️</span><span>Mentor Protocol Online</span>
                </div>
              </div>
            ) : (
              visibleMessages.map((m, idx) => {
                const parsedCmd = m.role === 'user' ? parseCommandOffline(m.content) : null;
                return (
                  <div key={m.id || idx} className="flex flex-col gap-2">
                    <ChatMessage message={m} onRetry={handleRetry} onEdit={handleEdit} />
                    {parsedCmd && !(m.content || '').includes('(Command') && (
                      <div className="ml-12 p-4 rounded-xl border border-accentBlue/25 bg-accentBlue/5 flex flex-col gap-3 max-w-md animate-fadeIn">
                        <div className="flex items-center gap-2 text-accentBlue">
                          <Sparkles className="h-4 w-4 fill-current" />
                          <span className="text-xs font-bold">Approve Action Request</span>
                        </div>
                        <p className="text-xs text-textSecondary">{parsedCmd.summary}</p>
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-[10px] rounded-lg"
                            onClick={() => {
                              if (!m.id) return;
                              updateMessage(m.id, { content: `${m.content || ''} (Command cancelled)` });
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            variant="primary"
                            className="h-8 text-[10px] rounded-lg bg-accentBlue text-white hover:bg-accentBlue/90"
                            onClick={() => {
                              const success = executeCommand(parsedCmd);
                              if (success && m.id) {
                                updateMessage(m.id, { content: `${m.content || ''} (Command applied successfully! ✓)` });
                              }
                            }}
                          >
                            Approve
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {isThinking && !messages.some(m => m.status === 'streaming' || m.status === 'sending') && (
              <div className="mt-3 flex w-full justify-start animate-fadeIn">
                <div className="flex items-end gap-2.5 max-w-[80%]">
                  {/* Shayla avatar */}
                  <div className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-sm"
                    style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.3), rgba(34,197,94,0.2))', border: '1px solid rgba(168,85,247,0.4)', boxShadow: '0 0 10px rgba(168,85,247,0.25)' }}>
                    ✨
                  </div>
                  {/* Typing bubble */}
                  <div className="rounded-2xl rounded-bl-none px-4 py-3 flex flex-col gap-2"
                    style={{ background: 'linear-gradient(135deg, rgba(30,5,45,0.9), rgba(5,15,10,0.9))', border: '1px solid rgba(168,85,247,0.25)', boxShadow: '0 0 16px rgba(168,85,247,0.15)' }}>
                    <span className="text-[8px] font-black uppercase tracking-[0.25em] font-mono" style={{ color: 'rgba(168,85,247,0.7)' }}>
                      🃏 Shayla is crafting her response...
                    </span>
                    {/* Animated dots */}
                    <div className="flex items-center gap-2">
                      {['#a855f7', '#22c55e', '#a855f7', '#ec4899', '#a855f7'].map((color, i) => (
                        <span key={i} className="h-2 w-2 rounded-full animate-bounce" style={{ background: color, animationDelay: `${i * 0.12}s`, boxShadow: `0 0 5px ${color}` }} />
                      ))}
                    </div>
                    {/* Rotating Joker taglines */}
                    <span className="text-[8px] font-mono italic" style={{ color: 'rgba(168,85,247,0.4)' }}>
                      "Why so serious about your career? Let's plan it..."
                    </span>
                  </div>
                </div>
              </div>
            )}


          </div>

          {/* Scroll to bottom floating indicator */}
          {showScrollBottomBtn && (
            <button
              onClick={() => scrollToBottom(true)}
              className="absolute bottom-[112px] right-6 bg-bgSurface/90 border border-border-subtle px-3 py-1.5 rounded-full text-[10px] font-bold text-textPrimary flex items-center gap-1 hover:bg-bgSurface transition shadow-glow-blue z-20 focus:outline-none focus:ring-1 focus:ring-accentBlue"
            >
              <ArrowDown className="h-3 w-3" />
              <span>Scroll to Latest</span>
            </button>
          )}

          {/* Text Composer Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="relative z-10 mt-1 shrink-0 border-t p-4 flex flex-col gap-2"
            style={{ borderColor: 'rgba(168,85,247,0.15)', background: 'linear-gradient(135deg, rgba(15,5,25,0.95), rgba(5,10,15,0.95))' }}
          >
            {/* File attachment preview badge */}
            {attachedFile && (
              <div className="flex items-center gap-2 bg-accentBlue/10 border border-accentBlue/20 rounded-lg p-2 text-[10px] text-accentBlue self-start">
                {attachedFile.type === 'pdf' ? (
                  <FileText className="h-3 w-3" />
                ) : attachedFile.type === 'image' ? (
                  <ImageIcon className="h-3.5 w-3.5" />
                ) : (
                  <FileText className="h-3 w-3" />
                )}
                <span className="font-semibold truncate max-w-[180px]">{attachedFile.name}</span>
                <span className="opacity-60">({attachedFile.content.length} chars)</span>
                <button
                  type="button"
                  onClick={removeAttachedFile}
                  className="hover:text-red-400 p-0.5 ml-1"
                  title="Remove attachment"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* File parsing indicator */}
            {fileParsing && (
              <div className="flex items-center gap-2 text-[10px] text-textMuted self-start italic">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-accentPurple" />
                <span>{fileParsingStatus}</span>
              </div>
            )}

            <div className="flex items-end gap-2 w-full">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".txt,.md,.json,.pdf,.png,.jpg,.jpeg,.webp"
              />
              <button
                type="button"
                disabled={isThinking || fileParsing}
                onClick={() => fileInputRef.current?.click()}
                className="shrink-0 rounded-xl p-3 h-[48px] w-[48px] flex items-center justify-center transition disabled:opacity-50"
                style={{ border: '1px solid rgba(168,85,247,0.2)', background: 'rgba(15,5,25,0.8)', color: 'rgba(168,85,247,0.7)' }}
                title="Attach document or image"
              >
                <Paperclip className="h-4 w-4" />
              </button>

              <textarea
                ref={inputRef}
                rows={1}
                placeholder="Ask Shayla anything — DSA, German, resume, motivation... 🕷️"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(Math.max(e.target.scrollHeight, 48), 180)}px`;
                }}
                disabled={isThinking || fileParsing}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(input);
                  }
                }}
                className="flex-1 resize-none rounded-xl px-4 py-3 text-xs text-white focus:outline-none disabled:opacity-50 min-h-[48px] max-h-[180px] overflow-y-auto"
                style={{
                  border: '1px solid rgba(168,85,247,0.2)',
                  background: 'rgba(10,2,18,0.8)',
                  backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(168,85,247,0.04) 1px, transparent 0)',
                  backgroundSize: '24px 24px',
                }}
              />
              <Button
                type="submit"
                disabled={isThinking || fileParsing || (!input.trim() && !attachedFile)}
                className="shrink-0 rounded-xl px-5 py-3 text-xs h-[48px] flex items-center justify-center font-black gap-1.5 transition"
                style={{
                  background: (!isThinking && (input.trim() || attachedFile)) ? 'linear-gradient(135deg, #7c3aed, #16a34a)' : 'rgba(50,20,60,0.5)',
                  border: '1px solid rgba(168,85,247,0.3)',
                  boxShadow: (!isThinking && (input.trim() || attachedFile)) ? '0 0 16px rgba(168,85,247,0.3)' : 'none',
                  color: 'white'
                }}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>

        </Card>

        {/* ── DRAG DIVIDER between chat and right panel ── */}
        {!shaylaRightPanelCollapsed && (
          <div
            onMouseDown={startWidthResize}
            className="hidden lg:flex shrink-0 items-center justify-center cursor-col-resize select-none group relative z-20"
            style={{ width: 14 }}
            aria-label="Drag to resize panels"
          >
            {/* Visible track */}
            <div className="w-px h-full bg-gradient-to-b from-transparent via-purple-500/30 to-transparent group-hover:via-purple-400/60 transition-all duration-200" />
            {/* Centre grip pill */}
            <div className="absolute flex flex-col gap-1 items-center" style={{ top: '50%', transform: 'translateY(-50%)' }}>
              <div className="w-1 h-6 rounded-full bg-purple-500/40 group-hover:bg-purple-400/70 group-active:bg-purple-300 transition-all duration-150" />
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400/60 group-hover:bg-purple-300 transition-all duration-150" />
              <div className="w-1 h-6 rounded-full bg-purple-500/40 group-hover:bg-purple-400/70 group-active:bg-purple-300 transition-all duration-150" />
            </div>
          </div>
        )}

        {/* RIGHT PANEL: Collapsible Widgets Dashboard */}
        {!shaylaRightPanelCollapsed ? (
          <div 
            style={{ width: shaylaRightPanelWidth, minWidth: 260, maxWidth: 600 }}
            className="hidden lg:flex flex-col gap-4 overflow-y-auto shrink-0 relative pl-2 pr-1 select-none"
          >
            {/* Widget 1: Tracker Context */}
            <Card className="border-white/5 p-4 flex flex-col gap-3">
              <div 
                onClick={() => toggleWidget('trackerContext')}
                className="flex items-center justify-between cursor-pointer group"
              >
                <span className="block text-[10px] font-bold uppercase tracking-wider text-textSecondary">
                  1. Active Tracker Context
                </span>
                {widgetsExpanded.trackerContext ? <ChevronDown className="h-4 w-4 text-textMuted" /> : <ChevronRight className="h-4 w-4 text-textMuted" />}
              </div>

              {widgetsExpanded.trackerContext && (
                <div className="flex flex-col gap-2.5 rounded-xl border border-border-subtle bg-bgSurface/40 p-3.5 text-xs text-textSecondary animate-fadeIn">
                  <div className="flex justify-between items-center border-b border-white/5 pb-1">
                    <span className="text-[9px] font-bold uppercase text-textMuted">Current day</span>
                    <span className="font-bold text-textPrimary">Day {ctx.currentDay}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-1">
                    <span className="text-[9px] font-bold uppercase text-textMuted">Topic</span>
                    <span className="font-bold text-textPrimary line-clamp-1">{ctx.currentTopic}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-1">
                    <span className="text-[9px] font-bold uppercase text-textMuted">LC solved</span>
                    <span className="font-mono font-bold text-textPrimary">{ctx.leetcodeSolved}/360</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-1">
                    <span className="text-[9px] font-bold uppercase text-textMuted">Streak</span>
                    <span className="font-mono font-bold text-accentOrange">{ctx.currentStreak} days</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-1">
                    <span className="text-[9px] font-bold uppercase text-textMuted">Resume score</span>
                    <span className="font-mono font-bold text-accentPurple">{ctx.resumeScore}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold uppercase text-textMuted">German level</span>
                    <span className="font-mono font-bold text-accentEmerald">{ctx.germanLevel}</span>
                  </div>
                </div>
              )}
            </Card>

            {/* Widget 2: AI Model Status */}
            <Card className="border-white/5 p-4 flex flex-col gap-3">
              <div 
                onClick={() => toggleWidget('aiModel')}
                className="flex items-center justify-between cursor-pointer group"
              >
                <span className="block text-[10px] font-bold uppercase tracking-wider text-textSecondary">
                  2. AI Model Status
                </span>
                {widgetsExpanded.aiModel ? <ChevronDown className="h-4 w-4 text-textMuted" /> : <ChevronRight className="h-4 w-4 text-textMuted" />}
              </div>

              {widgetsExpanded.aiModel && (
                <div className="rounded-xl border border-border-subtle bg-bgSurface/40 p-3.5 text-xs text-textSecondary flex flex-col gap-2 animate-fadeIn">
                  <div className="flex justify-between">
                    <span className="text-[9px] font-bold uppercase text-textMuted">Provider</span>
                    <span className="font-bold text-textPrimary uppercase">{activeProvider}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[9px] font-bold uppercase text-textMuted">Active Model</span>
                    <span className="font-bold text-textPrimary text-[10px] truncate max-w-[150px]">{activeModel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[9px] font-bold uppercase text-textMuted">Latency Tracker</span>
                    <span className="font-mono text-accentBlue font-bold">{useAISettingsStore.getState().usage?.averageLatency || 0}ms</span>
                  </div>
                </div>
              )}
            </Card>

            {/* Widget 3: Agent Mode */}
            <Card className="border-white/5 p-4 flex flex-col gap-3">
              <div 
                onClick={() => toggleWidget('agentMode')}
                className="flex items-center justify-between cursor-pointer group"
              >
                <span className="block text-[10px] font-bold uppercase tracking-wider text-textSecondary">
                  3. Agent Mode
                </span>
                {widgetsExpanded.agentMode ? <ChevronDown className="h-4 w-4 text-textMuted" /> : <ChevronRight className="h-4 w-4 text-textMuted" />}
              </div>

              {widgetsExpanded.agentMode && (
                <div className="rounded-xl border border-border-subtle bg-bgSurface/40 p-3.5 text-xs text-textSecondary flex flex-col gap-2.5 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase text-textMuted">Agent status</span>
                    <span className={`topbar-chip py-0 px-2 text-[10px] ${agentStore.agentModeEnabled ? 'text-accentEmerald bg-accentEmerald/10' : 'text-textMuted'}`}>
                      {agentStore.agentModeEnabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <div className="grid gap-1.5 mt-1">
                    <Button size="sm" variant="ghost" onClick={() => generateAgentBriefing('morning')} disabled={agentLoading} className="text-[10px] h-7">
                      Morning Briefing
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => generateAgentBriefing('recovery')} disabled={agentLoading} className="text-[10px] h-7">
                      Recovery Plan
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => generateAgentBriefing('evening')} disabled={agentLoading} className="text-[10px] h-7">
                      Evening Review
                    </Button>
                  </div>
                  {(morningBriefing || eveningReview) && (
                    <div className="mt-3 rounded-lg border border-border-subtle bg-white/[0.03] p-3 text-[10px] animate-fadeIn">
                      <p className="font-semibold text-textPrimary">{morningBriefing?.title || eveningReview?.title}</p>
                      <p className="mt-1 line-clamp-3 text-textMuted">{morningBriefing?.summary || eveningReview?.summary}</p>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Widget 4: Shayla Operating Partner */}
            <Card className="border-white/5 p-4 flex flex-col gap-3">
              <div 
                onClick={() => toggleWidget('operatingPartner')}
                className="flex items-center justify-between cursor-pointer group"
              >
                <span className="block text-[10px] font-bold uppercase tracking-wider text-textSecondary">
                  4. Shayla Operating Partner
                </span>
                {widgetsExpanded.operatingPartner ? <ChevronDown className="h-4 w-4 text-textMuted" /> : <ChevronRight className="h-4 w-4 text-textMuted" />}
              </div>

              {widgetsExpanded.operatingPartner && (
                <div className="rounded-xl border border-border-subtle bg-bgSurface/40 p-3.5 text-xs text-textSecondary flex flex-col gap-3 animate-fadeIn">
                  <div className="grid grid-cols-2 gap-1.5">
                    <Button size="sm" variant="ghost" onClick={() => generateAgentBriefing('morning')} disabled={agentLoading} className="text-[10px] h-8">
                      Morning
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => generateAgentBriefing('evening')} disabled={agentLoading} className="text-[10px] h-8">
                      Evening
                    </Button>
                  </div>

                  <div className="grid gap-2">
                    {operatingPartnerActions.map((item) => (
                      <button
                        key={item.title}
                        type="button"
                        onClick={item.action}
                        className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5 text-left transition hover:border-accentBlue/30 hover:bg-accentBlue/5"
                      >
                        <span className="block text-[10px] font-black text-textPrimary">{item.title}</span>
                        <span className="mt-0.5 block text-[9px] leading-snug text-textMuted">{item.detail}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Widget 5: AI Command Preview Panel */}
            <Card className="border-white/5 p-4 flex flex-col gap-3">
              <div 
                onClick={() => toggleWidget('commandPreview')}
                className="flex items-center justify-between cursor-pointer group"
              >
                <span className="block text-[10px] font-bold uppercase tracking-wider text-textSecondary">
                  5. AI Command Preview Panel
                </span>
                {widgetsExpanded.commandPreview ? <ChevronDown className="h-4 w-4 text-textMuted" /> : <ChevronRight className="h-4 w-4 text-textMuted" />}
              </div>

              {widgetsExpanded.commandPreview && (
                <div className="rounded-xl border border-accentBlue/20 bg-accentBlue/5 p-3.5 text-xs text-textSecondary flex flex-col gap-3 animate-fadeIn">
                  <div className="flex flex-col gap-2">
                    <input
                      value={commandDraft}
                      onChange={(event) => setCommandDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') previewCommand(commandDraft);
                      }}
                      placeholder="Add TCS application"
                      className="h-9 rounded-lg border border-white/10 bg-black/30 px-3 text-[11px] text-textPrimary outline-none focus:border-accentBlue/50"
                    />
                    <Button size="sm" variant="primary" onClick={() => previewCommand(commandDraft)} className="h-8 text-[10px]">
                      Preview Command
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {commandSamples.map((sample) => (
                      <button
                        key={sample}
                        type="button"
                        onClick={() => previewCommand(sample)}
                        className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-1 text-[9px] text-textMuted transition hover:border-accentBlue/30 hover:text-accentBlue"
                      >
                        {sample}
                      </button>
                    ))}
                  </div>

                  {pendingCommand ? (
                    <div className="rounded-lg border border-accentBlue/30 bg-black/30 p-3 text-[10px] animate-fadeIn">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-black uppercase tracking-wider text-accentBlue">Preview</span>
                        <span className="rounded-full bg-white/5 px-2 py-0.5 font-mono text-[8px] text-textMuted">{pendingCommand.type}</span>
                      </div>
                      <p className="mt-2 text-textPrimary">{pendingCommand.summary}</p>
                      <pre className="mt-2 max-h-24 overflow-auto rounded-md bg-black/40 p-2 text-[9px] text-textMuted">{JSON.stringify(pendingCommand.payload, null, 2)}</pre>
                      <p className="mt-2 text-[9px] text-textMuted">Human confirmation required. Cancel leaves tracker state untouched.</p>
                      <div className="mt-3 flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={cancelPendingCommand} className="h-8 text-[10px]">
                          Cancel
                        </Button>
                        <Button size="sm" variant="primary" onClick={applyPendingCommand} className="h-8 text-[10px]">
                          Apply
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-white/10 bg-black/20 p-3 text-[10px] text-textMuted">
                      Enter a command to see the action preview before any tracker mutation.
                    </div>
                  )}

                  {commandFeedback && (
                    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2 text-[10px] text-textSecondary">
                      {commandFeedback}
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Widget 6: German Goal */}
            <Card className="border-white/5 p-4 flex flex-col gap-3">
              <div 
                onClick={() => toggleWidget('germanGoal')}
                className="flex items-center justify-between cursor-pointer group"
              >
                <span className="block text-[10px] font-bold uppercase tracking-wider text-textSecondary">
                  6. German Goal Context
                </span>
                {widgetsExpanded.germanGoal ? <ChevronDown className="h-4 w-4 text-textMuted" /> : <ChevronRight className="h-4 w-4 text-textMuted" />}
              </div>

              {widgetsExpanded.germanGoal && (
                <div className="rounded-xl border border-dashed border-border-subtle p-3 text-[11px] leading-relaxed text-textMuted animate-fadeIn">
                  <span className="font-semibold text-textSecondary">Target placement</span>: German SWE placement opportunities. Shayla helps with vocab, phrases, and German touchpoints.
                </div>
              )}
            </Card>

            {/* Widget 7: Recent Memory */}
            <Card className="border-white/5 p-4 flex flex-col gap-3">
              <div 
                onClick={() => toggleWidget('memory')}
                className="flex items-center justify-between cursor-pointer group"
              >
                <span className="block text-[10px] font-bold uppercase tracking-wider text-textSecondary">
                  7. AI Core Memory
                </span>
                {widgetsExpanded.memory ? <ChevronDown className="h-4 w-4 text-textMuted" /> : <ChevronRight className="h-4 w-4 text-textMuted" />}
              </div>

              {widgetsExpanded.memory && (
                <div className="rounded-xl border border-border-subtle bg-bgSurface/40 p-3 text-[11px] leading-normal text-textSecondary flex flex-col gap-2 max-h-[140px] overflow-y-auto animate-fadeIn">
                  {agentStore.briefingHistory?.length === 0 ? (
                    <span className="text-textMuted">No memories recorded yet.</span>
                  ) : (
                    agentStore.briefingHistory?.map((log, i) => (
                      <span key={i} className="pb-1 border-b last:border-b-0 border-white/5 text-textSecondary">• {log.title || 'Briefing'}: {log.summary}</span>
                    ))
                  )}
                </div>
              )}
            </Card>

            {/* Collapse Side Panel Button */}
            <Button size="sm" variant="ghost" onClick={toggleShaylaRightPanel} className="text-xs text-textMuted gap-1.5 mt-2">
              <PanelRightClose className="h-4 w-4" />
              Collapse context panel
            </Button>
          </div>
        ) : (
          /* Mini Vertical Icon Rail when Collapsed */
          <div className="hidden lg:flex flex-col items-center gap-4 bg-bgSurface/60 border border-border-subtle py-4 px-2.5 rounded-2xl h-full shrink-0 select-none">
            <button onClick={toggleShaylaRightPanel} title="Expand Context Panel" className="p-1.5 rounded-xl hover:bg-white/5 text-accentBlue">
              <PanelRight className="h-5 w-5" />
            </button>
            <span className="w-px h-8 bg-white/10" />
            <div className="flex flex-col gap-4 text-textMuted text-[10px] font-black uppercase writing-mode-vertical">
              <span>CONTEXT</span>
            </div>
          </div>
        )}

        {/* Vertical Resize Handle */}
        {!shaylaRightPanelCollapsed && (
          <div
            onMouseDown={startWidthResize}
            className="hidden lg:block w-1 cursor-col-resize hover:w-2 bg-border-subtle/50 hover:bg-accentBlue/60 h-full transition-all select-none"
            aria-label="Drag to resize panel width"
          />
        )}
      </div>

      {/* Collapsible Agent Notifications */}
      <div className="flex flex-col gap-2.5 mt-2">
        <div className="flex justify-between items-center">
          <Button size="sm" variant="ghost" onClick={toggleShaylaAgentNotifications} className="text-xs text-textMuted gap-1.5">
            <Layers className="h-4 w-4" />
            {shaylaAgentNotificationsCollapsed ? 'Show Agent Notifications' : 'Hide Agent Notifications'}
          </Button>
        </div>

        {!shaylaAgentNotificationsCollapsed && (
          <SmartNotificationCenter
            notifications={notifications}
            onAction={(notification) => {
              if (notification.actionPrompt) {
                handleSend(notification.actionPrompt);
              }
            }}
            onDismiss={(notification) => agentStore.dismissNotification(notification.id)}
            title="Agent notifications"
          />
        )}
      </div>
    </div>
  );
};
