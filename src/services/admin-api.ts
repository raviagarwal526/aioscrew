/**
 * API client for Payroll Admin endpoints
 */

const API_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:3001' : window.location.origin);

export interface ClaimSummary {
  claim_id: string;
  crew_member_id: string;
  crew_name: string;
  claim_type: string;
  description: string;
  amount_claimed: number;
  amount_approved: number;
  status: string;
  priority: string;
  submitted_at: string;
  resolution_time_hours: number | null;
  ai_confidence: number | null;
  ai_recommendation: string | null;
}

export interface ClaimsMetrics {
  total_pending: number;
  total_amount_pending: number;
  auto_approved_today: number;
  manual_review_count: number;
  avg_resolution_hours: number;
  auto_approval_rate: number;
}

export interface ClaimDetails {
  claim: ClaimSummary;
  agent_activities: any[];
  evidence: any[];
  admin_actions: any[];
  contract_references: string[];
}

export interface PendingPayment {
  claim_id: string;
  crew_member_id: string;
  crew_name: string;
  amount: number;
  approved_at: string;
  status: string;
}

export interface PaymentBatch {
  batch_id: string;
  batch_date: string;
  total_amount: number;
  total_claims: number;
  status: string;
  processed_by: string | null;
  processed_at: string | null;
  export_file_path: string | null;
  created_at: string;
}

/**
 * Get claims metrics
 */
export async function getClaimsMetrics(startDate?: string, endDate?: string): Promise<ClaimsMetrics> {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);

  const response = await fetch(`${API_URL}/api/admin/claims/metrics?${params}`);
  if (!response.ok) throw new Error('Failed to fetch metrics');
  return response.json();
}

/**
 * List claims with filters
 */
export async function listClaims(filters: {
  status?: string;
  priority?: string;
  claim_type?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}): Promise<ClaimSummary[]> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) params.append(key, String(value));
  });

  const response = await fetch(`${API_URL}/api/admin/claims/list?${params}`);
  if (!response.ok) throw new Error('Failed to list claims');
  return response.json();
}

/**
 * Get claim details
 */
export async function getClaimDetails(claimId: string): Promise<ClaimDetails> {
  const response = await fetch(`${API_URL}/api/admin/claims/${claimId}`);
  if (!response.ok) throw new Error('Failed to fetch claim details');
  return response.json();
}

/**
 * Perform admin action on claim
 */
export async function performClaimAction(
  claimId: string,
  action: {
    action_type: string;
    reason?: string;
    override_amount?: number;
    admin_id?: string;
  }
): Promise<void> {
  const response = await fetch(`${API_URL}/api/admin/claims/${claimId}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(action)
  });
  if (!response.ok) throw new Error('Failed to perform action');
}

/**
 * Get pending payments
 */
export async function getPendingPayments(): Promise<PendingPayment[]> {
  const response = await fetch(`${API_URL}/api/admin/payments/pending`);
  if (!response.ok) throw new Error('Failed to fetch pending payments');
  return response.json();
}

/**
 * Create payment batch
 */
export async function createPaymentBatch(claimIds: string[], adminId?: string): Promise<PaymentBatch> {
  const response = await fetch(`${API_URL}/api/admin/payments/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ claim_ids: claimIds, admin_id: adminId || 'ADMIN001' })
  });
  if (!response.ok) throw new Error('Failed to create payment batch');
  return response.json();
}

/**
 * List payment batches
 */
export async function listPaymentBatches(filters: {
  status?: string;
  start_date?: string;
  end_date?: string;
}): Promise<PaymentBatch[]> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) params.append(key, String(value));
  });

  const response = await fetch(`${API_URL}/api/admin/payments/batches?${params}`);
  if (!response.ok) throw new Error('Failed to list payment batches');
  return response.json();
}

/**
 * Get claims analytics
 */
export async function getClaimsAnalytics(
  startDate: string,
  endDate: string,
  groupBy: string = 'day'
): Promise<any[]> {
  const params = new URLSearchParams({
    start_date: startDate,
    end_date: endDate,
    group_by: groupBy
  });

  const response = await fetch(`${API_URL}/api/admin/reports/claims-analytics?${params}`);
  if (!response.ok) throw new Error('Failed to fetch claims analytics');
  return response.json();
}

/**
 * Get agent performance
 */
export async function getAgentPerformance(startDate?: string, endDate?: string): Promise<any[]> {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);

  const response = await fetch(`${API_URL}/api/admin/reports/agent-performance?${params}`);
  if (!response.ok) throw new Error('Failed to fetch agent performance');
  return response.json();
}

/**
 * Get financial impact
 */
export async function getFinancialImpact(startDate: string, endDate: string): Promise<any[]> {
  const params = new URLSearchParams({
    start_date: startDate,
    end_date: endDate
  });

  const response = await fetch(`${API_URL}/api/admin/reports/financial-impact?${params}`);
  if (!response.ok) throw new Error('Failed to fetch financial impact');
  return response.json();
}

/**
 * Get system config
 */
export async function getSystemConfig(): Promise<Record<string, any>> {
  const response = await fetch(`${API_URL}/api/admin/settings/config`);
  if (!response.ok) throw new Error('Failed to fetch system config');
  return response.json();
}

/**
 * Get audit log
 */
export async function getAuditLog(filters: {
  entity_type?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
}): Promise<any[]> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) params.append(key, String(value));
  });

  const response = await fetch(`${API_URL}/api/admin/settings/audit-log?${params}`);
  if (!response.ok) throw new Error('Failed to fetch audit log');
  return response.json();
}

// ============================================================================
// EXCESS PAYMENT ENDPOINTS
// ============================================================================

export interface ExcessPaymentFinding {
  finding_id: number;
  claim_id: string;
  payment_id: number | null;
  finding_type: 'duplicate' | 'overpayment' | 'contract_violation' | 'ineligible' | 'anomaly' | 'calculation_error';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  excess_amount: number;
  expected_amount: number;
  paid_amount: number;
  evidence: string[];
  contract_references: string[] | null;
  suggested_action: string;
  agent_confidence: number | null;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewed_by: string | null;
  reviewed_at: string | null;
  resolution_notes: string | null;
  created_at: string;
  claim_type: string | null;
  claim_amount: number | null;
  crew_name: string | null;
  batch_id: string | null;
  batch_date: string | null;
}

export interface ExcessPaymentMetrics {
  total_pending: number;
  total_excess_amount: number;
  by_severity: Array<{
    severity: string;
    count: number;
    total_excess: number;
  }>;
  by_type: Array<{
    finding_type: string;
    count: number;
    total_excess: number;
  }>;
  resolved_count: number;
  total_recovered: number;
}

/**
 * Scan for excess payments
 */
export async function scanExcessPayments(params: {
  claim_id?: string;
  payment_id?: string;
  batch_id?: string;
}): Promise<any> {
  const response = await fetch(`${API_URL}/api/admin/excess-payments/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to scan for excess payments');
  }
  return response.json();
}

/**
 * List excess payment findings
 */
export async function listExcessPaymentFindings(filters: {
  status?: string;
  severity?: string;
  finding_type?: string;
  claim_id?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}): Promise<ExcessPaymentFinding[]> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) params.append(key, String(value));
  });

  const response = await fetch(`${API_URL}/api/admin/excess-payments/findings?${params}`);
  if (!response.ok) throw new Error('Failed to fetch excess payment findings');
  return response.json();
}

/**
 * Get excess payment metrics
 */
export async function getExcessPaymentMetrics(startDate?: string, endDate?: string): Promise<ExcessPaymentMetrics> {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);

  const response = await fetch(`${API_URL}/api/admin/excess-payments/metrics?${params}`);
  if (!response.ok) throw new Error('Failed to fetch excess payment metrics');
  return response.json();
}

/**
 * Update excess payment finding status
 */
export async function updateExcessPaymentFinding(
  findingId: number,
  action: 'resolved' | 'dismissed' | 'reviewed',
  resolutionNotes?: string,
  adminId?: string
): Promise<void> {
  const response = await fetch(`${API_URL}/api/admin/excess-payments/findings/${findingId}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action,
      resolution_notes: resolutionNotes,
      admin_id: adminId || 'ADMIN001'
    })
  });
  if (!response.ok) throw new Error('Failed to update finding');
}

/**
 * Create batch review for excess payments
 */
export async function createBatchReview(
  findingIds: number[],
  reviewNotes?: string,
  adminId?: string
): Promise<{ review_id: number; total_findings: number; total_excess_amount: number }> {
  const response = await fetch(`${API_URL}/api/admin/excess-payments/batch-review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      finding_ids: findingIds,
      review_notes: reviewNotes,
      admin_id: adminId || 'ADMIN001'
    })
  });
  if (!response.ok) throw new Error('Failed to create batch review');
  return response.json();
}
