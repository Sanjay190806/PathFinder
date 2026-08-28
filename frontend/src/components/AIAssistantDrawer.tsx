'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Bot, User, Clock, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { ChatMessage } from '@/lib/types';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanAdjusted?: () => void;
}

export function AIAssistantDrawer({ isOpen, onClose, onPlanAdjusted }: AIAssistantDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text: "Hello! I'm your PathFinder AI Learning Coach. I'm actively tracking your progress, skill gaps, and roadmap. How can I help you adjust or accelerate your studies today?",
      suggested_focus: ["Foundations", "Prerequisites", "Pacing"],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const quickChips = [
    "I only have 5 hours this week. What should I focus on?",
    "Why did you recommend this course next?",
    "I am struggling with neural network mathematics.",
    "Suggest a capstone project for my portfolio."
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await api.chatAssistant({ message: text });
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: res.reply,
        suggested_focus: res.suggested_focus,
        suggested_actions: res.suggested_actions,
        grounding_references: res.grounding_references,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: "I experienced an error connecting. Using deterministic fallback: Focus on completing your current Phase 1 fundamentals to unlock core topics.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex h-full w-full max-w-md flex-col bg-surface border-l border-surface-border shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-border px-5 py-4 bg-surface-raised/40">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-primary-600 to-accent-purple text-white shadow-md shadow-primary-500/20">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">AI Learning Coach</h3>
              <p className="text-[11px] text-accent-emerald flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-emerald animate-pulse" />
                Grounded in Your Live Roadmap
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-surface-raised hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-primary-600 text-white rounded-br-none shadow-md'
                    : 'bg-surface-raised border border-surface-border text-gray-200 rounded-bl-none'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>

                {/* Grounding references */}
                {msg.grounding_references && msg.grounding_references.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-surface-border/60">
                    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block mb-1">
                      Referenced in Roadmap:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {msg.grounding_references.map((ref, idx) => (
                        <span key={idx} className="rounded bg-surface px-1.5 py-0.5 text-[10px] text-accent-cyan border border-surface-border">
                          {ref}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Action Buttons */}
                {msg.suggested_actions && msg.suggested_actions.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {msg.suggested_actions.map((act, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          handleSend(`Confirmed: ${act.label}`);
                          if (onPlanAdjusted) onPlanAdjusted();
                        }}
                        className="flex w-full items-center justify-between rounded-lg bg-primary-950/80 border border-primary-700/60 px-2.5 py-1.5 text-[11px] font-semibold text-primary-200 hover:bg-primary-900 transition-colors"
                      >
                        <span>{act.label}</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <span className="mt-1 text-[10px] text-gray-500 px-1">{msg.timestamp}</span>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-gray-400 bg-surface-raised p-3 rounded-2xl rounded-bl-none border border-surface-border w-fit">
              <Sparkles className="h-3.5 w-3.5 animate-spin text-primary-400" />
              AI Coach is analyzing your roadmap...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Chips */}
        <div className="border-t border-surface-border p-2 bg-surface/50 overflow-x-auto whitespace-nowrap flex gap-1.5">
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              className="rounded-full bg-surface-raised border border-surface-border px-2.5 py-1 text-[10px] text-gray-300 hover:text-white hover:border-primary-500 transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <div className="border-t border-surface-border p-3 bg-surface-raised">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything about your path, time, or skills..."
              className="flex-1 rounded-xl bg-surface border border-surface-border px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white hover:bg-primary-500 disabled:opacity-40 transition-opacity shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
