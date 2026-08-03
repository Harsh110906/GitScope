import React from 'react';
import { Sparkles, ArrowRight, Target, Lightbulb, TrendingUp, UserCheck } from 'lucide-react';
import { ProfileEvaluation, ProjectIdea } from '../types';

interface PersonalizedRecommenderViewProps {
  profile: ProfileEvaluation | null;
  onOpenAuth: () => void;
  onSelectIdea: (idea: ProjectIdea) => void;
}

export const PersonalizedRecommenderView: React.FC<PersonalizedRecommenderViewProps> = ({
  profile, onOpenAuth, onSelectIdea
}) => {
  if (!profile) {
    return (
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-12">
        <div className="gh-card p-8 text-center space-y-4 max-w-lg mx-auto">
          <UserCheck className="w-12 h-12 text-gh-fgSubtle mx-auto" />
          <h2 className="text-lg font-bold text-gh-fg">No GitHub Profile Connected</h2>
          <p className="text-xs text-gh-fgMuted leading-relaxed">
            Connect your GitHub account or search any username in the Profile Analyzer to generate tailored project blueprints and career recommendations.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button onClick={onOpenAuth} className="gh-btn-primary text-xs">
              Connect GitHub Profile
            </button>
            <button onClick={() => onSelectIdea({} as any)} className="gh-btn-secondary text-xs">
              Browse Idea Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Header */}
      <div className="gh-card p-5">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-gh-done" />
          <span className="text-xs font-medium text-gh-done">AI-Powered</span>
        </div>
        <h1 className="text-xl font-bold text-gh-fg mb-1">Personalized Recommendations</h1>
        <p className="text-[13px] text-gh-fgMuted">
          Based on <span className="text-gh-fg font-medium">@{profile.username}</span>'s profile analysis, these are the highest-impact projects and actions to upgrade your portfolio.
        </p>
      </div>

      {/* Profile Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gh-bg border border-gh-borderMuted rounded-md p-3 text-center">
          <div className="text-[11px] text-gh-fgSubtle uppercase">Level</div>
          <div className="font-bold text-gh-accent">{profile.developerLevel}</div>
        </div>
        <div className="bg-gh-bg border border-gh-borderMuted rounded-md p-3 text-center">
          <div className="text-[11px] text-gh-fgSubtle uppercase">Profile Score</div>
          <div className="text-xl font-bold text-gh-fg">{profile.overallScore}<span className="text-xs font-normal text-gh-fgMuted">/100</span></div>
        </div>
        <div className="bg-gh-bg border border-gh-borderMuted rounded-md p-3 text-center">
          <div className="text-[11px] text-gh-fgSubtle uppercase">Percentile</div>
          <div className="font-bold text-gh-success">Top {100 - profile.globalPercentile}%</div>
        </div>
        <div className="bg-gh-bg border border-gh-borderMuted rounded-md p-3 text-center">
          <div className="text-[11px] text-gh-fgSubtle uppercase">Tech Diversity</div>
          <div className="text-xl font-bold text-gh-done">{profile.qualitySignals.techDiversityScore}%</div>
        </div>
      </div>

      {/* Detected Gaps */}
      {profile.portfolioGaps.length > 0 && (
        <div className="gh-card p-5">
          <h3 className="text-sm font-semibold text-gh-fg flex items-center gap-1.5 mb-4">
            <Target className="w-4 h-4 text-gh-warning" /> Portfolio Gaps Detected
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {profile.portfolioGaps.map((gap, i) => (
              <div key={i} className="bg-gh-bg border border-yellow-500/15 rounded-md p-4 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gh-warning shrink-0" />
                  <p className="text-[13px] text-gh-fg leading-relaxed">{gap}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Actions */}
      <div className="gh-card p-5">
        <h3 className="text-sm font-semibold text-gh-fg flex items-center gap-1.5 mb-4">
          <TrendingUp className="w-4 h-4 text-gh-accent" /> Recommended Next Steps
        </h3>
        <div className="space-y-3">
          {profile.recommendedActions.map((a, i) => (
            <div key={i} className="bg-gh-bg border border-gh-borderMuted rounded-md p-4 flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-medium text-gh-fgMuted bg-gh-canvas px-2 py-0.5 rounded border border-gh-borderMuted">{a.suggestedDomain}</span>
                  <span className={`text-[11px] font-semibold ${a.priority === 'High' ? 'text-gh-danger' : a.priority === 'Medium' ? 'text-gh-warning' : 'text-gh-fgMuted'}`}>{a.priority} Priority</span>
                </div>
                <h4 className="font-semibold text-[13px] text-gh-fg">{a.title}</h4>
                <p className="text-xs text-gh-fgMuted leading-relaxed">{a.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Blueprint CTA */}
      <div className="gh-card p-6 text-center">
        <Lightbulb className="w-6 h-6 text-gh-warning mx-auto mb-3" />
        <h3 className="font-bold text-gh-fg mb-1">Need a specific project idea?</h3>
        <p className="text-[13px] text-gh-fgMuted mb-4 max-w-md mx-auto">
          Browse our curated project catalog with saturation badges, estimated build times, and recommended stacks.
        </p>
        <button onClick={() => onSelectIdea({} as any)} className="gh-btn-primary">
          Browse Ideas <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
