/**
 * Strict GitHub URL Parser & SSRF Validator
 */

export interface ParsedGithubRepo {
  owner: string;
  repo: string;
  canonicalUrl: string;
}

export function parseAndValidateGithubUrl(urlOrQuery: string): { valid: boolean; parsed?: ParsedGithubRepo; error?: string } {
  if (!urlOrQuery || !urlOrQuery.trim()) {
    return { valid: false, error: 'Please enter a GitHub repository URL.' };
  }

  const trimmed = urlOrQuery.trim();
  let urlObj: URL;

  try {
    const formatted = trimmed.startsWith('http://') || trimmed.startsWith('https://') 
      ? trimmed 
      : `https://${trimmed}`;
    urlObj = new URL(formatted);
  } catch (e) {
    return { valid: false, error: 'Invalid URL format. Example: https://github.com/facebook/react' };
  }

  // SSRF Check: Allow strictly approved GitHub hostnames
  const allowedHostnames = ['github.com', 'www.github.com'];
  if (!allowedHostnames.includes(urlObj.hostname.toLowerCase())) {
    return { valid: false, error: 'Only public GitHub.com repository URLs are supported.' };
  }

  // Path check: must have /owner/repo
  const parts = urlObj.pathname.split('/').filter(Boolean);
  if (parts.length < 2) {
    return { valid: false, error: 'URL must include both repository owner and repository name (e.g. facebook/react).' };
  }

  const owner = parts[0].toLowerCase().trim();
  const repo = parts[1].replace('.git', '').toLowerCase().trim();

  // Validate owner and repo against valid GitHub naming rules
  const nameRegex = /^[a-z0-9_.-]+$/;
  if (!nameRegex.test(owner) || !nameRegex.test(repo)) {
    return { valid: false, error: 'Invalid character detected in repository owner or name.' };
  }

  return {
    valid: true,
    parsed: {
      owner,
      repo,
      canonicalUrl: `https://github.com/${owner}/${repo}`
    }
  };
}
