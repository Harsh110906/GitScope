import React, { useState } from 'react';
import { Lock, Star, RotateCcw, TrendingUp, Code } from 'lucide-react';
import { Project, DomainCategory } from '../types';
import { evaluatePrivatePreCheck } from '../services/aiIntelligence';

interface PrivatePreCheckViewProps {
  onSaveEvaluation: (project: Project) => void;
}

export const PrivatePreCheckView: React.FC<PrivatePreCheckViewProps> = ({ onSaveEvaluation }) => {
  const [projectName, setProjectName] = useState('');
  const [domain, setDomain] = useState<DomainCategory>('AI & Machine Learning');
  const [description, setDescription] = useState('');
  const [techStack, setTechStack] = useState('TypeScript, React, Node.js');
  const [hasTests, setHasTests] = useState(false);
  const [hasDocs, setHasDocs] = useState(true);
  const [hasDeployment, setHasDeployment] = useState(false);
  const [evaluation, setEvaluation] = useState<Project | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const domainOptions: DomainCategory[] = [
    'AI & Machine Learning', 'Fintech & Payments', 'Productivity & Tools', 'EdTech & Learning',
    'Developer Tools & Infra', 'Cybersecurity', 'SaaS & Web Apps', 'Health & Fitness'
  ];

  const handleRun = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      setEvaluation(evaluatePrivatePreCheck({ projectName, domain, description, techStack, hasTests, hasDocs, hasDeployment }));
      setIsAnalyzing(false);
    }, 600);
  };

  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Header */}
      <div className="gh-card p-6">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="w-4 h-4 text-gh-success" />
          <span className="text-xs font-medium text-gh-success">Private · Local evaluation only</span>
        </div>
        <h1 className="text-xl font-bold text-gh-fg mb-1">Private Pre-Check</h1>
        <p className="text-[13px] text-gh-fgMuted">Test how your project scores before publishing it. Results stay on your device.</p>
      </div>

      {!evaluation ? (
        <form onSubmit={handleRun} className="gh-card p-6 space-y-5">
          <div className="flex items-center gap-2 text-gh-fg font-semibold">
            <Code className="w-4 h-4 text-gh-fgMuted" />
            Project Specification
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gh-fgMuted mb-1.5">Project Name *</label>
              <input type="text" required value={projectName} onChange={e => setProjectName(e.target.value)}
                placeholder="e.g. Acme Financial Ledger" className="gh-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gh-fgMuted mb-1.5">Domain *</label>
              <select value={domain} onChange={e => setDomain(e.target.value as DomainCategory)}
                className="gh-input w-full cursor-pointer">
                {domainOptions.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gh-fgMuted mb-1.5">Description</label>
            <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)}
              placeholder="What does your project do?" className="gh-input w-full resize-none" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gh-fgMuted mb-1.5">Tech Stack</label>
            <input type="text" value={techStack} onChange={e => setTechStack(e.target.value)}
              placeholder="React, Node.js, PostgreSQL" className="gh-input w-full font-mono text-xs" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gh-fgMuted mb-2">Maturity Signals</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: 'Unit Tests', val: hasTests, set: setHasTests },
                { label: 'README / Docs', val: hasDocs, set: setHasDocs },
                { label: 'Live Deployment', val: hasDeployment, set: setHasDeployment },
              ].map(c => (
                <label key={c.label} className="flex items-center gap-2.5 p-3 bg-gh-bg border border-gh-borderMuted rounded-md cursor-pointer hover:border-gh-border transition-colors">
                  <input type="checkbox" checked={c.val} onChange={e => c.set(e.target.checked)} className="accent-gh-accent" />
                  <span className="text-[13px] text-gh-fg">{c.label}</span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" disabled={isAnalyzing} className="gh-btn-primary w-full justify-center py-2.5">
            {isAnalyzing ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Run Pre-Check Evaluation'}
          </button>
        </form>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gh-fg">Pre-Check Results</h2>
            <button onClick={() => setEvaluation(null)} className="gh-btn-secondary text-xs"><RotateCcw className="w-3.5 h-3.5" /> New Check</button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gh-bg border border-gh-borderMuted rounded-md p-3 text-center">
              <div className="text-[11px] text-gh-fgSubtle uppercase">Score</div>
              <div className="text-xl font-bold text-gh-fg">{evaluation.numericScore}/100</div>
            </div>
            <div className="bg-gh-bg border border-gh-borderMuted rounded-md p-3 text-center">
              <div className="text-[11px] text-gh-fgSubtle uppercase">Rating</div>
              <div className="text-xl font-bold text-yellow-400 flex items-center justify-center gap-1"><Star className="w-4 h-4 fill-yellow-400" />{evaluation.starRating}</div>
            </div>
            <div className="bg-gh-bg border border-gh-borderMuted rounded-md p-3 text-center">
              <div className="text-[11px] text-gh-fgSubtle uppercase">Domain Rank</div>
              <div className="text-xl font-bold text-gh-accent">Top {100 - evaluation.domainPercentileRank}%</div>
            </div>
            <div className="bg-gh-bg border border-gh-borderMuted rounded-md p-3 text-center">
              <div className="text-[11px] text-gh-fgSubtle uppercase">Deploy Ready</div>
              <div className="text-xl font-bold text-gh-success">{evaluation.deployabilityScore}%</div>
            </div>
          </div>

          <div className="gh-card p-4">
            <h4 className="text-xs font-semibold text-gh-fgMuted uppercase mb-2">AI Diagnosis</h4>
            <p className="text-[13px] text-gh-fg leading-relaxed">{evaluation.aiReviewNotes}</p>
          </div>

          <div className="gh-card p-4">
            <h4 className="text-xs font-semibold text-gh-accent uppercase mb-3 flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> How to Improve</h4>
            <div className="space-y-2">
              {evaluation.improvementSteps.map((s, i) => (
                <div key={i} className="flex items-start gap-3 p-2.5 bg-gh-bg border border-gh-borderMuted rounded-md">
                  <span className="w-5 h-5 rounded-full bg-gh-accent/20 text-gh-accent text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  <p className="text-[13px] text-gh-fg">{s}</p>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => onSaveEvaluation(evaluation)} className="gh-btn-primary w-full justify-center py-2.5">
            <Lock className="w-3.5 h-3.5" /> Save to Dashboard
          </button>
        </div>
      )}
    </div>
  );
};
