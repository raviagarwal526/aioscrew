/**
 * WebSocket service for broadcasting agent activities
 */

import { io } from '../server.js';

export interface AgentActivityMessage {
  claim_id: string;
  agent_name: string;
  activity: 'started' | 'completed' | 'failed' | 'flagged';
  status: string;
  processing_time_ms?: number;
  confidence?: number;
  error?: string;
  message?: string;
  timestamp: string;
}

/**
 * Broadcast agent activity to all admin clients
 */
export function broadcastAgentActivity(activity: AgentActivityMessage) {
  io.to('admin').emit('agent_activity', {
    type: 'agent_activity',
    data: activity,
    timestamp: new Date().toISOString()
  });
  
  console.log(`📡 Broadcasted agent activity: ${activity.agent_name} - ${activity.activity} for ${activity.claim_id}`);
}

/**
 * Emit agent activity when agent starts processing
 */
export function emitAgentStarted(claimId: string, agentName: string) {
  broadcastAgentActivity({
    claim_id: claimId,
    agent_name: agentName,
    activity: 'started',
    status: 'processing',
    timestamp: new Date().toISOString(),
    message: `${agentName}: Analyzing ${claimId}...`
  });
}

/**
 * Emit agent activity when agent completes successfully
 */
export function emitAgentCompleted(
  claimId: string,
  agentName: string,
  processingTimeMs: number,
  confidence?: number
) {
  broadcastAgentActivity({
    claim_id: claimId,
    agent_name: agentName,
    activity: 'completed',
    status: 'success',
    processing_time_ms: processingTimeMs,
    confidence: confidence,
    timestamp: new Date().toISOString(),
    message: `${agentName}: Validated ${claimId} ✓`
  });
}

/**
 * Emit agent activity when agent fails
 */
export function emitAgentFailed(claimId: string, agentName: string, error: string) {
  broadcastAgentActivity({
    claim_id: claimId,
    agent_name: agentName,
    activity: 'failed',
    status: 'error',
    error: error,
    timestamp: new Date().toISOString(),
    message: `${agentName}: Error processing ${claimId}`
  });
}

/**
 * Emit agent activity when claim is flagged for review
 */
export function emitAgentFlagged(claimId: string, agentName: string, reason?: string) {
  broadcastAgentActivity({
    claim_id: claimId,
    agent_name: agentName,
    activity: 'flagged',
    status: 'flagged',
    timestamp: new Date().toISOString(),
    message: `${agentName}: ${claimId} flagged for review${reason ? ` - ${reason}` : ''}`
  });
}
