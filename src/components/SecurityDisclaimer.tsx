import React from 'react';
import { ShieldAlert, ExternalLink, Info } from 'lucide-react';

interface SecurityDisclaimerProps {
  disclaimerText?: string;
}

export const SecurityDisclaimer: React.FC<SecurityDisclaimerProps> = ({ disclaimerText }) => {
  return (
    <div className="gh-card p-4 border-l-4 border-l-gh-warning bg-gh-canvas/80 space-y-2">
      <div className="flex items-center gap-2 text-gh-warning font-semibold text-xs">
        <ShieldAlert className="w-4 h-4 shrink-0" />
        <span>Advisory Security & Dependency Insights Disclaimer</span>
      </div>

      <p className="text-xs text-gh-fgMuted leading-relaxed">
        {disclaimerText || 'This security analysis is advisory and based strictly on static analysis of retrieved documentation and manifest metadata. GitScope never executes repository code and does not perform full penetration testing.'}
      </p>

      <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] text-gh-fgSubtle border-t border-gh-borderMuted">
        <span className="flex items-center gap-1"><Info className="w-3 h-3 text-gh-accent" /> Recommended Verification Tools:</span>
        <a href="https://github.com/features/security" target="_blank" rel="noreferrer" className="text-gh-accent hover:underline flex items-center gap-0.5">
          GitHub CodeQL <ExternalLink className="w-2.5 h-2.5" />
        </a>
        <a href="https://github.com/dependabot" target="_blank" rel="noreferrer" className="text-gh-accent hover:underline flex items-center gap-0.5">
          Dependabot <ExternalLink className="w-2.5 h-2.5" />
        </a>
        <a href="https://trufflesecurity.com/trufflehog" target="_blank" rel="noreferrer" className="text-gh-accent hover:underline flex items-center gap-0.5">
          TruffleHog <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>
    </div>
  );
};
