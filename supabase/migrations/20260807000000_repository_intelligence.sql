-- ==============================================================================
-- Migration: GitScope Repository Intelligence Database Schema & Hardened Procedures
-- File: supabase/migrations/20260807000000_repository_intelligence.sql
-- ==============================================================================

-- 1. Repository Analyses Storage Table
CREATE TABLE IF NOT EXISTS public.repository_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_session_hash TEXT,
  owner TEXT NOT NULL,
  repository_name TEXT NOT NULL,
  repository_url TEXT NOT NULL,
  default_branch TEXT,
  analyzed_commit_sha TEXT,
  scan_mode TEXT NOT NULL CHECK (scan_mode IN ('quick', 'standard', 'deep')),
  analysis_version TEXT NOT NULL DEFAULT '1.0.0',
  status TEXT NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'validating', 'collecting', 'extracting_evidence', 'scoring', 'generating_insights', 'completed', 'partial', 'failed', 'cancelled')),
  progress INT NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  current_step TEXT,
  overall_score INT CHECK (overall_score >= 0 AND overall_score <= 100),
  confidence TEXT CHECK (confidence IN ('low', 'medium', 'high')),
  quota_charged BOOLEAN NOT NULL DEFAULT FALSE,
  quota_refunded BOOLEAN NOT NULL DEFAULT FALSE,
  quota_refund_reason TEXT,
  worker_id TEXT,
  claimed_at TIMESTAMPTZ,
  heartbeat_at TIMESTAMPTZ,
  lease_expires_at TIMESTAMPTZ,
  attempt_count INT NOT NULL DEFAULT 0,
  last_error_code TEXT,
  report_json JSONB,
  error_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,

  -- Identity Constraint: Exactly one identity parameter
  CONSTRAINT repo_analyses_identity_check CHECK (
    (user_id IS NOT NULL AND anonymous_session_hash IS NULL)
    OR
    (user_id IS NULL AND anonymous_session_hash IS NOT NULL)
  )
);

-- Partial Unique Index for Completed/Partial Cache Lookup (Non-NULL Commit SHA)
CREATE UNIQUE INDEX IF NOT EXISTS repo_analyses_cache_idx 
ON public.repository_analyses (owner, repository_name, analyzed_commit_sha, scan_mode, analysis_version)
WHERE status IN ('completed', 'partial') AND analyzed_commit_sha IS NOT NULL;

-- Partial Unique Index for Active Scan Lock (Non-NULL Commit SHA)
CREATE UNIQUE INDEX IF NOT EXISTS repo_analyses_active_claim_idx 
ON public.repository_analyses (owner, repository_name, analyzed_commit_sha, scan_mode, analysis_version)
WHERE status IN ('validating', 'collecting', 'extracting_evidence', 'scoring', 'generating_insights') 
  AND analyzed_commit_sha IS NOT NULL;

-- 2. Daily Analysis Quota Table
CREATE TABLE IF NOT EXISTS public.analysis_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_session_hash TEXT,
  usage_date DATE NOT NULL DEFAULT ((NOW() AT TIME ZONE 'UTC')::DATE),
  analysis_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT analysis_usage_identity_check CHECK (
    (user_id IS NOT NULL AND anonymous_session_hash IS NULL)
    OR
    (user_id IS NULL AND anonymous_session_hash IS NOT NULL)
  ),
  CONSTRAINT analysis_usage_count_check CHECK (analysis_count >= 0)
);

-- Partial Unique Indexes for Quota
CREATE UNIQUE INDEX IF NOT EXISTS analysis_usage_user_daily_idx
ON public.analysis_usage (user_id, usage_date)
WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS analysis_usage_anonymous_daily_idx
ON public.analysis_usage (anonymous_session_hash, usage_date)
WHERE anonymous_session_hash IS NOT NULL;


-- ==============================================================================
-- Hardened SECURITY DEFINER Stored Procedures
-- ==============================================================================

-- 1. Atomic Quota Check & Increment Function
CREATE OR REPLACE FUNCTION public.check_and_increment_quota(
  p_user_id UUID,
  p_anon_hash TEXT,
  p_daily_limit INT
)
RETURNS TABLE (
  allowed BOOLEAN,
  remaining INT,
  limit_count INT,
  usage_date DATE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_utc_date DATE := ((NOW() AT TIME ZONE 'UTC')::DATE);
  v_current_count INT := 0;
BEGIN
  IF p_daily_limit IS NULL OR p_daily_limit <= 0 THEN
    RAISE EXCEPTION 'Invalid daily limit';
  END IF;

  IF (p_user_id IS NOT NULL AND p_anon_hash IS NOT NULL) OR (p_user_id IS NULL AND p_anon_hash IS NULL) THEN
    RAISE EXCEPTION 'Exactly one of p_user_id or p_anon_hash must be provided';
  END IF;

  limit_count := p_daily_limit;
  usage_date := v_utc_date;

  IF p_user_id IS NOT NULL THEN
    INSERT INTO public.analysis_usage (user_id, usage_date, analysis_count)
    VALUES (p_user_id, v_utc_date, 0)
    ON CONFLICT (user_id, usage_date) WHERE user_id IS NOT NULL DO NOTHING;

    SELECT analysis_count INTO v_current_count
    FROM public.analysis_usage
    WHERE user_id = p_user_id AND usage_date = v_utc_date
    FOR UPDATE;
  ELSE
    INSERT INTO public.analysis_usage (anonymous_session_hash, usage_date, analysis_count)
    VALUES (p_anon_hash, v_utc_date, 0)
    ON CONFLICT (anonymous_session_hash, usage_date) WHERE anonymous_session_hash IS NOT NULL DO NOTHING;

    SELECT analysis_count INTO v_current_count
    FROM public.analysis_usage
    WHERE anonymous_session_hash = p_anon_hash AND usage_date = v_utc_date
    FOR UPDATE;
  END IF;

  IF v_current_count < p_daily_limit THEN
    v_current_count := v_current_count + 1;

    IF p_user_id IS NOT NULL THEN
      UPDATE public.analysis_usage
      SET analysis_count = v_current_count, updated_at = NOW()
      WHERE user_id = p_user_id AND usage_date = v_utc_date;
    ELSE
      UPDATE public.analysis_usage
      SET analysis_count = v_current_count, updated_at = NOW()
      WHERE anonymous_session_hash = p_anon_hash AND usage_date = v_utc_date;
    END IF;

    allowed := TRUE;
    remaining := p_daily_limit - v_current_count;
  ELSE
    allowed := FALSE;
    remaining := 0;
  END IF;

  RETURN NEXT;
END;
$$;

-- 2. Fully Atomic Idempotent Quota Refund Function
CREATE OR REPLACE FUNCTION public.refund_quota(
  p_analysis_id UUID,
  p_reason TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id UUID;
  v_anon_hash TEXT;
  v_utc_date DATE := ((NOW() AT TIME ZONE 'UTC')::DATE);
BEGIN
  IF p_analysis_id IS NULL THEN
    RAISE EXCEPTION 'Analysis ID is required for refund';
  END IF;

  UPDATE public.repository_analyses
  SET
    quota_refunded = TRUE,
    quota_refund_reason = p_reason,
    updated_at = NOW()
  WHERE id = p_analysis_id
    AND quota_charged = TRUE
    AND quota_refunded = FALSE
  RETURNING user_id, anonymous_session_hash
  INTO v_user_id, v_anon_hash;

  IF FOUND THEN
    IF v_user_id IS NOT NULL THEN
      UPDATE public.analysis_usage
      SET analysis_count = GREATEST(0, analysis_count - 1), updated_at = NOW()
      WHERE user_id = v_user_id AND usage_date = v_utc_date;
    ELSIF v_anon_hash IS NOT NULL THEN
      UPDATE public.analysis_usage
      SET analysis_count = GREATEST(0, analysis_count - 1), updated_at = NOW()
      WHERE anonymous_session_hash = v_anon_hash AND usage_date = v_utc_date;
    END IF;
  END IF;
END;
$$;

-- 3. Atomic Repository Analysis Claim Procedure (With Advisory Transaction Lock & Parameter Normalization)
CREATE OR REPLACE FUNCTION public.claim_repository_analysis(
  p_owner TEXT,
  p_repository_name TEXT,
  p_repo_url TEXT,
  p_default_branch TEXT,
  p_commit_sha TEXT,
  p_scan_mode TEXT,
  p_analysis_version TEXT,
  p_user_id UUID,
  p_anon_hash TEXT,
  p_daily_limit INT,
  p_worker_id TEXT
)
RETURNS TABLE (
  result_type TEXT, -- 'cached' | 'active' | 'claimed' | 'quota_exceeded'
  out_analysis_id UUID,
  out_allowed BOOLEAN,
  out_remaining INT,
  out_limit_count INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_clean_owner TEXT;
  v_clean_repo TEXT;
  v_clean_sha TEXT;
  v_clean_mode TEXT;
  v_clean_version TEXT;
  v_existing_id UUID;
  v_quota_rec RECORD;
  v_used_count INT := 0;
  v_utc_date DATE := ((NOW() AT TIME ZONE 'UTC')::DATE);
BEGIN
  -- Identity Validation
  IF (p_user_id IS NOT NULL AND p_anon_hash IS NOT NULL) OR (p_user_id IS NULL AND p_anon_hash IS NULL) THEN
    RAISE EXCEPTION 'Exactly one of p_user_id or p_anon_hash must be provided';
  END IF;

  -- Worker & Cache Key Parameter Validation
  IF p_worker_id IS NULL OR length(trim(p_worker_id)) = 0 THEN
    RAISE EXCEPTION 'Invalid worker ID';
  END IF;

  IF p_commit_sha IS NULL OR length(trim(p_commit_sha)) = 0 THEN
    RAISE EXCEPTION 'Commit SHA is required';
  END IF;

  IF p_scan_mode IS NULL OR lower(trim(p_scan_mode)) NOT IN ('quick', 'standard', 'deep') THEN
    RAISE EXCEPTION 'Invalid scan mode';
  END IF;

  IF p_analysis_version IS NULL OR length(trim(p_analysis_version)) = 0 THEN
    RAISE EXCEPTION 'Analysis version is required';
  END IF;

  -- Parameter Normalization
  v_clean_owner := lower(trim(p_owner));
  v_clean_repo := lower(trim(p_repository_name));
  v_clean_sha := lower(trim(p_commit_sha));
  v_clean_mode := lower(trim(p_scan_mode));
  v_clean_version := lower(trim(p_analysis_version));

  -- Acquire Cache-Key Advisory Transaction Lock
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      v_clean_owner || ':' || v_clean_repo || ':' || v_clean_sha || ':' || v_clean_mode || ':' || v_clean_version,
      0
    )
  );

  -- Read current usage for quota display on cached/active branches
  IF p_user_id IS NOT NULL THEN
    SELECT analysis_count INTO v_used_count FROM public.analysis_usage WHERE user_id = p_user_id AND usage_date = v_utc_date;
  ELSE
    SELECT analysis_count INTO v_used_count FROM public.analysis_usage WHERE anonymous_session_hash = p_anon_hash AND usage_date = v_utc_date;
  END IF;
  v_used_count := COALESCE(v_used_count, 0);

  -- Check for Completed / Partial Cached Analysis
  SELECT id INTO v_existing_id
  FROM public.repository_analyses
  WHERE owner = v_clean_owner 
    AND repository_name = v_clean_repo 
    AND analyzed_commit_sha = v_clean_sha 
    AND scan_mode = v_clean_mode 
    AND analysis_version = v_clean_version
    AND status IN ('completed', 'partial')
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    result_type := 'cached';
    out_analysis_id := v_existing_id;
    out_allowed := TRUE;
    out_remaining := GREATEST(0, p_daily_limit - v_used_count);
    out_limit_count := p_daily_limit;
    RETURN NEXT;
    RETURN;
  END IF;

  -- Check for Active Running Analysis
  SELECT id INTO v_existing_id
  FROM public.repository_analyses
  WHERE owner = v_clean_owner 
    AND repository_name = v_clean_repo 
    AND analyzed_commit_sha = v_clean_sha 
    AND scan_mode = v_clean_mode 
    AND analysis_version = v_clean_version
    AND status IN ('validating', 'collecting', 'extracting_evidence', 'scoring', 'generating_insights')
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    result_type := 'active';
    out_analysis_id := v_existing_id;
    out_allowed := TRUE;
    out_remaining := GREATEST(0, p_daily_limit - v_used_count);
    out_limit_count := p_daily_limit;
    RETURN NEXT;
    RETURN;
  END IF;

  -- Atomic Quota Increment Check
  SELECT allowed, remaining, limit_count INTO v_quota_rec
  FROM public.check_and_increment_quota(p_user_id, p_anon_hash, p_daily_limit);

  IF v_quota_rec.allowed = FALSE THEN
    result_type := 'quota_exceeded';
    out_analysis_id := NULL;
    out_allowed := FALSE;
    out_remaining := 0;
    out_limit_count := p_daily_limit;
    RETURN NEXT;
    RETURN;
  END IF;

  -- Insert New Analysis Claim
  INSERT INTO public.repository_analyses (
    user_id, anonymous_session_hash, owner, repository_name, repository_url, default_branch,
    analyzed_commit_sha, scan_mode, analysis_version, status, progress, current_step,
    quota_charged, worker_id, claimed_at, heartbeat_at, lease_expires_at
  ) VALUES (
    p_user_id, p_anon_hash, v_clean_owner, v_clean_repo, p_repo_url, p_default_branch,
    v_clean_sha, v_clean_mode, v_clean_version, 'collecting', 10, 'Collecting repository metadata',
    TRUE, p_worker_id, NOW(), NOW(), NOW() + INTERVAL '30 seconds'
  )
  RETURNING id INTO out_analysis_id;

  result_type := 'claimed';
  out_allowed := TRUE;
  out_remaining := v_quota_rec.remaining;
  out_limit_count := v_quota_rec.limit_count;
  RETURN NEXT;
END;
$$;

-- 4. Lease-Guarded Stage Update Procedure
CREATE OR REPLACE FUNCTION public.update_analysis_stage(
  p_analysis_id UUID,
  p_worker_id TEXT,
  p_status TEXT,
  p_progress INT,
  p_current_step TEXT,
  p_report_json JSONB DEFAULT NULL,
  p_error_json JSONB DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_updated INT := 0;
BEGIN
  IF p_analysis_id IS NULL OR p_worker_id IS NULL THEN
    RETURN FALSE;
  END IF;

  UPDATE public.repository_analyses
  SET 
    status = p_status,
    progress = COALESCE(p_progress, progress),
    current_step = COALESCE(p_current_step, current_step),
    report_json = COALESCE(p_report_json, report_json),
    error_json = COALESCE(p_error_json, error_json),
    heartbeat_at = NOW(),
    updated_at = NOW(),
    completed_at = CASE WHEN p_status IN ('completed', 'partial', 'failed') THEN NOW() ELSE completed_at END
  WHERE id = p_analysis_id
    AND worker_id = p_worker_id
    AND lease_expires_at >= NOW()
    AND status IN ('validating', 'collecting', 'extracting_evidence', 'scoring', 'generating_insights');

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$;

-- 5. Worker Lease Renewal Procedure (With Lease Duration Validation)
CREATE OR REPLACE FUNCTION public.renew_analysis_lease(
  p_analysis_id UUID,
  p_worker_id TEXT,
  p_lease_seconds INT DEFAULT 30
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_updated INT := 0;
BEGIN
  IF p_lease_seconds IS NULL OR p_lease_seconds < 10 OR p_lease_seconds > 300 THEN
    RAISE EXCEPTION 'Lease duration must be between 10 and 300 seconds';
  END IF;

  UPDATE public.repository_analyses
  SET 
    heartbeat_at = NOW(),
    lease_expires_at = NOW() + (p_lease_seconds || ' seconds')::INTERVAL,
    updated_at = NOW()
  WHERE id = p_analysis_id
    AND worker_id = p_worker_id
    AND status IN ('validating', 'collecting', 'extracting_evidence', 'scoring', 'generating_insights')
    AND lease_expires_at >= NOW();

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$;

-- 6. Expired Analysis Recovery Procedure (With Lease Duration Validation)
CREATE OR REPLACE FUNCTION public.recover_expired_analysis(
  p_analysis_id UUID,
  p_new_worker_id TEXT,
  p_lease_seconds INT DEFAULT 30
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_updated INT := 0;
BEGIN
  IF p_lease_seconds IS NULL OR p_lease_seconds < 10 OR p_lease_seconds > 300 THEN
    RAISE EXCEPTION 'Lease duration must be between 10 and 300 seconds';
  END IF;

  UPDATE public.repository_analyses
  SET 
    worker_id = p_new_worker_id,
    claimed_at = NOW(),
    heartbeat_at = NOW(),
    lease_expires_at = NOW() + (p_lease_seconds || ' seconds')::INTERVAL,
    attempt_count = attempt_count + 1,
    updated_at = NOW()
  WHERE id = p_analysis_id
    AND (lease_expires_at < NOW() OR lease_expires_at IS NULL)
    AND status IN ('validating', 'collecting', 'extracting_evidence', 'scoring', 'generating_insights')
    AND attempt_count < 3;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$;


-- ==============================================================================
-- Row-Level Security (RLS) Policies & Function Permissions
-- ==============================================================================

ALTER TABLE public.repository_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own analyses"
  ON public.repository_analyses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "No direct client inserts on repository_analyses"
  ON public.repository_analyses FOR INSERT TO authenticated, anon
  WITH CHECK (false);

CREATE POLICY "No direct client updates on repository_analyses"
  ON public.repository_analyses FOR UPDATE TO authenticated, anon
  USING (false);

CREATE POLICY "No direct client inserts on analysis_usage"
  ON public.analysis_usage FOR INSERT TO authenticated, anon
  WITH CHECK (false);

-- Explicit Permissions with Exact Function Signatures
REVOKE EXECUTE ON FUNCTION public.check_and_increment_quota(UUID, TEXT, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_and_increment_quota(UUID, TEXT, INT) TO service_role;

REVOKE EXECUTE ON FUNCTION public.refund_quota(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.refund_quota(UUID, TEXT) TO service_role;

REVOKE EXECUTE ON FUNCTION public.claim_repository_analysis(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, TEXT, INT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_repository_analysis(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, TEXT, INT, TEXT) TO service_role;

REVOKE EXECUTE ON FUNCTION public.update_analysis_stage(UUID, TEXT, TEXT, INT, TEXT, JSONB, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_analysis_stage(UUID, TEXT, TEXT, INT, TEXT, JSONB, JSONB) TO service_role;

REVOKE EXECUTE ON FUNCTION public.renew_analysis_lease(UUID, TEXT, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.renew_analysis_lease(UUID, TEXT, INT) TO service_role;

REVOKE EXECUTE ON FUNCTION public.recover_expired_analysis(UUID, TEXT, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.recover_expired_analysis(UUID, TEXT, INT) TO service_role;
