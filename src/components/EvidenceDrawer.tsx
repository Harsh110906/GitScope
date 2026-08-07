import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileCode, CheckCircle2, FileText } from 'lucide-react';
import { RepositoryIntelligenceReport } from '../types/repoIntelligenceTypes';

interface EvidenceDrawerProps {
  evidenceItems: RepositoryIntelligenceReport['evidenceItems'];
  scanLimitations: string[];
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({ evidenceItems, scanLimitations }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="gh-card p-4 space-y-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left text-sm font-semibold text-gh-fg hover:text-gh-accent transition-colors"
      >
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-gh-accent" />
          <span>Verifiable Repository Evidence & Scan Scope</span>
          <span className="text-xs font-normal text-gh-fgSubtle bg-gh-bg px-2 py-0.5 rounded border border-gh-border">
            {evidenceItems.length} facts verified
          </span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {isOpen && (
        <div className="pt-3 border-t border-gh-borderMuted space-y-4 text-xs">
          
          {/* Verified Evidence List */}
          <div>
            <h4 className="font-semibold text-gh-fg mb-2 flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-gh-success" />
              Verified Facts ({evidenceItems.length}):
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {evidenceItems.map(item => (
                <div key={item.id} className="p-2.5 bg-gh-bg border border-gh-borderMuted rounded-md space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-gh-fgSubtle">
                    <span className="text-gh-accent font-semibold">{item.id}</span>
                    <span>{item.category}</span>
                  </div>
                  <div className="font-medium text-gh-fg">{item.title}</div>
                  <div className="text-gh-fgMuted line-clamp-2">{item.detail}</div>
                  {item.filePath && (
                    <div className="text-[10px] text-gh-accent font-mono pt-1">
                      File: {item.filePath} {item.lineNumber ? `: L${item.lineNumber}` : ''}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Scan Budget Limitations */}
          {scanLimitations.length > 0 && (
            <div className="p-3 bg-gh-bg/60 border border-gh-borderMuted rounded-md space-y-1.5">
              <h4 className="font-semibold text-gh-fgMuted text-xs flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-gh-fgSubtle" />
                Scan Budget & Operational Scope:
              </h4>
              <ul className="list-disc list-inside space-y-1 text-gh-fgMuted text-[11px]">
                {scanLimitations.map((lim, i) => (
                  <li key={i}>{lim}</li>
                ))}
              </ul>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
