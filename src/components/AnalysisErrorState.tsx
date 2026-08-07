import React from 'react';
import { AlertTriangle, Lock, RefreshCw, ArrowLeft, ShieldAlert } from 'lucide-react';

interface AnalysisErrorStateProps {
  code?: string;
  message?: string;
  onRetry?: () => void;
  onGoBack?: () => void;
  onOpenAuth?: (mode?: 'signin' | 'signup') => void;
}

export const AnalysisErrorState: React.FC<AnalysisErrorStateProps> = ({
  code, message, onRetry, onGoBack, onOpenAuth
}) => {
  const isQuotaExceeded = code === 'ANALYSIS_QUOTA_EXCEEDED';
  const isRateLimited = code === 'RATE_LIMITED';

  return (
    <div className="max-w-xl mx-auto gh-card p-8 text-center space-y-5 my-12">
      <div className={`w-14 h-14 rounded-full border flex items-center justify-center mx-auto ${
        isQuotaExceeded ? 'bg-gh-accent/15 border-gh-accent/40 text-gh-accent' : 'bg-gh-danger/15 border-gh-danger/40 text-gh-danger'
      }`}>
        {isQuotaExceeded ? <Lock className="w-7 h-7" /> : <AlertTriangle className="w-7 h-7" />}
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-bold text-gh-fg">
          {isQuotaExceeded ? 'Free Search Quota Reached' : 'Analysis Request Failed'}
        </h3>
        <p className="text-sm text-gh-fgMuted leading-relaxed max-w-md mx-auto">
          {message || 'An unexpected error occurred while analyzing the repository. Please check the URL and try again.'}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
        {isQuotaExceeded ? (
          <button
            onClick={() => onOpenAuth && onOpenAuth('signup')}
            className="gh-btn-primary py-2 px-5 font-semibold text-sm"
          >
            <Lock className="w-4 h-4" />
            Join Free for Unlimited Access
          </button>
        ) : (
          <>
            {onRetry && (
              <button onClick={onRetry} className="gh-btn-primary">
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Analysis
              </button>
            )}
            {onGoBack && (
              <button onClick={onGoBack} className="gh-btn-secondary">
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Explore
              </button>
            )}
          </>
        )}
      </div>

      {isRateLimited && (
        <div className="text-xs text-gh-fgSubtle bg-gh-bg p-3 rounded-md border border-gh-borderMuted text-left mt-4 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-gh-warning shrink-0 mt-0.5" />
          <span>GitHub API temporarily rate limited unauthenticated requests. Setting a server GitHub token increases API limits up to 5,000 requests/hr.</span>
        </div>
      )}
    </div>
  );
};
