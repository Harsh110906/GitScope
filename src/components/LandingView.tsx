import React, { useState, useEffect } from 'react';
import { Search, ArrowRight, Star, BarChart3, Lock, TrendingUp, GitFork } from 'lucide-react';
import { Project } from '../types';
import { searchGithubProjects } from '../services/githubService';

interface LandingViewProps {
  setActiveTab: (tab: string) => void;
  onSearchSubmit: (query: string) => void;
  onSelectProjectObj: (proj: Project) => void;
  onSearchAttempt?: () => boolean;
}

export const LandingView: React.FC<LandingViewProps> = ({
  setActiveTab, onSearchSubmit, onSelectProjectObj, onSearchAttempt
}) => {
  const [queryInput, setQueryInput] = useState('');
  const [topRepos, setTopRepos] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadTrending() {
      setIsLoading(true);
      const results = await searchGithubProjects('');
      if (isMounted) {
        setTopRepos(results.slice(0, 3));
        setIsLoading(false);
      }
    }
    loadTrending();
    return () => { isMounted = false; };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (queryInput.trim()) {
      if (onSearchAttempt && !onSearchAttempt()) {
        return;
      }
      onSearchSubmit(queryInput.trim());
      setActiveTab('search');
    }
  };

  const handleTopicClick = (topic: string) => {
    if (onSearchAttempt && !onSearchAttempt()) {
      return;
    }
    onSearchSubmit(topic);
    setActiveTab('search');
  };

  const quickTopics = [
    'to-do list apps', 'fintech dashboard', 'AI chatbot', 'developer CLI', 'cybersecurity'
  ];

  return (
    <div className="pb-16">
      
      {/* Hero */}
      <section className="border-b border-gh-border bg-gh-canvas">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12 lg:py-24">
          <div className="max-w-3xl">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-gh-fg tracking-tight leading-tight mb-4">
              Find, analyze, and inspect
              <br />
              <span className="text-gh-accent">GitHub repositories</span> with AI Intelligence
            </h1>

            <p className="text-gh-fgMuted text-sm sm:text-base lg:text-lg leading-relaxed mb-6 sm:mb-8 max-w-2xl">
              GitScope Repository Intelligence generates multi-pillar reports covering documentation, code organization, testing maturity, maintenance activity, advisory security, and personalized contribution matching.
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="mb-5 max-w-2xl">
              <div className="flex flex-col sm:flex-row gap-2 bg-gh-bg border border-gh-border rounded-md p-1.5 focus-within:border-gh-accent transition-colors">
                <div className="flex items-center gap-2 flex-1 px-2 py-1 sm:py-0">
                  <Search className="w-4 h-4 text-gh-fgSubtle shrink-0" />
                  <input
                    type="text"
                    value={queryInput}
                    onChange={(e) => setQueryInput(e.target.value)}
                    placeholder="Paste repo URL (e.g. facebook/react) or search..."
                    className="w-full bg-transparent text-sm text-gh-fg focus:outline-none placeholder:text-gh-fgSubtle py-1"
                  />
                </div>
                <button
                  type="submit"
                  className="gh-btn-primary justify-center shrink-0 py-2 sm:py-1.5 px-4"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Analyze / Search</span>
                </button>
              </div>
            </form>

            <div className="flex flex-wrap items-center gap-2 text-[13px]">
              <span className="text-gh-fgSubtle text-xs">Try repos:</span>
              {['https://github.com/facebook/react', 'https://github.com/expressjs/express', 'AI chatbot'].map((t, i) => (
                <button
                  key={i}
                  onClick={() => handleTopicClick(t)}
                  className="px-2.5 py-1 rounded-md bg-gh-card border border-gh-border text-gh-fgMuted hover:text-gh-accent hover:border-gh-accent transition-colors font-mono text-xs max-w-[260px] truncate"
                >
                  {t.replace('https://github.com/', '')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Search, title: 'Intent-Aware Search', desc: 'Searching for "to-do list apps" surfaces kanban boards, habit trackers, and workflow tools — compared side by side.', color: 'text-gh-accent' },
            { icon: BarChart3, title: 'Multi-Axis Scoring', desc: 'Projects rated on originality, UX polish, technical depth, utility, completeness, and resume impact. Domain-relative percentile ranks.', color: 'text-gh-success' },
            { icon: Lock, title: 'Private Pre-Check', desc: 'Evaluate draft projects before publishing. Get a pre-release score, domain benchmark, and improvement roadmap.', color: 'text-gh-done' },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="gh-card p-5 space-y-3 gh-card-hover">
                <Icon className={`w-5 h-5 ${f.color}`} />
                <h3 className="font-semibold text-gh-fg">{f.title}</h3>
                <p className="text-[13px] text-gh-fgMuted leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Top Repositories */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 pb-12">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gh-fgMuted" />
            <h2 className="font-semibold text-lg text-gh-fg">Top Rated Repositories</h2>
          </div>
          <button onClick={() => setActiveTab('search')} className="gh-btn-secondary text-xs">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 text-center">
            <div className="w-6 h-6 border-2 border-gh-accent border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-gh-fgMuted">Fetching top repositories from GitHub API...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topRepos.map((proj) => (
              <button
                key={proj.id}
                onClick={() => { onSelectProjectObj(proj); setActiveTab('search'); }}
                className="gh-card p-4 text-left gh-card-hover space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gh-fgMuted bg-gh-bg px-2 py-0.5 rounded-md border border-gh-borderMuted">
                    {proj.domain}
                  </span>
                  <span className={`gh-badge border ${
                    proj.saturationBadge === 'Frequently Made' ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20' :
                    proj.saturationBadge === 'Unique' ? 'bg-purple-400/10 text-purple-400 border-purple-400/20' :
                    'bg-blue-400/10 text-blue-400 border-blue-400/20'
                  }`}>
                    {proj.saturationBadge}
                  </span>
                </div>

                <div>
                  <h3 className="font-semibold text-gh-fg text-[15px] mb-1 truncate">{proj.name}</h3>
                  <p className="text-xs text-gh-fgMuted line-clamp-2">{proj.description}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gh-borderMuted text-xs">
                  <div className="flex items-center gap-3 text-gh-fgMuted">
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5" /> {proj.stars.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork className="w-3.5 h-3.5" /> {proj.forks.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 font-semibold text-gh-accent">
                    <span>{proj.numericScore}/100</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="gh-card p-8 sm:p-12 text-center">
          <h2 className="text-2xl font-bold text-gh-fg mb-3">
            Ready to improve your GitHub portfolio?
          </h2>
          <p className="text-gh-fgMuted text-sm max-w-lg mx-auto mb-6 leading-relaxed">
            Analyze your profile, discover where you stand among developers, and get a personalized plan to build stronger projects.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button onClick={() => setActiveTab('profile')} className="gh-btn-primary">
              Analyze Profile
            </button>
            <button onClick={() => setActiveTab('suggestions')} className="gh-btn-secondary">
              Browse Project Ideas
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
