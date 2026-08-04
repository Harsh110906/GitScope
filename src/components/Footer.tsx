import React from 'react';
import { Stethoscope, Mail, LifeBuoy } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  return (
    <footer className="w-full border-t border-gh-border bg-gh-canvas mt-16">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md bg-gh-accent flex items-center justify-center">
                <Stethoscope className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-semibold text-sm text-gh-fg">GitScope</span>
            </div>
            <p className="text-xs text-gh-fgMuted leading-relaxed mb-3">
              GitHub project intelligence platform. Discover, analyze, compare, and improve.
            </p>
            <div className="pt-2 border-t border-gh-borderMuted text-xs">
              <span className="text-gh-fgSubtle font-medium block mb-1">Customer Support & Feedback:</span>
              <a
                href="mailto:gitscopesupport@gmail.com"
                className="text-gh-accent hover:underline flex items-center gap-1.5 font-medium text-[12px]"
              >
                <Mail className="w-3.5 h-3.5 shrink-0" />
                gitscopesupport@gmail.com
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gh-fg mb-3 uppercase tracking-wider">Platform</h4>
            <ul className="space-y-1.5 text-[13px]">
              <li><button onClick={() => setActiveTab('search')} className="text-gh-fgMuted hover:text-gh-accent transition-colors">Explore Projects</button></li>
              <li><button onClick={() => setActiveTab('suggestions')} className="text-gh-fgMuted hover:text-gh-accent transition-colors">Project Ideas</button></li>
              <li><button onClick={() => setActiveTab('precheck')} className="text-gh-fgMuted hover:text-gh-accent transition-colors">Pre-Check</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gh-fg mb-3 uppercase tracking-wider">Analyze</h4>
            <ul className="space-y-1.5 text-[13px]">
              <li><button onClick={() => setActiveTab('profile')} className="text-gh-fgMuted hover:text-gh-accent transition-colors">Profile Analyzer</button></li>
              <li><button onClick={() => setActiveTab('recommender')} className="text-gh-fgMuted hover:text-gh-accent transition-colors">Recommendations</button></li>
              <li><button onClick={() => setActiveTab('compare')} className="text-gh-fgMuted hover:text-gh-accent transition-colors">Compare Projects</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gh-fg mb-3 uppercase tracking-wider">Help & Support</h4>
            <div className="space-y-2 text-xs">
              <p className="text-gh-fgMuted leading-relaxed">
                Have advice, suggestions, or complaints? Reach out to support:
              </p>
              <a
                href="mailto:gitscopesupport@gmail.com"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-gh-accent hover:underline bg-gh-bg px-2.5 py-1.5 rounded border border-gh-borderMuted"
              >
                <LifeBuoy className="w-3.5 h-3.5" />
                gitscopesupport@gmail.com
              </a>
            </div>
          </div>

        </div>

        <div className="pt-6 border-t border-gh-borderMuted flex flex-col sm:flex-row items-center justify-between text-xs text-gh-fgSubtle gap-3">
          <p>© {new Date().getFullYear()} GitScope. Built for developers.</p>
          <div className="flex items-center gap-4">
            <a href="mailto:gitscopesupport@gmail.com" className="hover:text-gh-fg transition-colors flex items-center gap-1">
              <Mail className="w-3 h-3" /> Contact Support (gitscopesupport@gmail.com)
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
