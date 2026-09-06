"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Globe, ArrowLeft, CheckCircle2, Star, Volume2, Sparkles, 
  HelpCircle, ChevronRight, BookOpen, Award, Check, RotateCcw
} from "lucide-react";
import { Card, Button, Badge, ProgressBar } from "@/components/ui";
import { GERMAN_LESSONS } from "@/lib/sanzzos/germanData";
import { GermanLessonData } from "@/lib/sanzzos/types";
import { SanzzOSStore } from "@/lib/sanzzos/sanzzosStore";

export default function GermanAcademyPage() {
  const [selectedLesson, setSelectedLesson] = useState<GermanLessonData>(GERMAN_LESSONS[0]);
  const [activeTab, setActiveTab] = useState<"vocab" | "grammar" | "dialogue" | "quiz">("vocab");
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [filterLevel, setFilterLevel] = useState<string>("all");
  
  // Quiz runner state
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setCompletedLessons(SanzzOSStore.getCompletedLessons());
  }, []);

  const filteredLessons = GERMAN_LESSONS.filter(l => {
    if (filterLevel === "all") return true;
    if (filterLevel === "A1") return l.level.includes("A1");
    if (filterLevel === "A2") return l.level.includes("A2");
    return l.level.includes("B1");
  });

  const handleSelectLesson = (lesson: GermanLessonData) => {
    setSelectedLesson(lesson);
    setActiveTab("vocab");
    setCurrentQuizIndex(0);
    setSelectedOption(null);
    setQuizScore(0);
    setQuizFinished(false);
    setFeedback(null);
  };

  const handleAnswerQuiz = (option: string) => {
    if (selectedOption !== null) return; // Prevent multi-click
    setSelectedOption(option);
    const q = selectedLesson.quiz[currentQuizIndex];
    const isCorrect = option === q.answer;
    
    if (isCorrect) {
      setQuizScore(prev => prev + 1);
      setFeedback("✓ Correct! " + q.explanation);
    } else {
      setFeedback(`✗ Incorrect. The correct answer was "${q.answer}". ${q.explanation}`);
    }
  };

  const handleNextQuizQuestion = () => {
    const nextIndex = currentQuizIndex + 1;
    if (nextIndex < selectedLesson.quiz.length) {
      setCurrentQuizIndex(nextIndex);
      setSelectedOption(null);
      setFeedback(null);
    } else {
      setQuizFinished(true);
      // Mark lesson as complete and award XP
      SanzzOSStore.markLessonComplete(selectedLesson.id, quizScore + 1, selectedLesson.xpReward);
      setCompletedLessons(SanzzOSStore.getCompletedLessons());
    }
  };

  const restartQuiz = () => {
    setCurrentQuizIndex(0);
    setSelectedOption(null);
    setQuizScore(0);
    setQuizFinished(false);
    setFeedback(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            <Link href="/sanzzos" className="hover:underline flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> SanzzOS Hub
            </Link>
            <span>&bull;</span>
            <span>Language Learning Lab</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-1 tracking-tight flex items-center gap-2">
            <span>🇩🇪 German Academy</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 font-bold border border-amber-500/30">
              30 Structured Lessons
            </span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Master German from A1 Beginner through A2/B1 with interactive vocabulary, pronunciation guides, grammar blueprints, and test quizzes.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-card border border-border px-4 py-2.5 rounded-2xl shadow-xs">
          <div className="text-right">
            <div className="text-xs text-muted-foreground font-medium">Academy Progress</div>
            <div className="text-sm font-bold text-foreground">
              {completedLessons.length} / {GERMAN_LESSONS.length} Lessons ({Math.round((completedLessons.length / GERMAN_LESSONS.length) * 100)}%)
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Award className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Left Sidebar with Lessons, Right Pane with Interactive Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Lesson Directory */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Lessons Directory</h3>
            <div className="flex items-center gap-1">
              {["all", "A1", "A2"].map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setFilterLevel(lvl)}
                  className={`px-2 py-0.5 rounded-md text-xs font-semibold transition-all ${
                    filterLevel === lvl
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {lvl.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
            {filteredLessons.map((l) => {
              const isSelected = selectedLesson.id === l.id;
              const isCompleted = completedLessons.includes(l.id);

              return (
                <div
                  key={l.id}
                  onClick={() => handleSelectLesson(l)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-150 flex items-center justify-between gap-3 ${
                    isSelected
                      ? "bg-amber-500/15 border-amber-500/40 text-foreground shadow-xs"
                      : "bg-card border-border hover:border-border/80 hover:bg-muted/40 text-muted-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-8 w-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${
                      isCompleted 
                        ? "bg-success/20 text-success" 
                        : isSelected 
                          ? "bg-amber-500 text-white" 
                          : "bg-muted text-muted-foreground"
                    }`}>
                      {isCompleted ? <Check className="h-4 w-4" /> : l.order}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-foreground truncate">
                        {l.title}
                      </div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <span>{l.level}</span>
                        <span>&bull;</span>
                        <span>{l.estimatedMinutes}m</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 shrink-0">
                    <Star className="h-3 w-3 fill-amber-500" />
                    <span>+{l.xpReward}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Lesson Workspace */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-6 sm:p-8 space-y-6 border-border bg-card">
            {/* Lesson Title & Header */}
            <div className="space-y-2 pb-4 border-b border-border">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Lesson {selectedLesson.order} • {selectedLesson.level}
                </span>
                <div className="flex items-center gap-2">
                  {completedLessons.includes(selectedLesson.id) && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-success bg-success/10 px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                    </span>
                  )}
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300">
                    +{selectedLesson.xpReward} XP
                  </span>
                </div>
              </div>

              <h2 className="text-2xl font-extrabold text-foreground">
                {selectedLesson.title}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {selectedLesson.objective}
              </p>
            </div>

            {/* Sub-tabs */}
            <div className="flex items-center gap-2 border-b border-border pb-1">
              {[
                { id: "vocab", label: `Vocabulary (${selectedLesson.vocabulary.length})` },
                { id: "grammar", label: `Grammar Rules (${selectedLesson.grammar.length})` },
                { id: "dialogue", label: "Dialogues" },
                { id: "quiz", label: `Quiz (${selectedLesson.quiz.length})` }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === tab.id
                      ? "bg-amber-600 text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Vocabulary */}
            {activeTab === "vocab" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedLesson.vocabulary.map((vocab, idx) => (
                    <div 
                      key={vocab.id || idx}
                      className="p-4 rounded-2xl border border-border bg-surface-muted/50 space-y-2 hover:border-amber-500/40 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base font-extrabold text-foreground tracking-tight">
                          {vocab.word}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                          {vocab.category}
                        </span>
                      </div>

                      <div className="text-xs text-amber-600 dark:text-amber-400 font-mono italic">
                        /{vocab.pronunciationHint}/
                      </div>

                      <div className="text-xs font-medium text-foreground">
                        {vocab.meaning}
                      </div>

                      {vocab.exampleSentence && (
                        <div className="pt-2 border-t border-border/60 text-[11px] text-muted-foreground space-y-0.5">
                          <p className="italic text-foreground/90">"{vocab.exampleSentence}"</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 2: Grammar */}
            {activeTab === "grammar" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {selectedLesson.grammar.map((g, idx) => (
                  <div key={idx} className="p-5 rounded-2xl border border-border bg-surface-muted/40 space-y-3">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      {g.title}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {g.explanation}
                    </p>
                    <div className="space-y-1 pt-2">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground">Examples:</span>
                      <ul className="space-y-1">
                        {g.examples.map((ex, exIdx) => (
                          <li key={exIdx} className="text-xs text-foreground font-mono bg-card px-3 py-1.5 rounded-lg border border-border">
                            {ex}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 3: Dialogues */}
            {activeTab === "dialogue" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {selectedLesson.examples.map((ex, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-border bg-surface-muted/40 space-y-1.5">
                    <div className="text-sm font-bold text-foreground">
                      {ex.german}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {ex.english}
                    </div>
                    {ex.pronunciationHint && (
                      <div className="text-[11px] text-amber-600 dark:text-amber-400 font-mono">
                        Pronunciation: {ex.pronunciationHint}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Tab 4: Interactive Quiz */}
            {activeTab === "quiz" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {!quizFinished ? (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                      <span>Question {currentQuizIndex + 1} of {selectedLesson.quiz.length}</span>
                      <span>Score: {quizScore} / {selectedLesson.quiz.length}</span>
                    </div>

                    <div className="p-5 rounded-2xl bg-surface-muted/60 border border-border">
                      <h4 className="text-base font-bold text-foreground leading-snug">
                        {selectedLesson.quiz[currentQuizIndex].question}
                      </h4>
                    </div>

                    {/* Quiz Options */}
                    <div className="grid grid-cols-1 gap-3">
                      {selectedLesson.quiz[currentQuizIndex].options.map((opt, optIdx) => {
                        const isChosen = selectedOption === opt;
                        const isAnswer = opt === selectedLesson.quiz[currentQuizIndex].answer;
                        
                        let btnStyle = "bg-card border-border hover:border-amber-500/50 text-foreground";
                        if (selectedOption !== null) {
                          if (isAnswer) {
                            btnStyle = "bg-success/15 border-success text-success font-bold";
                          } else if (isChosen) {
                            btnStyle = "bg-destructive/15 border-destructive text-destructive font-bold";
                          } else {
                            btnStyle = "bg-card border-border opacity-50";
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleAnswerQuiz(opt)}
                            disabled={selectedOption !== null}
                            className={`w-full p-4 rounded-xl border text-left text-sm font-medium transition-all duration-150 flex items-center justify-between ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {selectedOption !== null && isAnswer && (
                              <CheckCircle2 className="h-4 w-4 text-success" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Feedback Explanation */}
                    {feedback && (
                      <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-foreground/90 animate-in fade-in">
                        {feedback}
                      </div>
                    )}

                    {selectedOption !== null && (
                      <div className="flex justify-end pt-2">
                        <Button onClick={handleNextQuizQuestion} rightIcon={<ChevronRight className="h-4 w-4" />}>
                          {currentQuizIndex + 1 < selectedLesson.quiz.length ? "Next Question" : "Complete Lesson"}
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center space-y-4 bg-surface-muted/40 rounded-3xl border border-border">
                    <div className="h-16 w-16 rounded-full bg-amber-500/20 text-amber-500 mx-auto flex items-center justify-center">
                      <Award className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">
                      Lesson Completed!
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      Great job! You scored {quizScore} out of {selectedLesson.quiz.length} and earned +{selectedLesson.xpReward} XP.
                    </p>
                    <div className="pt-2 flex items-center justify-center gap-3">
                      <Button variant="outline" size="sm" onClick={restartQuiz} leftIcon={<RotateCcw className="h-4 w-4" />}>
                        Retake Quiz
                      </Button>
                      <Button size="sm" onClick={() => {
                        const nextIndex = selectedLesson.order;
                        if (nextIndex < GERMAN_LESSONS.length) {
                          handleSelectLesson(GERMAN_LESSONS[nextIndex]);
                        }
                      }} rightIcon={<ChevronRight className="h-4 w-4" />}>
                        Next Lesson
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
