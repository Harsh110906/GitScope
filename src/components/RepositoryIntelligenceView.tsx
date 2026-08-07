import React, { useState } from 'react';
import { 
  GitBranch, Star, GitFork, AlertCircle, FileText, CheckCircle2, 
  ArrowLeft, Bookmark, Share2, Sparkles, Shield, Cpu, Layers, UserCheck, 
  Wrench, ExternalLink, Zap, Lock
} from 'lucide-react';

import { RepositoryIntelligenceReport, ScanMode, UserProfilePreferences } from '../types/repoIntelligenceTypes';
import { ConfidenceBadge } from './ConfidenceBadge';
import { SecurityDisclaimer } from './SecurityDisclaimer';
import { EvidenceDrawer } from './EvidenceDrawer';
import { AnalysisProgress } from './AnalysisProgress';
import { AnalysisErrorState } from './AnalysisErrorState';

interface RepositoryIntelligenceViewProps {
  report: RepositoryIntelligenceReport | null;
  isLoading: boolean;
  status: RepositoryIntelligenceReport['status'] | string;
  progress: number;
  currentStep: string;
  errorCode?: string;
  errorMessage?: string;
  onAnalyzeUrl: (url: string, mode?: ScanMode, profile?: UserProfilePreferences) => void;
  onSaveReport?: (report: RepositoryIntelligenceReport) => void;
  isSaved?: boolean;
  onOpenAuth?: (mode?: 'signin' | 'signup') => void;
  onGoBack?: () => void;
}

export const RepositoryIntelligenceView: React.FC<RepositoryIntelligenceViewProps> = ({
  report, isLoading, status, progress, currentStep, errorCode, errorMessage,
  onAnalyzeUrl, onSaveReport, isSaved = false, onOpenAuth, onGoBack
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [scanMode, setScanMode] = useState<ScanMode>('standard');

  // Personalized Contribution Form state
  const [userSkillLevel, setUserSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [selectedLang, setSelectedLang] = useState('TypeScript');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onAnalyzeUrl(urlInput.trim(), scanMode, {
        experienceLevel: userSkillLevel,
        languages: [selectedLang]
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-gh-success';
    if (score >= 70) return 'text-gh-accent';
    if (score >= 50) return 'text-gh-warning';
    return 'text-gh-danger';
  };

  const getSeverityBadge = (sev: string) => {
    if (sev === 'critical' || sev === 'high') return 'bg-gh-danger/15 text-gh-danger border-gh-danger/30';
    if (sev === 'medium') return 'bg-gh-warning/15 text-gh-warning border-gh-warning/30';
    return 'bg-gh-accent/15 text-gh-accent border-gh-accent/30';
  };

  // Loading State
  if (isLoading || (status && status !== 'completed' && status !== 'partial' && status !== 'failed' && status !== 'idle' && !report)) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        <AnalysisProgress status={status as any} progress={progress} currentStep={currentStep} />
      </div>
    );
  }

  // Error State
  if (status === 'failed' || errorCode) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        <AnalysisErrorState
          code={errorCode}
          message={errorMessage}
          onRetry={() => urlInput && onAnalyzeUrl(urlInput, scanMode)}
          onGoBack={onGoBack}
          onOpenAuth={onOpenAuth}
        />
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Search Header Bar */}
      <div className="gh-card p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gh-fg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gh-accent" />
              Repository Intelligence Report
            </h1>
            <p className="text-xs text-gh-fgMuted">Deep multi-pillar discovery, documentation analysis & contribution readiness</p>
          </div>

          {/* Quick URL Submit Form */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-1 max-w-xl">
            <div className="flex-1 flex items-center gap-2 bg-gh-bg border border-gh-border rounded-md px-2.5 py-1 focus-within:border-gh-accent">
              <GitBranch className="w-4 h-4 text-gh-fgSubtle shrink-0" />
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Paste GitHub repository URL (e.g. facebook/react)..."
                className="w-full bg-transparent text-xs text-gh-fg focus:outline-none placeholder:text-gh-fgSubtle py-1"
              />
            </div>
            
            <select
              value={scanMode}
              onChange={(e) => setScanMode(e.target.value as ScanMode)}
              className="gh-input text-xs py-1 px-2 shrink-0 cursor-pointer"
            >
              <option value="quick">Quick Scan</option>
              <option value="standard">Standard Scan</option>
              <option value="deep">Deep Scan</option>
            </select>

            <button type="submit" className="gh-btn-primary shrink-0 text-xs py-1 px-3">
              Analyze
            </button>
          </form>
        </div>
      </div>

      {/* Main Report Document */}
      {report ? (
        <div className="space-y-6">
          
          {/* 1. Repository Header Card */}
          <div className="gh-card p-6 space-y-4 border-l-4 border-l-gh-accent">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  {report.metadata.ownerAvatarUrl && (
                    <img src={report.metadata.ownerAvatarUrl} alt={report.owner} className="w-7 h-7 rounded-full border border-gh-border" />
                  )}
                  <span className="text-sm font-mono text-gh-fgSubtle">{report.owner} /</span>
                  <h2 className="text-2xl font-bold text-gh-fg tracking-tight">{report.repositoryName}</h2>
                  
                  <a href={report.repositoryUrl} target="_blank" rel="noreferrer"
                    className="text-gh-fgSubtle hover:text-gh-accent p-1 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gh-bg border border-gh-border text-gh-fgMuted">
                    {report.metadata.visibility.toUpperCase()}
                  </span>

                  {report.metadata.license && (
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-gh-bg border border-gh-border text-gh-accent">
                      {report.metadata.license}
                    </span>
                  )}
                </div>

                <p className="text-sm text-gh-fgMuted leading-relaxed max-w-3xl">
                  {report.metadata.description || 'Public GitHub repository analyzed by GitScope Repository Intelligence.'}
                </p>

                {/* Topics */}
                {report.metadata.topics && report.metadata.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {report.metadata.topics.map((t, i) => (
                      <span key={i} className="text-[11px] font-mono text-gh-fgMuted bg-gh-bg px-2 py-0.5 rounded border border-gh-borderMuted">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-2 shrink-0">
                {onSaveReport && (
                  <button
                    onClick={() => onSaveReport(report)}
                    className={`gh-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 ${isSaved ? 'text-gh-accent border-gh-accent/40' : ''}`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                    <span>{isSaved ? 'Saved in Dashboard' : 'Save Report'}</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Report link copied to clipboard!');
                  }}
                  className="gh-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
              </div>

            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-gh-borderMuted text-xs text-gh-fgMuted">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="font-semibold text-gh-fg">{report.metadata.stars.toLocaleString()}</span> stars
              </div>
              <div className="flex items-center gap-1.5">
                <GitFork className="w-4 h-4 text-gh-fgSubtle" />
                <span className="font-semibold text-gh-fg">{report.metadata.forks.toLocaleString()}</span> forks
              </div>
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-gh-warning" />
                <span className="font-semibold text-gh-fg">{report.metadata.openIssues.toLocaleString()}</span> open issues
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[11px]">
                <GitBranch className="w-4 h-4 text-gh-accent" />
                <span>{report.defaultBranch} ({report.analyzedCommitSha.substring(0, 7)})</span>
              </div>
            </div>
          </div>

          {/* 2. Transparent Overall Score Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="gh-card p-5 space-y-3 md:col-span-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-gh-fg">Repository Intelligence Score</h3>
                  <ConfidenceBadge confidence={report.confidence} showDetails={false} />
                </div>
                <p className="text-xs text-gh-fgMuted leading-relaxed mb-4">{report.summary}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-gh-bg rounded-md border border-gh-borderMuted">
                <div>
                  <div className="text-[11px] text-gh-fgSubtle">Difficulty Level</div>
                  <div className="font-semibold text-xs text-gh-fg mt-0.5">{report.difficultyRating.level}</div>
                </div>
                <div>
                  <div className="text-[11px] text-gh-fgSubtle">Scan Mode</div>
                  <div className="font-semibold text-xs text-gh-accent mt-0.5 uppercase">{report.scanMode} Scan</div>
                </div>
                <div>
                  <div className="text-[11px] text-gh-fgSubtle">Analysis Engine</div>
                  <div className="font-semibold text-xs text-gh-done mt-0.5">v{report.analysisVersion} Deterministic</div>
                </div>
              </div>
            </div>

            {/* Score Wheel Box */}
            <div className="gh-card p-6 flex flex-col items-center justify-center text-center space-y-2">
              <div className={`text-5xl font-extrabold tracking-tight ${getScoreColor(report.overallScore)}`}>
                {report.overallScore}
                <span className="text-base text-gh-fgSubtle font-normal">/100</span>
              </div>
              <div className="text-xs font-semibold text-gh-fg">Transparent Project Score</div>
              <p className="text-[11px] text-gh-fgMuted">Computed deterministically across 6 core repository quality pillars.</p>
            </div>

          </div>

          {/* 3. Categorized Score Cards Grid */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-gh-fg flex items-center gap-2">
              <Layers className="w-4 h-4 text-gh-accent" />
              Six-Category Quality Breakdown
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.values(report.categories).map((cat) => (
                <div key={cat.category} className="gh-card p-4 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-semibold text-sm text-gh-fg">{cat.categoryTitle}</h4>
                      <span className={`font-bold text-sm ${getScoreColor((cat.score / cat.maxScore) * 100)}`}>
                        {cat.score}<span className="text-xs text-gh-fgSubtle font-normal">/{cat.maxScore}</span>
                      </span>
                    </div>

                    <ConfidenceBadge confidence={cat.confidence} evidenceCoverage={cat.evidenceCoverage} showDetails={true} />

                    {/* Findings list */}
                    <div className="space-y-2 mt-3 text-xs">
                      {cat.positiveFindings.slice(0, 2).map((pos, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-gh-fgMuted">
                          <CheckCircle2 className="w-3.5 h-3.5 text-gh-success shrink-0 mt-0.5" />
                          <span>{pos}</span>
                        </div>
                      ))}
                      {cat.missingData.slice(0, 2).map((miss, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-gh-fgSubtle">
                          <AlertCircle className="w-3.5 h-3.5 text-gh-warning shrink-0 mt-0.5" />
                          <span>{miss}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {cat.recommendations.length > 0 && (
                    <div className="pt-2 border-t border-gh-borderMuted text-[11px] text-gh-accent">
                      <span className="font-semibold">Rec:</span> {cat.recommendations[0]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 4. Strengths & Priority Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="gh-card p-5 space-y-3 border-t-2 border-t-gh-success">
              <h3 className="font-bold text-sm text-gh-fg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gh-success" />
                Key Repository Strengths
              </h3>
              <div className="space-y-2.5 text-xs">
                {report.topStrengths.map((str, i) => (
                  <div key={i} className="p-3 bg-gh-bg rounded-md border border-gh-borderMuted space-y-1">
                    <div className="font-semibold text-gh-fg">{str.title}</div>
                    <div className="text-gh-fgMuted">{str.description}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="gh-card p-5 space-y-3 border-t-2 border-t-gh-accent">
              <h3 className="font-bold text-sm text-gh-fg flex items-center gap-2">
                <Wrench className="w-4 h-4 text-gh-accent" />
                High-Priority Recommendations
              </h3>
              <div className="space-y-2.5 text-xs">
                {report.priorityImprovements.map((imp, i) => (
                  <div key={i} className="p-3 bg-gh-bg rounded-md border border-gh-borderMuted space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gh-fg">{imp.title}</span>
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                        imp.priority === 'high' ? 'bg-gh-danger/10 text-gh-danger border-gh-danger/30' : 'bg-gh-warning/10 text-gh-warning border-gh-warning/30'
                      }`}>
                        {imp.priority}
                      </span>
                    </div>
                    <div className="text-gh-fgMuted">{imp.description}</div>
                    <div className="text-[11px] text-gh-fgSubtle pt-1">Reason: {imp.reason}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* 5. Advisory Security & Dependency Insights */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-gh-fg flex items-center gap-2">
              <Shield className="w-4 h-4 text-gh-warning" />
              Security & Dependency Insights
            </h3>

            <SecurityDisclaimer disclaimerText={report.securityInsights.disclaimer} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {report.securityInsights.findings.map((f) => (
                <div key={f.id} className="gh-card p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gh-fg">{f.title}</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${getSeverityBadge(f.severity)}`}>
                        {f.severity}
                      </span>
                      <span className="text-[10px] font-mono text-gh-fgSubtle bg-gh-bg px-1.5 py-0.5 rounded border border-gh-borderMuted">
                        {f.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-gh-fgMuted">{f.description}</p>
                  
                  <div className="p-2 bg-gh-bg font-mono text-[11px] rounded border border-gh-borderMuted text-gh-fgSubtle">
                    {f.redactedEvidence}
                  </div>

                  <div className="text-gh-accent text-[11px] pt-1">
                    <span className="font-semibold">Recommendation:</span> {f.recommendation}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Personalized Contribution Matcher */}
          <div className="gh-card p-6 space-y-4 border-t-4 border-t-gh-done">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-gh-fg flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-gh-done" />
                  Personalized Contribution Path
                </h3>
                <p className="text-xs text-gh-fgMuted">Tailored tasks matching your developer skills and learning goals</p>
              </div>

              {/* Preferences Filter */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <label className="text-gh-fgSubtle flex items-center gap-1">
                  Level:
                  <select
                    value={userSkillLevel}
                    onChange={(e) => setUserSkillLevel(e.target.value as any)}
                    className="gh-input text-xs py-1 px-2 cursor-pointer"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </label>

                <label className="text-gh-fgSubtle flex items-center gap-1">
                  Stack:
                  <select
                    value={selectedLang}
                    onChange={(e) => setSelectedLang(e.target.value)}
                    className="gh-input text-xs py-1 px-2 cursor-pointer"
                  >
                    <option value="TypeScript">TypeScript</option>
                    <option value="JavaScript">JavaScript</option>
                    <option value="Python">Python</option>
                    <option value="Go">Go</option>
                    <option value="Rust">Rust</option>
                  </select>
                </label>
              </div>
            </div>

            {/* Tasks list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {report.contributionGuide.personalizedMatches?.map((match) => (
                <div key={match.id} className="p-3.5 bg-gh-bg border border-gh-borderMuted rounded-md space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gh-fg">{match.title}</span>
                    <span className="text-[11px] font-bold text-gh-success bg-gh-success/10 px-2 py-0.5 rounded border border-gh-success/20">
                      {match.matchScore}% Match
                    </span>
                  </div>

                  <p className="text-gh-fgMuted">{match.explanation}</p>

                  <div className="flex items-center justify-between text-[11px] text-gh-fgSubtle pt-2 border-t border-gh-borderMuted">
                    <span>Est. Effort: <strong className="text-gh-fg">{match.estimatedEffort}</strong></span>
                    <span>Files: <code className="text-gh-accent">{match.suggestedFiles.join(', ')}</code></span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-gh-bg rounded-md text-xs text-gh-fgMuted flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-gh-accent" />
                First step to contribute: {report.contributionGuide.firstStep}
              </span>
            </div>
          </div>

          {/* 7. Evidence Drawer */}
          <EvidenceDrawer evidenceItems={report.evidenceItems} scanLimitations={report.scanLimitations} />

        </div>
      ) : (
        /* Empty State / Initial Landing Prompt */
        <div className="gh-card p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-gh-accent/10 border border-gh-accent/30 text-gh-accent flex items-center justify-center mx-auto">
            <GitBranch className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-gh-fg">Paste a GitHub Repository URL to Begin</h3>
            <p className="text-xs text-gh-fgMuted">Get structured quality scores across documentation, code organization, testing maturity, maintenance activity, advisory security, and contributor readiness.</p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-gh-fgMuted">
            <span className="text-gh-fgSubtle">Try analyzing:</span>
            {['facebook/react', 'tailwindlabs/tailwindcss', 'expressjs/express'].map(r => (
              <button
                key={r}
                onClick={() => { setUrlInput(`https://github.com/${r}`); onAnalyzeUrl(`https://github.com/${r}`); }}
                className="px-2.5 py-1 rounded bg-gh-bg border border-gh-border hover:border-gh-accent text-gh-accent transition-colors font-mono"
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
