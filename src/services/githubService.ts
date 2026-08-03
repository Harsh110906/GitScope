import { Project, ProfileEvaluation } from '../types';
import { evaluateProject, expandSearchIntent } from './aiIntelligence';

const GITHUB_API_BASE = 'https://api.github.com';

/**
 * Returns GitHub API headers, including optional Authorization token if set in environment variables
 */
function getApiHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
  };
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  if (token && token.trim()) {
    headers['Authorization'] = `Bearer ${token.trim()}`;
  }
  return headers;
}

/**
 * Parses GitHub URL (e.g. https://github.com/facebook/react) into owner & repo name
 */
export function parseGithubUrl(urlOrQuery: string): { owner: string; repo: string } | null {
  try {
    const trimmed = urlOrQuery.trim();
    if (trimmed.includes('github.com')) {
      const urlObj = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
      const parts = urlObj.pathname.split('/').filter(Boolean);
      if (parts.length >= 2) {
        return { owner: parts[0], repo: parts[1].replace('.git', '') };
      }
    }
  } catch (err) {
    // Not a valid URL
  }
  return null;
}

/**
 * Searches real GitHub API or fetches trending repos
 */
export async function searchGithubProjects(query: string, domainFilter = 'All Domains'): Promise<Project[]> {
  const parsedRepo = parseGithubUrl(query);
  
  if (parsedRepo) {
    const singleRepo = await fetchGithubRepoDetails(parsedRepo.owner, parsedRepo.repo);
    if (singleRepo) return [singleRepo];
  }

  try {
    let apiEndpoint = '';
    const trimmedQuery = query.trim();

    if (!trimmedQuery || trimmedQuery === 'All Domains') {
      // Default to top starred repositories if no query is provided
      apiEndpoint = `${GITHUB_API_BASE}/search/repositories?q=stars:>5000&sort=stars&order=desc&per_page=12`;
    } else {
      const intentKeywords = expandSearchIntent(trimmedQuery);
      const searchQuery = intentKeywords.slice(0, 3).join(' OR ');
      apiEndpoint = `${GITHUB_API_BASE}/search/repositories?q=${encodeURIComponent(searchQuery)}&sort=stars&order=desc&per_page=12`;
    }
    
    const response = await fetch(apiEndpoint, {
      headers: getApiHeaders()
    });

    if (response.ok) {
      const data = await response.json();
      if (data.items && data.items.length > 0) {
        const processedProjects: Project[] = data.items.map((item: any) => {
          return evaluateProject({
            id: `gh-${item.id}`,
            name: item.name,
            repoUrl: item.html_url,
            owner: {
              login: item.owner.login,
              avatarUrl: item.owner.avatar_url,
              type: item.owner.type
            },
            description: item.description || 'Public GitHub repository analyzed by GitScope.',
            primaryLanguage: item.language || 'TypeScript',
            stars: item.stargazers_count,
            forks: item.forks_count,
            openIssues: item.open_issues_count,
            updatedAt: item.updated_at,
            createdAt: item.created_at,
            topics: item.topics && item.topics.length > 0 
              ? item.topics 
              : [item.language?.toLowerCase() || 'github'],
          }, query);
        });

        if (domainFilter !== 'All Domains') {
          return processedProjects.filter(p => p.domain === domainFilter);
        }
        return processedProjects;
      }
    } else if (response.status === 403) {
      console.warn('GitHub API rate limit exceeded. Set VITE_GITHUB_TOKEN to increase rate limits.');
    }
  } catch (error) {
    console.error('Failed to search GitHub API:', error);
  }

  return [];
}

/**
 * Fetches single repository from GitHub REST API and runs AI evaluation
 */
export async function fetchGithubRepoDetails(owner: string, repo: string): Promise<Project | null> {
  try {
    const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
      headers: getApiHeaders()
    });
    if (response.ok) {
      const item = await response.json();
      return evaluateProject({
        id: `gh-${item.id}`,
        name: item.name,
        repoUrl: item.html_url,
        owner: {
          login: item.owner.login,
          avatarUrl: item.owner.avatar_url,
          type: item.owner.type
        },
        description: item.description || 'Public GitHub repository analyzed by GitScope.',
        primaryLanguage: item.language || 'TypeScript',
        stars: item.stargazers_count,
        forks: item.forks_count,
        openIssues: item.open_issues_count,
        updatedAt: item.updated_at,
        createdAt: item.created_at,
        topics: item.topics || [],
      }, item.name);
    }
  } catch (error) {
    console.error('Failed to fetch repository from GitHub API', error);
  }
  return null;
}

/**
 * Fetches real user profile data and user's public repositories from GitHub REST API
 */
export async function fetchGithubUserProfile(username: string): Promise<ProfileEvaluation | null> {
  if (!username || !username.trim()) return null;

  try {
    const headers = getApiHeaders();
    
    // Fetch User Info
    const userRes = await fetch(`${GITHUB_API_BASE}/users/${encodeURIComponent(username.trim())}`, { headers });
    if (!userRes.ok) {
      return null;
    }
    const user = await userRes.json();
    
    // Fetch User Repos (up to 100)
    let totalStars = 0;
    const languageCounts: Record<string, number> = {};

    const reposRes = await fetch(`${GITHUB_API_BASE}/users/${encodeURIComponent(username.trim())}/repos?per_page=100&sort=updated`, { headers });
    if (reposRes.ok) {
      const repos = await reposRes.json();
      if (Array.isArray(repos)) {
        repos.forEach((r: any) => {
          totalStars += (r.stargazers_count || 0);
          if (r.language) {
            languageCounts[r.language] = (languageCounts[r.language] || 0) + 1;
          }
        });
      }
    }

    // Process Languages Percentage
    const totalLangCount = Object.values(languageCounts).reduce((a, b) => a + b, 0);
    const topLanguages = Object.entries(languageCounts)
      .map(([name, count]) => ({
        name,
        percentage: totalLangCount > 0 ? Math.round((count / totalLangCount) * 100) : 0
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5);

    // Calculate Account Age
    const createdYear = new Date(user.created_at).getFullYear();
    const currentYear = new Date().getFullYear();
    const ageYears = Math.max(1, currentYear - createdYear);

    // Calculate Overall Score based on real metrics
    const repoScore = Math.min(40, user.public_repos * 1.2);
    const starScore = Math.min(35, totalStars * 0.8 + user.followers * 0.5);
    const ageScore = Math.min(15, ageYears * 3);
    const overallScore = Math.min(99, Math.max(45, Math.round(35 + repoScore + starScore + ageScore)));

    let devLevel: ProfileEvaluation['developerLevel'] = 'Intermediate Developer';
    if (overallScore >= 92) devLevel = 'Elite Thought Leader';
    else if (overallScore >= 84) devLevel = 'Senior Architect';
    else if (overallScore >= 75) devLevel = 'Advanced Engineer';
    else if (overallScore < 60) devLevel = 'Junior Builder';

    // Real key strengths & gaps based on data
    const keyStrengths: string[] = [
      `Active public GitHub profile with ${user.public_repos} public repositories`,
      `Accumulated ${totalStars.toLocaleString()} stars across public projects`,
      `Consistent developer history over ${ageYears} years on GitHub`
    ];

    const portfolioGaps: string[] = [];
    if (user.public_repos < 5) {
      portfolioGaps.push('Low total repository count — publish more projects to demonstrate domain breadth.');
    }
    if (topLanguages.length < 2) {
      portfolioGaps.push('Limited language diversity — consider exploring multi-language stacks (e.g. Go, Rust, TypeScript).');
    }
    if (totalStars < 10) {
      portfolioGaps.push('Low overall star signals — focus on high UX polish, documentation, and live demo links to drive engagement.');
    }
    if (portfolioGaps.length === 0) {
      portfolioGaps.push('Opportunity to build specialized AI tools or Zero-Knowledge security microservices to reach Top 1% rank.');
    }

    const recommendedActions: ProfileEvaluation['recommendedActions'] = [
      {
        title: 'Build a Specialized Developer Tool / CLI',
        description: `Ship a focused open-source CLI or GitHub Action in ${topLanguages[0]?.name || 'TypeScript'} with automated testing and documentation.`,
        priority: 'High',
        suggestedDomain: 'Developer Tools & Infra'
      },
      {
        title: 'Deploy an Interactive Full-Stack Project',
        description: 'Host a production web application with live demo badges and Web Vitals benchmarks on Vercel or Render.',
        priority: 'High',
        suggestedDomain: 'SaaS & Web Apps'
      }
    ];

    return {
      username: user.login,
      name: user.name || user.login,
      avatarUrl: user.avatar_url,
      bio: user.bio || 'GitHub Developer.',
      followers: user.followers,
      following: user.following,
      publicRepos: user.public_repos,
      totalStars,
      accountAgeYears: ageYears,
      
      starRating: Number((overallScore / 20).toFixed(1)),
      overallScore,
      developerLevel: devLevel,
      globalPercentile: Math.min(99, Math.round(overallScore * 0.95)),
      
      qualitySignals: {
        repoCompletenessScore: Math.min(98, overallScore + 4),
        techDiversityScore: Math.min(95, topLanguages.length * 20),
        contributionConsistencyScore: Math.min(99, overallScore + 6),
        documentationScore: Math.min(90, overallScore - 2),
        portfolioImpactScore: overallScore
      },
      
      topLanguages: topLanguages.length > 0 ? topLanguages : [{ name: 'TypeScript', percentage: 100 }],
      keyStrengths,
      portfolioGaps,
      recommendedActions
    };
  } catch (err) {
    console.error('Failed to fetch GitHub user profile:', err);
    return null;
  }
}
