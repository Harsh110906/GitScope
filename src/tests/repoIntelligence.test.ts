/**
 * Unit & Integration Test Suite for GitScope Repository Intelligence
 */

import { parseAndValidateGithubUrl } from '../services/githubUrlParser';
import { redactSecrets } from '../services/secretRedactionService';
import { computeDeterministicReport } from '../services/deterministicScoringEngine';

export function runRepositoryIntelligenceTests(): { passed: number; failed: number; log: string[] } {
  const log: string[] = [];
  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, testName: string) => {
    if (condition) {
      passed++;
      log.push(`[PASS] ${testName}`);
    } else {
      failed++;
      log.push(`[FAIL] ${testName}`);
    }
  };

  // ── 1. GitHub URL Parsing & SSRF Rejection Tests ──
  const validUrl1 = parseAndValidateGithubUrl('https://github.com/facebook/react');
  assert(Boolean(validUrl1.valid && validUrl1.parsed?.owner === 'facebook' && validUrl1.parsed?.repo === 'react'), 'Valid URL parsing (facebook/react)');

  const validUrl2 = parseAndValidateGithubUrl('github.com/expressjs/express.git');
  assert(Boolean(validUrl2.valid && validUrl2.parsed?.owner === 'expressjs' && validUrl2.parsed?.repo === 'express'), 'URL with .git extension stripped');

  const invalidSsrf = parseAndValidateGithubUrl('https://malicious-domain.com/evil/repo');
  assert(Boolean(!invalidSsrf.valid && invalidSsrf.error?.includes('GitHub.com')), 'SSRF rejection for non-github hostname');

  const invalidPath = parseAndValidateGithubUrl('https://github.com/just-owner');
  assert(Boolean(!invalidPath.valid), 'Rejection of URL lacking repository name');

  // ── 2. Secret Redaction Pipeline Tests ──
  const syntheticGhp = 'My token is ghp_1234567890abcdefghijklmnopqrstuvwxyz';
  const redactedGhp = redactSecrets(syntheticGhp);
  assert(redactedGhp.redactedText.includes('[REDACTED_SECRET: GitHub Token]') && redactedGhp.redactedCount === 1, 'High-confidence GitHub Token redaction');

  const syntheticGoogleKey = 'Key is AIzaSyA1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6';
  const redactedGoogleKey = redactSecrets(syntheticGoogleKey);
  assert(redactedGoogleKey.redactedText.includes('[REDACTED_SECRET: Google API Key]'), 'High-confidence Google API Key redaction');

  const cleanText = 'This is a clean README file with no credentials.';
  const redactedClean = redactSecrets(cleanText);
  assert(redactedClean.redactedCount === 0 && redactedClean.redactedText === cleanText, 'Clean text remains un-redacted');

  // ── 3. Deterministic 100-Point Scoring Engine Tests ──
  const mockReport = computeDeterministicReport({
    metadata: {
      name: 'test-repo',
      owner: 'test-owner',
      description: 'A test project',
      stars: 150,
      forks: 40,
      openIssues: 5,
      updatedAt: new Date().toISOString(),
      createdAt: '2023-01-01T00:00:00Z',
      primaryLanguage: 'TypeScript',
      license: 'MIT',
      topics: ['typescript', 'react'],
      isArchived: false,
      hasReadme: true,
      hasContributing: true,
      hasCodeOfConduct: true,
      hasSecurityPolicy: true
    },
    filePaths: ['README.md', 'LICENSE', 'src/App.tsx', 'tests/app.test.ts', '.github/workflows/ci.yml', 'package-lock.json'],
    readmeContent: '# Test Repo\n\n## Getting Started\n\nnpm install\n\n## Usage\n\nExample code',
    workflows: ['.github/workflows/ci.yml'],
    testFiles: ['tests/app.test.ts'],
    lockfiles: ['package-lock.json'],
    scannedFileCount: 6,
    totalScanBytes: 15000
  });

  assert(mockReport.overallScore > 70 && mockReport.overallScore <= 100, 'Deterministic score calculation in expected high range');
  assert(mockReport.categories.documentation.evidenceCoverage.percentage === 100, 'Evidence coverage calculation');
  assert(mockReport.categories.security.score > 0, 'Security score calculation with lockfile and policy');

  return { passed, failed, log };
}

// Self-execute in test mode
if (import.meta.env.DEV) {
  const result = runRepositoryIntelligenceTests();
  console.log(`[TEST SUITE] Passed: ${result.passed}, Failed: ${result.failed}`);
}
