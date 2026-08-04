import React, { useState, useEffect } from 'react';
import { Sparkles, X, Lock } from 'lucide-react';

interface SearchQuotaToastProps {
  isAuthenticated: boolean;
  remainingSearches: number;
  onOpenAuth: () => void;
}

export const SearchQuotaToast: React.FC<SearchQuotaToastProps> = ({
  isAuthenticated,
  remainingSearches,
  onOpenAuth,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    // Only show for unauthenticated guest visitors
    if (isAuthenticated) {
      setIsVisible(false);
      setIsRendered(false);
      return;
    }

    // Show toast on mount
    setIsRendered(true);
    // Slight delay to trigger slide-up transition
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    // Auto-fade / dismiss after 3 seconds
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 3100);

    // Unrender from DOM after fade-out transition completes (3.6s total)
    const unmountTimer = setTimeout(() => {
      setIsRendered(false);
    }, 3600);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      clearTimeout(unmountTimer);
    };
  }, [isAuthenticated]);

  if (!isRendered || isAuthenticated) return null;

  return (
    <div
      className={`fixed bottom-5 right-5 z-40 max-w-sm w-full transition-all duration-500 ease-out transform ${
        isVisible
          ? 'translate-y-0 opacity-100 scale-100'
          : 'translate-y-4 opacity-0 scale-95 pointer-events-none'
      }`}
    >
      <div className="bg-gh-canvas/95 backdrop-blur-md border border-gh-border rounded-lg shadow-2xl p-3.5 flex items-start gap-3">
        <div className="w-8 h-8 rounded-md bg-gh-accent/15 flex items-center justify-center text-gh-accent shrink-0 mt-0.5">
          <Sparkles className="w-4.5 h-4.5" />
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gh-fg flex items-center gap-1.5">
              Daily Free Searches
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-gh-accent/20 text-gh-accent rounded-full border border-gh-accent/30">
                {remainingSearches} left today
              </span>
            </span>
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 text-gh-fgMuted hover:text-gh-fg rounded hover:bg-gh-card transition-colors"
              title="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-gh-fgMuted leading-relaxed">
            You have <strong className="text-gh-fg">{remainingSearches} free searches</strong> today. To unlock unlimited searches, please log in.
          </p>

          <div className="pt-1 flex items-center justify-between">
            <button
              onClick={() => {
                setIsVisible(false);
                onOpenAuth();
              }}
              className="text-[11px] font-semibold text-gh-accent hover:underline flex items-center gap-1"
            >
              <Lock className="w-3 h-3" />
              Sign in for unlimited
            </button>
            <span className="text-[10px] text-gh-fgSubtle">Fades in 3s</span>
          </div>
        </div>
      </div>
    </div>
  );
};
