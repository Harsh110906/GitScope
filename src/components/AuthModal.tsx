import React, { useState, useEffect } from 'react';
import { X, Lock, Sparkles, Github, Globe, ArrowRight, ShieldCheck, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { signInWithEmail, signUpWithEmail, signInWithProvider, OAuthProvider } from '../services/authService';

export type AuthMode = 'signin' | 'signup';
export type AuthReason = 'limit_reached' | 'user_click';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
  reason?: AuthReason;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen, onClose, initialMode = 'signup', reason = 'user_click'
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialLoading, setSocialLoading] = useState<OAuthProvider | null>(null);

  // Error and validation state
  const [formError, setFormError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync initialMode when modal opens
  useEffect(() => {
    setMode(initialMode);
    setEmail('');
    setPassword('');
    setFormError(null);
    setEmailError(null);
    setPasswordError(null);
    setSuccessMessage(null);
    setIsSubmitting(false);
    setSocialLoading(null);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    let valid = true;
    setEmailError(null);
    setPasswordError(null);
    setFormError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setEmailError('Please enter a valid email address.');
      valid = false;
    }

    if (!password || password.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      valid = false;
    }

    return valid;
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (mode === 'signup') {
        const { data, error } = await signUpWithEmail(email.trim(), password);
        if (error) {
          setFormError(error.message);
        } else if (data.user && !data.session) {
          setSuccessMessage('Check your email to confirm your account before signing in.');
        } else if (data.session) {
          onClose();
        }
      } else {
        const { data, error } = await signInWithEmail(email.trim(), password);
        if (error) {
          setFormError(error.message);
        } else if (data.session) {
          onClose();
        }
      }
    } catch (err: any) {
      setFormError(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = async (provider: OAuthProvider) => {
    setSocialLoading(provider);
    setFormError(null);
    try {
      const { error } = await signInWithProvider(provider);
      if (error) {
        setFormError(error.message);
        setSocialLoading(null);
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to initialize social login.');
      setSocialLoading(null);
    }
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

          {/* Error Banner */}
          {formError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-md p-3 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs text-red-300 leading-relaxed">{formError}</p>
            </div>
          )}

          {/* Success Confirmation Banner */}
          {successMessage && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-md p-3 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
              <p className="text-xs text-green-300 leading-relaxed">{successMessage}</p>
            </div>
          )}

          {/* Mode Switcher Tabs */}
          <div className="flex bg-gh-bg p-1 rounded-md border border-gh-borderMuted">
            <button
              onClick={() => {
                setMode('signup');
                setFormError(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded transition-colors ${
                mode === 'signup'
                  ? 'bg-gh-card text-gh-fg shadow-sm border border-gh-border'
                  : 'text-gh-fgMuted hover:text-gh-fg'
              }`}
            >
              Join for free
            </button>
            <button
              onClick={() => {
                setMode('signin');
                setFormError(null);
                setSuccessMessage(null);
              }}
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
              disabled={isSubmitting || socialLoading !== null}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-2 rounded-md bg-[#24292e] hover:bg-[#2c3137] text-white font-medium text-xs border border-gh-border transition-colors disabled:opacity-50"
            >
              {socialLoading === 'github' ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Github className="w-4 h-4" />
              )}
              <span>Continue with GitHub</span>
            </button>

            <button
              onClick={() => handleSocialLogin('google')}
              disabled={isSubmitting || socialLoading !== null}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-2 rounded-md bg-gh-bg hover:bg-gh-card text-gh-fg font-medium text-xs border border-gh-borderMuted transition-colors disabled:opacity-50"
            >
              {socialLoading === 'google' ? (
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
              )}
              <span>Continue with Google</span>
            </button>
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
          <form onSubmit={handleEmailSubmit} className="space-y-3.5" noValidate>
            <div>
              <label className="block text-xs font-medium text-gh-fgMuted mb-1">
                Work or Personal Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  placeholder="name@company.com"
                  className={`gh-input w-full pl-8 ${emailError ? 'border-red-500 focus:border-red-500' : ''}`}
                />
                <Mail className="w-4 h-4 text-gh-fgSubtle absolute left-2.5 top-2.5" />
              </div>
              {emailError && (
                <p className="text-[11px] text-red-400 mt-1">{emailError}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gh-fgMuted mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError(null);
                }}
                placeholder="••••••••"
                className={`gh-input w-full ${passwordError ? 'border-red-500 focus:border-red-500' : ''}`}
              />
              {passwordError && (
                <p className="text-[11px] text-red-400 mt-1">{passwordError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || socialLoading !== null}
              className="gh-btn-primary w-full justify-center py-2.5 text-xs font-bold mt-2"
            >
              {isSubmitting ? (
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
