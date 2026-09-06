export type GermanLevel = 'A1 Beginner' | 'A1 Strong' | 'A2 Beginner' | 'A2 Strong' | 'B1 Preview';

export interface GermanGrammarPoint {
  title: string;
  explanation: string;
  examples: string[];
}

export interface GermanExample {
  german: string;
  english: string;
  pronunciationHint?: string;
}

export type GermanQuizQuestionType = 'german_to_english' | 'english_to_german' | 'fill_blank' | 'article_choice';

export interface GermanQuizQuestion {
  type: GermanQuizQuestionType;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export interface GermanLessonData {
  id: string;
  order: number;
  title: string;
  level: GermanLevel;
  objective: string;
  vocabulary: GermanVocabularyItem[];
  grammar: GermanGrammarPoint[];
  examples: GermanExample[];
  quiz: GermanQuizQuestion[];
  cultureTip?: string;
  xpReward: number;
  estimatedMinutes: number;
  xp: number;
  vocabularyCount: number;
  quizScore: number;
  locked: boolean;
  completed: boolean;
  notes: string;
  lastPracticed: string | null;
}

export interface GermanVocabularyItem {
  id: string;
  word: string;
  meaning: string;
  pronunciationHint: string;
  exampleSentence: string;
  german?: string;
  english?: string;
  exampleGerman?: string;
  exampleEnglish?: string;
  category: string;
}

export type GermanVocabularyStatus = 'known' | 'learning' | 'review';

export interface GermanVocabularyProgress {
  status: GermanVocabularyStatus;
  reviewCount: number;
  lastReviewedAt: string | null;
  reviewStage?: number;
  nextReviewDate?: string | null;
  correctCount?: number;
  wrongCount?: number;
  lastReviewed?: string | null;
  easeFactor?: number;
  intervalDays?: number;
}

export interface GermanPhraseOfTheDay {
  phrase: string;
  meaning: string;
  pronunciationHint: string;
  context: string;
}

export interface GermanQuizHistoryItem {
  lessonId: string;
  score: number;
  total: number;
  perfect: boolean;
  type: string;
  takenAt: string;
}

export interface GermanDailyLog {
  minutes: number;
  lessonId: string | null;
  phrase: string;
  xpEarned: number;
  updatedAt: string;
}

export interface GermanLessonProgress {
  completed: boolean;
  locked: boolean;
  xpEarned: number;
  vocabularyCount: number;
  quizScore: number;
  notes: string;
  lastPracticed: string | null;
}
