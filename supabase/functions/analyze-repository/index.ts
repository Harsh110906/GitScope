import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.112.0';

import { getOrCreateAnonSessionHash, DAILY_ANALYSIS_LIMITS } from './_shared/cookie.ts';
import { claimRepositoryAnalysisRPC, refundQuotaRPC, updateAnalysisStageRPC } from './_shared/quota.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, cookie',
  'Access-Control-Allow-Credentials': 'true',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const workerId = `worker-edge-${crypto.randomUUID().substring(0, 8)}`;

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    // 1. Identity Resolution (Verified Supabase Auth JWT OR Anonymous Cookie)
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabaseClient.auth.getUser(token);
      if (user) {
        userId = user.id;
      }
    }

    const { sessionHash, cookieHeader } = await getOrCreateAnonSessionHash(req);
    const anonHash = userId ? null : sessionHash;

    const responseHeaders: Record<string, string> = {
      ...corsHeaders,
      'Content-Type': 'application/json'
    };
    if (cookieHeader) {
      responseHeaders['Set-Cookie'] = cookieHeader;
    }

    // 2. Parse Request Body
    const body = await req.json().catch(() => ({}));
    const repositoryUrl = body.repositoryUrl;
    const scanMode = body.scanMode || 'standard';
    const userProfile = body.userProfile;

    if (!repositoryUrl) {
      return new Response(
        JSON.stringify({ error: { code: 'INVALID_URL', message: 'Repository URL is required.' } }),
        { status: 400, headers: responseHeaders }
      );
    }

    // 3. Resolve GitHub Metadata & Commit SHA
    const urlParts = repositoryUrl.replace('https://github.com/', '').split('/').filter(Boolean);
    const owner = urlParts[0]?.toLowerCase();
    const repo = urlParts[1]?.replace('.git', '').toLowerCase();

    if (!owner || !repo) {
      return new Response(
        JSON.stringify({ error: { code: 'INVALID_URL', message: 'Invalid GitHub URL format.' } }),
        { status: 400, headers: responseHeaders }
      );
    }

    // Fetch commit SHA via GitHub API server-side
    const githubToken = Deno.env.get('GITHUB_TOKEN');
    const ghHeaders: Record<string, string> = { 'Accept': 'application/vnd.github.v3+json' };
    if (githubToken) ghHeaders['Authorization'] = `Bearer ${githubToken}`;

    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers: ghHeaders });
    if (!repoRes.ok) {
      return new Response(
        JSON.stringify({ error: { code: 'REPO_NOT_FOUND', message: `Repository ${owner}/${repo} not found on GitHub.` } }),
        { status: 404, headers: responseHeaders }
      );
    }

    const repoData = await repoRes.json();
    const defaultBranch = repoData.default_branch || 'main';
    const commitSha = repoData.pushed_at || new Date().toISOString();

    const dailyLimit = userId ? DAILY_ANALYSIS_LIMITS.authenticated : DAILY_ANALYSIS_LIMITS.anonymous;

    // 4. Claim Repository Analysis (Atomic Procedure with pg_advisory_xact_lock)
    const claim = await claimRepositoryAnalysisRPC(supabaseClient, {
      owner,
      repo,
      repoUrl: repoData.html_url,
      defaultBranch,
      commitSha,
      scanMode,
      analysisVersion: '1.0.0',
      userId,
      anonHash,
      dailyLimit,
      workerId
    });

    if (!claim.allowed) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'ANALYSIS_QUOTA_EXCEEDED',
            message: 'You have used your free analyses for today. Sign in to continue.',
            retryable: false,
            remaining: 0
          }
        }),
        { status: 429, headers: responseHeaders }
      );
    }

    // If CACHED or ACTIVE, return immediately
    if (claim.resultType === 'cached' || claim.resultType === 'active') {
      const { data: existing } = await supabaseClient
        .from('repository_analyses')
        .select('*')
        .eq('id', claim.analysisId)
        .single();

      return new Response(
        JSON.stringify({
          analysisId: claim.analysisId,
          status: existing?.status || 'completed',
          progress: existing?.progress || 100,
          currentStep: existing?.current_step || 'Report ready',
          isCached: claim.resultType === 'cached',
          quota: {
            allowed: true,
            remaining: claim.remaining,
            limit: claim.limitCount,
            usageDate: new Date().toISOString().split('T')[0]
          },
          report: existing?.report_json || null
        }),
        { status: claim.resultType === 'cached' ? 200 : 202, headers: responseHeaders }
      );
    }

    // 5. Claimed New Analysis Job -> Return HTTP 202 Accepted
    return new Response(
      JSON.stringify({
        analysisId: claim.analysisId,
        status: 'collecting',
        progress: 10,
        currentStep: 'Collecting repository metadata',
        quota: {
          allowed: true,
          remaining: claim.remaining,
          limit: claim.limitCount,
          usageDate: new Date().toISOString().split('T')[0]
        }
      }),
      { status: 202, headers: responseHeaders }
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: err.message || 'Server error' } }),
      { status: 500, headers: corsHeaders }
    );
  }
});
