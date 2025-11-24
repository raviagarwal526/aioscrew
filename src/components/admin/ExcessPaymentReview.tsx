/**
 * Excess Payment Review Dashboard
 * Allows admins to review and manage excess payment findings
 */

import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  DollarSign,
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  Search,
  Filter,
  TrendingUp,
  Loader,
  X,
  Shield,
  AlertCircle,
  Clock,
  Zap
} from 'lucide-react';
import {
  listExcessPaymentFindings,
  getExcessPaymentMetrics,
  scanExcessPayments,
  updateExcessPaymentFinding,
  createBatchReview,
  listPaymentBatches,
  type ExcessPaymentFinding,
  type ExcessPaymentMetrics
} from '../../services/admin-api';

export default function ExcessPaymentReview() {
  const [metrics, setMetrics] = useState<ExcessPaymentMetrics | null>(null);
  const [findings, setFindings] = useState<ExcessPaymentFinding[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFinding, setSelectedFinding] = useState<ExcessPaymentFinding | null>(null);
  const [selectedFindings, setSelectedFindings] = useState<Set<number>>(new Set());
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<string | null>(null);
  const [batches, setBatches] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    status: '',
    severity: '',
    finding_type: '',
    limit: 50,
    offset: 0
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [metricsData, findingsData, batchesData] = await Promise.all([
        getExcessPaymentMetrics(),
        listExcessPaymentFindings(filters),
        listPaymentBatches({})
      ]);
      setMetrics(metricsData);
      setFindings(findingsData);
      setBatches(batchesData);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load excess payment data');
    } finally {
      setLoading(false);
    }
  };

  const handleScanBatch = async (batchId: string) => {
    if (!confirm(`Scan batch ${batchId} for excess payments? This may take a few minutes.`)) {
      return;
    }

    try {
      setScanning(true);
      setScanProgress(`Scanning batch ${batchId}...`);
      const result = await scanExcessPayments({ batch_id: batchId });
      setScanProgress(null);
      alert(`Scan complete! Found ${result.total_findings} excess payment issue(s) totaling $${result.findings.reduce((sum: number, f: any) => sum + f.excess_amount, 0).toFixed(2)}`);
      await loadData();
    } catch (error) {
      console.error('Error scanning batch:', error);
      alert(`Failed to scan batch: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setScanning(false);
      setScanProgress(null);
    }
  };

  const handleScanClaim = async (claimId: string) => {
    try {
      setScanning(true);
      setScanProgress(`Scanning claim ${claimId}...`);
      const result = await scanExcessPayments({ claim_id: claimId });
      setScanProgress(null);
      if (result.findings && result.findings.length > 0) {
        alert(`Found ${result.findings.length} excess payment issue(s) totaling $${result.findings.reduce((sum: number, f: any) => sum + f.excess_amount, 0).toFixed(2)}`);
      } else {
        alert('No excess payment issues found for this claim');
      }
      await loadData();
    } catch (error) {
      console.error('Error scanning claim:', error);
      alert(`Failed to scan claim: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setScanning(false);
      setScanProgress(null);
    }
  };

  const handleResolveFinding = async (findingId: number, notes?: string) => {
    const resolutionNotes = notes || prompt('Enter resolution notes:');
    if (resolutionNotes === null) return;

    try {
      await updateExcessPaymentFinding(findingId, 'resolved', resolutionNotes);
      await loadData();
      setSelectedFinding(null);
    } catch (error) {
      console.error('Error resolving finding:', error);
      alert('Failed to resolve finding');
    }
  };

  const handleDismissFinding = async (findingId: number, notes?: string) => {
    const resolutionNotes = notes || prompt('Enter dismissal reason:');
    if (resolutionNotes === null) return;

    try {
      await updateExcessPaymentFinding(findingId, 'dismissed', resolutionNotes);
      await loadData();
      setSelectedFinding(null);
    } catch (error) {
      console.error('Error dismissing finding:', error);
      alert('Failed to dismiss finding');
    }
  };

  const handleBatchReview = async () => {
    if (selectedFindings.size === 0) {
      alert('Please select findings to review');
      return;
    }

    const notes = prompt('Enter batch review notes:');
    if (notes === null) return;

    try {
      const result = await createBatchReview(Array.from(selectedFindings), notes);
      alert(`Batch review created! ${result.total_findings} findings, $${result.total_excess_amount.toFixed(2)} total excess`);
      setSelectedFindings(new Set());
      await loadData();
    } catch (error) {
      console.error('Error creating batch review:', error);
      alert('Failed to create batch review');
    }
  };

  const toggleFindingSelection = (findingId: number) => {
    const newSelected = new Set(selectedFindings);
    if (newSelected.has(findingId)) {
      newSelected.delete(findingId);
    } else {
      newSelected.add(findingId);
    }
    setSelectedFindings(newSelected);
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, string> = {
      high: 'bg-red-100 text-red-800 border-red-300',
      medium: 'bg-orange-100 text-orange-800 border-orange-300',
      low: 'bg-yellow-100 text-yellow-800 border-yellow-300'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${variants[severity] || 'bg-gray-100 text-gray-800'}`}>
        {severity.toUpperCase()}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const icons: Record<string, any> = {
      duplicate: <AlertCircle size={14} />,
      overpayment: <DollarSign size={14} />,
      contract_violation: <Shield size={14} />,
      ineligible: <XCircle size={14} />,
      anomaly: <TrendingUp size={14} />,
      calculation_error: <AlertTriangle size={14} />
    };
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex items-center space-x-1">
        {icons[type] || <FileText size={14} />}
        <span>{type.replace('_', ' ').toUpperCase()}</span>
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewed: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      dismissed: 'bg-gray-100 text-gray-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${variants[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg p-6 shadow-lg">
        <h2 className="text-3xl font-bold mb-2">Excess Payment Review</h2>
        <p className="text-red-100">
          AI-Powered Detection and Review of Overpayments
        </p>
      </div>

      {/* Scanning Progress */}
      {scanning && (
        <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Loader className="animate-spin text-blue-600" size={24} />
            <div>
              <div className="font-semibold text-blue-900">Scanning for Excess Payments</div>
              <div className="text-sm text-blue-700">{scanProgress || 'Processing...'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md border-l-4 border-red-500 p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{metrics.total_pending}</div>
            <div className="text-sm text-gray-600">Pending Findings</div>
            <div className="text-xs text-gray-500 mt-1">
              ${metrics.total_excess_amount.toFixed(2)} at risk
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border-l-4 border-orange-500 p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="text-orange-600" size={24} />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {metrics.by_severity.find(s => s.severity === 'high')?.count || 0}
            </div>
            <div className="text-sm text-gray-600">High Severity</div>
            <div className="text-xs text-gray-500 mt-1">
              ${metrics.by_severity.find(s => s.severity === 'high')?.total_excess.toFixed(2) || '0.00'}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border-l-4 border-green-500 p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{metrics.resolved_count}</div>
            <div className="text-sm text-gray-600">Resolved</div>
            <div className="text-xs text-gray-500 mt-1">
              ${metrics.total_recovered.toFixed(2)} recovered
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border-l-4 border-blue-500 p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="text-blue-600" size={24} />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              ${metrics.total_excess_amount.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Total Excess</div>
            <div className="text-xs text-gray-500 mt-1">
              Across all findings
            </div>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4 flex-wrap">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>

            <select
              value={filters.severity}
              onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Severities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={filters.finding_type}
              onChange={(e) => setFilters({ ...filters, finding_type: e.target.value })}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Types</option>
              <option value="duplicate">Duplicate</option>
              <option value="overpayment">Overpayment</option>
              <option value="contract_violation">Contract Violation</option>
              <option value="ineligible">Ineligible</option>
              <option value="anomaly">Anomaly</option>
              <option value="calculation_error">Calculation Error</option>
            </select>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={loadData}
              disabled={scanning}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed font-semibold flex items-center space-x-2 shadow-sm transition-all"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>

            {selectedFindings.size > 0 && (
              <button
                onClick={handleBatchReview}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center space-x-2 shadow-md transition-all"
              >
                <FileText size={16} />
                <span>Batch Review ({selectedFindings.size})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Scan Section */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
        <h3 className="text-lg font-bold mb-3">Quick Scan</h3>
        <div className="flex items-center space-x-4 flex-wrap">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Scan Payment Batch:</label>
            <select
              onChange={(e) => e.target.value && handleScanBatch(e.target.value)}
              disabled={scanning}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
            >
              <option value="">Select batch...</option>
              {batches.map(b => (
                <option key={b.batch_id} value={b.batch_id}>
                  {b.batch_id} - ${b.total_amount.toFixed(2)} ({b.total_claims} claims)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Findings Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-xl font-bold text-gray-900">Excess Payment Findings</h3>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Loader className="animate-spin mx-auto text-red-600" size={32} />
            <p className="mt-4 text-gray-600">Loading findings...</p>
          </div>
        ) : findings.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <AlertTriangle className="mx-auto text-gray-300" size={64} />
            <p className="mt-4 text-lg font-medium">No excess payment findings found</p>
            <p className="mt-2 text-sm">Try scanning a payment batch or claim</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12">
                    <input
                      type="checkbox"
                      checked={selectedFindings.size === findings.length && findings.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFindings(new Set(findings.map(f => f.finding_id)));
                        } else {
                          setSelectedFindings(new Set());
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Finding</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Claim</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Excess Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {findings.map((finding) => (
                  <tr key={finding.finding_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedFindings.has(finding.finding_id)}
                        onChange={() => toggleFindingSelection(finding.finding_id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{finding.title}</div>
                      <div className="text-xs text-gray-500 mt-1">{finding.description.substring(0, 100)}...</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTypeBadge(finding.finding_type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getSeverityBadge(finding.severity)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{finding.claim_id}</div>
                      {finding.crew_name && (
                        <div className="text-xs text-gray-500">{finding.crew_name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-red-600">
                        ${finding.excess_amount.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Paid: ${finding.paid_amount.toFixed(2)} | Expected: ${finding.expected_amount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(finding.status)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedFinding(finding)}
                          className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center space-x-1 font-medium text-xs"
                        >
                          <Eye size={14} />
                          <span>View</span>
                        </button>
                        {finding.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleResolveFinding(finding.finding_id)}
                              className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 flex items-center space-x-1 font-medium text-xs"
                            >
                              <CheckCircle size={14} />
                              <span>Resolve</span>
                            </button>
                            <button
                              onClick={() => handleDismissFinding(finding.finding_id)}
                              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center space-x-1 font-medium text-xs"
                            >
                              <XCircle size={14} />
                              <span>Dismiss</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Finding Details Modal */}
      {selectedFinding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold">Finding Details</h2>
              <button
                onClick={() => setSelectedFinding(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-bold mb-2">Finding Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Title:</span>
                    <p className="font-medium">{selectedFinding.title}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Type:</span>
                    <p className="font-medium">{getTypeBadge(selectedFinding.finding_type)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Severity:</span>
                    <p className="font-medium">{getSeverityBadge(selectedFinding.severity)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Status:</span>
                    <p className="font-medium">{getStatusBadge(selectedFinding.status)}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-2">Description</h3>
                <p className="text-gray-700">{selectedFinding.description}</p>
              </div>

              <div>
                <h3 className="font-bold mb-2">Financial Details</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Expected Amount:</span>
                    <p className="font-medium text-green-600">${selectedFinding.expected_amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Paid Amount:</span>
                    <p className="font-medium text-blue-600">${selectedFinding.paid_amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Excess Amount:</span>
                    <p className="font-medium text-red-600">${selectedFinding.excess_amount.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {selectedFinding.evidence && selectedFinding.evidence.length > 0 && (
                <div>
                  <h3 className="font-bold mb-2">Evidence</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedFinding.evidence.map((item, idx) => (
                      <li key={idx} className="text-sm text-gray-700">{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedFinding.contract_references && selectedFinding.contract_references.length > 0 && (
                <div>
                  <h3 className="font-bold mb-2">Contract References</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedFinding.contract_references.map((ref, idx) => (
                      <li key={idx} className="text-sm text-gray-700">{ref}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h3 className="font-bold mb-2">Suggested Action</h3>
                <p className="text-gray-700">{selectedFinding.suggested_action}</p>
              </div>

              {selectedFinding.status === 'pending' && (
                <div className="flex space-x-3 pt-4 border-t">
                  <button
                    onClick={() => handleResolveFinding(selectedFinding.finding_id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                  >
                    Resolve Finding
                  </button>
                  <button
                    onClick={() => handleDismissFinding(selectedFinding.finding_id)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
                  >
                    Dismiss Finding
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
