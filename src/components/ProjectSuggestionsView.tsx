import React, { useState } from 'react';
import { Lightbulb, Bookmark, ArrowRight, AlertCircle, Award, Clock } from 'lucide-react';
import { PROJECT_IDEAS_CATALOG } from '../data/mockData';
import { ProjectIdea, DomainCategory, SaturationBadge } from '../types';

interface ProjectSuggestionsViewProps {
  onToggleSaveIdea: (ideaId: string) => void;
  savedIdeaIds: string[];
  onSelectIdeaForRecommender: (idea: ProjectIdea) => void;
}

export const ProjectSuggestionsView: React.FC<ProjectSuggestionsViewProps> = ({
  onToggleSaveIdea, savedIdeaIds, onSelectIdeaForRecommender
}) => {
  const [selDomain, setSelDomain] = useState<DomainCategory | 'All'>('All');
  const [selBadge, setSelBadge] = useState<SaturationBadge | 'All'>('All');

  const domainList: (DomainCategory | 'All')[] = ['All', 'AI & Machine Learning', 'Fintech & Payments', 'Productivity & Tools', 'EdTech & Learning', 'Developer Tools & Infra', 'Cybersecurity'];
  const badgeList: (SaturationBadge | 'All')[] = ['All', 'Frequently Made', 'Unique', 'High Demand', 'High Portfolio Value', 'Monetizable', 'Beginner-Friendly'];

  const filtered = PROJECT_IDEAS_CATALOG.filter(i =>
    (selDomain === 'All' || i.domain === selDomain) && (selBadge === 'All' || i.saturationBadge === selBadge)
  );

  const badgeStyle = (b: string) => {
    if (b === 'Frequently Made') return 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20';
    if (b === 'Unique') return 'bg-purple-400/10 text-purple-400 border-purple-400/20';
    if (b === 'Monetizable') return 'bg-green-400/10 text-green-400 border-green-400/20';
    if (b === 'Beginner-Friendly') return 'bg-teal-400/10 text-teal-400 border-teal-400/20';
    return 'bg-blue-400/10 text-blue-400 border-blue-400/20';
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      <div className="gh-card p-5">
        <div className="flex items-center gap-2 mb-1"><Lightbulb className="w-4 h-4 text-gh-warning" /><span className="text-xs font-medium text-gh-warning">Project Ideas</span></div>
        <h1 className="text-xl font-bold text-gh-fg mb-1">What should you build next?</h1>
        <p className="text-[13px] text-gh-fgMuted">Project blueprints categorized by saturation, demand, and resume impact. Badges indicate whether an idea is <span className="text-yellow-400 font-medium">Frequently Made</span> or a <span className="text-purple-400 font-medium">Unique</span> differentiator.</p>
      </div>

      {/* Filters */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-xs text-gh-fgSubtle shrink-0 mr-1">Domain:</span>
          {domainList.map(d => (
            <button key={d} onClick={() => setSelDomain(d)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                selDomain === d ? 'bg-gh-accent/15 text-gh-accent border border-gh-accent/30' : 'text-gh-fgMuted hover:text-gh-fg bg-gh-canvas border border-transparent hover:border-gh-border'
              }`}>{d}</button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-xs text-gh-fgSubtle shrink-0 mr-1">Badge:</span>
          {badgeList.map(b => (
            <button key={b} onClick={() => setSelBadge(b)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                selBadge === b ? 'bg-gh-card text-gh-fg border border-gh-border' : 'text-gh-fgMuted hover:text-gh-fg bg-gh-canvas border border-transparent hover:border-gh-border'
              }`}>{b}</button>
          ))}
        </div>
      </div>

      {/* Ideas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(idea => {
          const saved = savedIdeaIds.includes(idea.id);
          return (
            <div key={idea.id} className="gh-card p-4 gh-card-hover flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-medium text-gh-fgMuted bg-gh-bg px-2 py-0.5 rounded border border-gh-borderMuted">{idea.domain}</span>
                  <span className={`gh-badge border ${badgeStyle(idea.saturationBadge)}`}>{idea.saturationBadge}</span>
                </div>

                <h3 className="font-semibold text-[15px] text-gh-fg mb-1.5">{idea.title}</h3>

                <div className="flex items-center gap-1 text-[11px] text-gh-fgSubtle font-mono mb-2">
                  <AlertCircle className="w-3 h-3" /> {idea.saturationText}
                </div>

                <p className="text-xs text-gh-fgMuted leading-relaxed mb-3">{idea.whyBuildIt}</p>

                <div className="space-y-1 mb-3">
                  <div className="text-[10px] text-gh-fgSubtle uppercase font-semibold">Features</div>
                  {idea.coreFeatures.map((f, i) => (
                    <div key={i} className="text-xs text-gh-fgMuted flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-gh-fgSubtle shrink-0" /> <span className="line-clamp-1">{f}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1">
                  {idea.recommendedTechStack.map((t, i) => (
                    <span key={i} className="text-[11px] text-gh-fgMuted bg-gh-bg px-1.5 py-0.5 rounded border border-gh-borderMuted font-mono">{t}</span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-gh-borderMuted flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-gh-fgMuted">
                  <span className="flex items-center gap-1 font-medium text-gh-done"><Award className="w-3.5 h-3.5" />{idea.resumeImpactScore}%</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />~{idea.estimatedHours}h</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => onToggleSaveIdea(idea.id)}
                    className={`p-1.5 rounded-md border transition-colors ${saved ? 'bg-gh-accent/10 text-gh-accent border-gh-accent/30' : 'text-gh-fgMuted border-gh-border hover:text-gh-fg hover:bg-gh-card'}`}>
                    <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-current' : ''}`} />
                  </button>
                  <button onClick={() => onSelectIdeaForRecommender(idea)} className="gh-btn-secondary text-xs">
                    Use <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
