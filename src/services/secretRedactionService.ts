/**
 * Secret Redaction Pipeline with High, Medium, and Low Confidence Classification
 */

export interface RedactionResult {
  redactedText: string;
  redactedCount: number;
  categoriesFound: string[];
}

export function redactSecrets(text: string): RedactionResult {
  if (!text) return { redactedText: '', redactedCount: 0, categoriesFound: [] };

  let result = text;
  let redactedCount = 0;
  const categories = new Set<string>();

  // 1. High Confidence Redactions (Known secret token formats)
  const highConfidencePatterns = [
    { name: 'GitHub Token', regex: /(ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9]{22}_[a-zA-Z0-9]{59})/g },
    { name: 'Google API Key', regex: /AIzaSy[a-zA-Z0-9_-]{33}/g },
    { name: 'AWS Key', regex: /(AKIA[0-9A-Z]{16}|aws_secret_access_key\s*=\s*['"][a-zA-Z0-9/+=]{40}['"])/g },
    { name: 'Private Key', regex: /-----BEGIN (RSA |EC |PGP |OPENSSH )?PRIVATE KEY-----[[\s\S]*?-----END \1PRIVATE KEY-----/g },
    { name: 'Database Connection String', regex: /(postgres|postgresql|mongodb|mongodb\+srv|mysql|redis):\/\/[a-zA-Z0-9_]+:[^@\s]+@[a-zA-Z0-9_.-]+:\d+\/[a-zA-Z0-9_.-]+/g }
  ];

  highConfidencePatterns.forEach(pattern => {
    result = result.replace(pattern.regex, () => {
      redactedCount++;
      categories.add(`${pattern.name} (High Confidence)`);
      return `[REDACTED_SECRET: ${pattern.name}]`;
    });
  });

  // 2. Medium Confidence Redactions (Keyword near assignment)
  const mediumConfidencePatterns = [
    { name: 'API Key Assignment', regex: /(api_key|apikey|secret_key|access_token|auth_token|client_secret)\s*[:=]\s*["']?([a-zA-Z0-9_.-]{16,})["']?/gi },
    { name: 'Bearer Token', regex: /Bearer\s+([a-zA-Z0-9_.-]{24,})/gi }
  ];

  mediumConfidencePatterns.forEach(pattern => {
    result = result.replace(pattern.regex, (match, key) => {
      redactedCount++;
      categories.add(`${pattern.name} (Medium Confidence)`);
      return `${key}: [REDACTED_SECRET: ${pattern.name}]`;
    });
  });

  // 3. Low Confidence Redactions (Long high-entropy strings inside config files)
  const lowConfidenceRegex = /"([^"]{40,})"/g;
  result = result.replace(lowConfidenceRegex, (match, val) => {
    // Only redact if string contains base64/hex signature
    if (/^[A-Za-z0-9+/=]{40,}$/.test(val) && !val.includes(' ') && !val.includes('/')) {
      redactedCount++;
      categories.add('High-Entropy String (Low Confidence)');
      return '"[REDACTED_SECRET: High-Entropy Value]"';
    }
    return match;
  });

  return {
    redactedText: result,
    redactedCount,
    categoriesFound: Array.from(categories)
  };
}
