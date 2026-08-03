import React, { useState } from 'react';
import { X, Lock, Sparkles, Github, Globe, ArrowRight, ShieldCheck, Mail } from 'lucide-react';

export type AuthMode = 'signin' | 'signup';
export type AuthReason = 'limit_reached' | 'user_click';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: { username: string; email?: string; provider?: string }) => void;
  initialMode?: AuthMode;
  reason?: AuthReason;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen, onClose, onLogin, initialMode = 'signup', reason = 'user_click'
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Sync initialMode when modal opens
  React.useEffect(() => {
    setMode(initialMode);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    setTimeout(() => {
      const derivedUsername = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
      onLogin({ username: derivedUsername, email: email.trim(), provider: 'email' });
      setIsLoading(false);
      onClose();
    }, 500);
  };

  const handleSocialLogin = (provider: string) => {
    setIsLoading(true);
    setTimeout(() => {
      const mockUsername = provider === 'github' ? 'dev_builder' : `${provider}_user`;
      onLogin({ username: mockUsername, provider });
      setIsLoading(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-md bg-gh-canvas border border-gh-border rounded-lg shadow-2xl overflow-hidden my-8">
        
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-gh-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gh-accent/15 flex items-center justify-center text-gh-accent">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-semibold text-sm text-gh-fg">
              {mode === 'signup' ? 'Join GitScope' : 'Sign in to GitScope'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gh-fgMuted hover:text-gh-fg rounded-md hover:bg-gh-card transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          
          {/* Limit Reached Banner */}
          {reason === 'limit_reached' && (
            <div className="bg-yellow-400/10 border border-yellow-400/25 rounded-md p-3.5 space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-yellow-400 text-xs">
                <Lock className="w-4 h-4 shrink-0" />
                <span>You've reached your 3 free searches limit</span>
              </div>
              <p className="text-xs text-gh-fgMuted leading-relaxed">
                Join for free or sign in to unlock unlimited project searches, AI portfolio evaluations, and repository comparisons.
              </p>
            </div>
          )}

          {/* Mode Switcher Tabs */}
          <div className="flex bg-gh-bg p-1 rounded-md border border-gh-borderMuted">
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded transition-colors ${
                mode === 'signup'
                  ? 'bg-gh-card text-gh-fg shadow-sm border border-gh-border'
                  : 'text-gh-fgMuted hover:text-gh-fg'
              }`}
            >
              Join for free
            </button>
            <button
              onClick={() => setMode('signin')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded transition-colors ${
                mode === 'signin'
                  ? 'bg-gh-card text-gh-fg shadow-sm border border-gh-border'
                  : 'text-gh-fgMuted hover:text-gh-fg'
              }`}
            >
              Sign in
            </button>
          </div>

          {/* Social Logins */}
          <div className="space-y-2">
            <button
              onClick={() => handleSocialLogin('github')}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-2 rounded-md bg-[#24292e] hover:bg-[#2c3137] text-white font-medium text-xs border border-gh-border transition-colors disabled:opacity-50"
            >
              <Github className="w-4 h-4" />
              <span>Continue with GitHub</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-gh-bg hover:bg-gh-card text-gh-fg font-medium text-xs border border-gh-borderMuted transition-colors disabled:opacity-50"
              >
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>Google</span>
              </button>
              <button
                onClick={() => handleSocialLogin('apple')}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-gh-bg hover:bg-gh-card text-gh-fg font-medium text-xs border border-gh-borderMuted transition-colors disabled:opacity-50"
              >
                <Globe className="w-3.5 h-3.5 text-gh-fgSubtle" />
                <span>Apple</span>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gh-borderMuted" />
            </div>
            <span className="relative px-2 bg-gh-canvas text-[11px] font-medium text-gh-fgSubtle uppercase">
              Or with email
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-gh-fgMuted mb-1">
                Work or Personal Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="gh-input w-full pl-8"
                />
                <Mail className="w-4 h-4 text-gh-fgSubtle absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gh-fgMuted mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="gh-input w-full"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="gh-btn-primary w-full justify-center py-2.5 text-xs font-bold mt-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'signup' ? 'Create Free Account' : 'Sign In'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Feature highlights & Support */}
          <div className="pt-3 border-t border-gh-borderMuted text-[11px] text-gh-fgMuted space-y-1.5">
            <div className="flex items-center gap-1.5 text-gh-success">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="font-medium">Instant access to unlimited searches & AI scores</span>
            </div>
            <div className="text-center pt-1 text-[11px] text-gh-fgSubtle">
              Need help or have feedback? Contact <a href="mailto:gitscopesupport@gmail.com" className="text-gh-accent hover:underline">gitscopesupport@gmail.com</a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
