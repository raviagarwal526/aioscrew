/**
 * Admin API routes for Payroll Admin interface
 */

import { Router, Request, Response } from 'express';
import { neon } from '@neondatabase/serverless';

const router = Router();
const sql = neon(process.env.DATABASE_URL!);

// ============================================================================
// CLAIMS REVIEW ENDPOINTS
// ============================================================================

/**
 * GET /api/admin/claims/metrics
 * Get summary metrics for claims dashboard
 */
router.get('/claims/metrics', async (req: Request, res: Response) => {
  try {
    const { start_date, end_date } = req.query;

    let dateFilter = '';
    const params: any[] = [];
    
    if (start_date && end_date) {
      dateFilter = 'WHERE claim_date >= $1 AND claim_date <= $2';
      params.push(start_date, end_date);
    }

    // Total pending
    const pendingResult = await sql`
      SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total_amount
      FROM pay_claims
      WHERE COALESCE(status, 'pending') IN ('pending', 'needs-review', 'manual_review')
      ${start_date && end_date ? sql`AND claim_date >= ${start_date} AND claim_date <= ${end_date}` : sql``}
    `;

    // Auto-approved today
    const today = new Date().toISOString().split('T')[0];
    const autoApprovedResult = await sql`
      SELECT COUNT(*) as count
      FROM pay_claims
      WHERE (status = 'auto_approved' OR status = 'ai-validated')
      AND DATE(claim_date) = ${today}
    `;

    // Manual review count
    const manualReviewResult = await sql`
      SELECT COUNT(*) as count
      FROM pay_claims
      WHERE status IN ('manual_review', 'needs-review')
    `;

    // Average resolution time
    const avgResolutionResult = await sql`
      SELECT AVG(resolution_time_hours) as avg_hours
      FROM pay_claims
      WHERE resolution_time_hours IS NOT NULL
      ${start_date && end_date ? sql`AND claim_date >= ${start_date} AND claim_date <= ${end_date}` : sql``}
    `;

    // Auto-approval rate
    const approvalRateResult = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status IN ('auto_approved', 'ai-validated') THEN 1 END) as auto_approved
      FROM pay_claims
      WHERE status IS NOT NULL
      ${start_date && end_date ? sql`AND claim_date >= ${start_date} AND claim_date <= ${end_date}` : sql``}
    `;

    const total = Number(approvalRateResult[0]?.total || 0);
    const autoApproved = Number(approvalRateResult[0]?.auto_approved || 0);
    const autoApprovalRate = total > 0 ? autoApproved / total : 0;

    res.json({
      total_pending: Number(pendingResult[0]?.count || 0),
      total_amount_pending: Number(pendingResult[0]?.total_amount || 0),
      auto_approved_today: Number(autoApprovedResult[0]?.count || 0),
      manual_review_count: Number(manualReviewResult[0]?.count || 0),
      avg_resolution_hours: Number(avgResolutionResult[0]?.avg_hours || 0),
      auto_approval_rate: autoApprovalRate
    });
  } catch (error) {
    console.error('Error fetching claims metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

/**
 * GET /api/admin/claims/list
 * List claims with filters and pagination
 */
router.get('/claims/list', async (req: Request, res: Response) => {
  try {
    const {
      status,
      priority,
      claim_type,
      start_date,
      end_date,
      limit = '50',
      offset = '0'
    } = req.query;

    const limitNum = parseInt(limit as string, 10);
    const offsetNum = parseInt(offset as string, 10);

    // Build base query - Neon doesn't support dynamic WHERE clauses easily, so we'll filter in memory if needed
    // For now, fetch all and filter client-side (not ideal but works)
    const allClaims = await sql`
      SELECT 
        pc.id as claim_id,
        pc.crew_id as crew_member_id,
        cm.name as crew_name,
        pc.claim_type,
        pc.notes as description,
        pc.amount as amount_claimed,
        COALESCE(pc.amount_approved, pc.amount) as amount_approved,
        COALESCE(pc.status, 'pending') as status,
        COALESCE(pc.priority, 'normal') as priority,
        pc.claim_date as submitted_at,
        pc.resolution_time_hours,
        pc.ai_confidence,
        pc.ai_recommendation
      FROM pay_claims pc
      LEFT JOIN crew_members cm ON pc.crew_id = cm.id
      ORDER BY pc.claim_date DESC
      LIMIT ${limitNum + 100} OFFSET ${offsetNum}
    `;

    // Filter in memory
    let claims = allClaims;
    if (status) {
      claims = claims.filter((c: any) => (c.status || 'pending') === status);
    }
    if (priority) {
      claims = claims.filter((c: any) => (c.priority || 'normal') === priority);
    }
    if (claim_type) {
      claims = claims.filter((c: any) => c.claim_type === claim_type);
    }
    if (start_date) {
      const start = new Date(start_date as string);
      claims = claims.filter((c: any) => new Date(c.submitted_at) >= start);
    }
    if (end_date) {
      const end = new Date(end_date as string);
      claims = claims.filter((c: any) => new Date(c.submitted_at) <= end);
    }

    // Apply limit after filtering
    claims = claims.slice(0, limitNum);

    res.json(claims.map((row: any) => ({
      claim_id: row.claim_id,
      crew_member_id: row.crew_member_id,
      crew_name: row.crew_name || 'Unknown',
      claim_type: row.claim_type,
      description: row.description || '',
      amount_claimed: Number(row.amount_claimed || 0),
      amount_approved: Number(row.amount_approved || 0),
      status: row.status,
      priority: row.priority,
      submitted_at: row.submitted_at,
      resolution_time_hours: row.resolution_time_hours ? Number(row.resolution_time_hours) : null,
      ai_confidence: row.ai_confidence ? Number(row.ai_confidence) : null,
      ai_recommendation: row.ai_recommendation
    })));
  } catch (error) {
    console.error('Error listing claims:', error);
    res.status(500).json({ error: 'Failed to list claims' });
  }
});

/**
 * GET /api/admin/claims/:claimId
 * Get detailed information about a specific claim
 */
router.get('/claims/:claimId', async (req: Request, res: Response) => {
  try {
    const { claimId } = req.params;

    // Get claim details
    const claimResult = await sql`
      SELECT 
        pc.*,
        cm.name as crew_name
      FROM pay_claims pc
      LEFT JOIN crew_members cm ON pc.crew_id = cm.id
      WHERE pc.id = ${claimId}
    `;

    if (claimResult.length === 0) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    const claim = claimResult[0];

    // Get agent activities
    const activities = await sql`
      SELECT *
      FROM agent_activity_log
      WHERE claim_id = ${claimId}
      ORDER BY created_at ASC
    `;

    // Get evidence
    const evidence = await sql`
      SELECT *
      FROM claim_evidence
      WHERE claim_id = ${claimId}
      ORDER BY created_at ASC
    `;

    // Get admin actions
    const adminActions = await sql`
      SELECT *
      FROM admin_actions
      WHERE claim_id = ${claimId}
      ORDER BY created_at ASC
    `;

    res.json({
      claim: {
        claim_id: claim.id,
        crew_member_id: claim.crew_id,
        crew_name: claim.crew_name || 'Unknown',
        claim_type: claim.claim_type,
        description: claim.notes || '',
        amount_claimed: Number(claim.amount || 0),
        amount_approved: Number(claim.amount_approved || claim.amount || 0),
        status: claim.status || 'pending',
        priority: claim.priority || 'normal',
        submitted_at: claim.claim_date,
        resolution_time_hours: claim.resolution_time_hours ? Number(claim.resolution_time_hours) : null,
        ai_confidence: claim.ai_confidence ? Number(claim.ai_confidence) : null,
        ai_recommendation: claim.ai_recommendation,
        ai_reasoning: claim.ai_reasoning,
        contract_references: claim.contract_references || []
      },
      agent_activities: activities.map((a: any) => ({
        activity_id: a.activity_id,
        agent_name: a.agent_name,
        activity_type: a.activity_type,
        processing_time_ms: a.processing_time_ms,
        input_data: a.input_data,
        output_data: a.output_data,
        confidence_score: a.confidence_score ? Number(a.confidence_score) : null,
        error_message: a.error_message,
        created_at: a.created_at
      })),
      evidence: evidence.map((e: any) => ({
        evidence_id: e.evidence_id,
        evidence_type: e.evidence_type,
        source: e.source,
        data: e.data,
        verified: e.verified,
        created_at: e.created_at
      })),
      admin_actions: adminActions.map((a: any) => ({
        action_id: a.action_id,
        action_type: a.action_type,
        reason: a.reason,
        override_amount: a.override_amount ? Number(a.override_amount) : null,
        created_at: a.created_at
      })),
      contract_references: claim.contract_references || []
    });
  } catch (error) {
    console.error('Error fetching claim details:', error);
    res.status(500).json({ error: 'Failed to fetch claim details' });
  }
});

/**
 * POST /api/admin/claims/:claimId/action
 * Approve, reject, or take other action on a claim
 */
router.post('/claims/:claimId/action', async (req: Request, res: Response) => {
  try {
    const { claimId } = req.params;
    const { action_type, reason, override_amount, admin_id = 'ADMIN001' } = req.body;

    if (!action_type) {
      return res.status(400).json({ error: 'action_type is required' });
    }

    // Record admin action
    await sql`
      INSERT INTO admin_actions (claim_id, admin_id, action_type, reason, override_amount)
      VALUES (${claimId}, ${admin_id}, ${action_type}, ${reason || null}, ${override_amount || null})
    `;

    // Update claim status
    let newStatus = 'pending';
    let amountApproved = null;

    if (action_type === 'approved') {
      newStatus = 'approved';
      amountApproved = override_amount || null;
    } else if (action_type === 'rejected') {
      newStatus = 'rejected';
    } else if (action_type === 'override') {
      newStatus = 'approved';
      amountApproved = override_amount;
    }

    if (amountApproved !== null) {
      await sql`
        UPDATE pay_claims
        SET 
          status = ${newStatus},
          amount_approved = ${amountApproved},
          reviewed_at = NOW(),
          reviewed_by = ${admin_id}
        WHERE id = ${claimId}
      `;
    } else {
      await sql`
        UPDATE pay_claims
        SET 
          status = ${newStatus},
          reviewed_at = NOW(),
          reviewed_by = ${admin_id}
        WHERE id = ${claimId}
      `;
    }

    // Log to audit trail
    await sql`
      INSERT INTO audit_log (entity_type, entity_id, action, performed_by, changes)
      VALUES ('claim', ${claimId}, ${action_type}, ${admin_id}, ${JSON.stringify({ reason, override_amount })}::jsonb)
    `;

    res.json({ success: true, message: `Claim ${action_type} successfully` });
  } catch (error) {
    console.error('Error performing claim action:', error);
    res.status(500).json({ error: 'Failed to perform action' });
  }
});

// ============================================================================
// PAYMENTS ENDPOINTS
// ============================================================================

/**
 * GET /api/admin/payments/pending
 * Get all approved claims ready for payment
 */
router.get('/payments/pending', async (req: Request, res: Response) => {
  try {
    const pending = await sql`
      SELECT 
        pc.id as claim_id,
        pc.crew_id as crew_member_id,
        cm.name as crew_name,
        COALESCE(pc.amount_approved, pc.amount) as amount,
        pc.reviewed_at as approved_at,
        'ready' as status
      FROM pay_claims pc
      LEFT JOIN crew_members cm ON pc.crew_id = cm.id
      WHERE pc.status IN ('approved', 'auto_approved', 'ai-validated')
      AND NOT EXISTS (
        SELECT 1 FROM payment_items pi WHERE pi.claim_id = pc.id
      )
      ORDER BY pc.reviewed_at DESC
    `;

    res.json(pending.map((p: any) => ({
      claim_id: p.claim_id,
      crew_member_id: p.crew_member_id,
      crew_name: p.crew_name || 'Unknown',
      amount: Number(p.amount || 0),
      approved_at: p.approved_at,
      status: p.status
    })));
  } catch (error) {
    console.error('Error fetching pending payments:', error);
    res.status(500).json({ error: 'Failed to fetch pending payments' });
  }
});

/**
 * POST /api/admin/payments/batch
 * Create a payment batch from selected claims
 */
router.post('/payments/batch', async (req: Request, res: Response) => {
  try {
    const { claim_ids, admin_id = 'ADMIN001' } = req.body;

    if (!claim_ids || !Array.isArray(claim_ids) || claim_ids.length === 0) {
      return res.status(400).json({ error: 'claim_ids array is required' });
    }

    // Calculate total amount
    const claimsResult = await sql`
      SELECT 
        id,
        crew_id,
        COALESCE(amount_approved, amount) as amount
      FROM pay_claims
      WHERE id = ANY(${claim_ids})
      AND status IN ('approved', 'auto_approved', 'ai-validated')
    `;

    if (claimsResult.length === 0) {
      return res.status(400).json({ error: 'No valid claims found' });
    }

    const totalAmount = claimsResult.reduce((sum: number, c: any) => sum + Number(c.amount || 0), 0);

    // Generate batch ID
    const batchId = `BATCH-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    // Create batch
    await sql`
      INSERT INTO payment_batches (batch_id, batch_date, total_amount, total_claims, status, processed_by)
      VALUES (${batchId}, CURRENT_DATE, ${totalAmount}, ${claimsResult.length}, 'pending', ${admin_id})
    `;

    // Create payment items
    for (const claim of claimsResult) {
      await sql`
        INSERT INTO payment_items (batch_id, claim_id, crew_member_id, amount, status)
        VALUES (${batchId}, ${claim.id}, ${claim.crew_id}, ${claim.amount}, 'pending')
      `;
    }

    res.json({
      batch_id: batchId,
      total_amount: totalAmount,
      total_claims: claimsResult.length,
      status: 'pending'
    });
  } catch (error) {
    console.error('Error creating payment batch:', error);
    res.status(500).json({ error: 'Failed to create payment batch' });
  }
});

/**
 * GET /api/admin/payments/batches
 * List payment batches with filters
 */
router.get('/payments/batches', async (req: Request, res: Response) => {
  try {
    const { status, start_date, end_date } = req.query;

    let whereConditions: string[] = [];
    const params: any[] = [];

    if (status) {
      whereConditions.push(`status = $${params.length + 1}`);
      params.push(status);
    }

    if (start_date) {
      whereConditions.push(`batch_date >= $${params.length + 1}`);
      params.push(start_date);
    }

    if (end_date) {
      whereConditions.push(`batch_date <= $${params.length + 1}`);
      params.push(end_date);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    const batches = await sql`
      SELECT *
      FROM payment_batches
      ${whereConditions.length > 0 ? sql`WHERE ${sql.raw(whereConditions.map((_, i) => `$${i + 1}`).join(' AND '))}` : sql``}
      ORDER BY batch_date DESC, created_at DESC
    `;

    res.json(batches.map((b: any) => ({
      batch_id: b.batch_id,
      batch_date: b.batch_date,
      total_amount: Number(b.total_amount || 0),
      total_claims: Number(b.total_claims || 0),
      status: b.status,
      processed_by: b.processed_by,
      processed_at: b.processed_at,
      export_file_path: b.export_file_path,
      created_at: b.created_at
    })));
  } catch (error) {
    console.error('Error listing payment batches:', error);
    res.status(500).json({ error: 'Failed to list payment batches' });
  }
});

// ============================================================================
// REPORTS ENDPOINTS
// ============================================================================

/**
 * GET /api/admin/reports/claims-analytics
 * Get claims analytics with time-series data
 */
router.get('/reports/claims-analytics', async (req: Request, res: Response) => {
  try {
    const { start_date, end_date, group_by = 'day' } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date and end_date are required' });
    }

    const analytics = await sql`
      SELECT *
      FROM claims_analytics
      WHERE claim_date >= ${start_date} AND claim_date <= ${end_date}
      ORDER BY claim_date ASC
    `;

    res.json(analytics.map((a: any) => ({
      claim_date: a.claim_date,
      claim_type: a.claim_type,
      status: a.status,
      claim_count: Number(a.claim_count || 0),
      avg_resolution_hours: a.avg_resolution_hours ? Number(a.avg_resolution_hours) : null,
      avg_confidence: a.avg_confidence ? Number(a.avg_confidence) : null,
      total_claimed: Number(a.total_claimed || 0),
      total_approved: Number(a.total_approved || 0),
      auto_approved_count: Number(a.auto_approved_count || 0),
      manual_review_count: Number(a.manual_review_count || 0)
    })));
  } catch (error) {
    console.error('Error fetching claims analytics:', error);
    res.status(500).json({ error: 'Failed to fetch claims analytics' });
  }
});

/**
 * GET /api/admin/reports/agent-performance
 * Get agent performance metrics
 */
router.get('/reports/agent-performance', async (req: Request, res: Response) => {
  try {
    const { start_date, end_date } = req.query;

    let whereClause = '';
    if (start_date && end_date) {
      whereClause = `WHERE activity_date >= '${start_date}' AND activity_date <= '${end_date}'`;
    }

    const performance = await sql`
      SELECT *
      FROM agent_performance
      ${start_date && end_date ? sql`WHERE activity_date >= ${start_date} AND activity_date <= ${end_date}` : sql``}
      ORDER BY activity_date DESC, agent_name ASC
    `;

    res.json(performance.map((p: any) => ({
      agent_name: p.agent_name,
      activity_date: p.activity_date,
      activities_count: Number(p.activities_count || 0),
      avg_processing_time_ms: p.avg_processing_time_ms ? Number(p.avg_processing_time_ms) : null,
      avg_confidence: p.avg_confidence ? Number(p.avg_confidence) : null,
      completed_count: Number(p.completed_count || 0),
      failed_count: Number(p.failed_count || 0)
    })));
  } catch (error) {
    console.error('Error fetching agent performance:', error);
    res.status(500).json({ error: 'Failed to fetch agent performance' });
  }
});

/**
 * GET /api/admin/reports/financial-impact
 * Get financial impact report
 */
router.get('/reports/financial-impact', async (req: Request, res: Response) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date and end_date are required' });
    }

    const impact = await sql`
      SELECT *
      FROM financial_impact
      WHERE report_date >= ${start_date} AND report_date <= ${end_date}
      ORDER BY report_date ASC
    `;

    res.json(impact.map((i: any) => ({
      report_date: i.report_date,
      total_claimed: Number(i.total_claimed || 0),
      total_approved: Number(i.total_approved || 0),
      total_savings: Number(i.total_savings || 0),
      claims_processed: Number(i.claims_processed || 0),
      avg_resolution_hours: i.avg_resolution_hours ? Number(i.avg_resolution_hours) : null
    })));
  } catch (error) {
    console.error('Error fetching financial impact:', error);
    res.status(500).json({ error: 'Failed to fetch financial impact' });
  }
});

// ============================================================================
// SETTINGS ENDPOINTS
// ============================================================================

/**
 * GET /api/admin/settings/config
 * Get system configuration
 */
router.get('/settings/config', async (req: Request, res: Response) => {
  try {
    const config = await sql`
      SELECT *
      FROM system_config
      ORDER BY config_key ASC
    `;

    const configObj: Record<string, any> = {};
    config.forEach((c: any) => {
      configObj[c.config_key] = {
        value: c.config_value,
        description: c.description,
        updated_by: c.updated_by,
        updated_at: c.updated_at
      };
    });

    res.json(configObj);
  } catch (error) {
    console.error('Error fetching system config:', error);
    res.status(500).json({ error: 'Failed to fetch system config' });
  }
});

/**
 * GET /api/admin/settings/audit-log
 * Get audit log entries
 */
router.get('/settings/audit-log', async (req: Request, res: Response) => {
  try {
    const { entity_type, start_date, end_date, limit = '100' } = req.query;

    let whereConditions: string[] = [];
    const params: any[] = [];

    if (entity_type) {
      whereConditions.push(`entity_type = $${params.length + 1}`);
      params.push(entity_type);
    }

    if (start_date) {
      whereConditions.push(`created_at >= $${params.length + 1}`);
      params.push(start_date);
    }

    if (end_date) {
      whereConditions.push(`created_at <= $${params.length + 1}`);
      params.push(end_date);
    }

    const limitNum = parseInt(limit as string, 10);
    params.push(limitNum);

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    const logs = await sql`
      SELECT *
      FROM audit_log
      ${whereConditions.length > 0 ? sql`WHERE ${sql.raw(whereConditions.map((_, i) => `$${i + 1}`).join(' AND '))}` : sql``}
      ORDER BY created_at DESC
      LIMIT $${params.length}
    `;

    res.json(logs.map((l: any) => ({
      log_id: l.log_id,
      entity_type: l.entity_type,
      entity_id: l.entity_id,
      action: l.action,
      performed_by: l.performed_by,
      ip_address: l.ip_address,
      changes: l.changes,
      created_at: l.created_at
    })));
  } catch (error) {
    console.error('Error fetching audit log:', error);
    res.status(500).json({ error: 'Failed to fetch audit log' });
  }
});

export default router;
