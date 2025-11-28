import { Scale, AlertTriangle, CheckCircle, DollarSign, Clock, TrendingUp } from 'lucide-react';
import { crewMembers } from '../data/mockData';
import CBADocumentUpload from '../components/cba/CBADocumentUpload';
import CBAChat from '../components/cba/CBAChat';

interface UnionViewProps {
  activeView?: string;
}

export default function UnionView({ activeView = 'dashboard' }: UnionViewProps) {
  // Handle CBA-specific views
  if (activeView === 'cba-upload') {
    return <CBADocumentUpload />;
  }

  if (activeView === 'cba-chat') {
    return <CBAChat />;
  }

  // Default dashboard view
  const totalCrew = crewMembers.length;
  const avgPay = Math.round(crewMembers.reduce((sum, c) => sum + c.ytdEarnings, 0) / totalCrew);
  const violations = 4;
  const complianceRate = 98.5;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg p-6">
        <h2 className="text-3xl font-bold mb-2">Union Compliance Dashboard</h2>
        <p className="text-teal-100">
          Contract Monitoring & Member Advocacy | November 2024
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs text-green-600 font-medium">COMPLIANT</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{complianceRate}%</div>
          <div className="text-sm text-gray-600">Contract compliance</div>
          <div className="text-xs text-gray-500 mt-1">Trips meet minimums</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-amber-500">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-xs text-amber-600 font-medium">FLAGGED</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{violations}</div>
          <div className="text-sm text-gray-600">Potential violations</div>
          <div className="text-xs text-gray-500 mt-1">Under investigation</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
              <TrendingUp className="w-3 h-3" />
              3.5%
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">${(avgPay / 1000).toFixed(0)}K</div>
          <div className="text-sm text-gray-600">Avg pay per crew (YTD)</div>
          <div className="text-xs text-gray-500 mt-1">Up from last year</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Scale className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-xs text-purple-600 font-medium">ACTIVE</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">12</div>
          <div className="text-sm text-gray-600">Grievances filed</div>
          <div className="text-xs text-gray-500 mt-1">Q4 2024</div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-amber-50 to-red-50 rounded-lg p-6 border border-amber-200">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-600 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Flagged Contract Violations</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-red-500">
                <div className="text-sm font-semibold text-red-900 mb-1">Duty Time Exceeded</div>
                <div className="text-xs text-gray-600 mb-2">CM230 crew on Nov 15 logged 12.3hrs (limit: 14hrs)</div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">Under Review</span>
                  <span className="text-xs text-gray-500">High Priority</span>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-red-500">
                <div className="text-sm font-semibold text-red-900 mb-1">Rest Period Violation</div>
                <div className="text-xs text-gray-600 mb-2">Reserve crew CM006 called with less than 10hrs rest on Nov 18</div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Confirmed</span>
                  <span className="text-xs text-gray-500">High Priority</span>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-amber-500">
                <div className="text-sm font-semibold text-amber-900 mb-1">Per Diem Short Payment</div>
                <div className="text-xs text-gray-600 mb-2">CM002 international overnight on Nov 12 - paid domestic rate</div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Resolved</span>
                  <span className="text-xs text-gray-500">Medium Priority</span>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-amber-500">
                <div className="text-sm font-semibold text-amber-900 mb-1">Unauthorized Day Off Training</div>
                <div className="text-xs text-gray-600 mb-2">FA015 scheduled training on contracted day off on Nov 20</div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">Under Review</span>
                  <span className="text-xs text-gray-500">Low Priority</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-blue-600" />
          Per Diem Rates by Base - November
        </h3>
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-medium text-gray-700">BUR Base</div>
                <div className="text-xs text-gray-500">59% international rate trips</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">$82</div>
                <div className="text-xs text-gray-600">avg/day</div>
              </div>
            </div>
            <div className="bg-gray-100 rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Domestic rate ($75)</span>
                <span className="font-medium">41% of trips</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">International rate ($95)</span>
                <span className="font-medium">59% of trips</span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-medium text-gray-700">PTY Base</div>
                <div className="text-xs text-gray-500">67% international rate trips</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">$88</div>
                <div className="text-xs text-gray-600">avg/day</div>
              </div>
            </div>
            <div className="bg-gray-100 rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Domestic rate ($75)</span>
                <span className="font-medium">33% of trips</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">International rate ($95)</span>
                <span className="font-medium">67% of trips</span>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div className="font-semibold text-green-900">Contract Compliance</div>
            </div>
            <div className="text-sm text-gray-700">
              100% compliance with minimum rates. Year-over-year increase: +$3/day (+3.5%)
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-600" />
          Duty Time Monitoring - Safety & Compliance
        </h3>
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-1" />
              <div className="flex-1">
                <div className="font-semibold text-amber-900 mb-1">2 Duty Time Concerns This Month</div>
                <div className="text-sm text-gray-700 mb-3">
                  While both instances were technically legal, they approached maximum limits and warrant review
                </div>
                <div className="space-y-2">
                  <div className="bg-white rounded p-3">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-medium text-gray-900">CM230 Crew - Nov 15</div>
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">Close Call</span>
                    </div>
                    <div className="text-sm text-gray-600">Duty time: 12.3 hours (limit: 14 hours)</div>
                    <div className="text-xs text-gray-500 mt-1">Legal but flagged for monitoring</div>
                  </div>
                  <div className="bg-white rounded p-3">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-medium text-gray-900">CM450 Crew - Nov 22 (Cancelled)</div>
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Would Have Violated</span>
                    </div>
                    <div className="text-sm text-gray-600">Projected duty time: 14.2 hours (would have exceeded limit)</div>
                    <div className="text-xs text-gray-500 mt-1">Prevented by cancellation</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="font-semibold text-blue-900 mb-2">Recommendation</div>
            <div className="text-sm text-gray-700">
              Review scheduling buffer for delay recovery. Close calls increasing trend suggests need for additional safety margins in planning.
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Scale className="w-5 h-5 text-purple-600" />
          Recent Grievances - Q4 2024
        </h3>
        <div className="space-y-3">
          {[
            { id: 'GRV-2024-089', member: 'Sarah Martinez', issue: 'Denied vacation request', status: 'Under Review', priority: 'Medium' },
            { id: 'GRV-2024-090', member: 'David Park', issue: 'Incorrectly calculated premium pay', status: 'Resolved', priority: 'Low' },
            { id: 'GRV-2024-091', member: 'Emily Rodriguez', issue: 'Training scheduled on day off', status: 'In Mediation', priority: 'High' }
          ].map((grievance) => (
            <div key={grievance.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="p-2 bg-purple-100 rounded">
                <Scale className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{grievance.id}</div>
                <div className="text-sm text-gray-600">{grievance.member} - {grievance.issue}</div>
              </div>
              <div className="text-right">
                <div className={`text-xs px-2 py-1 rounded ${
                  grievance.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                  grievance.status === 'Under Review' ? 'bg-amber-100 text-amber-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {grievance.status}
                </div>
                <div className="text-xs text-gray-500 mt-1">{grievance.priority} Priority</div>
              </div>
              <button className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors">
                Details
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <button className="px-6 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-lg shadow-md transition-colors text-left">
          <AlertTriangle className="w-6 h-6 text-red-600 mb-2" />
          <div className="font-semibold">Violations</div>
          <div className="text-xs text-gray-600">Contract monitoring</div>
        </button>

        <button className="px-6 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-lg shadow-md transition-colors text-left">
          <Scale className="w-6 h-6 text-purple-600 mb-2" />
          <div className="font-semibold">Grievances</div>
          <div className="text-xs text-gray-600">Member advocacy</div>
        </button>

        <button className="px-6 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-lg shadow-md transition-colors text-left">
          <DollarSign className="w-6 h-6 text-green-600 mb-2" />
          <div className="font-semibold">Pay Analysis</div>
          <div className="text-xs text-gray-600">Compensation tracking</div>
        </button>

        <button className="px-6 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-lg shadow-md transition-colors text-left">
          <CheckCircle className="w-6 h-6 text-blue-600 mb-2" />
          <div className="font-semibold">Compliance</div>
          <div className="text-xs text-gray-600">Contract adherence</div>
        </button>
      </div>
    </div>
  );
}
