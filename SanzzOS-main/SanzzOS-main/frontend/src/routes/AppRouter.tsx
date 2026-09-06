import React, { useEffect, lazy, Suspense } from 'react';
import { useUIStore } from '../app/store/useUIStore';
import { AppShell } from '../components/layout/AppShell';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { PageLoadingFallback } from '../components/ui/PageLoadingFallback';
import { pathToSection, sectionToPath } from '../utils/navigation';
import { useAuthStore } from '../app/store/useAuthStore';

// Public pages are statically imported for zero-latency initial loads
import { LandingPage } from '../pages/LandingPage';
import { PortfolioModePage } from '../pages/PortfolioModePage';

// Workspace console sub-pages are lazy loaded
const OverviewPage = lazy(() => import('../pages/OverviewPage').then(m => ({ default: m.OverviewPage })));
const TodayPage = lazy(() => import('../pages/TodayPage').then(m => ({ default: m.TodayPage })));
const AIBrainPage = lazy(() => import('../pages/AIBrainPage').then(m => ({ default: m.AIBrainPage })));
const SmartPlannerPage = lazy(() => import('../pages/SmartPlannerPage').then(m => ({ default: m.SmartPlannerPage })));
const PlacementOSPage = lazy(() => import('../pages/PlacementOSPage').then(m => ({ default: m.PlacementOSPage })));
const LearningOSPage = lazy(() => import('../pages/LearningOSPage').then(m => ({ default: m.LearningOSPage })));
const RoadmapPage = lazy(() => import('../pages/RoadmapPage').then(m => ({ default: m.RoadmapPage })));
const ShaylaAIPage = lazy(() => import('../pages/ShaylaAIPage').then(m => ({ default: m.ShaylaAIPage })));
const AISettingsPage = lazy(() => import('../pages/AISettingsPage').then(m => ({ default: m.AISettingsPage })));
const ShaylaMemoryPage = lazy(() => import('../pages/ShaylaMemoryPage').then(m => ({ default: m.ShaylaMemoryPage })));
const AIPlaygroundPage = lazy(() => import('../pages/AIPlaygroundPage').then(m => ({ default: m.AIPlaygroundPage })));
const AIBenchmarkPage = lazy(() => import('../pages/AIBenchmarkPage').then(m => ({ default: m.AIBenchmarkPage })));
const GermanPage = lazy(() => import('../pages/GermanPage').then(m => ({ default: m.GermanPage })));
const AnalyticsPage = lazy(() => import('../pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const ReportsPage = lazy(() => import('../pages/ReportsPage').then(m => ({ default: m.ReportsPage })));
const DSATrackerPage = lazy(() => import('../pages/DSATrackerPage').then(m => ({ default: m.DSATrackerPage })));
const SkillRackPage = lazy(() => import('../pages/SkillRackPage').then(m => ({ default: m.SkillRackPage })));
const AptitudePage = lazy(() => import('../pages/AptitudePage').then(m => ({ default: m.AptitudePage })));
const SQLPage = lazy(() => import('../pages/SQLPage').then(m => ({ default: m.SQLPage })));
const CSCorePage = lazy(() => import('../pages/CSCorePage').then(m => ({ default: m.CSCorePage })));
const ProjectsPage = lazy(() => import('../pages/ProjectsPage').then(m => ({ default: m.ProjectsPage })));
const CodingMentorPage = lazy(() => import('../pages/CodingMentorPage').then(m => ({ default: m.CodingMentorPage })));
const CareerIntelligencePage = lazy(() => import('../pages/CareerIntelligencePage').then(m => ({ default: m.CareerIntelligencePage })));
const IntegrationsPage = lazy(() => import('../pages/IntegrationsPage').then(m => ({ default: m.IntegrationsPage })));
const ResumePage = lazy(() => import('../pages/ResumePage').then(m => ({ default: m.ResumePage })));
const InterviewCoachPage = lazy(() => import('../pages/InterviewCoachPage').then(m => ({ default: m.InterviewCoachPage })));
const ApplicationsPage = lazy(() => import('../pages/ApplicationsPage').then(m => ({ default: m.ApplicationsPage })));
const CalendarFocusPage = lazy(() => import('../pages/CalendarFocusPage').then(m => ({ default: m.CalendarFocusPage })));
const PlacementCalendarPage = lazy(() => import('../pages/PlacementCalendarPage').then(m => ({ default: m.PlacementCalendarPage })));
const CompaniesPage = lazy(() => import('../pages/CompaniesPage').then(m => ({ default: m.CompaniesPage })));
const SkillTreePage = lazy(() => import('../pages/SkillTreePage').then(m => ({ default: m.SkillTreePage })));
const AchievementsPage = lazy(() => import('../pages/AchievementsPage').then(m => ({ default: m.AchievementsPage })));
const HistoryPage = lazy(() => import('../pages/HistoryPage').then(m => ({ default: m.HistoryPage })));
const SettingsPage = lazy(() => import('../pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const AdminPage = lazy(() => import('../pages/AdminPage').then(m => ({ default: m.AdminPage })));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const OfflinePage = lazy(() => import('../pages/OfflinePage').then(m => ({ default: m.OfflinePage })));
const MockInterviewOSPage = lazy(() => import('../pages/MockInterviewOSPage').then(m => ({ default: m.MockInterviewOSPage })));
const CompanyIntelligencePage = lazy(() => import('../pages/CompanyIntelligencePage').then(m => ({ default: m.CompanyIntelligencePage })));
const PortfolioOSPage = lazy(() => import('../pages/PortfolioOSPage').then(m => ({ default: m.PortfolioOSPage })));
const AIMentorPage = lazy(() => import('../pages/AIMentorPage').then(m => ({ default: m.AIMentorPage })));
const AuthHomePage = lazy(() => import('../pages/auth/AuthHomePage').then(m => ({ default: m.AuthHomePage })));
const LoginPage = lazy(() => import('../pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import('../pages/auth/SignupPage').then(m => ({ default: m.SignupPage })));
const AuthCallbackPage = lazy(() => import('../pages/auth/AuthCallbackPage').then(m => ({ default: m.AuthCallbackPage })));
const OnboardingPage = lazy(() => import('../pages/onboarding/OnboardingPage').then(m => ({ default: m.OnboardingPage })));



export const AppRouter: React.FC = () => {
  const activeSection = useUIStore((s) => s.activeSection);
  const setActiveSection = useUIStore((s) => s.setActiveSection);
  const [pathname, setPathname] = React.useState(typeof window !== 'undefined' ? window.location.pathname : '/');
  const [hasSyncedUrl, setHasSyncedUrl] = React.useState(false);
  const initializeAuth = useAuthStore((s) => s.initialize);

  const isLanding = pathname === '/' || pathname === '/landing' || pathname.endsWith('index.html') || pathname === '';
  const isPortfolio = pathname === '/portfolio';
  const isOffline = pathname === '/offline';
  const isAuthRoute = ['/auth', '/login', '/signup', '/auth/callback', '/onboarding'].includes(pathname);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // 1. Sync URL path -> Store's activeSection on mount and popstate
  useEffect(() => {
    const handleLocationChange = () => {
      const nextPath = window.location.pathname;
      setPathname(nextPath);

      // Support query parameters (?section=shayla / ?section=ai) and hashes (#/shayla)
      const searchParams = new URLSearchParams(window.location.search);
      const querySection = searchParams.get('section') || searchParams.get('tab');
      const hash = window.location.hash.replace(/^#\/?/, '/');

      if (querySection === 'shayla' || querySection === 'ai' || hash === '/shayla' || hash === '/ai' || nextPath === '/shayla' || nextPath === '/ai') {
        setActiveSection('ai');
        setHasSyncedUrl(true);
        return;
      }

      if (querySection && pathToSection['/' + querySection]) {
        setActiveSection(pathToSection['/' + querySection]);
        setHasSyncedUrl(true);
        return;
      }

      if (nextPath === '/' || nextPath === '/landing' || nextPath.endsWith('index.html') || nextPath === '') {
        // public landing - do not force shell section
      } else if (nextPath === '/portfolio' || ['/auth', '/login', '/signup', '/auth/callback', '/onboarding'].includes(nextPath)) {
        // public/special routes
      } else {
        const sect = pathToSection[nextPath];
        if (sect) {
          setActiveSection(sect);
        }
      }
      setHasSyncedUrl(true);
    };

    // Run once on mount to handle initial deep link
    handleLocationChange();

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, [setActiveSection]);

  // 2. Sync section changes -> URL only after the current URL has initialized the store.
  useEffect(() => {
    if (!hasSyncedUrl) return;
    if (isLanding || isPortfolio || isAuthRoute) return;
    const currentSection = pathToSection[pathname] || 'overview';
    if (activeSection === currentSection) return;
    const targetPath = sectionToPath[activeSection];
    if (targetPath && window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
      setPathname(targetPath);
    }
  }, [activeSection, hasSyncedUrl, isLanding, isPortfolio, pathname]);

  if (isLanding) {
    return (
      <ErrorBoundary>
        <LandingPage />
      </ErrorBoundary>
    );
  }

  if (isPortfolio) {
    return (
      <ErrorBoundary>
        <PortfolioModePage />
      </ErrorBoundary>
    );
  }

  if (isOffline) {
    return (
      <ErrorBoundary>
        <OfflinePage />
      </ErrorBoundary>
    );
  }

  if (isAuthRoute) {
    const authPage = pathname === '/login'
      ? <LoginPage />
      : pathname === '/signup'
        ? <SignupPage />
        : pathname === '/auth/callback'
          ? <AuthCallbackPage />
          : pathname === '/onboarding'
            ? <OnboardingPage />
            : <AuthHomePage />;
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoadingFallback />}>{authPage}</Suspense>
      </ErrorBoundary>
    );
  }

  const renderSection = () => {
    const currentActive = isLanding ? 'landing' : isPortfolio ? 'portfolio' : activeSection;
    switch (currentActive) {
      case 'overview':
        return <OverviewPage />;
      case 'today':
        return <TodayPage />;
      case 'ai_brain':
        return <AIBrainPage />;
      case 'smart_planner':
        return <SmartPlannerPage />;
      case 'placement_os':
        return <PlacementOSPage />;
      case 'learning_os':
        return <LearningOSPage />;
      case 'roadmap':
        return <RoadmapPage />;
      case 'ai':
        return <ShaylaAIPage />;
      case 'ai_settings':
        return <AISettingsPage />;
      case 'shayla_memory':
        return <ShaylaMemoryPage />;
      case 'ai_playground':
        return <AIPlaygroundPage />;
      case 'ai_benchmark':
        return <AIBenchmarkPage />;
      case 'german':
        return <GermanPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'portfolio':
        return <PortfolioModePage />;
      case 'dsa_tracker':
        return <DSATrackerPage />;
      case 'skillrack':
        return <SkillRackPage />;
      case 'aptitude':
        return <AptitudePage />;
      case 'sql':
        return <SQLPage />;
      case 'cscore':
        return <CSCorePage />;
      case 'projects':
        return <ProjectsPage />;
      case 'coding_mentor':
        return <CodingMentorPage />;
      case 'career_intelligence':
        return <CareerIntelligencePage />;
      case 'integrations':
        return <IntegrationsPage />;
      case 'resume':
        return <ResumePage />;
      case 'interview_coach':
        return <InterviewCoachPage />;
      case 'applications':
        return <ApplicationsPage />;
      case 'calendar':
        return <CalendarFocusPage />;
      case 'placement_calendar':
        return <PlacementCalendarPage />;
      case 'companies':
        return <CompaniesPage />;
      case 'skill_tree':
        return <SkillTreePage />;
      case 'achievements':
        return <AchievementsPage />;
      case 'history':
        return <HistoryPage />;
      case 'settings':
        return <SettingsPage />;
      case 'admin':
        return <AdminPage />;
      case 'mock_interview_os':
        return <MockInterviewOSPage />;
      case 'company_intelligence':
        return <CompanyIntelligencePage />;
      case 'portfolio_os':
        return <PortfolioOSPage />;
      case 'ai_mentor':
        return <AIMentorPage />;

      default:
        return <NotFoundPage />;
    }
  };

  return (
    <ErrorBoundary>
      <AppShell>
        <Suspense fallback={<PageLoadingFallback />}>
          {renderSection()}
        </Suspense>
      </AppShell>
    </ErrorBoundary>
  );
};
