import { Project, DomainCategory, SaturationBadge, ScoreBreakdown, ProfileEvaluation, ProjectIdea } from '../types';

/**
 * Expands search intent for queries like "to-do list apps", "ai chatbot", etc.
 */
export function expandSearchIntent(query: string): string[] {
  const q = query.toLowerCase().trim();
  const keywords = new Set<string>();
  keywords.add(q);

  if (q.includes('todo') || q.includes('to-do') || q.includes('task') || q.includes('kanban')) {
    ['productivity', 'task manager', 'kanban board', 'habit tracker', 'note taking', 'planner', 'workflow', 'time tracker'].forEach(k => keywords.add(k));
  } else if (q.includes('ai') || q.includes('bot') || q.includes('llm') || q.includes('gpt')) {
    ['machine learning', 'chatbot', 'nlp', 'openai', 'gemini', 'rag', 'vector search', 'prompt', 'agent'].forEach(k => keywords.add(k));
  } else if (q.includes('fintech') || q.includes('bank') || q.includes('crypto') || q.includes('trading') || q.includes('expense')) {
    ['finance', 'payments', 'budget', 'trading bot', 'investment', 'ledger', 'plaid', 'blockchain'].forEach(k => keywords.add(k));
  } else if (q.includes('portfolio') || q.includes('resume') || q.includes('website')) {
    ['developer portfolio', 'personal site', 'landing page', 'starter kit', 'bio link', 'resume builder'].forEach(k => keywords.add(k));
  } else if (q.includes('security') || q.includes('auth') || q.includes('crypto')) {
    ['cybersecurity', 'vulnerability scanner', 'zero trust', 'oauth', 'encryption', 'firewall'].forEach(k => keywords.add(k));
  }

  return Array.from(keywords);
}

/**
 * Derives Domain Category based on repository topics, name, and description
 */
export function classifyDomain(name: string, desc: string, topics: string[]): DomainCategory {
  const combined = `${name} ${desc} ${topics.join(' ')}`.toLowerCase();

  if (combined.includes('ai') || combined.includes('learning') || combined.includes('gpt') || combined.includes('llm') || combined.includes('model')) {
    return 'AI & Machine Learning';
  }
  if (combined.includes('fintech') || combined.includes('pay') || combined.includes('crypto') || combined.includes('trade') || combined.includes('bank') || combined.includes('expense') || combined.includes('finance')) {
    return 'Fintech & Payments';
  }
  if (combined.includes('todo') || combined.includes('task') || combined.includes('kanban') || combined.includes('note') || combined.includes('productivity') || combined.includes('habit')) {
    return 'Productivity & Tools';
  }
  if (combined.includes('health') || combined.includes('med') || combined.includes('fitness') || combined.includes('workout') || combined.includes('doctor')) {
    return 'Health & Fitness';
  }
  if (combined.includes('security') || combined.includes('auth') || combined.includes('vulnerability') || combined.includes('proxy') || combined.includes('firewall')) {
    return 'Cybersecurity';
  }
  if (combined.includes('action') || combined.includes('cli') || combined.includes('tool') || combined.includes('compiler') || combined.includes('linter') || combined.includes('dev')) {
    return 'Developer Tools & Infra';
  }
  if (combined.includes('learn') || combined.includes('course') || combined.includes('quiz') || combined.includes('flashcard') || combined.includes('edtech')) {
    return 'EdTech & Learning';
  }
  if (combined.includes('shop') || combined.includes('store') || combined.includes('cart') || combined.includes('commerce')) {
    return 'E-Commerce & Retail';
  }

  return 'SaaS & Web Apps';
}

/**
 * Calculates multi-dimensional quality scores, percentile rank, and AI review notes for any repo
 */
export function evaluateProject(rawRepo: any, searchContext: string = ''): Project {
  const domain = classifyDomain(rawRepo.name, rawRepo.description, rawRepo.topics || []);
  const stars = rawRepo.stars || 0;
  const forks = rawRepo.forks || 0;

  // Determine saturation & originality metrics
  const isCommonCategory = domain === 'Productivity & Tools' || rawRepo.name.toLowerCase().includes('todo') || rawRepo.name.toLowerCase().includes('portfolio');
  const isHighTech = domain === 'Cybersecurity' || domain === 'AI & Machine Learning' || rawRepo.primaryLanguage === 'Rust' || rawRepo.primaryLanguage === 'Go';

  // Compute pillar scores
  const originality = isCommonCategory ? Math.min(65, 40 + Math.round(stars / 100)) : (isHighTech ? 92 : 82);
  const uxPolish = Math.min(98, 75 + Math.round((stars % 30)));
  const technicalDepth = isHighTech ? Math.min(99, 85 + Math.round(stars / 150)) : Math.min(92, 60 + Math.round(stars / 80));
  const utility = Math.min(98, 70 + Math.round((stars % 25) + forks / 10));
  const portfolioValue = Math.min(98, Math.round((originality * 0.4) + (technicalDepth * 0.4) + (uxPolish * 0.2)));
  const codeCompleteness = Math.min(95, 80 + Math.round(forks / 20));
  const maintainability = Math.min(96, 78 + Math.round(stars / 200));

  const scoreBreakdown: ScoreBreakdown = {
    originality,
    uxPolish,
    technicalDepth,
    utility,
    portfolioValue,
    codeCompleteness,
    maintainability
  };

  // Compute Overall Numeric Score (0-100)
  const numericScore = Math.round(
    originality * 0.20 +
    uxPolish * 0.15 +
    technicalDepth * 0.25 +
    utility * 0.15 +
    portfolioValue * 0.15 +
    codeCompleteness * 0.10
  );

  const starRating = Number((numericScore / 20).toFixed(1));
  const domainPercentileRank = Math.min(99, Math.max(35, Math.round(numericScore * 0.98)));

  let domainTier: Project['domainTier'] = 'Solid Standard';
  if (numericScore >= 90) domainTier = 'Top Tier';
  else if (numericScore >= 80) domainTier = 'Emerging';
  else if (isCommonCategory && numericScore < 75) domainTier = 'Oversaturated Standard';

  let saturationBadge: SaturationBadge = 'High Demand';
  let similarCount = 1200;

  if (isCommonCategory) {
    saturationBadge = 'Frequently Made';
    similarCount = 45000;
  } else if (isHighTech && originality > 85) {
    saturationBadge = 'Unique';
    similarCount = 320;
  } else if (portfolioValue > 90) {
    saturationBadge = 'High Portfolio Value';
    similarCount = 890;
  }

  let difficulty: Project['difficulty'] = 'Intermediate';
  if (technicalDepth > 92) difficulty = 'Expert';
  else if (technicalDepth > 82) difficulty = 'Advanced';
  else if (technicalDepth < 60) difficulty = 'Beginner';

  return {
    ...rawRepo,
    domain,
    difficulty,
    starRating,
    numericScore,
    domainPercentileRank,
    domainTier,
    saturationBadge,
    similarCount,
    scoreBreakdown,
    deployabilityScore: Math.min(98, Math.round((codeCompleteness + maintainability) / 2)),
    aiSummary: `${rawRepo.name} is a ${difficulty.toLowerCase()}-level ${domain} repository scoring ${numericScore}/100. It demonstrates ${technicalDepth > 80 ? 'strong architectural depth' : 'accessible clean code'} and ${uxPolish > 80 ? 'high visual polish' : 'standard formatting'}.`,
    aiReviewNotes: `Compared to other ${domain} projects, ${rawRepo.name} ranks in the top ${100 - domainPercentileRank}% percentile. ${isCommonCategory ? 'While this domain has high saturation, high code completeness makes it stand out.' : 'This project offers distinct portfolio differentiation.'}`,
    problemSolved: rawRepo.description || 'Solves domain-specific workflow challenges with modern web architecture.',
    strengths: [
      `High domain utility with ${stars.toLocaleString()} stargazers`,
      `Robust ${rawRepo.primaryLanguage || 'TypeScript'} codebase structure`,
      `Solid portfolio impact score (${portfolioValue}/100)`
    ],
    weaknesses: [
      isCommonCategory ? 'Frequently made project category with high domain competition' : 'Could benefit from expanded automated integration test suites',
      'Requires live deployment demo links in repository header'
    ],
    improvementSteps: [
      'Add end-to-end Cypress or Playwright test suites to prove reliability',
      'Create interactive live web demo hosted on Vercel / Render',
      'Publish detailed architecture documentation and API endpoint swagger schemas'
    ]
  };
}

/**
 * Runs a private pre-check evaluation on user's own draft code/repo
 */
export function evaluatePrivatePreCheck(data: {
  projectName: string;
  domain: DomainCategory;
  description: string;
  techStack: string;
  hasTests: boolean;
  hasDocs: boolean;
  hasDeployment: boolean;
}): Project {
  const isAi = data.domain === 'AI & Machine Learning';
  const isFintech = data.domain === 'Fintech & Payments';
  
  const originality = isAi || isFintech ? 88 : 74;
  const uxPolish = data.hasDeployment ? 90 : 65;
  const technicalDepth = data.hasTests ? 88 : 70;
  const utility = 85;
  const portfolioValue = Math.round((originality * 0.3) + (technicalDepth * 0.4) + (uxPolish * 0.3));
  const codeCompleteness = data.hasDocs ? 88 : 60;
  const maintainability = data.hasTests && data.hasDocs ? 92 : 68;

  const scoreBreakdown: ScoreBreakdown = {
    originality,
    uxPolish,
    technicalDepth,
    utility,
    portfolioValue,
    codeCompleteness,
    maintainability
  };

  const numericScore = Math.round(
    originality * 0.20 +
    uxPolish * 0.15 +
    technicalDepth * 0.25 +
    utility * 0.15 +
    portfolioValue * 0.15 +
    codeCompleteness * 0.10
  );

  const starRating = Number((numericScore / 20).toFixed(1));

  return {
    id: `precheck-${Date.now()}`,
    name: data.projectName || 'Draft Project Pre-Check',
    repoUrl: '#',
    owner: {
      login: 'You (Private Pre-Check)',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      type: 'User'
    },
    description: data.description || 'Private pre-release project evaluation.',
    domain: data.domain,
    difficulty: technicalDepth > 80 ? 'Advanced' : 'Intermediate',
    stars: 0,
    forks: 0,
    openIssues: 0,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    primaryLanguage: data.techStack.split(',')[0] || 'TypeScript',
    languages: { 'TypeScript': 70, 'React': 30 },
    topics: ['private-precheck', data.domain.toLowerCase()],
    
    starRating,
    numericScore,
    domainPercentileRank: Math.min(98, Math.round(numericScore * 0.96)),
    domainTier: numericScore > 85 ? 'Top Tier' : 'Emerging',
    saturationBadge: data.domain === 'Cybersecurity' ? 'Unique' : 'High Portfolio Value',
    similarCount: 650,
    scoreBreakdown,
    deployabilityScore: data.hasDeployment ? 95 : 55,
    isPrivatePreCheck: true,
    
    aiSummary: `Private evaluation for ${data.projectName}. Pre-release score: ${numericScore}/100 (${starRating} Stars).`,
    aiReviewNotes: `Your project currently scores in the Top ${100 - Math.round(numericScore * 0.96)}% relative to public ${data.domain} projects. ${data.hasDeployment ? 'Having a live deployment gives you a huge advantage!' : 'Adding a live deployment URL will immediately raise your score by +12 points.'}`,
    problemSolved: data.description,
    strengths: [
      `Targeted in high-demand ${data.domain} sector`,
      data.hasTests ? 'Includes unit/integration test coverage' : 'Clear core problem definition',
      data.hasDocs ? 'Well-documented repository structure' : 'Modern tech stack foundation'
    ],
    weaknesses: [
      !data.hasDeployment ? 'Lacks a live public deployment URL' : '',
      !data.hasTests ? 'No automated unit tests detected' : '',
      !data.hasDocs ? 'README lacks setup instructions and architecture diagrams' : ''
    ].filter(Boolean),
    improvementSteps: [
      !data.hasDeployment ? 'Deploy application to Vercel / Render / Fly.io and add badge to README' : 'Add CI/CD GitHub Action pipeline',
      !data.hasTests ? 'Add Vitest or Jest test suite covering core business logic' : 'Increase branch test coverage above 80%',
      'Create a demo GIF or screenshot gallery in your repository header'
    ]
  };
}

/**
 * Generates personalized recommendations for logged in user based on profile gaps
 */
export function generatePersonalizedRecommendations(profile: ProfileEvaluation): ProjectIdea[] {
  const ideas: ProjectIdea[] = [
    {
      id: 'rec-1',
      title: 'Real-Time Financial Risk Analytics Engine',
      domain: 'Fintech & Payments',
      difficulty: 'Advanced',
      demandLevel: 'High',
      saturationBadge: 'High Portfolio Value',
      saturationText: 'Low Saturation (~420 repos)',
      whyBuildIt: `Your profile currently scores ${profile.overallScore}/100. Adding a fintech risk engine with WebSockets and WebAssembly will elevate your profile to Senior Architect tier.`,
      coreFeatures: [
        'Live financial websocket stream ingestion',
        'Monte Carlo risk portfolio simulation',
        'Rust/WASM data parsing pipeline',
        'Interactive financial dashboard'
      ],
      recommendedTechStack: ['TypeScript', 'Rust (WASM)', 'React', 'Recharts', 'Tailwind'],
      targetUser: 'Financial Analysts, Quant Traders, Hiring Managers',
      resumeImpactScore: 97,
      estimatedHours: 40
    },
    {
      id: 'rec-2',
      title: 'Autonomous AI Security Code Auditor CLI',
      domain: 'Developer Tools & Infra',
      difficulty: 'Advanced',
      demandLevel: 'High',
      saturationBadge: 'High Demand',
      saturationText: 'Moderate (~310 repos)',
      whyBuildIt: `Addresses your profile gap: "Lacks production backend microservices or containerized deployments". Building a Go/CLI tool proves system design mastery.`,
      coreFeatures: [
        'Static analysis CLI parsing AST syntax trees',
        'Google Gemini API semantic security checks',
        'Automated GitHub Action PR inline comments'
      ],
      recommendedTechStack: ['Go', 'TypeScript', 'Docker', 'Google Gemini API'],
      targetUser: 'DevOps Engineers, Open Source Maintainers',
      resumeImpactScore: 95,
      estimatedHours: 35
    },
    {
      id: 'rec-3',
      title: 'Zero-Knowledge Encrypted Document Locker',
      domain: 'Cybersecurity',
      difficulty: 'Expert',
      demandLevel: 'Emerging',
      saturationBadge: 'Unique',
      saturationText: 'Very Low (~95 repos)',
      whyBuildIt: 'Unique cryptographic projects score in the 99th percentile for originality and instantly grab recruiter attention.',
      coreFeatures: [
        'Browser-side SHA-256 and Web Crypto API encryption',
        'Zero-knowledge proof verification stream',
        'Tamper-evident cryptographic audit logs'
      ],
      recommendedTechStack: ['React', 'TypeScript', 'Web Crypto API', 'Tailwind'],
      targetUser: 'Security Professionals, Legal Tech',
      resumeImpactScore: 99,
      estimatedHours: 50
    }
  ];

  return ideas;
}
