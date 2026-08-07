/**
 * Secure Anonymous Session Cookie Handler (Supabase Edge Function)
 * Generates cryptographically secure 256-bit random tokens, sets HttpOnly cookies,
 * and computes SHA-256 hashes for database identity matching.
 */

export interface AnonCookieResult {
  sessionHash: string;
  cookieHeader: string | null;
}

export async function getOrCreateAnonSessionHash(req: Request): Promise<AnonCookieResult> {
  const cookieHeader = req.headers.get('Cookie') || '';
  const match = cookieHeader.match(/gitscope_anon_session=([a-f0-9]{64})/);

  let rawToken: string;
  let isNew = false;

  if (match && match[1]) {
    rawToken = match[1];
  } else {
    // Generate 256-bit secure random token (64 hex chars)
    const buffer = new Uint8Array(32);
    crypto.getRandomValues(buffer);
    rawToken = Array.from(buffer).map(b => b.toString(16).padStart(2, '0')).join('');
    isNew = true;
  }

  // Compute SHA-256 Hash of raw token
  const encoder = new TextEncoder();
  const data = encoder.encode(rawToken);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const sessionHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

  let setCookieHeader: string | null = null;
  if (isNew) {
    setCookieHeader = `gitscope_anon_session=${rawToken}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=31536000`;
  }

  return {
    sessionHash,
    cookieHeader: setCookieHeader
  };
}
