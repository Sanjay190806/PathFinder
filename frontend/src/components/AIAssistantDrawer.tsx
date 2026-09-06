'use client';

import React, { useState, useRef, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { ChatMessage, CoachContext } from "@/lib/types";

import { CoachHeader } from "./coach/CoachHeader";
import { CoachContextSummary } from "./coach/CoachContextSummary";
import { CoachSuggestedPrompts } from "./coach/CoachSuggestedPrompts";
import { CoachMessage } from "./coach/CoachMessage";
import { CoachInput } from "./coach/CoachInput";
import { CoachSkeleton } from "./coach/CoachSkeleton";

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanAdjusted?: () => void;
}

export function AIAssistantDrawer({ isOpen, onClose, onPlanAdjusted }: AIAssistantDrawerProps) {
  const [context, setContext] = useState<CoachContext | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("English");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "assistant",
      text: "Hello! I'm your PathFinder AI Career Coach. I track your calibrated skill confidence, prerequisite status, and learning velocity in real time. How can I assist your career progression today?",
      suggested_focus: ["Next Step", "Prerequisites", "Pacing"],
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadCoachContext = useCallback(async () => {
    try {
      const data = await api.getCoachContext();
      setContext(data);
      if (data?.preferred_language) {
        setSelectedLanguage(data.preferred_language);
      }
    } catch (err) {
      console.warn("Could not load coach context", err);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadCoachContext();
    }
  }, [isOpen, loadCoachContext]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await api.chatAssistant({
        message: text,
        preferred_language: selectedLanguage
      });
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: res.reply,
        suggested_focus: res.suggested_focus,
        suggested_actions: res.suggested_actions,
        grounding_references: res.grounding_references,
        sources: res.sources,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: "I experienced a connection interruption. PathFinder fallback advice: Proceed with your active phase foundational modules to unlock subsequent specializations.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (actionLabel: string) => {
    handleSend(`Confirmed action: ${actionLabel}`);
    if (onPlanAdjusted) onPlanAdjusted();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex h-full w-full max-w-md flex-col bg-surface border-l border-surface-border shadow-2xl">
        {/* Header */}
        <CoachHeader
          targetRole={context?.target_role}
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
          onClose={onClose}
        />

        {/* Groq AI badge */}
        <div className="px-4 pb-2 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
            ⚡ Powered by Groq · llama-3.3-70b
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            Live AI
          </span>
        </div>

        {/* Live Grounded Context Summary */}
        <CoachContextSummary context={context} />

        {/* Conversation Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <CoachMessage key={msg.id} message={msg} onActionClick={handleActionClick} />
          ))}

          {isLoading && <CoachSkeleton />}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompts */}
        <CoachSuggestedPrompts onSelectPrompt={handleSend} />

        {/* Message Input */}
        <CoachInput onSend={handleSend} isLoading={isLoading} />
      </div>
    </div>
  );
}
