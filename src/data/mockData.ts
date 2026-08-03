import { ProjectIdea } from '../types';

/**
 * Curated catalog of high-impact project blueprints & ideas.
 * Used by the Project Suggestions and Idea Evaluation engine.
 */
export const PROJECT_IDEAS_CATALOG: ProjectIdea[] = [
  {
    id: 'idea-1',
    title: 'Multi-LLM Prompt Engineering Benchmark & Sandbox',
    domain: 'AI & Machine Learning',
    difficulty: 'Intermediate',
    demandLevel: 'High',
    saturationBadge: 'High Demand',
    saturationText: 'Moderate (~280 similar repos)',
    whyBuildIt: 'AI developers constantly compare responses across Gemini, GPT-4, and Claude. A local sandbox comparing latency, cost, and output quality makes a standout portfolio piece.',
    coreFeatures: [
      'Parallel prompt execution across 3+ AI providers',
      'Tokens-per-second and cost calculation breakdown',
      'Diff viewer for prompt response iterations',
      'Exportable benchmark PDF reports'
    ],
    recommendedTechStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Vercel AI SDK', 'Supabase'],
    targetUser: 'AI Engineers, Prompt Designers, Product Managers',
    resumeImpactScore: 95,
    estimatedHours: 35
  },
  {
    id: 'idea-2',
    title: 'Personal Finance & Subscription Tracker with Bank Webhooks',
    domain: 'Fintech & Payments',
    difficulty: 'Intermediate',
    demandLevel: 'High',
    saturationBadge: 'Monetizable',
    saturationText: 'High (~4,200 similar repos)',
    whyBuildIt: 'Everyone manages recurring subscriptions. Adding automated renewal alert webhooks and categorised expense analytics elevates this above standard expense trackers.',
    coreFeatures: [
      'Plaid or banking API transaction sync',
      'Recurring subscription price hike detection',
      'Interactive cashflow burn rate projection charts',
      'CSV & PDF tax export engine'
    ],
    recommendedTechStack: ['React', 'Node.js/Express', 'PostgreSQL', 'Recharts', 'Plaid API'],
    targetUser: 'Students, Freelancers, Budgeters',
    resumeImpactScore: 88,
    estimatedHours: 40
  },
  {
    id: 'idea-3',
    title: 'Simple React To-Do / Task List App',
    domain: 'Productivity & Tools',
    difficulty: 'Beginner',
    demandLevel: 'Medium',
    saturationBadge: 'Frequently Made',
    saturationText: 'Extremely High (150,000+ similar repos)',
    whyBuildIt: 'Great first beginner project for learning React state and localStorage, but should be enhanced with unique features before placing on a final portfolio.',
    coreFeatures: [
      'Add, edit, delete tasks',
      'Filter completed vs pending items',
      'Local storage persistence'
    ],
    recommendedTechStack: ['React', 'CSS', 'JavaScript'],
    targetUser: 'Individual learner',
    resumeImpactScore: 45,
    estimatedHours: 10
  },
  {
    id: 'idea-4',
    title: 'Zero-Knowledge Document Verification Vault',
    domain: 'Cybersecurity',
    difficulty: 'Advanced',
    demandLevel: 'High',
    saturationBadge: 'Unique',
    saturationText: 'Very Low (~45 similar repos)',
    whyBuildIt: 'Demonstrates cutting-edge cryptographic concepts (ZK-SNARKs, SHA-256 client hashing) and sets your portfolio apart from job candidates.',
    coreFeatures: [
      'Client-side web crypto document hashing',
      'Zero-knowledge proof verification without uploading raw files',
      'Tamper-evident audit log with Web3 or cryptographic merkle tree'
    ],
    recommendedTechStack: ['Rust / WebAssembly', 'TypeScript', 'Circom', 'Tailwind CSS'],
    targetUser: 'Legal Tech, HR Teams, Security Researchers',
    resumeImpactScore: 99,
    estimatedHours: 60
  },
  {
    id: 'idea-5',
    title: 'Interactive Code Playground & Compiler Sandbox',
    domain: 'Developer Tools & Infra',
    difficulty: 'Advanced',
    demandLevel: 'High',
    saturationBadge: 'High Portfolio Value',
    saturationText: 'Low-Medium (~520 similar repos)',
    whyBuildIt: 'Building a code sandbox proves your understanding of isolated execution environments (Docker/Piston API), Monaco editor integration, and real-time output stream handling.',
    coreFeatures: [
      'Monaco Editor with IntelliSense & syntax highlighting',
      'Docker containerized multi-language runner (Python, JS, Go, Rust)',
      'Shareable code snippet links with short URLs'
    ],
    recommendedTechStack: ['React', 'Monaco Editor', 'Node.js', 'Docker', 'Redis'],
    targetUser: 'Educators, Technical Interviewers, Coding Students',
    resumeImpactScore: 96,
    estimatedHours: 50
  },
  {
    id: 'idea-6',
    title: 'AI Flashcard & Micro-Learning Study Suite',
    domain: 'EdTech & Learning',
    difficulty: 'Beginner-Friendly',
    demandLevel: 'High',
    saturationBadge: 'Beginner-Friendly',
    saturationText: 'High (~8,500 similar repos)',
    whyBuildIt: 'An accessible starting point that incorporates AI PDF parsing to automatically convert lecture notes into spaced-repetition flashcards.',
    coreFeatures: [
      'PDF / Markdown note upload',
      'AI auto-generated question & answer flashcards',
      'SuperMemo-2 spaced repetition review algorithm',
      'Streak counter & daily goal progress'
    ],
    recommendedTechStack: ['React', 'Tailwind CSS', 'Google Gemini API', 'IndexedDB'],
    targetUser: 'College Students, Certification Candidates',
    resumeImpactScore: 82,
    estimatedHours: 25
  }
];
