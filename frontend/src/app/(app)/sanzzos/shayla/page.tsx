"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Bot, ArrowLeft, Send, Sparkles, User, RotateCcw, 
  Brain, ShieldCheck, Terminal, Globe, Award, Copy, Check
} from "lucide-react";
import { Card, Button, Badge } from "@/components/ui";
import { SanzzOSStore } from "@/lib/sanzzos/sanzzosStore";
import { ShaylaChatMessage } from "@/lib/sanzzos/types";

export default function ShaylaAIPage() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("English");
  const [messages, setMessages] = useState<ShaylaChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(SanzzOSStore.getChatMessages());
    const savedLang = localStorage.getItem("sanzzos_shayla_language");
    if (savedLang) {
      setSelectedLanguage(savedLang);
    }
  }, []);

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    localStorage.setItem("sanzzos_shayla_language", lang);
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const quickPrompts = [
    { label: "🧩 Two Pointers Strategy", prompt: "Explain the Two Pointers pattern in DSA and when to choose it over HashMaps." },
    { label: "💼 Zoho Round 1 Logic", prompt: "What are the common question patterns in Zoho Round 1 C programming and flowchart logic?" },
    { label: "🇩🇪 German Introduction", prompt: "Help me practice introducing myself in German for a tech interview (A1/A2 level)." },
    { label: "📄 Resume Action Verbs", prompt: "Critique my project bullet points and suggest strong metrics-driven action verbs." }
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    // Add user message
    const userMsg = SanzzOSStore.addChatMessage({
      sender: "user",
      text,
      category: "general"
    });
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    try {
      const history = [...messages, userMsg].map(m => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text
      }));

      const res = await fetch("/api/sanzzos/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          provider: "groq",
          model: "qwen/qwen3.8-27b",
          language: selectedLanguage
        })
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.reply || data.content || data.choices?.[0]?.message?.content || "";
        if (reply) {
          const botMsg = SanzzOSStore.addChatMessage({
            sender: "shayla",
            text: reply,
            category: "general"
          });
          setMessages(prev => [...prev, botMsg]);
          setIsTyping(false);
          return;
        }
      }
    } catch (err) {
      console.warn("SanzzOS AI backend call error, using local fallback", err);
    }

    // Contextual fallback response if backend is offline
    setTimeout(() => {
      let reply = "I am analyzing your career context and engineering progress. ";
      const lower = text.toLowerCase();

      if (lower.includes("two pointer") || lower.includes("dsa") || lower.includes("pattern")) {
        reply = "The **Two Pointers** pattern is ideal for sorted arrays or sequence traversals where you need $O(N)$ time with $O(1)$ auxiliary space. \n\n" +
          "**When to use:**\n" +
          "- Searching for pairs with a target sum (e.g., Two Sum II, 3Sum).\n" +
          "- In-place array modification (e.g., Remove Duplicates, Move Zeroes).\n" +
          "- Palindrome verification or container volume calculations (Container With Most Water).\n\n" +
          "*Next step: head over to the SanzzOS 180-Day Tracker to mark Day 1 problems complete!*";
      } else if (lower.includes("zoho")) {
        reply = "For **Zoho Technical Placements**, Round 1 prioritizes fundamental logic without high-level library abstractions:\n\n" +
          "1. **Matrix Transformations**: Spiral printing, rotating an $N \\times N$ matrix by 90 degrees in-place.\n" +
          "2. **String Permutations & Substrings**: Finding substrings without standard string methods.\n" +
          "3. **Flowchart & Pointers in C**: Understanding operator precedence, pointer arithmetic, and recursive function calls.\n\n" +
          "Focus on writing clean, self-contained algorithms without memory leaks!";
      } else if (lower.includes("german") || lower.includes("deutsch")) {
        reply = "Sehr gut! Here is a crisp, professional introduction in German:\n\n" +
          "**\"Guten Tag! Ich heiße Sanju. Ich bin Softwareentwickler und studiere Informatik. Ich lerne fleißig Deutsch.\"**\n\n" +
          "- *Guten Tag* = Good day / Hello\n" +
          "- *Ich heiße...* = My name is...\n" +
          "- *Ich bin Softwareentwickler* = I am a software developer\n" +
          "- *Ich lerne fleißig Deutsch* = I am diligently learning German\n\n" +
          "Try out Lesson 1 in the German Academy to practice your pronunciation!";
      } else if (lower.includes("resume")) {
        reply = "When framing technical projects for recruiters, use Google's XYZ formula: **'Accomplished [X] as measured by [Y], by doing [Z]'**.\n\n" +
          "**Example Before**: *Built a full-stack career platform with Next.js and FastAPI.*\n" +
          "**Example After**: *Engineered a distributed career guidance system serving 500+ daily sessions, reducing quiz calibration latency by 42% through optimized caching algorithms.*";
      } else {
        reply = `I have received your request: "${text}". As your SanzzOS mentor, I am monitoring your 7-day streak, active placement pipeline, and daily study targets. Let's keep your momentum high today!`;
      }

      const botMsg = SanzzOSStore.addChatMessage({
        sender: "shayla",
        text: reply,
        category: "general"
      });
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 400);
  };

  const copyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const languages = [
    { id: "English", label: "English", flag: "🇺🇸" },
    { id: "Tamil", label: "தமிழ்", flag: "🇮🇳" },
    { id: "German", label: "Deutsch", flag: "🇩🇪" },
    { id: "Hindi", label: "हिन्दी", flag: "🇮🇳" },
    { id: "French", label: "Français", flag: "🇫🇷" },
    { id: "Spanish", label: "Español", flag: "🇪🇸" },
    { id: "Telugu", label: "తెలుగు", flag: "🇮🇳" },
    { id: "Malayalam", label: "മലയാളം", flag: "🇮🇳" },
    { id: "Kannada", label: "ಕನ್ನಡ", flag: "🇮🇳" },
    { id: "Japanese", label: "日本語", flag: "🇯🇵" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
            <Link href="/sanzzos" className="hover:underline flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> SanzzOS Hub
            </Link>
            <span>&bull;</span>
            <span>Intelligent Career Mentor</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-1 tracking-tight flex items-center gap-2">
            <span>🤖 Shayla AI Mentor</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 font-bold border border-cyan-500/30">
              v1.7.2
            </span>
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/sanzzos?section=shayla">
            <Button size="sm" className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 shadow-sm gap-1.5 text-xs font-bold">
              <Bot className="h-3.5 w-3.5" />
              Open in SanzzOS Main
            </Button>
          </Link>
          <Badge variant="cyan" size="sm" className="gap-1">
            <Brain className="h-3.5 w-3.5" /> Multilingual Engine
          </Badge>
          <Badge variant="success" size="sm" className="gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Groq AI Engine (Ready)
          </Badge>
        </div>
      </div>

      {/* Multilingual Selector Bar */}
      <div className="p-3.5 rounded-2xl bg-surface-muted/70 border border-border space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
            <Globe className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            <span>Select AI Output Language:</span>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 font-bold border border-cyan-500/30">
            Active: {languages.find(l => l.id === selectedLanguage)?.flag} {selectedLanguage}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {languages.map((lang) => {
            const active = selectedLanguage === lang.id;
            return (
              <button
                key={lang.id}
                type="button"
                onClick={() => handleLanguageChange(lang.id)}
                className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 border cursor-pointer ${
                  active
                    ? "bg-primary text-primary-foreground border-primary shadow-xs font-bold ring-2 ring-primary/20"
                    : "bg-card text-muted-foreground border-border hover:border-cyan-500/50 hover:text-foreground"
                }`}
                title={`Make Shayla speak strictly in ${lang.label}`}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Prompts Bar */}
      <div className="flex flex-wrap gap-2">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(qp.prompt)}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-card border border-border hover:border-cyan-500/50 hover:bg-muted/40 transition-all text-foreground"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Chat Conversation Card */}
      <Card className="h-[600px] flex flex-col justify-between border-border bg-card p-4 sm:p-6 shadow-xs">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
              >
                <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30"
                }`}>
                  {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                <div className={`max-w-[82%] rounded-2xl p-4 space-y-1.5 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                  isUser
                    ? "bg-primary text-primary-foreground font-medium rounded-tr-none"
                    : "bg-surface-muted/70 text-foreground border border-border rounded-tl-none"
                }`}>
                  <div className="flex items-center justify-between gap-4 pb-1 border-b border-border/40 text-[10px] opacity-75">
                    <span className="font-bold uppercase tracking-wider">{isUser ? "You" : "Shayla AI"}</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div className="whitespace-pre-wrap">
                    {msg.text}
                  </div>

                  {!isUser && (
                    <div className="pt-1 flex justify-end">
                      <button
                        onClick={() => copyMessage(msg.id, msg.text)}
                        className="text-[10px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                      >
                        {copiedId === msg.id ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedId === msg.id ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                <Bot className="h-4 w-4 animate-spin" />
              </div>
              <div className="px-4 py-2.5 rounded-2xl bg-surface-muted text-xs text-muted-foreground animate-pulse border border-border">
                Shayla is formulating guidance...
              </div>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Input Box */}
        <div className="pt-4 border-t border-border mt-3 flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask Shayla about DSA patterns, German vocabulary, mock interview questions, or company prep..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="flex-1 px-4 py-2.5 rounded-xl bg-surface-muted border border-input text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button
            size="md"
            variant="primary"
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isTyping}
            rightIcon={<Send className="h-4 w-4" />}
          >
            Send
          </Button>
        </div>
      </Card>
    </div>
  );
}
