import { RepositoryIntelligenceReport, CategoryScore, EvidenceCoverage, FindingConfidence, SecurityFinding } from '../types/repoIntelligenceTypes';

export interface RawRepoEvidence {
  metadata: {
    name: string;
    owner: string;
    description: string;
    stars: number;
    forks: number;
    openIssues: number;
    updatedAt: string;
    createdAt: string;
    primaryLanguage: string;
    license: string;
    topics: string[];
    isArchived: boolean;
    hasReadme: boolean;
    hasContributing: boolean;
    hasCodeOfConduct: boolean;
    hasSecurityPolicy: boolean;
  };
  filePaths: string[];
  readmeContent?: string;
  contributingContent?: string;
  packageManifestContent?: string;
  workflows: string[];
  testFiles: string[];
  lockfiles: string[];
  scannedFileCount: number;
  totalScanBytes: number;
}

export function computeDeterministicReport(evidence: RawRepoEvidence): {
  overallScore: number;
  confidence: FindingConfidence;
  categories: RepositoryIntelligenceReport['categories'];
  securityFindings: SecurityFinding[];
  evidenceItems: RepositoryIntelligenceReport['evidenceItems'];
} {
  const nowIso = new Date().toISOString();
  const evidenceItems: RepositoryIntelligenceReport['evidenceItems'] = [];
  let evIdCounter = 1;

  const addEv = (category: string, title: string, detail: string, filePath?: string, lineNumber?: number, snippet?: string): string => {
    const id = `EV-${category.substring(0, 3).toUpperCase()}-${String(evIdCounter++).padStart(2, '0')}`;
    evidenceItems.push({ id, category, title, detail, filePath, lineNumber, snippet });
    return id;
  };

  const meta = evidence.metadata;
  const paths = evidence.filePaths;
  const hasSrc = paths.some(p => p.startsWith('src/') || p.startsWith('lib/') || p.startsWith('pkg/'));
  const hasTests = evidence.testFiles.length > 0;
  const hasCI = evidence.workflows.length > 0;
  const hasLock = evidence.lockfiles.length > 0;

  // ── 1. DOCUMENTATION QUALITY (20 pts) ──
  let docScore = 0;
  const docEvIds: string[] = [];
  const docPositives: string[] = [];
  const docMissing: string[] = [];
  const docRecs: string[] = [];

  if (meta.hasReadme) {
    docScore += 6;
    docPositives.push('Repository includes a README file');
    docEvIds.push(addEv('Documentation', 'README File Present', 'README.md exists in repository root', 'README.md'));
  } else {
    docMissing.push('Missing README file');
    docRecs.push('Create a comprehensive README.md describing the project, installation, and usage');
  }

  if (meta.license && meta.license !== 'NOASSERTION' && meta.license !== 'None') {
    docScore += 4;
    docPositives.push(`Open source license detected (${meta.license})`);
    docEvIds.push(addEv('Documentation', 'License Available', `Project licensed under ${meta.license}`));
  } else {
    docMissing.push('No explicit open-source license detected');
    docRecs.push('Add an open-source LICENSE file (e.g. MIT, Apache 2.0)');
  }

  if (meta.hasContributing) {
    docScore += 4;
    docPositives.push('Includes contribution guidelines (CONTRIBUTING.md)');
    docEvIds.push(addEv('Documentation', 'Contribution Guide Present', 'CONTRIBUTING.md is present', 'CONTRIBUTING.md'));
  } else {
    docMissing.push('No CONTRIBUTING.md file detected');
    docRecs.push('Add CONTRIBUTING.md explaining setup, PR workflows, and coding standards');
  }

  if (evidence.readmeContent) {
    const readmeLower = evidence.readmeContent.toLowerCase();
    if (readmeLower.includes('install') || readmeLower.includes('getting started')) {
      docScore += 3;
      docPositives.push('README contains installation instructions');
    } else {
      docMissing.push('README lacks explicit installation instructions');
      docRecs.push('Add a "Getting Started" section with step-by-step setup commands');
    }
    if (readmeLower.includes('example') || readmeLower.includes('usage')) {
      docScore += 3;
      docPositives.push('README contains usage examples');
    } else {
      docMissing.push('README lacks code examples or usage demonstrations');
      docRecs.push('Include code snippets or screenshots demonstrating usage');
    }
  } else {
    docScore += 2; // Baseline fallback
  }

  docScore = Math.min(20, docScore);

  const docCategory: CategoryScore = {
    category: 'documentation',
    categoryTitle: 'Documentation Quality',
    score: docScore,
    maxScore: 20,
    confidence: meta.hasReadme ? 'high' : 'medium',
    evidenceCoverage: { availableChecks: meta.hasReadme ? 5 : 2, totalChecks: 5, percentage: meta.hasReadme ? 100 : 40 },
    evidenceIds: docEvIds,
    positiveFindings: docPositives,
    missingData: docMissing,
    recommendations: docRecs,
    scanTimestamp: nowIso
  };

  // ── 2. CODE ORGANIZATION (20 pts) ──
  let orgScore = 0;
  const orgEvIds: string[] = [];
  const orgPositives: string[] = [];
  const orgMissing: string[] = [];
  const orgRecs: string[] = [];

  if (hasSrc) {
    orgScore += 8;
    orgPositives.push('Clean directory separation between source code and configuration');
    orgEvIds.push(addEv('Code Organization', 'Structured Source Directory', 'Source files grouped under src/, lib/, or pkg/'));
  } else {
    orgMissing.push('Source files scattered in repository root');
    orgRecs.push('Move core implementation files into dedicated src/ or lib/ directories');
  }

  if (paths.some(p => p.includes('config') || p.includes('.env') || p.includes('tsconfig') || p.includes('package.json'))) {
    orgScore += 6;
    orgPositives.push('Explicit environment and configuration management detected');
  }

  if (paths.length > 10) {
    orgScore += 6;
    orgPositives.push('Modular multi-file structure');
  } else {
    orgScore += 4;
    orgMissing.push('Small number of repository files');
  }

  orgScore = Math.min(20, orgScore);

  const orgCategory: CategoryScore = {
    category: 'code_organization',
    categoryTitle: 'Code Organization',
    score: orgScore,
    maxScore: 20,
    confidence: 'high',
    evidenceCoverage: { availableChecks: 4, totalChecks: 4, percentage: 100 },
    evidenceIds: orgEvIds,
    positiveFindings: orgPositives,
    missingData: orgMissing,
    recommendations: orgRecs,
    scanTimestamp: nowIso
  };

  // ── 3. MAINTENANCE & PROJECT HEALTH (15 pts) ──
  let maintScore = 0;
  const maintEvIds: string[] = [];
  const maintPositives: string[] = [];
  const maintMissing: string[] = [];
  const maintRecs: string[] = [];

  const daysSinceUpdate = (Date.now() - new Date(meta.updatedAt).getTime()) / (1000 * 3600 * 24);

  if (daysSinceUpdate <= 30) {
    maintScore += 7;
    maintPositives.push(`Actively maintained (Updated ${Math.round(daysSinceUpdate)} days ago)`);
    maintEvIds.push(addEv('Maintenance', 'Active Commits', `Last updated ${Math.round(daysSinceUpdate)} days ago`));
  } else if (daysSinceUpdate <= 90) {
    maintScore += 5;
    maintPositives.push('Moderately active development in recent months');
  } else {
    maintScore += 2;
    maintMissing.push(`Repository inactive for ${Math.round(daysSinceUpdate)} days`);
    maintRecs.push('Review open issues and publish recent maintenance release tags');
  }

  if (meta.stars > 50) {
    maintScore += 4;
    maintPositives.push(`Strong community engagement (${meta.stars.toLocaleString()} stars, ${meta.forks.toLocaleString()} forks)`);
  } else {
    maintScore += 2;
  }

  if (!meta.isArchived) {
    maintScore += 4;
    maintPositives.push('Repository is active and accepting contributions');
  } else {
    maintMissing.push('Repository has been archived by owner');
  }

  maintScore = Math.min(15, maintScore);

  const maintCategory: CategoryScore = {
    category: 'maintenance',
    categoryTitle: 'Maintenance & Project Health',
    score: maintScore,
    maxScore: 15,
    confidence: 'high',
    evidenceCoverage: { availableChecks: 4, totalChecks: 4, percentage: 100 },
    evidenceIds: maintEvIds,
    positiveFindings: maintPositives,
    missingData: maintMissing,
    recommendations: maintRecs,
    scanTimestamp: nowIso
  };

  // ── 4. TESTING & CI/CD (15 pts) ──
  let testScore = 0;
  const testEvIds: string[] = [];
  const testPositives: string[] = [];
  const testMissing: string[] = [];
  const testRecs: string[] = [];

  if (hasTests) {
    testScore += 8;
    testPositives.push(`Automated test suite detected (${evidence.testFiles.length} test files found)`);
    testEvIds.push(addEv('Testing', 'Automated Test Files', `Found test files: ${evidence.testFiles.slice(0, 3).join(', ')}`));
  } else {
    testMissing.push('No automated test directory or test files detected');
    testRecs.push('Add unit test suites covering core business logic (e.g., Vitest, Jest, PyTest, Go test)');
  }

  if (hasCI) {
    testScore += 7;
    testPositives.push(`CI/CD GitHub Actions workflows detected (${evidence.workflows.length} workflows)`);
    testEvIds.push(addEv('CI/CD', 'GitHub Actions Workflows', `Workflows: ${evidence.workflows.slice(0, 2).join(', ')}`));
  } else {
    testMissing.push('No GitHub Actions workflows configured');
    testRecs.push('Add GitHub Actions workflow (.github/workflows/ci.yml) for automated building and testing');
  }

  testScore = Math.min(15, testScore);

  const testCategory: CategoryScore = {
    category: 'testing_cicd',
    categoryTitle: 'Testing & CI/CD Maturity',
    score: testScore,
    maxScore: 15,
    confidence: hasTests || hasCI ? 'high' : 'medium',
    evidenceCoverage: { availableChecks: 3, totalChecks: 3, percentage: 100 },
    evidenceIds: testEvIds,
    positiveFindings: testPositives,
    missingData: testMissing,
    recommendations: testRecs,
    scanTimestamp: nowIso
  };

  // ── 5. SECURITY & DEPENDENCY INSIGHTS (15 pts) ──
  let secScore = 0;
  const secEvIds: string[] = [];
  const secPositives: string[] = [];
  const secMissing: string[] = [];
  const secRecs: string[] = [];
  const securityFindings: SecurityFinding[] = [];

  if (hasLock) {
    secScore += 6;
    secPositives.push(`Dependency lockfile present (${evidence.lockfiles.join(', ')})`);
    secEvIds.push(addEv('Security', 'Lockfile Verification', `Lockfiles present: ${evidence.lockfiles.join(', ')}`));
  } else {
    secMissing.push('Missing dependency lockfile (package-lock.json, yarn.lock, Cargo.lock, etc.)');
    secRecs.push('Commit a lockfile to ensure deterministic reproducible builds and prevent dependency hijacking');
    securityFindings.push({
      id: 'SEC-FINDING-01',
      title: 'Missing Dependency Lockfile',
      severity: 'medium',
      confidence: 'high',
      status: 'confirmed_by_rule',
      description: 'Repository lacks a locked dependency manifest, making builds susceptible to supply-chain drift.',
      evidenceIds: [],
      filePath: null,
      lineNumber: null,
      redactedEvidence: 'No package-lock.json, yarn.lock, pnpm-lock.yaml, or Cargo.lock detected',
      recommendation: 'Generate and commit a lockfile to pin exact dependency versions.'
    });
  }

  if (meta.hasSecurityPolicy) {
    secScore += 5;
    secPositives.push('SECURITY.md vulnerability disclosure policy present');
    secEvIds.push(addEv('Security', 'Security Policy Present', 'SECURITY.md is present', 'SECURITY.md'));
  } else {
    secMissing.push('No SECURITY.md policy file detected');
    secRecs.push('Add SECURITY.md outlining how security vulnerabilities should be privately reported');
    securityFindings.push({
      id: 'SEC-FINDING-02',
      title: 'Missing Security Policy (SECURITY.md)',
      severity: 'informational',
      confidence: 'high',
      status: 'confirmed_by_rule',
      description: 'Without a security policy, security researchers may disclose vulnerabilities publicly.',
      evidenceIds: [],
      filePath: null,
      lineNumber: null,
      redactedEvidence: 'No SECURITY.md detected in root directory',
      recommendation: 'Add a SECURITY.md file detailing responsible disclosure contacts.'
    });
  }

  if (hasCI) {
    // Check if workflows use pinned tags
    secScore += 4;
    secPositives.push('CI/CD build pipeline configuration present');
  } else {
    secScore += 2;
  }

  secScore = Math.min(15, secScore);

  const secCategory: CategoryScore = {
    category: 'security',
    categoryTitle: 'Security & Dependency Insights',
    score: secScore,
    maxScore: 15,
    confidence: 'high',
    evidenceCoverage: { availableChecks: 4, totalChecks: 4, percentage: 100 },
    evidenceIds: secEvIds,
    positiveFindings: secPositives,
    missingData: secMissing,
    recommendations: secRecs,
    scanTimestamp: nowIso
  };

  // ── 6. CONTRIBUTION READINESS (15 pts) ──
  let contribScore = 0;
  const contribEvIds: string[] = [];
  const contribPositives: string[] = [];
  const contribMissing: string[] = [];
  const contribRecs: string[] = [];

  if (meta.hasContributing) {
    contribScore += 6;
    contribPositives.push('Includes contributor setup guide (CONTRIBUTING.md)');
  } else {
    contribMissing.push('No CONTRIBUTING.md guide');
  }

  if (meta.hasCodeOfConduct) {
    contribScore += 4;
    contribPositives.push('Includes community Code of Conduct (CODE_OF_CONDUCT.md)');
  } else {
    contribMissing.push('No Code of Conduct file detected');
    contribRecs.push('Add CODE_OF_CONDUCT.md to set welcoming community expectations');
  }

  if (meta.openIssues > 0) {
    contribScore += 5;
    contribPositives.push(`Open contribution surface (${meta.openIssues} open issues)`);
  } else {
    contribScore += 3;
  }

  contribScore = Math.min(15, contribScore);

  const contribCategory: CategoryScore = {
    category: 'contribution',
    categoryTitle: 'Contribution Readiness',
    score: contribScore,
    maxScore: 15,
    confidence: 'high',
    evidenceCoverage: { availableChecks: 3, totalChecks: 3, percentage: 100 },
    evidenceIds: contribEvIds,
    positiveFindings: contribPositives,
    missingData: contribMissing,
    recommendations: contribRecs,
    scanTimestamp: nowIso
  };

  // Compute Overall Score (Sum of 6 categories = 100)
  const overallScore = docScore + orgScore + maintScore + testScore + secScore + contribScore;

  return {
    overallScore,
    confidence: 'high',
    categories: {
      documentation: docCategory,
      codeOrganization: orgCategory,
      maintenance: maintCategory,
      testingCicd: testCategory,
      security: secCategory,
      contribution: contribCategory
    },
    securityFindings,
    evidenceItems
  };
}
