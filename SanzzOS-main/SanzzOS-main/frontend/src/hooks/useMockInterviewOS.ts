import { useMockInterviewStore } from '../app/store/useMockInterviewStore';
import { useInterviewQuestionsStore } from '../app/store/useInterviewQuestionsStore';
import { useCommunicationStore } from '../app/store/useCommunicationStore';

export const useMockInterviewOS = () => {
  const {
    sessions,
    answers,
    projectPitches,
    addSession,
    saveAnswerDraft,
    saveProjectPitch,
    practicedProjectPitch,
  } = useMockInterviewStore();

  const {
    questions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    resetToDefaults,
  } = useInterviewQuestionsStore();

  const {
    logs: speakingLogs,
    mistakes,
    addSpeakingLog,
    addMistake,
    incrementMistake,
    resolveMistake,
  } = useCommunicationStore();

  return {
    // Session state & actions
    sessions,
    addSession,

    // Answer builder state & actions
    answers,
    saveAnswerDraft,

    // Project pitches state & actions
    projectPitches,
    saveProjectPitch,
    practicedProjectPitch,

    // Questions list & actions
    questions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    resetToDefaults,

    // Speaking practice state & actions
    speakingLogs,
    addSpeakingLog,

    // Mistakes state & actions
    mistakes,
    addMistake,
    incrementMistake,
    resolveMistake,
  };
};
export default useMockInterviewOS;
