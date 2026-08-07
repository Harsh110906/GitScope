/**
 * Repository Intelligence Domain Types for GitScope
 */

export type ScanMode = 'quick' | 'standard' | 'deep';

export type AnalysisStatus =
  | 'idle'
  | 'validating'
  | 'collecting'
  | 'extracting_evidence'
  | 'scoring'
  | 'generating_insights'
  | 'completed'
  | 'partial'
  | 'failed'
  | 'cancelled';

export type FindingSeverity = 'informational' | 'low' | 'medium' | 'high' | 'critical';
export type FindingConfidence = 'low' | 'medium' | 'high';
export type FindingStatus = 'potential' | 'confirmed_by_rule' | 'not_detected' | 'not_scanned';

export interface EvidenceCoverage {
  availableChecks: number;
  totalChecks: number;
  percentage: number;
}

export interface CategoryScore {
  category: 'documentation' | 'code_organization' | 'maintenance' | 'testing_cicd' | 'security' | 'contribution';
  categoryTitle: string;
  score: number;
  maxScore: number;
  confidence: FindingConfidence;
  evidenceCoverage: EvidenceCoverage;
  evidenceIds: string[];
  positiveFindings: string[];
  missingData: string[];
  recommendations: string[];
  scanTimestamp: string;
}

export interface SecurityFinding {
  id: string;
  title: string;
  severity: FindingSeverity;
  confidence: FindingConfidence;
  status: FindingStatus;
  description: string;
  evidenceIds: string[];
  filePath: string | null;
  lineNumber: number | null;
  redactedEvidence: string;
  recommendation: string;
}

export interface ContributionRecommendation {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Beginner to Intermediate' | 'Intermediate' | 'Intermediate to Advanced' | 'Advanced';
  matchScore: number; // 0 - 100
  explanation: string;
  suggestedFiles: string[];
  estimatedEffort: string; // e.g. "2-4 hours"
  priority: 'high' | 'medium' | 'low';
}

export interface UserProfilePreferences {
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  languages?: string[];
  frameworks?: string[];
  interests?: string[];
  learningGoals?: string[];
  availableHours?: number;
}

export interface RepositoryMetadata {
  name: string;
  owner: string;
  ownerAvatarUrl?: string;
  description: string;
  primaryLanguage: string;
  otherLanguages: Record<string, number>;
  license: string;
  stars: number;
  forks: number;
  openIssues: number;
  openPullRequests?: number;
  watchers?: number;
  visibility: 'public' | 'private';
  createdAt: string;
  updatedAt: string;
  latestCommitDate: string;
  defaultBranch: string;
  topics: string[];
  homepage?: string;
  isArchived: boolean;
  hasReadme: boolean;
  hasContributing: boolean;
  hasCodeOfConduct: boolean;
  hasSecurityPolicy: boolean;
  hasLicense: boolean;
}

export interface RepositoryIntelligenceReport {
  id: string;
  owner: string;
  repositoryName: string;
  repositoryUrl: string;
  analyzedCommitSha: string;
  defaultBranch: string;
  scanMode: ScanMode;
  analysisVersion: string;
  status: AnalysisStatus;
  overallScore: number;
  confidence: FindingConfidence;
  
  // Repository Meta
  metadata: RepositoryMetadata;
  
  // Categorized Scores
  categories: {
    documentation: CategoryScore;
    codeOrganization: CategoryScore;
    maintenance: CategoryScore;
    testingCicd: CategoryScore;
    security: CategoryScore;
    contribution: CategoryScore;
  };
  
  // Executive Highlights
  summary: string;
  projectType: string;
  difficultyRating: {
    level: 'Beginner' | 'Beginner to Intermediate' | 'Intermediate' | 'Intermediate to Advanced' | 'Advanced';
    explanation: string;
  };
  topStrengths: {
    title: string;
    description: string;
    evidenceIds: string[];
  }[];
  priorityImprovements: {
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    reason: string;
    evidenceIds: string[];
  }[];

  // Advisory Security
  securityInsights: {
    disclaimer: string;
    findings: SecurityFinding[];
    scanLimitations: string[];
  };

  // Personalized Contribution Guidance
  contributionGuide: {
    firstStep: string;
    requiredSkills: string[];
    recommendedFiles: string[];
    learningOpportunities: string[];
    isBeginnerFriendly: boolean;
    personalizedMatches?: ContributionRecommendation[];
  };

  // Scan Evidence & Limitations
  evidenceItems: {
    id: string;
    category: string;
    title: string;
    detail: string;
    filePath?: string;
    lineNumber?: number;
    snippet?: string;
  }[];
  scanLimitations: string[];
  createdAt: string;
  completedAt?: string;
}
