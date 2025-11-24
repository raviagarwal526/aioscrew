/**
 * Claims Review Dashboard for Payroll Admin
 * Shows real-time agent activity, metrics, and claims table
 */

import { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  AlertCircle,
  Loader,
  Brain,
  RefreshCw,
  Zap,
  Plane,
  DollarSign,
  Shield,
  X
} from 'lucide-react';
import { useAdminAgentActivity } from '../../hooks/useAdminAgentActivity';
import {
  getClaimsMetrics,
  listClaims,
  getClaimDetails,
  performClaimAction,
  type ClaimSummary,
  type ClaimsMetrics,
  type ClaimDetails
} from '../../services/admin-api';

interface ClaimsReviewDashboardProps {
  onViewClaim?: (claimId: string) => void;
}

interface ProcessingStep {
  id: string;
  agent: string;
  agentName: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  message: string;
  duration?: number;
  startTime?: number;
  error?: string;
}

interface ProcessingProgress {
  claimId: string;
  claimNumber: string;
  totalSteps: number;
  completedSteps: number;
  steps: ProcessingStep[];
  overallStatus?: 'processing' | 'completed' | 'error';
  result?: any;
}

export default function ClaimsReviewDashboard({}: ClaimsReviewDashboardProps) {
  const { activities, isConnected } = useAdminAgentActivity();
  const [metrics, setMetrics] = useState<ClaimsMetrics | null>(null);
  const [claims, setClaims] = useState<ClaimSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState<ClaimDetails | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingClaimId, setProcessingClaimId] = useState<string | null>(null);
  const [processingProgress, setProcessingProgress] = useState<ProcessingProgress | null>(null);
  const [batchProcessing, setBatchProcessing] = useState<{
    total: number;
    processed: number;
    current: string | null;
  } | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    claim_type: '',
    limit: 50,
    offset: 0
  });
  const cancelProcessingRef = useRef(false);

  // Load metrics and claims
  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [metricsData, claimsData] = await Promise.all([
        getClaimsMetrics(),
        listClaims(filters)
      ]);
      setMetrics(metricsData);
      setClaims(claimsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (claimId: string) => {
    try {
      await performClaimAction(claimId, { action_type: 'approved', admin_id: 'ADMIN001' });
      await loadData();
    } catch (error) {
      console.error('Error approving claim:', error);
      alert('Failed to approve claim');
    }
  };

  const handleReject = async (claimId: string) => {
    try {
      await performClaimAction(claimId, { action_type: 'rejected', admin_id: 'ADMIN001' });
      await loadData();
    } catch (error) {
      console.error('Error rejecting claim:', error);
      alert('Failed to reject claim');
    }
  };

  const handleViewDetails = async (claimId: string) => {
    try {
      const details = await getClaimDetails(claimId);
      setSelectedClaim(details);
    } catch (error) {
      console.error('Error loading claim details:', error);
    }
  };

  // Process a single claim with AI agents
  const processClaimWithAgents = async (claimId: string) => {
    // Check if cancellation was requested before starting
    if (cancelProcessingRef.current) {
      throw new Error('Processing cancelled');
    }

    try {
      setProcessingClaimId(claimId);
      const claim = claims.find(c => c.claim_id === claimId);
      
      // Initialize processing progress
      const progress: ProcessingProgress = {
        claimId,
        claimNumber: claim?.claim_id || claimId,
        totalSteps: 4,
        completedSteps: 0,
        steps: [
          {
            id: 'init',
            agent: 'orchestrator',
            agentName: 'Orchestrator',
            status: 'processing',
            message: 'Initializing claim validation...'
          },
          {
            id: 'flight-time',
            agent: 'flight-time-calculator',
            agentName: 'Flight Time Calculator',
            status: 'pending',
            message: 'Validating trip data and flight times'
          },
          {
            id: 'premium-pay',
            agent: 'premium-pay-calculator',
            agentName: 'Premium Pay Calculator',
            status: 'pending',
            message: 'Verifying payment amounts against CBA rules'
          },
          {
            id: 'compliance',
            agent: 'compliance-validator',
            agentName: 'Compliance Validator',
            status: 'pending',
            message: 'Checking for red flags and policy violations'
          }
        ],
        overallStatus: 'processing'
      };
      setProcessingProgress(progress);

      // Check cancellation before continuing
      if (cancelProcessingRef.current) {
        throw new Error('Processing cancelled');
      }

      // Update step 1: Starting
      setTimeout(() => {
        if (!cancelProcessingRef.current) {
          setProcessingProgress(prev => prev ? {
            ...prev,
            steps: prev.steps.map(s => s.id === 'init' ? { ...s, status: 'completed', message: '✓ Claim validation initialized' } : s),
            completedSteps: 1
          } : null);
        }
      }, 300);

      // Start agents
      setTimeout(() => {
        if (!cancelProcessingRef.current) {
          setProcessingProgress(prev => prev ? {
            ...prev,
            steps: prev.steps.map(s => 
              s.id === 'flight-time' || s.id === 'premium-pay' || s.id === 'compliance'
                ? { ...s, status: 'processing', startTime: Date.now() }
                : s
            )
          } : null);
        }
      }, 500);

      // Check cancellation before API call
      if (cancelProcessingRef.current) {
        throw new Error('Processing cancelled');
      }

      console.log(`🤖 Processing claim ${claimId} with AI agents...`);

      const response = await fetch('/api/agents/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId })
      });

      // Check cancellation after API call starts
      if (cancelProcessingRef.current) {
        throw new Error('Processing cancelled');
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to process claim: ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      
      // Check cancellation after getting result
      if (cancelProcessingRef.current) {
        throw new Error('Processing cancelled');
      }

      console.log(`✅ Claim ${claimId} processed:`, result.overallStatus);

      // Update all steps as completed
      const now = Date.now();
      setProcessingProgress(prev => prev ? {
        ...prev,
        completedSteps: prev.totalSteps,
        overallStatus: 'completed',
        result,
        steps: prev.steps.map(s => {
          if (s.status === 'processing') {
            const duration = s.startTime ? now - s.startTime : 0;
            return {
              ...s,
              status: 'completed',
              duration,
              message: `✓ ${s.message} (${duration}ms)`
            };
          }
          return s;
        })
      } : null);

      // Reload data to show updated claim
      if (!cancelProcessingRef.current) {
        await loadData();
      }

      // Clear progress after 3 seconds
      if (!cancelProcessingRef.current) {
        setTimeout(() => {
          setProcessingProgress(null);
        }, 3000);
      }
    } catch (error) {
      // Don't show error if cancellation was requested
      if (cancelProcessingRef.current) {
        setProcessingProgress(null);
        setProcessingClaimId(null);
        return;
      }

      console.error('Error processing claim:', error);
      
      // Mark steps as error
      setProcessingProgress(prev => prev ? {
        ...prev,
        overallStatus: 'error',
        steps: prev.steps.map(s => 
          s.status === 'processing' 
            ? { ...s, status: 'error', error: error instanceof Error ? error.message : 'Unknown error' }
            : s
        )
      } : null);

      // Show detailed error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Processing error:', errorMessage);
      
      // Display error in UI (already shown in processingProgress)
      // Also show alert for critical errors
      if (errorMessage.includes('All LLM providers failed')) {
        alert(`⚠️ LLM Configuration Issue\n\n${errorMessage}\n\nPlease check your LLM provider setup (Ollama or Anthropic API key).`);
      } else if (!errorMessage.includes('cancelled')) {
        alert(`Failed to process claim: ${errorMessage}`);
      }
      
      // Clear error state after 8 seconds (longer for errors so user can read)
      setTimeout(() => {
        setProcessingProgress(null);
      }, 8000);
    } finally {
      setProcessingClaimId(null);
    }
  };

  // Cancel all processing
  const cancelAllProcessing = () => {
    cancelProcessingRef.current = true;
    setIsProcessing(false);
    setProcessingClaimId(null);
    setProcessingProgress(null);
    setBatchProcessing(null);
    console.log('🛑 Processing cancelled by user');
  };

  // Process all pending claims with AI agents
  const processAllPendingClaims = async () => {
    const pendingClaims = claims.filter(c =>
      c.status === 'pending' || c.status === 'needs-review' || c.status === 'manual_review'
    );

    if (pendingClaims.length === 0) {
      alert('No pending claims to process');
      return;
    }

    if (!confirm(`Process ${pendingClaims.length} pending claims with AI agents?`)) {
      return;
    }

    // Reset cancellation flag
    cancelProcessingRef.current = false;

    try {
      setIsProcessing(true);
      setBatchProcessing({
        total: pendingClaims.length,
        processed: 0,
        current: null
      });
      console.log(`🤖 Processing ${pendingClaims.length} pending claims...`);

      for (let i = 0; i < pendingClaims.length; i++) {
        // Check if cancellation was requested
        if (cancelProcessingRef.current) {
          console.log(`🛑 Processing cancelled at claim ${i + 1} of ${pendingClaims.length}`);
          setBatchProcessing(prev => prev ? {
            ...prev,
            current: null
          } : null);
          break;
        }

        const claim = pendingClaims[i];
        setBatchProcessing(prev => prev ? {
          ...prev,
          current: claim.claim_id,
          processed: i
        } : null);

        try {
          await processClaimWithAgents(claim.claim_id);
        } catch (error) {
          // If cancelled during processing, break out
          if (cancelProcessingRef.current) {
            break;
          }
          console.error(`Error processing claim ${claim.claim_id}:`, error);
        }
        
        // Check again before delay
        if (cancelProcessingRef.current) {
          break;
        }
        
        // Small delay to avoid overwhelming the backend
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      if (!cancelProcessingRef.current) {
        setBatchProcessing({
          total: pendingClaims.length,
          processed: pendingClaims.length,
          current: null
        });
        console.log('✅ All claims processed');
        alert('All pending claims have been processed!');
      } else {
        const processed = batchProcessing?.processed || 0;
        console.log(`🛑 Processing cancelled. Processed ${processed} of ${pendingClaims.length} claims.`);
        alert(`Processing cancelled. Processed ${processed} of ${pendingClaims.length} claims.`);
      }
    } catch (error) {
      console.error('Error processing claims:', error);
      if (!cancelProcessingRef.current) {
        alert('Error processing some claims. Check console for details.');
      }
    } finally {
      setIsProcessing(false);
      cancelProcessingRef.current = false;
      setTimeout(() => setBatchProcessing(null), 2000);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      'auto_approved': 'bg-green-100 text-green-800',
      'ai-validated': 'bg-green-100 text-green-800',
      'manual_review': 'bg-orange-100 text-orange-800',
      'needs-review': 'bg-orange-100 text-orange-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${variants[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, string> = {
      low: 'bg-gray-100 text-gray-800',
      normal: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${variants[priority] || 'bg-gray-100 text-gray-800'}`}>
        {priority.toUpperCase()}
      </span>
    );
  };

  const getConfidenceBar = (confidence: number | null) => {
    if (confidence === null) return <span className="text-xs text-gray-400">N/A</span>;
    
    const percentage = Math.round(confidence * 100);
    const color = percentage >= 85 ? 'bg-green-500' :
                 percentage >= 70 ? 'bg-yellow-500' : 'bg-red-500';
    
    return (
      <div className="flex items-center space-x-2">
        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${color} transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-xs font-medium w-10">{percentage}%</span>
      </div>
    );
  };

  const getActivityIcon = (_activity: string, status: string) => {
    if (status === 'processing') return <Loader className="animate-spin text-blue-600" size={16} />;
    if (status === 'success') return <CheckCircle className="text-green-600" size={16} />;
    if (status === 'error') return <XCircle className="text-red-600" size={16} />;
    return <AlertCircle className="text-orange-600" size={16} />;
  };

  const getStepIcon = (step: ProcessingStep) => {
    if (step.status === 'completed') return <CheckCircle className="text-green-600" size={16} />;
    if (step.status === 'processing') return <Loader className="animate-spin text-blue-600" size={16} />;
    if (step.status === 'error') return <XCircle className="text-red-600" size={16} />;
    return <Clock className="text-gray-400" size={16} />;
  };

  const getAgentIcon = (agentId: string) => {
    switch (agentId) {
      case 'flight-time-calculator': return <Plane className="text-blue-600" size={16} />;
      case 'premium-pay-calculator': return <DollarSign className="text-green-600" size={16} />;
      case 'compliance-validator': return <Shield className="text-purple-600" size={16} />;
      case 'orchestrator': return <Zap className="text-yellow-600" size={16} />;
      default: return <Brain className="text-gray-600" size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header matching other screens */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-6 shadow-lg">
        <h2 className="text-3xl font-bold mb-2">Payroll Administration</h2>
        <p className="text-purple-100">
          AI-Powered Claims Processing & Review Dashboard
        </p>
      </div>

      {/* Detailed Processing Progress Panel */}
      {(processingProgress || batchProcessing) && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-400 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-purple-900 flex items-center space-x-2">
              <Brain className="animate-pulse" size={24} />
              <span>AI Agent Processing</span>
            </h3>
            <div className="flex items-center space-x-4">
              {batchProcessing && (
                <div className="text-sm font-medium text-purple-700">
                  Batch: {batchProcessing.processed} / {batchProcessing.total}
                </div>
              )}
              {isProcessing && (
                <button
                  onClick={cancelAllProcessing}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold flex items-center space-x-2 shadow-md transition-all transform hover:scale-105"
                >
                  <X size={18} />
                  <span>Cancel All Processing</span>
                </button>
              )}
            </div>
          </div>

          {processingProgress && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 mb-4">
                <span className="font-semibold text-gray-700">Claim:</span>
                <span className="font-mono text-purple-700">{processingProgress.claimNumber}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2 ml-4">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(processingProgress.completedSteps / processingProgress.totalSteps) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600">
                  {processingProgress.completedSteps} / {processingProgress.totalSteps}
                </span>
              </div>

              <div className="space-y-2 font-mono text-sm">
                {processingProgress.steps.map((step, idx) => (
                  <div 
                    key={step.id}
                    className={`flex items-start space-x-3 p-3 rounded-lg transition-all ${
                      step.status === 'completed' 
                        ? 'bg-green-50 border border-green-200' 
                        : step.status === 'processing'
                        ? 'bg-blue-50 border-2 border-blue-300'
                        : step.status === 'error'
                        ? 'bg-red-50 border border-red-200'
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="mt-0.5">
                      {getStepIcon(step)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        {getAgentIcon(step.agent)}
                        <span className={`font-semibold ${
                          step.status === 'completed' ? 'line-through text-gray-500' :
                          step.status === 'processing' ? 'text-blue-700' :
                          step.status === 'error' ? 'text-red-700' :
                          'text-gray-400'
                        }`}>
                          {step.agentName}
                        </span>
                        {step.duration && (
                          <span className="text-xs text-gray-500">({step.duration}ms)</span>
                        )}
                      </div>
                      <div className={`mt-1 ${
                        step.status === 'completed' ? 'line-through text-gray-400' :
                        step.status === 'processing' ? 'text-blue-600' :
                        step.status === 'error' ? 'text-red-600' :
                        'text-gray-500'
                      }`}>
                        {step.message}
                      </div>
                      {step.error && (
                        <div className="mt-1 text-xs text-red-600 font-normal whitespace-pre-wrap">
                          <div className="font-semibold mb-1">Error:</div>
                          <div className="bg-red-50 p-2 rounded border border-red-200">
                            {step.error.split('\n').map((line, idx) => (
                              <div key={idx}>{line}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {processingProgress.overallStatus === 'completed' && processingProgress.result && (
                <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="text-green-600" size={20} />
                    <span className="font-bold text-green-800">Processing Complete</span>
                  </div>
                  <div className="text-sm text-green-700">
                    <div>Status: <span className="font-semibold">{processingProgress.result.overallStatus?.toUpperCase()}</span></div>
                    {processingProgress.result.confidence && (
                      <div>Confidence: <span className="font-semibold">{(processingProgress.result.confidence * 100).toFixed(1)}%</span></div>
                    )}
                    {processingProgress.result.recommendation && (
                      <div className="mt-1">Recommendation: {processingProgress.result.recommendation}</div>
                    )}
                  </div>
                </div>
              )}

              {processingProgress.overallStatus === 'error' && (
                <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <XCircle className="text-red-600" size={20} />
                    <span className="font-bold text-red-800">Processing Failed</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Real-time Agent Activity Feed */}
      {activities.length > 0 && !processingProgress && (
        <div className="bg-blue-50 border-2 border-blue-600 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="relative">
              <div className={`h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center ${
                isConnected ? 'animate-pulse' : ''
              }`}>
                <Brain className="text-white" size={24} />
              </div>
              {isConnected && (
                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white animate-bounce"></div>
              )}
            </div>
            
            <div className="flex-1">
              <h3 className="font-bold text-blue-900 mb-2 flex items-center">
                AI Agents Processing Claims {isConnected ? '🟢' : '🔴'}
              </h3>
              <div className="space-y-2 text-sm">
                {activities.slice(0, 5).map((activity, index) => (
                  <div 
                    key={`${activity.claim_id}-${index}`}
                    className="flex items-center space-x-2 animate-fade-in"
                  >
                    {getActivityIcon(activity.activity, activity.status)}
                    <span className="flex-1">{activity.message || `${activity.agent_name}: ${activity.activity}`}</span>
                    {activity.processing_time_ms && (
                      <span className="text-xs text-gray-500">
                        {activity.processing_time_ms}ms
                      </span>
                    )}
                    {activity.confidence && (
                      <span className="text-xs font-medium text-green-600">
                        {Math.round(activity.confidence * 100)}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md border-l-4 border-yellow-500 p-4">
            <div className="flex items-center justify-between mb-2">
              <FileText className="text-yellow-600" size={24} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{metrics.total_pending}</div>
            <div className="text-sm text-gray-600">Pending Claims</div>
            <div className="text-xs text-gray-500 mt-1">
              ${metrics.total_amount_pending.toFixed(2)} total
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border-l-4 border-green-600 p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="text-green-600" size={24} />
              <span className="text-xs font-semibold text-green-600">
                {Math.round(metrics.auto_approval_rate * 100)}%
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{metrics.auto_approved_today}</div>
            <div className="text-sm text-gray-600">Auto-Approved Today</div>
          </div>

          <div className="bg-white rounded-lg shadow-md border-l-4 border-orange-500 p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="text-orange-500" size={24} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{metrics.manual_review_count}</div>
            <div className="text-sm text-gray-600">Manual Review</div>
          </div>

          <div className="bg-white rounded-lg shadow-md border-l-4 border-blue-600 p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="text-blue-600" size={24} />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {metrics.avg_resolution_hours.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Avg Resolution (hrs)</div>
          </div>
        </div>
      )}

      {/* Action Bar - Prominent and Always Visible */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4 flex-wrap">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="auto_approved">Auto-Approved</option>
              <option value="manual_review">Manual Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>

            <select
              value={filters.claim_type}
              onChange={(e) => setFilters({ ...filters, claim_type: e.target.value })}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Types</option>
              <option value="missing_flight">Missing Flight</option>
              <option value="incorrect_block_time">Block Time</option>
              <option value="premium_pay">Premium Pay</option>
              <option value="per_diem">Per Diem</option>
              <option value="guarantee">Guarantee</option>
            </select>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={loadData}
              disabled={isProcessing}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed font-semibold flex items-center space-x-2 shadow-sm transition-all"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>

            {isProcessing ? (
              <button
                onClick={cancelAllProcessing}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold flex items-center space-x-2 shadow-lg transition-all transform hover:scale-105"
              >
                <X size={18} />
                <span>Cancel Processing ({batchProcessing?.processed || 0}/{batchProcessing?.total || 0})</span>
              </button>
            ) : (
              <button
                onClick={processAllPendingClaims}
                disabled={claims.filter(c => c.status === 'pending' || c.status === 'needs-review' || c.status === 'manual_review').length === 0}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed font-bold flex items-center space-x-2 shadow-lg transition-all transform hover:scale-105"
              >
                <Brain size={18} />
                <span>🤖 Process All ({claims.filter(c => c.status === 'pending' || c.status === 'needs-review' || c.status === 'manual_review').length})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Claims Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-xl font-bold text-gray-900">Claims Queue</h3>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Loader className="animate-spin mx-auto text-blue-600" size={32} />
            <p className="mt-4 text-gray-600">Loading claims...</p>
          </div>
        ) : claims.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FileText className="mx-auto text-gray-300" size={64} />
            <p className="mt-4 text-lg font-medium">No claims found</p>
          </div>
        ) : (
          <div className="relative">
            {/* Visual indicator for horizontal scroll - subtle gradient hint */}
            <div className="absolute top-0 right-0 h-full w-12 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none z-10" />
            <div className="overflow-x-auto claims-queue-scroll pb-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#6B7280 #E5E7EB' }}>
              <table className="min-w-full divide-y divide-gray-200" style={{ minWidth: '1200px' }}>
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Claim ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Crew Member</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">AI Confidence</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {claims.map((claim) => (
                  <tr key={claim.claim_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {claim.claim_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {claim.crew_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {claim.claim_type.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${claim.amount_claimed.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(claim.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPriorityBadge(claim.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getConfidenceBar(claim.ai_confidence)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(claim.submitted_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-col space-y-2 min-w-[200px]">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewDetails(claim.claim_id)}
                            className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center space-x-1 font-medium text-xs"
                          >
                            <Eye size={14} />
                            <span>View</span>
                          </button>
                          {claim.status === 'pending' || claim.status === 'manual_review' || claim.status === 'needs-review' ? (
                            <button
                              onClick={() => processClaimWithAgents(claim.claim_id)}
                              disabled={processingClaimId === claim.claim_id || isProcessing}
                              className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center space-x-1 font-semibold text-xs shadow-md transition-all"
                            >
                              <Brain size={14} className={processingClaimId === claim.claim_id ? 'animate-pulse' : ''} />
                              <span>{processingClaimId === claim.claim_id ? 'Processing...' : '🤖 AI Process'}</span>
                            </button>
                          ) : null}
                        </div>
                        {claim.status === 'pending' || claim.status === 'manual_review' || claim.status === 'needs-review' ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApprove(claim.claim_id)}
                              className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 flex items-center space-x-1 font-medium text-xs"
                            >
                              <CheckCircle size={14} />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleReject(claim.claim_id)}
                              className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center space-x-1 font-medium text-xs"
                            >
                              <XCircle size={14} />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>

      {/* Claim Details Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold">Claim Details: {selectedClaim.claim.claim_id}</h2>
              <button
                onClick={() => setSelectedClaim(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-bold mb-2">Claim Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Crew Member:</span>
                    <p className="font-medium">{selectedClaim.claim.crew_name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Type:</span>
                    <p className="font-medium">{selectedClaim.claim.claim_type}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Amount Claimed:</span>
                    <p className="font-medium">${selectedClaim.claim.amount_claimed.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Status:</span>
                    <p className="font-medium">{selectedClaim.claim.status}</p>
                  </div>
                </div>
              </div>

              {selectedClaim.agent_activities.length > 0 && (
                <div>
                  <h3 className="font-bold mb-2">Agent Activities</h3>
                  <div className="space-y-2">
                    {selectedClaim.agent_activities.map((activity: any, idx: number) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded">
                        <div className="flex justify-between">
                          <span className="font-medium">{activity.agent_name}</span>
                          <span className="text-sm text-gray-500">
                            {activity.processing_time_ms}ms
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{activity.activity_type}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
