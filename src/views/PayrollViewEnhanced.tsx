import { useState, useEffect } from 'react';
import { DollarSign, CheckCircle, Clock, AlertCircle, FileText } from 'lucide-react';
import { crewService } from '../services/crewService';

export default function PayrollViewEnhanced() {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState<any | null>(null);

  useEffect(() => {
    loadClaims();
  }, []);

  const loadClaims = async () => {
    setLoading(true);
    try {
      const allClaims = await crewService.getAllClaims();
      setClaims(allClaims);
    } catch (error) {
      console.error('Error loading claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (claimId: string) => {
    const success = await crewService.updateClaimStatus(claimId, 'approved', 'Payroll Admin');
    if (success) {
      await loadClaims();
      setSelectedClaim(null);
    }
  };

  const handleReject = async (claimId: string) => {
    const success = await crewService.updateClaimStatus(claimId, 'rejected', 'Payroll Admin');
    if (success) {
      await loadClaims();
      setSelectedClaim(null);
    }
  };

  const pendingClaims = claims.filter(c => c.status === 'pending');
  const approvedClaims = claims.filter(c => c.status === 'approved');
  const totalPayroll = claims.reduce((sum, c) => c.status === 'approved' ? sum + parseFloat(c.amount) : sum, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payroll data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg p-6">
        <h2 className="text-3xl font-bold mb-2">Payroll Administration</h2>
        <p className="text-green-100">
          Period: Nov 16-30, 2024 | {claims.length} total claims
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs text-green-600 font-medium">TOTAL</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">${totalPayroll.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          <div className="text-sm text-gray-600">Approved claims</div>
          <div className="text-xs text-gray-500 mt-1">{approvedClaims.length} claims</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs text-blue-600 font-medium">PROCESSED</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{claims.length}</div>
          <div className="text-sm text-gray-600">Total claims</div>
          <div className="text-xs text-gray-500 mt-1">AI validated</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-amber-500">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-xs text-amber-600 font-medium">REVIEW</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{pendingClaims.length}</div>
          <div className="text-sm text-gray-600">Pending claims</div>
          <div className="text-xs text-gray-500 mt-1">Awaiting approval</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-xs text-red-600 font-medium">AUTO-RATE</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {claims.length > 0 ? Math.round((claims.filter(c => c.ai_validated).length / claims.length) * 100) : 0}%
          </div>
          <div className="text-sm text-gray-600">AI validation rate</div>
          <div className="text-xs text-gray-500 mt-1">{claims.filter(c => c.ai_validated).length} validated</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-600" />
          Pending Claims Review
        </h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {pendingClaims.map((claim) => (
            <div key={claim.id} className="border border-amber-200 rounded-lg p-4 bg-amber-50">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-semibold text-gray-900">{claim.crew_name || 'Unknown Crew'}</div>
                  <div className="text-sm text-gray-600">{claim.claim_type}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">${claim.amount}</div>
                  <div className="text-xs text-amber-600 font-medium">PENDING</div>
                </div>
              </div>
              {claim.ai_validated && (
                <div className="text-sm text-gray-700 bg-white rounded p-3 mb-3">
                  <div className="font-medium text-gray-900 mb-1 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    AI Validation:
                  </div>
                  {claim.ai_explanation}
                </div>
              )}
              <div className="text-xs text-gray-500 mb-3">
                Trip: {claim.trip_id} | Date: {new Date(claim.claim_date).toLocaleDateString()}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(claim.id)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(claim.id)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                >
                  Reject
                </button>
                <button
                  onClick={() => setSelectedClaim(claim)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm"
                >
                  Details
                </button>
              </div>
            </div>
          ))}
          {pendingClaims.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-300" />
              <p>No pending claims to review</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Recently Approved Claims
        </h3>
        <div className="space-y-2">
          {approvedClaims.slice(0, 10).map((claim) => (
            <div key={claim.id} className="flex items-center gap-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="p-2 bg-green-100 rounded">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{claim.crew_name || 'Unknown'}</div>
                <div className="text-sm text-gray-600">{claim.claim_type} - {claim.trip_id}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">${claim.amount}</div>
                <div className="text-xs text-green-600">APPROVED</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedClaim && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Claim Details</h3>
              <button
                onClick={() => setSelectedClaim(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Claim ID</div>
                  <div className="font-semibold">{selectedClaim.id}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Crew Member</div>
                  <div className="font-semibold">{selectedClaim.crew_name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Claim Type</div>
                  <div className="font-semibold">{selectedClaim.claim_type}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Amount</div>
                  <div className="font-semibold text-green-600">${selectedClaim.amount}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Trip</div>
                  <div className="font-semibold">{selectedClaim.trip_id}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Date</div>
                  <div className="font-semibold">{new Date(selectedClaim.claim_date).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="font-semibold text-blue-900 mb-2">AI Validation</div>
                <p className="text-sm text-gray-700">{selectedClaim.ai_explanation}</p>
                {selectedClaim.contract_reference && (
                  <div className="mt-2 text-xs text-blue-700">
                    Reference: {selectedClaim.contract_reference}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleApprove(selectedClaim.id)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(selectedClaim.id)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => setSelectedClaim(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
