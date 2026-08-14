import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, UserCheck, Lightbulb, Bookmark, Lock, GitBranch, Layers, Sparkles, ChevronDown, LogOut, User
} from 'lucide-react';
import { UserSession } from '../types';
import { AuthMode } from './AuthModal';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userSession: UserSession;
  onOpenAuth: (mode?: AuthMode) => void;
  onLogout?: () => void;
  savedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab, setActiveTab, userSession, onOpenAuth, onLogout, savedCount
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { id: 'search', label: 'Explore', icon: Search },
    { id: 'intelligence', label: 'Intelligence', icon: Sparkles },
    { id: 'suggestions', label: 'Ideas', icon: Lightbulb },
    { id: 'precheck', label: 'Pre-Check', icon: Lock },
    { id: 'profile', label: 'Profile', icon: UserCheck },
    { id: 'recommender', label: 'Recommendations', icon: Sparkles },
    { id: 'compare', label: 'Compare', icon: Layers },
    { id: 'dashboard', label: 'Saved', icon: Bookmark, count: savedCount },
  ];

  // Close dropdown on click outside (support both mouse and touch events)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-gh-canvas border-b border-gh-border">
      <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14">
          
          {/* Logo */}
          <button
            onClick={() => {
              setActiveTab('landing');
              setDropdownOpen(false);
            }}
            className="flex items-center gap-2 text-gh-fg hover:opacity-80 transition-opacity shrink-0"
          >
            <img src="/logo.png" alt="GitScope Logo" className="w-8 h-8 rounded-md object-contain" />
            <span className="font-semibold text-base tracking-tight hidden sm:block">
              GitScope
            </span>
          </button>

          {/* Desktop Nav Tabs */}
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
          <div className="flex items-center gap-1.5 sm:gap-2">
            {userSession.isAuthenticated ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gh-card transition-colors border border-transparent hover:border-gh-border active:scale-95"
                  aria-label="User profile menu"
                >
                  {userSession.avatarUrl ? (
                    <img
                      src={userSession.avatarUrl}
                      alt={userSession.name || userSession.username}
                      className="w-7 h-7 rounded-full border border-gh-border object-cover shrink-0"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gh-bg border border-gh-border flex items-center justify-center text-gh-fgMuted shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                  <span className="text-[13px] font-medium text-gh-fg hidden sm:block max-w-[120px] truncate">
                    {userSession.name || userSession.username}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-gh-fgMuted hidden sm:block" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-52 bg-gh-canvas border border-gh-border rounded-md shadow-2xl py-1 z-50 animate-in fade-in-50 duration-150">
                    <div className="px-3 py-2 border-b border-gh-borderMuted">
                      <div className="text-xs font-semibold text-gh-fg truncate">
                        {userSession.name || userSession.username}
                      </div>
                      {userSession.email && (
                        <div className="text-[11px] text-gh-fgMuted truncate mt-0.5">
                          {userSession.email}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        setActiveTab('profile');
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-gh-fg hover:bg-gh-card flex items-center gap-2 transition-colors active:bg-gh-card"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-gh-fgMuted" />
                      <span>Profile Insights</span>
                    </button>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        if (onLogout) onLogout();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-gh-card flex items-center gap-2 transition-colors active:bg-gh-card"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => onOpenAuth('signin')}
                  className="gh-btn-secondary text-xs py-1.5 px-2.5 sm:px-3 whitespace-nowrap"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="gh-btn-primary text-xs py-1.5 px-2.5 sm:px-3 font-semibold whitespace-nowrap"
                >
                  <span className="hidden xs:inline">Join for free</span>
                  <span className="xs:hidden">Join</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Mobile nav bar with horizontal touch scroll */}
      <div className="md:hidden flex items-center gap-1 px-2.5 py-1.5 overflow-x-auto border-t border-gh-border no-scrollbar touch-scroll bg-gh-canvas/95">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
                isActive
                  ? 'bg-gh-card text-gh-fg border border-gh-border shadow-sm'
                  : 'text-gh-fgMuted hover:text-gh-fg active:bg-gh-bg'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
              {typeof item.count === 'number' && item.count > 0 && (
                <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                  isActive ? 'bg-gh-accent/20 text-gh-accent' : 'bg-gh-border text-gh-fgMuted'
                }`}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
