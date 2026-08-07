import { ScanMode, AnalysisStatus, RepositoryIntelligenceReport, UserProfilePreferences } from './repoIntelligenceTypes';

export interface AnalyzeRepositoryRequest {
  repositoryUrl: string;
  scanMode?: ScanMode;
  userProfile?: UserProfilePreferences;
}

export interface QuotaInfo {
  allowed: boolean;
  remaining: number;
  limit: number;
  usageDate: string;
}

export interface AnalyzeRepositoryResponse {
  analysisId: string;
  status: AnalysisStatus;
  progress: number;
  currentStep: string;
  isCached?: boolean;
  quota?: QuotaInfo;
  report?: RepositoryIntelligenceReport | null;
  error?: {
    code: string;
    message: string;
    retryable: boolean;
    remaining?: number;
  };
}

export type ApiErrorCode =
  | 'INVALID_URL'
  | 'SSRF_BLOCKED'
  | 'REPO_NOT_FOUND'
  | 'REPO_UNAVAILABLE'
  | 'ANALYSIS_QUOTA_EXCEEDED'
  | 'RATE_LIMITED'
  | 'ANALYSIS_TIMEOUT'
  | 'INTERNAL_ERROR';
