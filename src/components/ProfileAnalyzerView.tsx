import React, { useState, useEffect } from 'react';
import { Search, Star, UserCheck, CheckCircle2, TrendingUp, Code, ArrowRight, CircleAlert } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { ProfileEvaluation } from '../types';
import { fetchGithubUserProfile } from '../services/githubService';

interface ProfileAnalyzerViewProps {
  currentUsername: string;
  onNavigateToRecommender: () => void;
  onProfileLoaded?: (profile: ProfileEvaluation) => void;
  onSearchAttempt?: () => boolean;
}

export const ProfileAnalyzerView: React.FC<ProfileAnalyzerViewProps> = ({
  currentUsername, onNavigateToRecommender, onProfileLoaded, onSearchAttempt
}) => {
  const [handle, setHandle] = useState(currentUsername || '');
  const [profile, setProfile] = useState<ProfileEvaluation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const load = async (u: string) => {
    if (!u.trim()) return;
    setIsLoading(true);
    setHasSearched(true);
    const prof = await fetchGithubUserProfile(u.trim());
    setProfile(prof);
    if (prof && onProfileLoaded) {
      onProfileLoaded(prof);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (currentUsername) {
      load(currentUsername);
    }
  }, [currentUsername]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle.trim()) return;
    if (onSearchAttempt && !onSearchAttempt()) return;
    load(handle.trim());
  };

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      <div>
        <h1 className="text-xl font-bold text-gh-fg flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-gh-fgMuted" /> Profile Analyzer
        </h1>
        <p className="text-[13px] text-gh-fgMuted mt-0.5">Evaluate any public GitHub profile's quality, developer level, and portfolio strengths.</p>
      </div>

      <form onSubmit={handleSearch} className="max-w-xl">
        <div className="flex items-center gap-2 bg-gh-bg border border-gh-border rounded-md p-1.5 focus-within:border-gh-accent transition-colors">
          <Search className="w-4 h-4 text-gh-fgSubtle ml-2 shrink-0" />
          <input type="text" value={handle} onChange={e => setHandle(e.target.value)}
            placeholder="Enter GitHub username (e.g. torvalds, gaearon)" className="flex-1 bg-transparent text-sm text-gh-fg font-mono focus:outline-none placeholder:text-gh-fgSubtle py-1" />
          <button type="submit" disabled={isLoading} className="gh-btn-primary shrink-0">
            {isLoading ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Analyze'}
          </button>
        </div>
      </form>

      {isLoading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-3 border-gh-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gh-fgMuted">Fetching public GitHub data for @{handle}…</p>
        </div>
      ) : profile ? (
        <div className="space-y-5">
          
          {/* Profile Card */}
          <div className="gh-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-5">
            <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0">
              <img src={profile.avatarUrl} alt={profile.username}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-gh-border object-cover shrink-0" />
              <div className="min-w-0">
                <h2 className="font-bold text-base sm:text-lg text-gh-fg truncate">{profile.name}</h2>
                <p className="text-xs text-gh-fgMuted font-mono truncate">@{profile.username}</p>
                <p className="text-xs text-gh-fgMuted mt-1 max-w-md line-clamp-2">{profile.bio}</p>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-gh-fgSubtle mt-1.5 font-mono">
                  <span>{profile.publicRepos} repos</span>
                  <span>·</span>
                  <span>{profile.followers} followers</span>
                  <span>·</span>
                  <span>{profile.totalStars.toLocaleString()} stars</span>
                </div>
              </div>
            </div>
            <div className="gh-card p-3 sm:p-4 text-center shrink-0 w-full sm:w-auto min-w-[150px]">
              <div className="text-[10px] sm:text-[11px] text-gh-fgSubtle uppercase mb-1">Developer Level</div>
              <div className="text-sm font-bold text-gh-accent mb-0.5">{profile.developerLevel}</div>
              <span className="gh-badge bg-gh-accent/10 text-gh-accent border border-gh-accent/20">Top {100 - profile.globalPercentile}%</span>
            </div>
          </div>

          {/* Score Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gh-bg border border-gh-borderMuted rounded-md p-3 text-center">
              <div className="text-[11px] text-gh-fgSubtle uppercase">Rating</div>
              <div className="text-xl font-bold text-yellow-400 flex items-center justify-center gap-1"><Star className="w-4 h-4 fill-yellow-400" />{profile.starRating}</div>
            </div>
            <div className="bg-gh-bg border border-gh-borderMuted rounded-md p-3 text-center">
              <div className="text-[11px] text-gh-fgSubtle uppercase">Score</div>
              <div className="text-xl font-bold text-gh-fg">{profile.overallScore}/100</div>
            </div>
            <div className="bg-gh-bg border border-gh-borderMuted rounded-md p-3 text-center">
              <div className="text-[11px] text-gh-fgSubtle uppercase">Documentation</div>
              <div className="text-xl font-bold text-gh-done">{profile.qualitySignals.documentationScore}%</div>
            </div>
            <div className="bg-gh-bg border border-gh-borderMuted rounded-md p-3 text-center">
              <div className="text-[11px] text-gh-fgSubtle uppercase">Tech Diversity</div>
              <div className="text-xl font-bold text-gh-success">{profile.qualitySignals.techDiversityScore}%</div>
            </div>
          </div>

          {/* Languages + Strengths */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="gh-card p-4">
              <h3 className="text-xs font-semibold text-gh-fgMuted uppercase mb-3 flex items-center gap-1"><Code className="w-3.5 h-3.5" /> Top Languages</h3>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={profile.topLanguages} layout="vertical">
                    <XAxis type="number" domain={[0, 100]} stroke="#30363d" tick={{ fontSize: 10, fill: '#8b949e' }} />
                    <YAxis type="category" dataKey="name" stroke="#30363d" tick={{ fontSize: 11, fill: '#e6edf3' }} width={90} />
                    <Tooltip contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', borderRadius: '6px', fontSize: '12px', color: '#e6edf3' }} />
                    <Bar dataKey="percentage" fill="#58a6ff" radius={[0, 3, 3, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="gh-card p-4 border-green-500/15">
              <h3 className="text-xs font-semibold text-gh-success uppercase mb-3 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Strengths</h3>
              <ul className="space-y-2">{profile.keyStrengths.map((s, i) => (
                <li key={i} className="text-[13px] text-gh-fg flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gh-success mt-1.5 shrink-0" />{s}</li>
              ))}</ul>
            </div>
          </div>

          {/* Recommendations */}
          <div className="gh-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gh-fg flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-gh-accent" /> Profile Upgrade Recommendations</h3>
              <button onClick={onNavigateToRecommender} className="gh-btn-primary text-xs">
                View Blueprints <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {profile.recommendedActions.map((a, i) => (
                <div key={i} className="bg-gh-bg border border-gh-borderMuted rounded-md p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-gh-fgMuted bg-gh-canvas px-2 py-0.5 rounded border border-gh-borderMuted">{a.suggestedDomain}</span>
                    <span className={`text-[11px] font-semibold ${a.priority === 'High' ? 'text-gh-danger' : 'text-gh-warning'}`}>{a.priority}</span>
                  </div>
                  <h4 className="font-semibold text-[13px] text-gh-fg">{a.title}</h4>
                  <p className="text-xs text-gh-fgMuted leading-relaxed">{a.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : hasSearched ? (
        <div className="py-16 text-center gh-card p-8 space-y-3">
          <CircleAlert className="w-10 h-10 text-gh-fgSubtle mx-auto" />
          <h3 className="font-semibold text-gh-fg">GitHub User Not Found or Rate Limited</h3>
          <p className="text-xs text-gh-fgMuted max-w-md mx-auto">
            Please check the username spelling or supply a <code className="bg-gh-bg px-1 py-0.5 rounded border border-gh-border font-mono text-[11px]">VITE_GITHUB_TOKEN</code> to increase API rate limits.
          </p>
        </div>
      ) : (
        <div className="py-16 text-center gh-card p-8 space-y-3">
          <UserCheck className="w-10 h-10 text-gh-fgSubtle mx-auto" />
          <h3 className="font-semibold text-gh-fg">No Profile Analyzed Yet</h3>
          <p className="text-xs text-gh-fgMuted max-w-md mx-auto">
            Enter any public GitHub username above (e.g. <code className="text-gh-accent cursor-pointer" onClick={() => { setHandle('torvalds'); load('torvalds'); }}>torvalds</code>, <code className="text-gh-accent cursor-pointer" onClick={() => { setHandle('gaearon'); load('gaearon'); }}>gaearon</code>) to inspect repository statistics, top languages, developer level, and AI portfolio recommendations.
          </p>
        </div>
      )}
    </div>
  );
};
