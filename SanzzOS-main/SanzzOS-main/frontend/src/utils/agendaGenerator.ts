import { CareerState } from '../types';
import { DailyAgenda } from '../app/store/useNotificationStore';
import { UserFocusMode, UserEnergyMode } from '../types/personalization';
import { personalizationService } from '../services/personalizationService';

export const agendaGenerator = {
  generateAgenda(dayNum: number, _state: CareerState): DailyAgenda {
    const profile = personalizationService.getProfile();
    const focusMode: UserFocusMode = profile.focusMode || 'placement_sprint';
    const energyMode: UserEnergyMode = profile.energyMode || 'normal';

    const tasks: DailyAgenda['tasks'] = [];
    const timeSlots: DailyAgenda['timeSlots'] = [];

    let focusTopic = 'General Placement Preparation';

    // 1. Build tasks based on Focus Mode
    if (focusMode === 'placement_sprint') {
      focusTopic = 'DSA & LeetCode Practice';
      tasks.push(
        { id: 'dsa-1', text: 'Solve today\'s primary LeetCode challenge', completed: false, source: 'placement' },
        { id: 'skillrack-1', text: 'Solve 10 SkillRack problems', completed: false, source: 'placement' },
        { id: 'apt-1', text: 'Complete 30 minutes of quantitative aptitude practice', completed: false, source: 'placement' },
        { id: 'mock-session-1', text: 'Run 15-minute mock interview session in Mock Interview OS', completed: false, source: 'placement' }
      );
    } else if (focusMode === 'project_builder') {
      focusTopic = 'Portfolio Project Building';
      tasks.push(
        { id: 'proj-1', text: 'Write project backend endpoints / models', completed: false, source: 'project' },
        { id: 'proj-2', text: 'Update UI components and verify state flow', completed: false, source: 'project' },
        { id: 'project-pitch-1', text: 'Practice a 60-second pitch for one real tracked project', completed: false, source: 'project' }
      );
    } else if (focusMode === 'german_practice') {
      focusTopic = 'German Vocabulary & Grammar';
      tasks.push(
        { id: 'german-1', text: 'Complete today\'s German academy target lesson', completed: false, source: 'german' },
        { id: 'german-2', text: 'Review 15 vocabulary flashcards', completed: false, source: 'german' }
      );
    } else if (focusMode === 'resume_polish') {
      focusTopic = 'Resume Accomplishments & LinkedIn';
      tasks.push(
        { id: 'resume-1', text: 'Improve one project description bullet with metrics', completed: false, source: 'resume' },
        { id: 'linkedin-1', text: 'Verify LinkedIn profile structure and headlines', completed: false, source: 'resume' }
      );
    } else {
      tasks.push(
        { id: 'gen-1', text: 'Review due revision items in your queue', completed: false, source: 'revision' }
      );
    }

    // 2. Adjust based on Energy Mode
    if (energyMode === 'burnout_risk' || energyMode === 'low') {
      focusTopic = `Recovery: ${focusTopic}`;
      // Reduce tasks load
      if (tasks.length > 1) {
        tasks.splice(1); // keep only first task to protect energy
      }
      tasks.push({ id: 'recovery-rest', text: 'Take a structured 20-minute rest walk', completed: false, source: 'system' });
      
      timeSlots.push(
        { time: '09:00', activity: 'Light Focus Study Block', duration: 25 },
        { time: '11:00', activity: 'Streak Protection Check-in', duration: 15 }
      );
    } else {
      // Normal / High Energy
      timeSlots.push(
        { time: '09:00', activity: 'Focused DSA Session', duration: 60 },
        { time: '11:00', activity: 'Aptitude Practice Block', duration: 30 },
        { time: '14:00', activity: 'Core Subject Syllabus Review', duration: 45 },
        { time: '16:00', activity: 'Project Build Sprint', duration: 60 }
      );
    }

    return {
      dayNum,
      focusTopic,
      tasks,
      timeSlots,
      generatedAt: new Date().toISOString(),
    };
  },
};

export default agendaGenerator;
