import { DollarSign, CheckCircle, Clock, AlertCircle, FileText, Download } from 'lucide-react';
import ConversationalAI from '../components/ConversationalAI';
import { claims, crewMembers } from '../data/mockData';

export default function PayrollView() {
  const totalPayroll = 523450;
  const totalClaims = claims.length * 10;
  const autoApproved = Math.floor(totalClaims * 0.98);
  const pendingClaims = claims.filter(c => c.status === 'pending');
  const exceptions = 3;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg p-6">
        <h2 className="text-3xl font-bold mb-2">Payroll Administration</h2>
        <p className="text-green-100">
          Period: Nov 16-30, 2024 | {crewMembers.length} crew members
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
          <div className="text-2xl font-bold text-gray-900">${totalPayroll.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total payroll</div>
          <div className="text-xs text-gray-500 mt-1">Current pay period</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs text-blue-600 font-medium">AI VALIDATED</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalClaims}</div>
          <div className="text-sm text-gray-600">Claims processed</div>
          <div className="text-xs text-gray-500 mt-1">{autoApproved} auto-approved (98%)</div>
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
            <span className="text-xs text-red-600 font-medium">EXCEPTIONS</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{exceptions}</div>
          <div className="text-sm text-gray-600">Flagged for review</div>
          <div className="text-xs text-gray-500 mt-1">Manual verification needed</div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-600 rounded-lg">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">AI Validation Summary</h3>
            <p className="text-sm text-gray-600">Automated claim processing with CBA compliance verification</p>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-3xl font-bold text-green-600">98%</div>
            <div className="text-sm text-gray-600">Auto-approval rate</div>
            <div className="text-xs text-gray-500 mt-1">234 claims validated automatically</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-3xl font-bold text-blue-600">$0</div>
            <div className="text-sm text-gray-600">Processing errors</div>
            <div className="text-xs text-gray-500 mt-1">100% accuracy this period</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-3xl font-bold text-purple-600">2.3hrs</div>
            <div className="text-sm text-gray-600">Avg processing time</div>
            <div className="text-xs text-gray-500 mt-1">vs 48hrs manual processing</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-600" />
            Recent Claims - Pending Review
          </h3>
          <div className="space-y-3">
            {pendingClaims.map((claim) => {
              const crew = crewMembers.find(c => c.id === claim.crewId);
              return (
                <div key={claim.id} className="border border-amber-200 rounded-lg p-4 bg-amber-50">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-semibold text-gray-900">{crew?.name}</div>
                      <div className="text-sm text-gray-600">{claim.type}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">${claim.amount}</div>
                      <div className="text-xs text-amber-600 font-medium">PENDING</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700 bg-white rounded p-3 mb-3">
                    <div className="font-medium text-gray-900 mb-1">AI Validation:</div>
                    {claim.explanation}
                  </div>
                  <div className="text-xs text-gray-500 mb-3">
                    Flight: {claim.flight} | Date: {new Date(claim.date).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm">
                      Approve
                    </button>
                    <button className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm">
                      Reject
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm">
                      Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <ConversationalAI
          role="payroll"
          context="Payroll Period: Nov 16-30, 2024"
        />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Approved Claims - Recent Activity
        </h3>
        <div className="space-y-2">
          {claims.filter(c => c.status === 'approved').map((claim) => {
            const crew = crewMembers.find(c => c.id === claim.crewId);
            return (
              <div key={claim.id} className="flex items-center gap-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="p-2 bg-green-100 rounded">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{crew?.name}</div>
                  <div className="text-sm text-gray-600">{claim.type} - {claim.flight}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">${claim.amount}</div>
                  <div className="text-xs text-green-600">APPROVED</div>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm">
                  View Details
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <button className="px-6 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-lg shadow-md transition-colors text-left">
          <FileText className="w-6 h-6 text-amber-600 mb-2" />
          <div className="font-semibold">Claims Review</div>
          <div className="text-xs text-gray-600">Process pending claims</div>
        </button>

        <button className="px-6 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-lg shadow-md transition-colors text-left">
          <AlertCircle className="w-6 h-6 text-red-600 mb-2" />
          <div className="font-semibold">Exceptions</div>
          <div className="text-xs text-gray-600">Flagged items</div>
        </button>

        <button className="px-6 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-lg shadow-md transition-colors text-left">
          <CheckCircle className="w-6 h-6 text-green-600 mb-2" />
          <div className="font-semibold">Audit Trail</div>
          <div className="text-xs text-gray-600">Complete history</div>
        </button>

        <button className="px-6 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-lg shadow-md transition-colors text-left">
          <Download className="w-6 h-6 text-blue-600 mb-2" />
          <div className="font-semibold">Export</div>
          <div className="text-xs text-gray-600">Download payroll data</div>
        </button>
      </div>
    </div>
  );
}
