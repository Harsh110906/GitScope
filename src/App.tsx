import React, { useState } from 'react';
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
import { AuthModal, AuthMode, AuthReason } from './components/AuthModal';

import { Project, UserSession, ProfileEvaluation } from './types';
import { fetchGithubUserProfile } from './services/githubService';

const FREE_SEARCH_LIMIT = 3;

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

  // Anonymous Search Counter (persisted in localStorage)
  const [searchCount, setSearchCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('gitscope_search_count');
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

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

  // Search Gatekeeper Check
  const handleSearchAttempt = (): boolean => {
    if (userSession.isAuthenticated) return true;
    if (searchCount >= FREE_SEARCH_LIMIT) {
      setAuthModalReason('limit_reached');
      setAuthModalMode('signup');
      setIsAuthModalOpen(true);
      return false;
    }
    const newCount = searchCount + 1;
    setSearchCount(newCount);
    try {
      localStorage.setItem('gitscope_search_count', newCount.toString());
    } catch (e) {
      // Storage unavailable fallback
    }
    return true;
  };

  const handleOpenAuth = (mode: AuthMode = 'signup') => {
    setAuthModalReason('user_click');
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleSearchSubmit = (query: string) => {
    setActiveSearchQuery(query);
    setActiveTab('search');
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

  const handleUserLogin = async (userInfo: { username: string; email?: string; provider?: string }) => {
    const uname = userInfo.username || 'developer';
    const profile = await fetchGithubUserProfile(uname);
    
    setUserSession({
      isAuthenticated: true,
      username: profile?.username || uname,
      name: profile?.name || uname,
      avatarUrl: profile?.avatarUrl || `https://github.com/${uname}.png`,
      savedProjectIds: userSession.savedProjectIds,
      savedIdeaIds: userSession.savedIdeaIds,
      privateEvaluations: userSession.privateEvaluations
    });

    if (profile) {
      setCurrentProfile(profile);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gh-bg text-gh-fg font-sans">
      
      {/* NAVBAR */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userSession={userSession}
        onOpenAuth={handleOpenAuth}
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
          />
        )}

        {activeTab === 'profile' && (
          <ProfileAnalyzerView
            currentUsername={userSession.username}
            onNavigateToRecommender={() => setActiveTab('recommender')}
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
            onSelectProject={handleSelectProject}
            onRemoveSavedProject={(id) => handleToggleSaveProject(id)}
            onRemoveSavedIdea={handleToggleSaveIdea}
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
        onLogin={handleUserLogin}
        initialMode={authModalMode}
        reason={authModalReason}
      />

    </div>
  );
}

export default App;
