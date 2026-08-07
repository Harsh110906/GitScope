import React, { useState, useEffect } from 'react';
import { Search, Star, GitFork, Grid, List, ArrowUpDown, Layers, Bookmark, ExternalLink, Zap, CircleAlert, Lock } from 'lucide-react';
import { Project, DomainCategory, FilterOptions } from '../types';
import { searchGithubProjects } from '../services/githubService';
import { expandSearchIntent } from '../services/aiIntelligence';
import { parseAndValidateGithubUrl } from '../services/githubUrlParser';

interface SearchDiscoveryViewProps {
  initialQuery?: string;
  onSelectProject: (project: Project) => void;
  onCompareProject: (project: Project) => void;
  onToggleSaveProject: (projectId: string) => void;
  savedProjectIds: string[];
  comparedProjectIds: string[];
  isAuthenticated?: boolean;
  searchCount?: number;
  onSearchAttempt?: () => boolean;
  onOpenAuth?: (mode?: 'signin' | 'signup') => void;
  onAnalyzeUrl?: (url: string) => void;
}

export const SearchDiscoveryView: React.FC<SearchDiscoveryViewProps> = ({
  initialQuery = '', onSelectProject, onCompareProject, onToggleSaveProject, savedProjectIds, comparedProjectIds,
  isAuthenticated = false, searchCount = 0, onSearchAttempt, onOpenAuth, onAnalyzeUrl
}) => {
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [intentChips, setIntentChips] = useState<string[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [filters, setFilters] = useState<FilterOptions>({
    searchKeyword: initialQuery, domain: 'All Domains', difficulty: 'All',
    saturationBadge: 'All', minScore: 0, sortBy: 'relevance', sortOrder: 'desc', viewMode: 'grid'
  });

  const domains: DomainCategory[] = [
    'All Domains', 'AI & Machine Learning', 'Fintech & Payments', 'Productivity & Tools',
    'EdTech & Learning', 'Developer Tools & Infra', 'Cybersecurity', 'SaaS & Web Apps', 'Health & Fitness'
  ];

  const executeSearch = async (q: string, d: DomainCategory) => {
    setIsLoading(true);
    setIntentChips(expandSearchIntent(q));
    setProjects(await searchGithubProjects(q, d));
    setIsLoading(false);
  };

  useEffect(() => { executeSearch(searchTerm, filters.domain); }, [filters.domain]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchAttempt) {
      const allowed = onSearchAttempt();
      if (!allowed) return;
    }
    const urlCheck = parseAndValidateGithubUrl(searchTerm);
    if (urlCheck.valid && onAnalyzeUrl) {
      onAnalyzeUrl(searchTerm);
      return;
    }
    executeSearch(searchTerm, filters.domain);
  };

  const remainingSearches = Math.max(0, 3 - searchCount);

  const processed = projects
    .filter(p => (filters.difficulty === 'All' || p.difficulty === filters.difficulty)
      && (filters.saturationBadge === 'All' || p.saturationBadge === filters.saturationBadge)
      && p.numericScore >= filters.minScore)
    .sort((a, b) => {
      if (filters.sortBy === 'score') return b.numericScore - a.numericScore;
      if (filters.sortBy === 'stars') return b.stars - a.stars;
      if (filters.sortBy === 'unique') return b.scoreBreakdown.originality - a.scoreBreakdown.originality;
      if (filters.sortBy === 'portfolio') return b.scoreBreakdown.portfolioValue - a.scoreBreakdown.portfolioValue;
      return b.domainPercentileRank - a.domainPercentileRank;
    });

  const badgeStyle = (badge: string) => {
    if (badge === 'Frequently Made') return 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20';
    if (badge === 'Unique') return 'bg-purple-400/10 text-purple-400 border-purple-400/20';
    return 'bg-blue-400/10 text-blue-400 border-blue-400/20';
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-5">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gh-fg flex items-center gap-2">
            Explore Projects
            <span className="text-xs font-medium text-gh-fgSubtle bg-gh-card px-2 py-0.5 rounded-full border border-gh-border">
              {processed.length} results
            </span>
          </h1>
          <p className="text-[13px] text-gh-fgMuted mt-0.5">Search by topic or paste a GitHub repository URL</p>
        </div>
        <div className="flex items-center gap-2">
          {!isAuthenticated && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gh-bg border border-gh-borderMuted rounded-md text-xs text-gh-fgMuted">
              <Lock className="w-3.5 h-3.5 text-gh-accent" />
              <span>{remainingSearches} of 3 free searches left</span>
              {remainingSearches === 0 && (
                <button
                  onClick={() => onOpenAuth && onOpenAuth('signup')}
                  className="ml-1 text-gh-accent font-semibold hover:underline"
                >
                  Join free
                </button>
              )}
            </div>
          )}
          <div className="flex items-center gap-1 bg-gh-canvas border border-gh-border rounded-md p-0.5">
            <button onClick={() => setFilters({ ...filters, viewMode: 'grid' })}
              className={`p-1.5 rounded ${filters.viewMode === 'grid' ? 'bg-gh-card text-gh-fg' : 'text-gh-fgMuted hover:text-gh-fg'}`}
            ><Grid className="w-4 h-4" /></button>
            <button onClick={() => setFilters({ ...filters, viewMode: 'list' })}
              className={`p-1.5 rounded ${filters.viewMode === 'list' ? 'bg-gh-card text-gh-fg' : 'text-gh-fgMuted hover:text-gh-fg'}`}
            ><List className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-2 bg-gh-bg border border-gh-border rounded-md p-1.5 focus-within:border-gh-accent transition-colors">
          <Search className="w-4 h-4 text-gh-fgSubtle ml-2 shrink-0" />
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects..." className="flex-1 bg-transparent text-sm text-gh-fg focus:outline-none placeholder:text-gh-fgSubtle py-1" />
          <button type="submit" disabled={isLoading} className="gh-btn-primary shrink-0">
            {isLoading ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Search'}
          </button>
        </div>
      </form>

      {/* Intent Chips */}
      {intentChips.length > 1 && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-gh-fgMuted font-medium mr-1 flex items-center gap-1"><Zap className="w-3 h-3" /> Related:</span>
          {intentChips.map((c, i) => (
            <span key={i} className="px-2 py-0.5 bg-gh-card border border-gh-border rounded-md text-gh-fgMuted font-mono text-[11px]">
              {c}
            </span>
          ))}
        </div>
      )}

      {/* Domain Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
        {domains.map(d => (
          <button key={d} onClick={() => setFilters({ ...filters, domain: d })}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
              filters.domain === d ? 'bg-gh-accent/15 text-gh-accent border border-gh-accent/30' : 'text-gh-fgMuted hover:text-gh-fg bg-gh-canvas border border-transparent hover:border-gh-border'
            }`}
          >{d}</button>
        ))}
      </div>

      {/* Filter/Sort Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-2.5 px-3 bg-gh-canvas border border-gh-border rounded-md text-[13px]">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-gh-fgMuted">
            Difficulty:
            <select value={filters.difficulty} onChange={e => setFilters({ ...filters, difficulty: e.target.value })}
              className="gh-input text-xs py-1 px-2 cursor-pointer">
              <option value="All">All</option><option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option><option value="Advanced">Advanced</option><option value="Expert">Expert</option>
            </select>
          </label>
          <label className="flex items-center gap-1.5 text-gh-fgMuted">
            Badge:
            <select value={filters.saturationBadge} onChange={e => setFilters({ ...filters, saturationBadge: e.target.value })}
              className="gh-input text-xs py-1 px-2 cursor-pointer">
              <option value="All">All</option><option value="Frequently Made">Frequently Made</option>
              <option value="Unique">Unique</option><option value="High Demand">High Demand</option><option value="High Portfolio Value">High Resume</option>
            </select>
          </label>
        </div>
        <label className="flex items-center gap-1.5 text-gh-fgMuted">
          <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
          <select value={filters.sortBy} onChange={e => setFilters({ ...filters, sortBy: e.target.value as any })}
            className="gh-input text-xs py-1 px-2 cursor-pointer font-medium text-gh-accent">
            <option value="relevance">Best Match</option><option value="score">Highest Score</option>
            <option value="unique">Most Unique</option><option value="portfolio">Resume Impact</option><option value="stars">Most Stars</option>
          </select>
        </label>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-3 border-gh-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gh-fgMuted">Analyzing projects…</p>
        </div>
      ) : processed.length === 0 ? (
        <div className="py-16 text-center gh-card p-8">
          <CircleAlert className="w-10 h-10 text-gh-fgSubtle mx-auto mb-3" />
          <h3 className="font-semibold text-gh-fg mb-1">No results found</h3>
          <p className="text-[13px] text-gh-fgMuted">Try adjusting your search or domain filter.</p>
        </div>
      ) : (
        <div className={filters.viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-3'}>
          {processed.map(proj => {
            const saved = savedProjectIds.includes(proj.id);
            const compared = comparedProjectIds.includes(proj.id);
            return (
              <div key={proj.id} className="gh-card p-4 gh-card-hover flex flex-col justify-between space-y-3">
                
                <div>
                  {/* Badges row */}
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-medium text-gh-fgMuted bg-gh-bg px-2 py-0.5 rounded border border-gh-borderMuted">
                      {proj.domain}
                    </span>
                    <span className={`gh-badge border ${badgeStyle(proj.saturationBadge)}`}>
                      {proj.saturationBadge}
                    </span>
                  </div>

                  {/* Title & score */}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="min-w-0">
                      <h3 onClick={() => onSelectProject(proj)}
                        className="font-semibold text-[15px] text-gh-fg hover:text-gh-accent cursor-pointer transition-colors truncate">
                        {proj.name}
                      </h3>
                      <p className="text-xs text-gh-fgSubtle font-mono">{proj.owner.login}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-gh-fg">{proj.numericScore}<span className="text-gh-fgSubtle font-normal">/100</span></div>
                      <div className="text-[11px] text-gh-fgMuted">Top {100 - proj.domainPercentileRank}%</div>
                    </div>
                  </div>

                  <p className="text-xs text-gh-fgMuted line-clamp-2 mb-3">{proj.description}</p>

                  {/* Scores row */}
                  <div className="grid grid-cols-3 gap-2 text-center p-2 bg-gh-bg rounded-md border border-gh-borderMuted text-[11px] mb-3">
                    <div><div className="text-gh-fgSubtle">Originality</div><div className="font-semibold text-gh-fg">{proj.scoreBreakdown.originality}</div></div>
                    <div><div className="text-gh-fgSubtle">Tech Depth</div><div className="font-semibold text-gh-accent">{proj.scoreBreakdown.technicalDepth}</div></div>
                    <div><div className="text-gh-fgSubtle">UX Polish</div><div className="font-semibold text-gh-done">{proj.scoreBreakdown.uxPolish}</div></div>
                  </div>

                  {/* Topics */}
                  <div className="flex flex-wrap gap-1 mb-1">
                    {proj.topics.slice(0, 4).map((t, i) => (
                      <span key={i} className="text-[11px] text-gh-fgMuted bg-gh-bg px-1.5 py-0.5 rounded border border-gh-borderMuted">{t}</span>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-gh-borderMuted flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-gh-fgMuted">
                    <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" />{proj.stars.toLocaleString()}</span>
                    <span className="flex items-center gap-1"><GitFork className="w-3.5 h-3.5" />{proj.forks.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => onCompareProject(proj)} title="Compare"
                      className={`p-1.5 rounded-md border transition-colors ${compared ? 'bg-purple-400/10 text-purple-400 border-purple-400/30' : 'text-gh-fgMuted border-gh-border hover:text-gh-fg hover:bg-gh-card'}`}>
                      <Layers className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onToggleSaveProject(proj.id)} title="Save"
                      className={`p-1.5 rounded-md border transition-colors ${saved ? 'bg-gh-accent/10 text-gh-accent border-gh-accent/30' : 'text-gh-fgMuted border-gh-border hover:text-gh-fg hover:bg-gh-card'}`}>
                      <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-current' : ''}`} />
                    </button>
                    <button onClick={() => onSelectProject(proj)} className="gh-btn-primary text-xs py-1 px-2.5">
                      Details <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
