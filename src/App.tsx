import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingView } from './components/LandingView';
import { SearchDiscoveryView } from './components/SearchDiscoveryView';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { PrivatePreCheckView } from './components/PrivatePreCheckView';
import { ProfileAnalyzerView } from './components/ProfileAnalyzerView';
import { ProjectSuggestionsView } from './components/ProjectSuggestionsView';
import { PersonalizedRecommenderView } from './components/PersonalizedRecommenderView';
import { ProjectCompareMatrix } from './components/ProjectCompareMatrix';
import { SavedDashboardView } from './components/SavedDashboardView';
import { RepositoryIntelligenceView } from './components/RepositoryIntelligenceView';
import { AuthModal, AuthMode, AuthReason } from './components/AuthModal';
import { SearchQuotaToast } from './components/SearchQuotaToast';

import { Project, UserSession, ProfileEvaluation } from './types';
import { RepositoryIntelligenceReport, ScanMode, UserProfilePreferences } from './types/repoIntelligenceTypes';
import { startRepositoryAnalysis, pollRepositoryAnalysisStatus } from './services/repositoryIntelligenceClient';
import { parseAndValidateGithubUrl } from './services/githubUrlParser';
import { fetchGithubUserProfile } from './services/githubService';
import { getCurrentSession, onAuthStateChange, signOut } from './services/authService';

const DAILY_FREE_SEARCH_LIMIT = 3;

const getTodayDateKey = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const getDailySearchCount = (): number => {
  try {
    const raw = localStorage.getItem('gitscope_daily_search');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.date === getTodayDateKey()) {
        return typeof parsed.count === 'number' ? parsed.count : 0;
      }
    }
  } catch (e) {}
  return 0;
};

const saveDailySearchCount = (count: number) => {
  try {
    const data = { date: getTodayDateKey(), count };
    localStorage.setItem('gitscope_daily_search', JSON.stringify(data));
  } catch (e) {}
};

export function App() {
  const [activeTab, setActiveTab] = useState<string>('landing');
  
  // User session state — default unauthenticated guest mode
  const [userSession, setUserSession] = useState<UserSession>({
    isAuthenticated: false,
    username: '',
    name: '',
    avatarUrl: '',
    savedProjectIds: [],
    savedIdeaIds: [],
    privateEvaluations: []
  });

  const [currentProfile, setCurrentProfile] = useState<ProfileEvaluation | null>(null);

  // Daily Anonymous Search Counter (persisted in localStorage with date key)
  const [searchCount, setSearchCount] = useState<number>(() => getDailySearchCount());

  // Auth modal states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthMode>('signup');
  const [authModalReason, setAuthModalReason] = useState<AuthReason>('user_click');

  // App workspace states
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  const [selectedProjectModal, setSelectedProjectModal] = useState<Project | null>(null);
  const [comparedProjects, setComparedProjects] = useState<Project[]>([]);
  const [savedProjects, setSavedProjects] = useState<Project[]>([]);
  const [privateEvaluations, setPrivateEvaluations] = useState<Project[]>([]);

  // Repository Intelligence States
  const [intelReport, setIntelReport] = useState<RepositoryIntelligenceReport | null>(null);
  const [savedIntelligenceReports, setSavedIntelligenceReports] = useState<RepositoryIntelligenceReport[]>([]);
  const [intelLoading, setIntelLoading] = useState(false);
  const [intelStatus, setIntelStatus] = useState<string>('idle');
  const [intelProgress, setIntelProgress] = useState(0);
  const [intelStep, setIntelStep] = useState('');
  const [intelErrorCode, setIntelErrorCode] = useState<string | undefined>(undefined);
  const [intelErrorMessage, setIntelErrorMessage] = useState<string | undefined>(undefined);

  const handleSaveReport = (report: RepositoryIntelligenceReport) => {
    setSavedIntelligenceReports(prev => {
      const exists = prev.some(r => r.id === report.id);
      if (exists) {
        return prev.filter(r => r.id !== report.id);
      }
      return [report, ...prev];
    });
  };

  const handleAnalyzeRepositoryUrl = async (
    url: string,
    mode: ScanMode = 'standard',
    profile?: UserProfilePreferences
  ) => {
    if (!handleSearchAttempt()) {
      return;
    }

    setActiveTab('intelligence');
    setIntelLoading(true);
    setIntelStatus('validating');
    setIntelProgress(10);
    setIntelStep('Validating repository URL...');
    setIntelErrorCode(undefined);
    setIntelErrorMessage(undefined);

    try {
      const res = await startRepositoryAnalysis(url, mode, profile);
      
      if (res.error) {
        setIntelStatus('failed');
        setIntelProgress(0);
        setIntelErrorCode(res.error.code);
        setIntelErrorMessage(res.error.message);
        setIntelLoading(false);

        if (res.error.code === 'ANALYSIS_QUOTA_EXCEEDED') {
          setAuthModalReason('limit_reached');
          setAuthModalMode('signup');
          setIsAuthModalOpen(true);
        }
        return;
      }

      if (res.report) {
        setIntelReport(res.report);
        setIntelStatus('completed');
        setIntelProgress(100);
        setIntelStep('Report ready.');
      } else {
        setIntelStatus(res.status);
        setIntelProgress(res.progress || 50);
        setIntelStep(res.currentStep || 'Processing scan job...');
      }
    } catch (err: any) {
      setIntelStatus('failed');
      setIntelProgress(0);
      setIntelErrorCode('INTERNAL_ERROR');
      setIntelErrorMessage(err.message || 'An unexpected analysis error occurred.');
    } finally {
      setIntelLoading(false);
    }
  };

  // Supabase Auth Session Listener
  useEffect(() => {
    // 1. Fetch initial session on mount
    getCurrentSession().then(({ data: { session } }) => {
      if (session?.user) {
        syncUserSession(session.user);
      }
    });

    // 2. Subscribe to auth state changes across tabs / login / logout
    const { data: { subscription } } = onAuthStateChange((_event, session) => {
      if (session?.user) {
        syncUserSession(session.user);
      } else {
        setUserSession(prev => ({
          ...prev,
          isAuthenticated: false,
          username: '',
          name: '',
          avatarUrl: '',
          email: undefined
        }));
        setCurrentProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const syncUserSession = (user: any) => {
    const meta = user.user_metadata || {};
    const email = user.email || '';
    const emailPrefix = email ? email.split('@')[0] : 'developer';
    
    const name = meta.full_name || meta.name || meta.preferred_username || emailPrefix;
    const username = meta.preferred_username || meta.user_name || emailPrefix;
    const avatarUrl = meta.avatar_url || meta.picture || '';

    setUserSession(prev => ({
      ...prev,
      isAuthenticated: true,
      username,
      name,
      avatarUrl,
      email
    }));

    // If user has a GitHub username, attempt to load GitHub profile statistics
    if (username && username !== 'developer') {
      fetchGithubUserProfile(username).then(prof => {
        if (prof) setCurrentProfile(prof);
      });
    }
  };

  const handleLogout = async () => {
    await signOut();
    setUserSession(prev => ({
      ...prev,
      isAuthenticated: false,
      username: '',
      name: '',
      avatarUrl: '',
      email: undefined
    }));
    setCurrentProfile(null);
    setActiveTab('landing');
  };

  // Daily Search Gatekeeper Check
  const handleSearchAttempt = (): boolean => {
    if (userSession.isAuthenticated) return true;

    const currentDailyCount = getDailySearchCount();

    if (currentDailyCount >= DAILY_FREE_SEARCH_LIMIT) {
      setAuthModalReason('limit_reached');
      setAuthModalMode('signup');
      setIsAuthModalOpen(true);
      return false;
    }

    const newCount = currentDailyCount + 1;
    saveDailySearchCount(newCount);
    setSearchCount(newCount);
    return true;
  };

  const handleOpenAuth = (mode: AuthMode = 'signup') => {
    setAuthModalReason('user_click');
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleSearchSubmit = (query: string) => {
    const urlCheck = parseAndValidateGithubUrl(query);
    if (urlCheck.valid) {
      handleAnalyzeRepositoryUrl(query);
    } else {
      setActiveSearchQuery(query);
      setActiveTab('search');
    }
  };

  const handleSelectProject = (project: Project) => {
    setSelectedProjectModal(project);
  };

  const handleToggleSaveProject = (projectOrId: string | Project) => {
    const projId = typeof projectOrId === 'string' ? projectOrId : projectOrId.id;
    const projectObj = typeof projectOrId === 'object' ? projectOrId : selectedProjectModal;

    if (userSession.savedProjectIds.includes(projId)) {
      setUserSession(prev => ({
        ...prev,
        savedProjectIds: prev.savedProjectIds.filter(id => id !== projId)
      }));
      setSavedProjects(prev => prev.filter(p => p.id !== projId));
    } else {
      setUserSession(prev => ({
        ...prev,
        savedProjectIds: [...prev.savedProjectIds, projId]
      }));
      if (projectObj && !savedProjects.some(p => p.id === projId)) {
        setSavedProjects(prev => [...prev, projectObj]);
      }
    }
  };

  const handleToggleSaveIdea = (ideaId: string) => {
    if (userSession.savedIdeaIds.includes(ideaId)) {
      setUserSession(prev => ({
        ...prev,
        savedIdeaIds: prev.savedIdeaIds.filter(id => id !== ideaId)
      }));
    } else {
      setUserSession(prev => ({
        ...prev,
        savedIdeaIds: [...prev.savedIdeaIds, ideaId]
      }));
    }
  };

  const handleCompareProject = (project: Project) => {
    if (!comparedProjects.some(p => p.id === project.id)) {
      if (comparedProjects.length >= 3) {
        setComparedProjects([...comparedProjects.slice(1), project]);
      } else {
        setComparedProjects([...comparedProjects, project]);
      }
    }
    setActiveTab('compare');
  };

  const handleRemoveFromCompare = (projectId: string) => {
    setComparedProjects(prev => prev.filter(p => p.id !== projectId));
  };

  const handleSavePrivatePreCheck = (evalResult: Project) => {
    setPrivateEvaluations(prev => [evalResult, ...prev]);
    setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gh-bg text-gh-fg font-sans">
      
      {/* NAVBAR */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userSession={userSession}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        savedCount={userSession.savedProjectIds.length + userSession.savedIdeaIds.length}
      />

      {/* MAIN VIEW CONTENT */}
      <main className="flex-1">
        {activeTab === 'landing' && (
          <LandingView
            setActiveTab={setActiveTab}
            onSearchSubmit={handleSearchSubmit}
            onSelectProjectObj={handleSelectProject}
            onSearchAttempt={handleSearchAttempt}
          />
        )}

        {activeTab === 'search' && (
          <SearchDiscoveryView
            initialQuery={activeSearchQuery}
            onSelectProject={handleSelectProject}
            onCompareProject={handleCompareProject}
            onToggleSaveProject={(projId) => {
              const found = savedProjects.find(p => p.id === projId) || selectedProjectModal;
              if (found) handleToggleSaveProject(found);
              else handleToggleSaveProject(projId);
            }}
            savedProjectIds={userSession.savedProjectIds}
            comparedProjectIds={comparedProjects.map(p => p.id)}
            isAuthenticated={userSession.isAuthenticated}
            searchCount={searchCount}
            onSearchAttempt={handleSearchAttempt}
            onOpenAuth={handleOpenAuth}
            onAnalyzeUrl={handleAnalyzeRepositoryUrl}
          />
        )}

        {activeTab === 'intelligence' && (
          <RepositoryIntelligenceView
            report={intelReport}
            isLoading={intelLoading}
            status={intelStatus}
            progress={intelProgress}
            currentStep={intelStep}
            errorCode={intelErrorCode}
            errorMessage={intelErrorMessage}
            onAnalyzeUrl={handleAnalyzeRepositoryUrl}
            onSaveReport={handleSaveReport}
            isSaved={Boolean(intelReport && savedIntelligenceReports.some(r => r.id === intelReport.id))}
            onOpenAuth={handleOpenAuth}
            onGoBack={() => setActiveTab('landing')}
          />
        )}

        {activeTab === 'suggestions' && (
          <ProjectSuggestionsView
            onToggleSaveIdea={handleToggleSaveIdea}
            savedIdeaIds={userSession.savedIdeaIds}
            onSelectIdeaForRecommender={() => setActiveTab('recommender')}
          />
        )}

        {activeTab === 'precheck' && (
          <PrivatePreCheckView
            onSaveEvaluation={handleSavePrivatePreCheck}
            onSearchAttempt={handleSearchAttempt}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileAnalyzerView
            currentUsername={userSession.username}
            onNavigateToRecommender={() => setActiveTab('recommender')}
            onSearchAttempt={handleSearchAttempt}
            onProfileLoaded={(prof) => {
              setCurrentProfile(prof);
              if (!userSession.isAuthenticated) {
                setUserSession(prev => ({
                  ...prev,
                  username: prof.username,
                  name: prof.name,
                  avatarUrl: prof.avatarUrl
                }));
              }
            }}
          />
        )}

        {activeTab === 'recommender' && (
          <PersonalizedRecommenderView
            profile={currentProfile}
            onOpenAuth={() => handleOpenAuth('signup')}
            onSelectIdea={() => setActiveTab('suggestions')}
          />
        )}

        {activeTab === 'compare' && (
          <ProjectCompareMatrix
            comparedProjects={comparedProjects}
            onRemoveFromCompare={handleRemoveFromCompare}
            onClose={() => setActiveTab('search')}
          />
        )}

        {activeTab === 'dashboard' && (
          <SavedDashboardView
            savedProjects={savedProjects}
            savedIdeaIds={userSession.savedIdeaIds}
            privateEvaluations={privateEvaluations}
            savedIntelligenceReports={savedIntelligenceReports}
            onSelectProject={handleSelectProject}
            onRemoveSavedProject={(id) => handleToggleSaveProject(id)}
            onRemoveSavedIdea={handleToggleSaveIdea}
            onSelectIntelligenceReport={(rep) => { setIntelReport(rep); setActiveTab('intelligence'); }}
            onRemoveSavedReport={(id) => setSavedIntelligenceReports(prev => prev.filter(r => r.id !== id))}
            setActiveTab={setActiveTab}
          />
        )}
      </main>

      {/* FOOTER */}
      <Footer setActiveTab={setActiveTab} />

      {/* AI DEEP DIVE INSPECTOR MODAL */}
      <ProjectDetailModal
        project={selectedProjectModal}
        onClose={() => setSelectedProjectModal(null)}
        onToggleSave={(id) => {
          if (selectedProjectModal) handleToggleSaveProject(selectedProjectModal);
          else handleToggleSaveProject(id);
        }}
        isSaved={selectedProjectModal ? userSession.savedProjectIds.includes(selectedProjectModal.id) : false}
        onCompare={handleCompareProject}
      />

      {/* AUTHENTICATION MODAL */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        reason={authModalReason}
      />

      {/* LANDING BOTTOM-RIGHT FLOATING TOAST (3 seconds auto-fade) */}
      <SearchQuotaToast
        isAuthenticated={userSession.isAuthenticated}
        remainingSearches={Math.max(0, DAILY_FREE_SEARCH_LIMIT - searchCount)}
        onOpenAuth={() => handleOpenAuth('signup')}
      />

    </div>
  );
}

export default App;
