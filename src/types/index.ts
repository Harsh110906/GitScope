export type DomainCategory = 
  | 'All Domains'
  | 'AI & Machine Learning'
  | 'Fintech & Payments'
  | 'Productivity & Tools'
  | 'EdTech & Learning'
  | 'E-Commerce & Retail'
  | 'Developer Tools & Infra'
  | 'Cybersecurity'
  | 'SaaS & Web Apps'
  | 'Health & Fitness'
  | 'Social & Community';

export type DifficultyLevel = 'Beginner' | 'Beginner-Friendly' | 'Intermediate' | 'Advanced' | 'Expert';

export type SaturationBadge = 
  | 'Frequently Made'
  | 'Unique'
  | 'High Demand'
  | 'High Portfolio Value'
  | 'High Learning Value'
  | 'Monetizable'
  | 'Beginner-Friendly';

export type DomainTier = 'Top Tier' | 'Emerging' | 'Solid Standard' | 'Oversaturated Standard';

export type DeveloperLevel = 
  | 'Junior Builder'
  | 'Intermediate Developer'
  | 'Advanced Engineer'
  | 'Senior Architect'
  | 'Elite Thought Leader';

export interface ScoreBreakdown {
  originality: number; // 0-100
  uxPolish: number; // 0-100
  technicalDepth: number; // 0-100
  utility: number; // 0-100
  portfolioValue: number; // 0-100
  codeCompleteness: number; // 0-100
  maintainability: number; // 0-100
}

export interface Project {
  id: string;
  name: string;
  repoUrl: string;
  owner: {
    login: string;
    avatarUrl: string;
    type: string;
  };
  description: string;
  domain: DomainCategory;
  difficulty: DifficultyLevel;
  stars: number;
  forks: number;
  openIssues: number;
  updatedAt: string;
  createdAt: string;
  primaryLanguage: string;
  languages: Record<string, number>;
  topics: string[];
  
  // AI Analytics & Ranking
  starRating: number; // 1.0 - 5.0
  numericScore: number; // 0 - 100
  domainPercentileRank: number; // e.g., 96 = Top 4%
  domainTier: DomainTier;
  saturationBadge: SaturationBadge;
  similarCount: number; // Estimated existing repos
  
  scoreBreakdown: ScoreBreakdown;
  
  aiSummary: string;
  aiReviewNotes: string;
  problemSolved: string;
  strengths: string[];
  weaknesses: string[];
  improvementSteps: string[];
  deployabilityScore: number;
  isPrivatePreCheck?: boolean;
}

export interface ProfileEvaluation {
  username: string;
  name: string;
  avatarUrl: string;
  bio: string;
  followers: number;
  following: number;
  publicRepos: number;
  totalStars: number;
  accountAgeYears: number;
  
  starRating: number; // 1.0 - 5.0
  overallScore: number; // 0 - 100
  developerLevel: DeveloperLevel;
  globalPercentile: number; // e.g. 94 = Top 6%
  
  qualitySignals: {
    repoCompletenessScore: number;
    techDiversityScore: number;
    contributionConsistencyScore: number;
    documentationScore: number;
    portfolioImpactScore: number;
  };
  
  topLanguages: { name: string; percentage: number }[];
  keyStrengths: string[];
  portfolioGaps: string[];
  recommendedActions: {
    title: string;
    description: string;
    priority: 'High' | 'Medium' | 'Low';
    suggestedDomain: DomainCategory;
  }[];
}

export interface ProjectIdea {
  id: string;
  title: string;
  domain: DomainCategory;
  difficulty: DifficultyLevel;
  demandLevel: 'High' | 'Medium' | 'Emerging';
  saturationBadge: SaturationBadge;
  saturationText: string;
  whyBuildIt: string;
  coreFeatures: string[];
  recommendedTechStack: string[];
  targetUser: string;
  resumeImpactScore: number; // 0 - 100
  estimatedHours: number;
}

export interface FilterOptions {
  searchKeyword: string;
  domain: DomainCategory;
  difficulty: string; // 'All' or specific
  saturationBadge: string; // 'All' or specific
  minScore: number;
  sortBy: 'relevance' | 'score' | 'stars' | 'unique' | 'demand' | 'portfolio';
  sortOrder: 'asc' | 'desc';
  viewMode: 'grid' | 'list';
}

export interface UserSession {
  isAuthenticated: boolean;
  username: string;
  name: string;
  avatarUrl: string;
  savedProjectIds: string[];
  savedIdeaIds: string[];
  privateEvaluations: Project[];
}
