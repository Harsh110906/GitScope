import React from 'react';
import { 
  Search, UserCheck, Lightbulb, Bookmark, Lock, GitBranch, Layers, Sparkles, ChevronDown
} from 'lucide-react';
import { UserSession } from '../types';
import { AuthMode } from './AuthModal';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userSession: UserSession;
  onOpenAuth: (mode?: AuthMode) => void;
  savedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab, setActiveTab, userSession, onOpenAuth, savedCount
}) => {
  const navItems = [
    { id: 'search', label: 'Explore', icon: Search },
    { id: 'suggestions', label: 'Ideas', icon: Lightbulb },
    { id: 'precheck', label: 'Pre-Check', icon: Lock },
    { id: 'profile', label: 'Profile', icon: UserCheck },
    { id: 'recommender', label: 'Recommendations', icon: Sparkles },
    { id: 'compare', label: 'Compare', icon: Layers },
    { id: 'dashboard', label: 'Saved', icon: Bookmark, count: savedCount },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-gh-canvas border-b border-gh-border">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          
          {/* Logo */}
          <button
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-2.5 text-gh-fg hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-md bg-gh-accent flex items-center justify-center">
              <GitBranch className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-semibold text-base tracking-tight hidden sm:block">
              GitScope
            </span>
          </button>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
                    isActive
                      ? 'bg-gh-card text-gh-fg border border-gh-border'
                      : 'text-gh-fgMuted hover:text-gh-fg hover:bg-gh-bg'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {typeof item.count === 'number' && item.count > 0 && (
                    <span className="ml-0.5 px-1.5 text-[11px] font-semibold bg-gh-border text-gh-fgMuted rounded-full">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User / Auth */}
          <div className="flex items-center gap-2">
            {userSession.isAuthenticated ? (
              <button
                onClick={() => setActiveTab('profile')}
                className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gh-card transition-colors border border-transparent hover:border-gh-border"
              >
                <img
                  src={userSession.avatarUrl}
                  alt={userSession.username}
                  className="w-7 h-7 rounded-full border border-gh-border object-cover"
                />
                <span className="text-[13px] font-medium text-gh-fg hidden sm:block">
                  {userSession.username}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gh-fgMuted hidden sm:block" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('signin')}
                  className="gh-btn-secondary text-xs py-1.5 px-3"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="gh-btn-primary text-xs py-1.5 px-3 font-semibold"
                >
                  Join for free
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden flex items-center gap-1 px-3 py-1.5 overflow-x-auto border-t border-gh-border no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                isActive ? 'bg-gh-card text-gh-fg' : 'text-gh-fgMuted hover:text-gh-fg'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
