import React from 'react';
import { Layers, X, Star, ExternalLink, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { Project } from '../types';

interface ProjectCompareMatrixProps {
  comparedProjects: Project[];
  onRemoveFromCompare: (projectId: string) => void;
  onClose: () => void;
}

const CHART_COLORS = ['#58a6ff', '#a371f7', '#3fb950'];

export const ProjectCompareMatrix: React.FC<ProjectCompareMatrixProps> = ({
  comparedProjects, onRemoveFromCompare, onClose
}) => {
  const radarAxes = [
    { key: 'originality', label: 'Originality' },
    { key: 'uxPolish', label: 'UX Polish' },
    { key: 'technicalDepth', label: 'Tech Depth' },
    { key: 'utility', label: 'Utility' },
    { key: 'portfolioValue', label: 'Portfolio' },
    { key: 'codeCompleteness', label: 'Completeness' },
  ];

  const radarData = radarAxes.map(axis => {
    const point: any = { subject: axis.label };
    comparedProjects.forEach((p, i) => {
      point[`project${i}`] = (p.scoreBreakdown as any)[axis.key] || 0;
    });
    return point;
  });

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gh-fg flex items-center gap-2">
          <Layers className="w-5 h-5 text-gh-fgMuted" /> Compare Projects
          <span className="text-xs text-gh-fgSubtle font-normal">({comparedProjects.length} / 3)</span>
        </h1>
        <button onClick={onClose} className="gh-btn-secondary text-xs">
          <X className="w-3.5 h-3.5" /> Close
        </button>
      </div>

      {comparedProjects.length < 2 ? (
        <div className="py-16 text-center gh-card p-8">
          <AlertCircle className="w-10 h-10 text-gh-fgSubtle mx-auto mb-3" />
          <h3 className="font-semibold text-gh-fg mb-1">Need at least 2 projects</h3>
          <p className="text-[13px] text-gh-fgMuted">Add more projects from the Explore tab to compare them side by side.</p>
        </div>
      ) : (
        <>
          {/* Radar Chart */}
          <div className="gh-card p-5">
            <h3 className="text-xs font-semibold text-gh-fgMuted uppercase text-center mb-2">Quality Radar</h3>
            <div className="h-72 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#30363d" />
                  <PolarAngleAxis dataKey="subject" stroke="#8b949e" tick={{ fill: '#8b949e', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#21262d" />
                  {comparedProjects.map((p, i) => (
                    <Radar key={p.id} name={p.name} dataKey={`project${i}`} stroke={CHART_COLORS[i]} fill={CHART_COLORS[i]} fillOpacity={0.12} />
                  ))}
                  <Legend wrapperStyle={{ fontSize: '12px', color: '#e6edf3' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {comparedProjects.map((proj, i) => (
              <div key={proj.id} className="gh-card p-4 relative" style={{ borderTopColor: CHART_COLORS[i], borderTopWidth: '3px' }}>
                <button onClick={() => onRemoveFromCompare(proj.id)} className="absolute top-2 right-2 p-1 text-gh-fgMuted hover:text-gh-fg rounded-md hover:bg-gh-bg">
                  <X className="w-3.5 h-3.5" />
                </button>

                <h3 className="font-semibold text-gh-fg mb-0.5 pr-6">{proj.name}</h3>
                <p className="text-xs text-gh-fgMuted font-mono mb-3">{proj.owner.login} · {proj.domain}</p>

                <div className="grid grid-cols-2 gap-2 mb-3 text-center text-xs">
                  <div className="bg-gh-bg border border-gh-borderMuted rounded p-2">
                    <div className="text-gh-fgSubtle text-[10px]">Score</div>
                    <div className="font-bold text-gh-fg">{proj.numericScore}/100</div>
                  </div>
                  <div className="bg-gh-bg border border-gh-borderMuted rounded p-2">
                    <div className="text-gh-fgSubtle text-[10px]">Rating</div>
                    <div className="font-bold text-yellow-400 flex items-center justify-center gap-0.5"><Star className="w-3 h-3 fill-yellow-400" />{proj.starRating}</div>
                  </div>
                  <div className="bg-gh-bg border border-gh-borderMuted rounded p-2">
                    <div className="text-gh-fgSubtle text-[10px]">Rank</div>
                    <div className="font-bold text-gh-accent">Top {100 - proj.domainPercentileRank}%</div>
                  </div>
                  <div className="bg-gh-bg border border-gh-borderMuted rounded p-2">
                    <div className="text-gh-fgSubtle text-[10px]">Stars</div>
                    <div className="font-bold text-gh-fg">{proj.stars.toLocaleString()}</div>
                  </div>
                </div>

                {/* Score bars */}
                <div className="space-y-1.5 text-[11px]">
                  {radarAxes.map(axis => {
                    const val = (proj.scoreBreakdown as any)[axis.key] || 0;
                    return (
                      <div key={axis.key} className="flex items-center gap-2">
                        <span className="w-20 text-gh-fgSubtle truncate">{axis.label}</span>
                        <div className="flex-1 h-1.5 bg-gh-bg rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${val}%`, background: CHART_COLORS[i] }} />
                        </div>
                        <span className="w-8 text-right font-medium text-gh-fg">{val}</span>
                      </div>
                    );
                  })}
                </div>

                <a href={proj.repoUrl} target="_blank" rel="noopener noreferrer"
                  className="gh-btn-secondary text-xs w-full justify-center mt-4">
                  GitHub <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
