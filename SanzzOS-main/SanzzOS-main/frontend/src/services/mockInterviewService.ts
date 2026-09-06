import { useMockInterviewStore } from '../app/store/useMockInterviewStore';
import { useCommunicationStore } from '../app/store/useCommunicationStore';
import { useInterviewQuestionsStore } from '../app/store/useInterviewQuestionsStore';
import { MockInterviewSession, SpeakingPracticeLog } from '../types/mockInterview';

export const mockInterviewService = {
  getSessions(): MockInterviewSession[] {
    return useMockInterviewStore.getState().sessions;
  },

  getAnswers() {
    return useMockInterviewStore.getState().answers;
  },

  getQuestions() {
    return useInterviewQuestionsStore.getState().questions;
  },

  getSpeakingLogs(): SpeakingPracticeLog[] {
    return useCommunicationStore.getState().logs;
  },

  getMistakes() {
    return useCommunicationStore.getState().mistakes;
  },

  // Calculate statistics for dashboards and overview modules
  compileMockStats() {
    const sessions = this.getSessions();
    const answers = this.getAnswers();
    const logs = this.getSpeakingLogs();

    const totalSessions = sessions.length;
    
    // Average confidence rating out of 5 across all saved answers
    const savedAnswersList = Object.values(answers);
    const avgConfidenceAnswers = savedAnswersList.length > 0
      ? savedAnswersList.reduce((sum, a) => sum + a.confidenceRating, 0) / savedAnswersList.length
      : 0;

    // Average communication practice score out of 100%
    const avgCommunicationScore = logs.length > 0
      ? logs.reduce((sum, l) => sum + l.overallScore, 0) / logs.length
      : 0;

    // Identify weak areas by looking at questions with confidence < 3 in session summaries
    const categoryMismatches: Record<string, number> = {};
    sessions.forEach((s) => {
      s.questionsAttempted.forEach((q) => {
        if (q.confidenceScore < 3) {
          const matchedQuestion = this.getQuestions().find((d) => d.id === q.questionId);
          const cat = matchedQuestion?.category || 'General';
          categoryMismatches[cat] = (categoryMismatches[cat] || 0) + 1;
        }
      });
    });

    const sortedWeakCategories = Object.entries(categoryMismatches)
      .sort((a, b) => b[1] - a[1])
      .map(([cat]) => cat);

    const weakestArea = sortedWeakCategories[0] || 'Behavioral';

    return {
      totalSessions,
      avgConfidenceAnswers: Math.round(avgConfidenceAnswers * 10) / 10,
      avgCommunicationScore: Math.round(avgCommunicationScore),
      weakestArea,
      savedAnswersCount: savedAnswersList.length,
    };
  },
};
export default mockInterviewService;
