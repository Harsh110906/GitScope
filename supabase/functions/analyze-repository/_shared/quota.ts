/**
 * Atomic Quota Intermediary for Supabase Edge Functions
 * Interacts with public.check_and_increment_quota and public.refund_quota PL/pgSQL procedures.
 */

export const DAILY_ANALYSIS_LIMITS = {
  anonymous: 3,
  authenticated: 10
} as const;

export async function claimRepositoryAnalysisRPC(
  supabaseClient: any,
  params: {
    owner: string;
    repo: string;
    repoUrl: string;
    defaultBranch: string;
    commitSha: string;
    scanMode: string;
    analysisVersion: string;
    userId: string | null;
    anonHash: string | null;
    dailyLimit: number;
    workerId: string;
  }
) {
  const { data, error } = await supabaseClient.rpc('claim_repository_analysis', {
    p_owner: params.owner,
    p_repository_name: params.repo,
    p_repo_url: params.repoUrl,
    p_default_branch: params.defaultBranch,
    p_commit_sha: params.commitSha,
    p_scan_mode: params.scanMode,
    p_analysis_version: params.analysisVersion,
    p_user_id: params.userId,
    p_anon_hash: params.anonHash,
    p_daily_limit: params.dailyLimit,
    p_worker_id: params.workerId
  });

  if (error) {
    throw new Error(`Database claim RPC failed: ${error.message}`);
  }

  const rec = Array.isArray(data) ? data[0] : data;
  return {
    resultType: rec.result_type as 'cached' | 'active' | 'claimed' | 'quota_exceeded',
    analysisId: rec.out_analysis_id as string | null,
    allowed: rec.out_allowed as boolean,
    remaining: rec.out_remaining as number,
    limitCount: rec.out_limit_count as number
  };
}

export async function refundQuotaRPC(
  supabaseClient: any,
  analysisId: string,
  reason: string
) {
  await supabaseClient.rpc('refund_quota', {
    p_analysis_id: analysisId,
    p_reason: reason
  });
}

export async function updateAnalysisStageRPC(
  supabaseClient: any,
  params: {
    analysisId: string;
    workerId: string;
    status: string;
    progress: number;
    currentStep: string;
    reportJson?: any;
    errorJson?: any;
  }
) {
  const { data } = await supabaseClient.rpc('update_analysis_stage', {
    p_analysis_id: params.analysisId,
    p_worker_id: params.workerId,
    p_status: params.status,
    p_progress: params.progress,
    p_current_step: params.currentStep,
    p_report_json: params.reportJson || null,
    p_error_json: params.errorJson || null
  });

  return Boolean(data);
}
