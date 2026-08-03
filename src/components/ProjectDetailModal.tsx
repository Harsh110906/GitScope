import React from 'react';
import { X, Star, ExternalLink, CheckCircle2, AlertTriangle, TrendingUp, Bookmark, Layers } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Project } from '../types';

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
  onToggleSave: (projectId: string) => void;
  isSaved: boolean;
  onCompare: (project: Project) => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project, onClose, onToggleSave, isSaved, onCompare
}) => {
  if (!project) return null;

  const radarData = [
    { subject: 'Originality', value: project.scoreBreakdown.originality },
    { subject: 'UX Polish', value: project.scoreBreakdown.uxPolish },
    { subject: 'Tech Depth', value: project.scoreBreakdown.technicalDepth },
    { subject: 'Utility', value: project.scoreBreakdown.utility },
    { subject: 'Portfolio', value: project.scoreBreakdown.portfolioValue },
    { subject: 'Completeness', value: project.scoreBreakdown.codeCompleteness },
    { subject: 'Maintainability', value: project.scoreBreakdown.maintainability },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 bg-black/60 overflow-y-auto">
      <div className="w-full max-w-3xl bg-gh-canvas border border-gh-border rounded-lg shadow-2xl my-4">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-gh-border flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg text-gh-fg">{project.name}</h2>
            <p className="text-xs text-gh-fgMuted font-mono">{project.owner.login} · {project.domain}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md text-gh-fgMuted hover:text-gh-fg hover:bg-gh-card"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-6">
          
          {/* Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gh-bg border border-gh-borderMuted rounded-md p-3 text-center">
              <div className="text-[11px] text-gh-fgSubtle uppercase">Score</div>
              <div className="text-xl font-bold text-gh-fg">{project.numericScore}<span className="text-sm font-normal text-gh-fgMuted">/100</span></div>
            </div>
            <div className="bg-gh-bg border border-gh-borderMuted rounded-md p-3 text-center">
              <div className="text-[11px] text-gh-fgSubtle uppercase">Star Rating</div>
              <div className="text-xl font-bold text-yellow-400 flex items-center justify-center gap-1"><Star className="w-4 h-4 fill-yellow-400" />{project.starRating}</div>
            </div>
            <div className="bg-gh-bg border border-gh-borderMuted rounded-md p-3 text-center">
              <div className="text-[11px] text-gh-fgSubtle uppercase">Domain Rank</div>
              <div className="text-xl font-bold text-gh-accent">Top {100 - project.domainPercentileRank}%</div>
            </div>
            <div className="bg-gh-bg border border-gh-borderMuted rounded-md p-3 text-center">
              <div className="text-[11px] text-gh-fgSubtle uppercase">Similar Repos</div>
              <div className="text-xl font-bold text-gh-fg">{project.similarCount.toLocaleString()}</div>
            </div>
          </div>

          {/* Summary + Radar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="space-y-3">
              <div className="bg-gh-bg border border-gh-borderMuted rounded-md p-4">
                <h4 className="text-xs font-semibold text-gh-fgMuted uppercase mb-2">AI Summary</h4>
                <p className="text-[13px] text-gh-fg leading-relaxed">{project.aiSummary}</p>
              </div>
              <div className="bg-gh-bg border border-gh-borderMuted rounded-md p-4">
                <h4 className="text-xs font-semibold text-gh-fgMuted uppercase mb-2">Problem Solved</h4>
                <p className="text-[13px] text-gh-fg leading-relaxed">{project.problemSolved}</p>
              </div>
            </div>
            <div className="bg-gh-bg border border-gh-borderMuted rounded-md p-4 h-64">
              <h4 className="text-xs font-semibold text-gh-fgMuted uppercase mb-1 text-center">Quality Breakdown</h4>
              <ResponsiveContainer width="100%" height="90%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#30363d" />
                  <PolarAngleAxis dataKey="subject" stroke="#8b949e" tick={{ fill: '#8b949e', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#21262d" />
                  <Radar dataKey="value" stroke="#58a6ff" fill="#58a6ff" fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gh-bg border border-green-500/20 rounded-md p-4">
              <h4 className="text-xs font-semibold text-gh-success uppercase mb-2 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Strengths</h4>
              <ul className="space-y-1.5">{project.strengths.map((s, i) => (
                <li key={i} className="text-[13px] text-gh-fg flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gh-success mt-1.5 shrink-0" />{s}</li>
              ))}</ul>
            </div>
            <div className="bg-gh-bg border border-yellow-500/20 rounded-md p-4">
              <h4 className="text-xs font-semibold text-gh-warning uppercase mb-2 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Weaknesses</h4>
              <ul className="space-y-1.5">{project.weaknesses.map((w, i) => (
                <li key={i} className="text-[13px] text-gh-fg flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gh-warning mt-1.5 shrink-0" />{w}</li>
              ))}</ul>
            </div>
          </div>

          {/* Improvement Steps */}
          <div className="bg-gh-bg border border-gh-accent/20 rounded-md p-4">
            <h4 className="text-xs font-semibold text-gh-accent uppercase mb-3 flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> Improvement Roadmap</h4>
            <div className="space-y-2">
              {project.improvementSteps.map((s, i) => (
                <div key={i} className="flex items-start gap-3 p-2.5 bg-gh-canvas border border-gh-borderMuted rounded-md">
                  <span className="w-5 h-5 rounded-full bg-gh-accent/20 text-gh-accent text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  <p className="text-[13px] text-gh-fg">{s}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gh-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => onToggleSave(project.id)}
              className={`gh-btn-secondary text-xs ${isSaved ? 'text-gh-accent border-gh-accent/30' : ''}`}>
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} /> {isSaved ? 'Saved' : 'Save'}
            </button>
            <button onClick={() => onCompare(project)} className="gh-btn-secondary text-xs">
              <Layers className="w-3.5 h-3.5" /> Compare
            </button>
          </div>
          <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="gh-btn-primary text-xs">
            View on GitHub <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
