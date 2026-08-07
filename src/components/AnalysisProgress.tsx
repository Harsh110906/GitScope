import React from 'react';
import { Sparkles, CheckCircle2, Loader2, GitBranch, Search, ShieldCheck, Cpu } from 'lucide-react';
import { AnalysisStatus } from '../types/repoIntelligenceTypes';

interface AnalysisProgressProps {
  status: AnalysisStatus;
  progress: number;
  currentStep: string;
}

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({ status, progress, currentStep }) => {
  const steps = [
    { key: 'validating', label: 'Validating URL & Permissions', icon: Search },
    { key: 'collecting', label: 'Collecting Metadata & Manifests', icon: GitBranch },
    { key: 'extracting_evidence', label: 'Inspecting Code & CI/CD Workflows', icon: Cpu },
    { key: 'scoring', label: 'Computing Deterministic Scores', icon: ShieldCheck },
    { key: 'generating_insights', label: 'Generating AI Recommendations', icon: Sparkles },
  ];

  const getStepState = (stepKey: string) => {
    const order = ['validating', 'collecting', 'extracting_evidence', 'scoring', 'generating_insights', 'completed'];
    const currentIndex = order.indexOf(status);
    const stepIndex = order.indexOf(stepKey);

    if (currentIndex > stepIndex || status === 'completed') return 'completed';
    if (currentIndex === stepIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="max-w-2xl mx-auto gh-card p-6 sm:p-8 space-y-6 my-12">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-full bg-gh-accent/10 text-gh-accent border border-gh-accent/30 flex items-center justify-center mx-auto mb-3">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <h3 className="text-lg font-bold text-gh-fg">Analyzing GitHub Repository Intelligence</h3>
        <p className="text-xs text-gh-fgMuted">{currentStep || 'Gathering structured evidence and computing pillar scores...'}</p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono text-gh-fgMuted">
          <span>Overall Progress</span>
          <span className="font-semibold text-gh-accent">{progress}%</span>
        </div>
        <div className="w-full h-2 bg-gh-bg border border-gh-borderMuted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gh-accent to-gh-success transition-all duration-500 ease-out"
            style={{ width: `${Math.max(5, progress)}%` }}
          />
        </div>
      </div>

      {/* Step Indicator Stack */}
      <div className="space-y-2.5 pt-2">
        {steps.map(step => {
          const state = getStepState(step.key);
          const Icon = step.icon;

          return (
            <div
              key={step.key}
              className={`flex items-center gap-3 p-3 rounded-md border text-xs transition-colors ${
                state === 'completed'
                  ? 'bg-gh-bg/50 border-gh-borderMuted text-gh-fgMuted'
                  : state === 'active'
                  ? 'bg-gh-accent/10 border-gh-accent/40 text-gh-fg'
                  : 'bg-gh-canvas/40 border-transparent text-gh-fgSubtle'
              }`}
            >
              <div className="shrink-0">
                {state === 'completed' ? (
                  <CheckCircle2 className="w-4 h-4 text-gh-success" />
                ) : state === 'active' ? (
                  <Loader2 className="w-4 h-4 text-gh-accent animate-spin" />
                ) : (
                  <Icon className="w-4 h-4 text-gh-fgSubtle" />
                )}
              </div>

              <span className={`font-medium flex-1 ${state === 'active' ? 'text-gh-fg font-semibold' : ''}`}>
                {step.label}
              </span>

              {state === 'completed' && (
                <span className="text-[10px] font-mono text-gh-success bg-gh-success/10 px-2 py-0.5 rounded border border-gh-success/20">
                  DONE
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
