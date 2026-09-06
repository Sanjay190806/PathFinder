'use client';

import React from 'react';
import { 
  Clock, Award, BookOpen, AlertCircle, CheckCircle, 
  Brain, Zap, HelpCircle, Code, ShieldCheck, PlayCircle
} from 'lucide-react';


export interface QuestionData {
  id: string;
  question_text: string;
  question_type: string;
  difficulty: string;
  marks: number;
  options?: string[];
  code_template?: string;
  code_language?: string;
  topic_id?: string;
  module_id?: string;
  objective_id?: string;
}

export interface AssessmentMetadata {
  id: string;
  title: string;
  domain: string;
  description?: string;
  assessment_type: string;
  duration_minutes: number;
  total_questions: number;
  total_marks: number;
  passing_score: number;
}


export function AssessmentIntro({
  assessment,
  selectedMode,
  onSelectMode,
  onStart
}: {
  assessment: AssessmentMetadata;
  selectedMode: string;
  onSelectMode: (mode: string) => void;
  onStart: () => void;
}) {
  const modes = [
    {
      id: 'ADAPTIVE',
      name: 'Adaptive Assessment',
      desc: 'Dynamically adapts question difficulty to your demonstrated mastery and skill gaps.',
      icon: <Brain className="w-5 h-5 text-indigo-400" />
    },
    {
      id: 'STANDARD',
      name: 'Standard Evaluation',
      desc: 'Fixed curriculum blueprint and predetermined difficulty distribution.',
      icon: <BookOpen className="w-5 h-5 text-sky-400" />
    },
    {
      id: 'DIAGNOSTIC',
      name: 'Diagnostic Scan',
      desc: 'Rapid diagnostic pass across all syllabus modules to identify weak spots.',
      icon: <Zap className="w-5 h-5 text-amber-400" />
    },
    {
      id: 'PRACTICE',
      name: 'Guided Practice',
      desc: 'Learning-oriented mode with instant explanations and formative feedback.',
      icon: <HelpCircle className="w-5 h-5 text-emerald-400" />
    }
  ];

  return (
    <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto shadow-sm">
      <div className="flex items-start justify-between mb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-3">
            <ShieldCheck className="w-3.5 h-3.5" /> Syllabus-Grounded Blueprint
          </span>
          <h1 className="text-2xl font-bold text-foreground mb-2">{assessment.title}</h1>
          <p className="text-muted-foreground text-sm">{assessment.description || 'Verified course assessment.'}</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Pass Criteria</div>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{assessment.passing_score}% Score</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8 bg-muted/40 p-4 rounded-xl border border-border">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-muted-foreground" />
          <div>
            <div className="text-xs text-muted-foreground">Duration</div>
            <div className="text-sm font-semibold text-foreground">{assessment.duration_minutes} Minutes</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-muted-foreground" />
          <div>
            <div className="text-xs text-muted-foreground">Questions</div>
            <div className="text-sm font-semibold text-foreground">{assessment.total_questions} Items</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Award className="w-5 h-5 text-muted-foreground" />
          <div>
            <div className="text-xs text-muted-foreground">Total Marks</div>
            <div className="text-sm font-semibold text-foreground">{assessment.total_marks} Pts</div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <label className="block text-sm font-semibold text-foreground mb-3">Select Assessment Mode</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {modes.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelectMode(m.id)}
              className={`text-left p-4 rounded-xl border transition-all ${
                selectedMode === m.id
                  ? 'bg-primary/10 border-primary ring-1 ring-primary/40'
                  : 'bg-card border-border hover:bg-muted/40'
              }`}
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                {m.icon}
                <span className="font-semibold text-foreground text-sm">{m.name}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{m.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onStart}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 transition-all"
      >
        <PlayCircle className="w-5 h-5" />
        Begin Assessment ({selectedMode})
      </button>
    </div>
  );
}


export function AssessmentTimer({ seconds }: { seconds: number }) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const isLow = seconds < 300;

  return (
    <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-mono text-sm font-bold border ${
      isLow 
        ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400 animate-pulse' 
        : 'bg-card border-border text-foreground shadow-sm'
    }`}>
      <Clock className="w-4 h-4 text-primary" />
      <span>
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </span>
    </div>
  );
}


export function ProgressIndicator({
  current,
  total,
  difficulty
}: {
  current: number;
  total: number;
  difficulty: string;
}) {
  const pct = Math.min(100, Math.round((current / Math.max(total, 1)) * 100));

  const diffColors: Record<string, string> = {
    BEGINNER: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    INTERMEDIATE: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    ADVANCED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    EXPERT: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
        <div className="flex items-center gap-2">
          <span>Question {current} of {total}</span>
          <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${diffColors[difficulty] || diffColors.INTERMEDIATE}`}>
            {difficulty}
          </span>
        </div>
        <span>{pct}% Completed</span>
      </div>
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 transition-all duration-300 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}


export function QuestionCard({
  question,
  selectedAnswer,
  onSelectAnswer,
  codeAnswer,
  onChangeCodeAnswer,
  explanation
}: {
  question: QuestionData;
  selectedAnswer: any;
  onSelectAnswer: (ans: any) => void;
  codeAnswer: string;
  onChangeCodeAnswer: (val: string) => void;
  explanation?: string | null;
}) {
  const isMCQ = question.question_type === 'MCQ';
  const isCoding = question.question_type === 'CODING';

  return (
    <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-4">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-muted text-foreground border border-border">
          {question.question_type}
        </span>
        <span className="text-xs font-semibold text-muted-foreground">{question.marks} Marks</span>
      </div>

      <h2 className="text-base sm:text-lg font-bold text-foreground mb-6 leading-relaxed">
        {question.question_text}
      </h2>

      {isCoding ? (
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium"><Code className="w-4 h-4 text-primary" /> Solution Editor ({question.code_language || 'python'})</span>
          </div>
          <textarea
            value={codeAnswer || question.code_template || ''}
            onChange={(e) => onChangeCodeAnswer(e.target.value)}
            rows={10}
            className="w-full bg-muted/40 border border-border rounded-xl p-3.5 font-mono text-sm text-foreground focus:outline-none focus:border-primary"
            placeholder="// Write code implementation here"
          />
        </div>
      ) : isMCQ && question.options ? (
        <div className="space-y-3 mb-6">
          {question.options.map((opt, idx) => {
            const isSelected = selectedAnswer === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectAnswer(idx)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3.5 ${
                  isSelected
                    ? 'bg-primary/10 border-primary text-foreground ring-1 ring-primary/40 font-semibold shadow-sm'
                    : 'bg-card hover:bg-muted/40 border-border text-foreground'
                }`}
              >
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold border transition-colors shrink-0 ${
                  isSelected 
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm' 
                    : 'border-border bg-muted text-foreground'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-sm font-medium">{opt}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="mb-6">
          <input
            type="text"
            value={selectedAnswer || ''}
            onChange={(e) => onSelectAnswer(e.target.value)}
            className="w-full bg-card border border-border rounded-xl p-3.5 text-foreground text-sm focus:outline-none focus:border-primary"
            placeholder="Type your answer here..."
          />
        </div>
      )}

      {explanation && (
        <div className="mt-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-300 text-xs leading-relaxed font-medium">
          <div className="font-bold mb-1 flex items-center gap-1.5 text-emerald-800 dark:text-emerald-400">
            <CheckCircle className="w-4 h-4 shrink-0" /> Explanation (Practice Mode)
          </div>
          {explanation}
        </div>
      )}
    </div>
  );
}


export function AdaptationIndicator({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/10 border border-primary/20 text-foreground text-xs font-medium">
      <Brain className="w-4 h-4 text-primary shrink-0" />
      <span>{message}</span>
    </div>
  );
}
