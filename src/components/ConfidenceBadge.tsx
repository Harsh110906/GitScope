import React from 'react';
import { ShieldCheck, Info, CheckCircle2 } from 'lucide-react';
import { FindingConfidence, EvidenceCoverage } from '../types/repoIntelligenceTypes';

interface ConfidenceBadgeProps {
  confidence: FindingConfidence;
  evidenceCoverage?: EvidenceCoverage;
  score?: number;
  maxScore?: number;
  showDetails?: boolean;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  confidence, evidenceCoverage, score, maxScore, showDetails = true
}) => {
  const badgeColor = 
    confidence === 'high' ? 'bg-gh-success/15 text-gh-success border-gh-success/30' :
    confidence === 'medium' ? 'bg-gh-warning/15 text-gh-warning border-gh-warning/30' :
    'bg-gh-fgMuted/15 text-gh-fgMuted border-gh-border';

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {typeof score === 'number' && typeof maxScore === 'number' && (
        <span className="font-bold text-gh-fg text-sm">
          {score}<span className="text-gh-fgSubtle text-xs font-normal">/{maxScore} pts</span>
        </span>
      )}

      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold ${badgeColor}`}>
        <ShieldCheck className="w-3 h-3" />
        <span>{confidence.toUpperCase()} CONFIDENCE</span>
      </span>

      {showDetails && evidenceCoverage && (
        <span className="text-gh-fgMuted text-[11px] flex items-center gap-1 bg-gh-bg px-2 py-0.5 rounded border border-gh-borderMuted">
          <CheckCircle2 className="w-3 h-3 text-gh-accent" />
          <span>Evidence: {evidenceCoverage.availableChecks} of {evidenceCoverage.totalChecks} checks ({evidenceCoverage.percentage}%)</span>
        </span>
      )}
    </div>
  );
};
