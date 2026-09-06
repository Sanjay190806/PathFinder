import { DEFAULT_PLACEMENT_COMPANIES } from '../data/defaultCompanies';
import { ApplicationStatus, OARecord, PlacementApplication, PlacementCompany, PlacementOSReadiness, PlacementRound } from '../types/placement';

export const PLACEMENT_OS_STORAGE_KEY = 'sanzz_os_placement_os_v1';

export interface PlacementOSState {
  companies: PlacementCompany[];
  applications: PlacementApplication[];
  interviews: PlacementRound[];
  oaRecords: OARecord[];
  resumeChecklist: Record<string, boolean>;
}

const defaultChecklist = {
  atsFormat: false,
  quantifiedBullets: false,
  projectLinks: false,
  skillsTailored: false,
  onePage: false,
  proofread: false
};

export function getDefaultPlacementOSState(): PlacementOSState {
  return {
    companies: DEFAULT_PLACEMENT_COMPANIES,
    applications: [],
    interviews: [],
    oaRecords: [],
    resumeChecklist: defaultChecklist
  };
}

export function loadPlacementOS(): PlacementOSState {
  try {
    const raw = localStorage.getItem(PLACEMENT_OS_STORAGE_KEY);
    if (!raw) return getDefaultPlacementOSState();
    const parsed = JSON.parse(raw) as Partial<PlacementOSState>;
    const seededApplicationIds = new Set(DEFAULT_PLACEMENT_COMPANIES.map((company) => `application-${company.id}`));
    const parsedApplications = parsed.applications || [];
    const seededCompanyIds = new Set(DEFAULT_PLACEMENT_COMPANIES.map((company) => company.id));
    const hasOnlySeededApplications = parsedApplications.length > 0 && parsedApplications.every((app) => seededApplicationIds.has(app.id) || seededCompanyIds.has(app.companyId));
    return {
      companies: parsed.companies?.length ? parsed.companies : DEFAULT_PLACEMENT_COMPANIES,
      applications: hasOnlySeededApplications ? [] : parsedApplications,
      interviews: parsed.interviews || [],
      oaRecords: parsed.oaRecords || [],
      resumeChecklist: hasOnlySeededApplications ? defaultChecklist : { ...defaultChecklist, ...(parsed.resumeChecklist || {}) }
    };
  } catch {
    return getDefaultPlacementOSState();
  }
}

export function savePlacementOS(state: PlacementOSState): void {
  try {
    localStorage.setItem(PLACEMENT_OS_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Unable to persist Placement OS', error);
  }
}

export function updateApplicationStatus(state: PlacementOSState, companyId: string, status: ApplicationStatus): PlacementOSState {
  const existing = state.applications.find((app) => app.companyId === companyId);
  const nextApplication: PlacementApplication = {
    id: existing?.id || `application-${companyId}`,
    companyId,
        status,
        updatedAt: new Date().toISOString(),
        nextAction: status === 'applied' ? 'Watch for OA schedule' : status === 'interview_scheduled' ? 'Prepare project and HR answers' : existing?.nextAction || 'Continue preparation',
        deadline: existing?.deadline,
        oaDate: existing?.oaDate,
        interviewDate: existing?.interviewDate,
        followUpDate: existing?.followUpDate,
        resumeVersion: existing?.resumeVersion,
        notes: existing?.notes
      };
  return {
    ...state,
    applications: existing
      ? state.applications.map((app) => app.companyId === companyId ? nextApplication : app)
      : [...state.applications, nextApplication]
  };
}

export function calculatePlacementReadiness(state: PlacementOSState): PlacementOSReadiness {
  const highPriorityPreparing = state.applications.filter((app) => {
    const company = state.companies.find((item) => item.id === app.companyId);
    return company?.priority === 'high' && app.status !== 'not_started';
  }).length;
  const checklistScore = Object.values(state.resumeChecklist).filter(Boolean).length / Object.keys(state.resumeChecklist).length;
  const interviewScore = Math.min(1, state.interviews.length / 4);
  const oaScore = Math.min(1, state.oaRecords.length / 4);
  const activeCompanies = state.applications
    .map((app) => state.companies.find((company) => company.id === app.companyId))
    .filter(Boolean) as typeof state.companies;
  const companyPool = activeCompanies.length ? activeCompanies : state.companies.filter((company) => company.priority === 'high');
  const focusText = companyPool.map((company) => `${company.dsaFocus} ${company.csCoreFocus} ${company.aptitudeFocus} ${company.resumeTips}`).join(' ').toLowerCase();
  const dsaReadiness = Math.min(100, Math.round((oaScore * 45) + (interviewScore * 20) + (focusText.includes('dynamic') || focusText.includes('recursion') ? 15 : 25)));
  const csCoreReadiness = Math.min(100, Math.round((interviewScore * 45) + (focusText.includes('dbms') || focusText.includes('oop') ? 30 : 15) + (checklistScore * 25)));
  const aptitudeReadiness = Math.min(100, Math.round((oaScore * 50) + (focusText.includes('aptitude') || focusText.includes('quant') ? 30 : 15) + (state.oaRecords.length ? 20 : 0)));
  const projectReadiness = Math.min(100, Math.round(checklistScore * 60 + interviewScore * 25 + (focusText.includes('project') ? 15 : 5)));
  const communicationReadiness = Math.min(100, Math.round(checklistScore * 35 + interviewScore * 35 + (focusText.includes('communication') || focusText.includes('hr') ? 25 : 10)));
  const applicationMomentum = Math.min(100, Math.round((state.applications.filter((app) => app.status !== 'not_started').length / 8) * 100));
  const score = Math.round(
    dsaReadiness * 0.18 +
    csCoreReadiness * 0.14 +
    aptitudeReadiness * 0.14 +
    checklistScore * 100 * 0.18 +
    projectReadiness * 0.12 +
    communicationReadiness * 0.12 +
    applicationMomentum * 0.12
  );

  return {
    score: Math.min(100, score),
    resumeScore: Math.round(checklistScore * 100),
    companyPrepScore: Math.min(100, Math.round((highPriorityPreparing / 6) * 100)),
    interviewScore: Math.round(interviewScore * 100),
    oaScore: Math.round(oaScore * 100),
    dsaReadiness,
    csCoreReadiness,
    aptitudeReadiness,
    projectReadiness,
    communicationReadiness,
    applicationMomentum,
    nextAction: score === 0
      ? 'Not enough data yet. Add resume checklist items, OA logs, interviews, or real company status.'
      : checklistScore < 0.7 ? 'Finish resume checklist before applying broadly.' : 'Prepare the next high-priority company round.'
  };
}
