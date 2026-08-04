import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Lock } from 'lucide-react';

interface SearchQuotaToastProps {
  isAuthenticated: boolean;
  remainingSearches: number;
  onOpenAuth: () => void;
}

const DISPLAY_DURATION_MS = 5000; // 5 seconds display time

export const SearchQuotaToast: React.FC<SearchQuotaToastProps> = ({
  isAuthenticated,
  remainingSearches,
  onOpenAuth,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const unmountTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startDismissTimer = () => {
    clearDismissTimers();

    // Fade out after 5 seconds
    hideTimerRef.current = setTimeout(() => {
      setIsVisible(false);
      // Remove from DOM after fade animation (500ms) finishes
      unmountTimerRef.current = setTimeout(() => {
        setIsRendered(false);
      }, 500);
    }, DISPLAY_DURATION_MS);
  };

  const clearDismissTimers = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (unmountTimerRef.current) clearTimeout(unmountTimerRef.current);
  };

  useEffect(() => {
    if (isAuthenticated) {
      setIsVisible(false);
      setIsRendered(false);
      return;
    }

    setIsRendered(true);
    // Slide up into view
    const mountTimer = setTimeout(() => {
      setIsVisible(true);
      startDismissTimer();
    }, 100);

    return () => {
      clearTimeout(mountTimer);
      clearDismissTimers();
    };
  }, [isAuthenticated]);

  // Handle mouse enter (pause timer) and mouse leave (resume 5s timer)
  const handleMouseEnter = () => {
    setIsHovered(true);
    clearDismissTimers();
    setIsVisible(true); // Keep fully visible while hovered
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    startDismissTimer();
  };

  if (!isRendered || isAuthenticated) return null;

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`fixed bottom-5 right-5 z-40 max-w-sm w-full transition-all duration-500 ease-out transform ${
        isVisible
          ? 'translate-y-0 opacity-100 scale-100'
          : 'translate-y-4 opacity-0 scale-95 pointer-events-none'
      }`}
    >
      <div className="bg-gh-canvas/95 backdrop-blur-md border border-gh-border rounded-lg shadow-2xl p-3.5 flex items-start gap-3 hover:border-gh-accent/50 transition-colors">
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
              onClick={() => {
                clearDismissTimers();
                setIsVisible(false);
                setTimeout(() => setIsRendered(false), 500);
              }}
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
                clearDismissTimers();
                setIsVisible(false);
                onOpenAuth();
              }}
              className="text-[11px] font-semibold text-gh-accent hover:underline flex items-center gap-1"
            >
              <Lock className="w-3 h-3" />
              Sign in for unlimited
            </button>
            <span className="text-[10px] text-gh-fgSubtle">
              {isHovered ? 'Paused on hover' : 'Fades in 5s'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
