import React from 'react';
import { Bookmark, Star, X, Trash2, ArrowRight, Clock, Lightbulb, Lock, Package, Sparkles } from 'lucide-react';
import { Project, ProjectIdea } from '../types';
import { RepositoryIntelligenceReport } from '../types/repoIntelligenceTypes';
import { PROJECT_IDEAS_CATALOG } from '../data/mockData';

interface SavedDashboardViewProps {
  savedProjects: Project[];
  savedIdeaIds: string[];
  privateEvaluations: Project[];
  savedIntelligenceReports?: RepositoryIntelligenceReport[];
  onSelectProject: (proj: Project) => void;
  onRemoveSavedProject: (projId: string) => void;
  onRemoveSavedIdea: (ideaId: string) => void;
  onSelectIntelligenceReport?: (report: RepositoryIntelligenceReport) => void;
  onRemoveSavedReport?: (reportId: string) => void;
  setActiveTab: (tab: string) => void;
}

export const SavedDashboardView: React.FC<SavedDashboardViewProps> = ({
  savedProjects, savedIdeaIds, privateEvaluations, savedIntelligenceReports = [],
  onSelectProject, onRemoveSavedProject, onRemoveSavedIdea,
  onSelectIntelligenceReport, onRemoveSavedReport, setActiveTab
}) => {
  const savedIdeas = PROJECT_IDEAS_CATALOG.filter(i => savedIdeaIds.includes(i.id));
  const totalItems = savedProjects.length + savedIdeas.length + privateEvaluations.length + savedIntelligenceReports.length;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      <div>
        <h1 className="text-xl font-bold text-gh-fg flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-gh-fgMuted shrink-0" />
            <span>Saved & History</span>
          </span>
          <span className="text-xs text-gh-fgSubtle font-normal bg-gh-card px-2 py-0.5 rounded-full border border-gh-border shrink-0">{totalItems} items</span>
        </h1>
        <p className="text-[13px] text-gh-fgMuted mt-0.5">Your bookmarked projects, saved ideas, intelligence reports, and private pre-check results.</p>
      </div>

      {/* Saved Intelligence Reports */}
      {savedIntelligenceReports.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gh-fg flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-gh-accent" /> Repository Intelligence Reports ({savedIntelligenceReports.length})</h2>
            <button onClick={() => setActiveTab('intelligence')} className="text-xs text-gh-accent hover:underline flex items-center gap-1">Analyze new repo <ArrowRight className="w-3 h-3" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {savedIntelligenceReports.map(rep => (
              <div key={rep.id} className="gh-card p-4 gh-card-hover flex items-start justify-between gap-3 border-l-2 border-l-gh-accent">
                <div className="min-w-0 flex-1 cursor-pointer" onClick={() => onSelectIntelligenceReport && onSelectIntelligenceReport(rep)}>
                  <h3 className="font-semibold text-[13px] text-gh-fg hover:text-gh-accent transition-colors truncate">{rep.owner} / {rep.repositoryName}</h3>
                  <p className="text-xs text-gh-fgMuted font-mono truncate">{rep.metadata.primaryLanguage} · {rep.scanMode.toUpperCase()} SCAN</p>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-gh-fgMuted">
                    <span className="font-bold text-gh-fg">{rep.overallScore}/100</span>
                    <span className="text-[11px] text-gh-fgSubtle">({rep.confidence} confidence)</span>
                  </div>
                </div>
                {onRemoveSavedReport && (
                  <button onClick={() => onRemoveSavedReport(rep.id)} className="p-1.5 text-gh-fgMuted hover:text-gh-danger rounded-md hover:bg-gh-bg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Saved Projects */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gh-fg flex items-center gap-1.5"><Package className="w-4 h-4 text-gh-fgMuted" /> Saved Projects ({savedProjects.length})</h2>
          <button onClick={() => setActiveTab('search')} className="text-xs text-gh-accent hover:underline flex items-center gap-1">Browse more <ArrowRight className="w-3 h-3" /></button>
        </div>
        {savedProjects.length === 0 ? (
          <div className="gh-card p-6 text-center text-sm text-gh-fgMuted">No saved projects yet. Start exploring.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {savedProjects.map(p => (
              <div key={p.id} className="gh-card p-4 gh-card-hover flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 cursor-pointer" onClick={() => onSelectProject(p)}>
                  <h3 className="font-semibold text-[13px] text-gh-fg hover:text-gh-accent transition-colors truncate">{p.name}</h3>
                  <p className="text-xs text-gh-fgMuted font-mono">{p.owner.login} · {p.domain}</p>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-gh-fgMuted">
                    <span className="flex items-center gap-1"><Star className="w-3 h-3" />{p.starRating}</span>
                    <span>{p.numericScore}/100</span>
                  </div>
                </div>
                <button onClick={() => onRemoveSavedProject(p.id)} className="p-1.5 text-gh-fgMuted hover:text-gh-danger rounded-md hover:bg-gh-bg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Saved Ideas */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gh-fg flex items-center gap-1.5"><Lightbulb className="w-4 h-4 text-gh-warning" /> Saved Ideas ({savedIdeas.length})</h2>
          <button onClick={() => setActiveTab('suggestions')} className="text-xs text-gh-accent hover:underline flex items-center gap-1">Browse ideas <ArrowRight className="w-3 h-3" /></button>
        </div>
        {savedIdeas.length === 0 ? (
          <div className="gh-card p-6 text-center text-sm text-gh-fgMuted">No saved ideas yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {savedIdeas.map(idea => (
              <div key={idea.id} className="gh-card p-4 gh-card-hover flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-[13px] text-gh-fg truncate">{idea.title}</h3>
                  <p className="text-xs text-gh-fgMuted">{idea.domain}</p>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-gh-fgSubtle">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />~{idea.estimatedHours}h</span>
                  </div>
                </div>
                <button onClick={() => onRemoveSavedIdea(idea.id)} className="p-1.5 text-gh-fgMuted hover:text-gh-danger rounded-md hover:bg-gh-bg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Private Evaluations */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gh-fg flex items-center gap-1.5"><Lock className="w-4 h-4 text-gh-success" /> Private Pre-Checks ({privateEvaluations.length})</h2>
          <button onClick={() => setActiveTab('precheck')} className="text-xs text-gh-accent hover:underline flex items-center gap-1">New check <ArrowRight className="w-3 h-3" /></button>
        </div>
        {privateEvaluations.length === 0 ? (
          <div className="gh-card p-6 text-center text-sm text-gh-fgMuted">No private evaluations yet. Run a pre-check first.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {privateEvaluations.map(ev => (
              <div key={ev.id} className="gh-card p-4 gh-card-hover cursor-pointer" onClick={() => onSelectProject(ev)}>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-[13px] text-gh-fg truncate">{ev.name}</h3>
                  <span className="gh-badge bg-green-400/10 text-green-400 border border-green-400/20">Private</span>
                </div>
                <p className="text-xs text-gh-fgMuted">{ev.domain}</p>
                <div className="flex items-center gap-2 mt-1.5 text-xs">
                  <span className="text-gh-fg font-medium">{ev.numericScore}/100</span>
                  <span className="text-gh-accent">Top {100 - ev.domainPercentileRank}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
