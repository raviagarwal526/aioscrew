/**
 * Claims Review Dashboard for Payroll Admin
 * Shows real-time agent activity, metrics, and claims table
 */

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  AlertCircle,
  Loader,
  Brain,
  RefreshCw
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

export default function ClaimsReviewDashboard({ onViewClaim }: ClaimsReviewDashboardProps) {
  const { activities, isConnected } = useAdminAgentActivity();
  const [metrics, setMetrics] = useState<ClaimsMetrics | null>(null);
  const [claims, setClaims] = useState<ClaimSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState<ClaimDetails | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    claim_type: '',
    limit: 50,
    offset: 0
  });

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

  const getActivityIcon = (activity: string, status: string) => {
    if (status === 'processing') return <Loader className="animate-spin text-blue-600" size={16} />;
    if (status === 'success') return <CheckCircle className="text-green-600" size={16} />;
    if (status === 'error') return <XCircle className="text-red-600" size={16} />;
    return <AlertCircle className="text-orange-600" size={16} />;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Real-time Agent Activity Feed */}
      {activities.length > 0 && (
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

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center space-x-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border rounded-lg"
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
            className="px-3 py-2 border rounded-lg"
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
            className="px-3 py-2 border rounded-lg"
          >
            <option value="">All Types</option>
            <option value="missing_flight">Missing Flight</option>
            <option value="incorrect_block_time">Block Time</option>
            <option value="premium_pay">Premium Pay</option>
            <option value="per_diem">Per Diem</option>
            <option value="guarantee">Guarantee</option>
          </select>

          <button
            onClick={loadData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
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
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDetails(claim.claim_id)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center space-x-1"
                        >
                          <Eye size={14} />
                          <span>View</span>
                        </button>
                        {claim.status === 'pending' || claim.status === 'manual_review' || claim.status === 'needs-review' ? (
                          <>
                            <button
                              onClick={() => handleApprove(claim.claim_id)}
                              className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 flex items-center space-x-1"
                            >
                              <CheckCircle size={14} />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleReject(claim.claim_id)}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center space-x-1"
                            >
                              <XCircle size={14} />
                              <span>Reject</span>
                            </button>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
