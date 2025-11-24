import { useState, useEffect } from 'react';
import { ArrowLeft, Shield, Download, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';

interface ComplianceReportsViewProps {
  onBack: () => void;
}

interface ComplianceReport {
  periodStart: string;
  periodEnd: string;
  totalEvaluations: number;
  totalViolations: number;
  violationRate: number;
  violations: Array<{
    evaluationId: number;
    crewId: string;
    crewName: string;
    base: string;
    ruleName: string;
    ruleType: string;
    currentValue: number;
    limitValue: number;
    violationSeverity: string;
    evaluationDate: string;
  }>;
}

export default function ComplianceReportsView({ onBack }: ComplianceReportsViewProps) {
  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [periodStart, setPeriodStart] = useState<string>('');
  const [periodEnd, setPeriodEnd] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Set default to current month
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setPeriodStart(start.toISOString().split('T')[0]);
    setPeriodEnd(end.toISOString().split('T')[0]);
  }, []);

  const loadReport = async () => {
    if (!periodStart || !periodEnd) return;

    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/crew-scheduling/reports/compliance?periodStart=${periodStart}&periodEnd=${periodEnd}`
      );
      const data = await res.json();
      setReport(data);
    } catch (error) {
      console.error('Error loading report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (periodStart && periodEnd) {
      loadReport();
    }
  }, [periodStart, periodEnd]);

  const severityColors: Record<string, string> = {
    critical: 'bg-red-100 text-red-700',
    major: 'bg-orange-100 text-orange-700',
    minor: 'bg-amber-100 text-amber-700',
    warning: 'bg-blue-100 text-blue-700'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Compliance Reports</h2>
            <p className="text-gray-600">Regulatory compliance analytics and reporting</p>
          </div>
        </div>
        {report && (
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        )}
      </div>

      {/* Period Selection */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Select Period</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={periodStart}
              onChange={(e) => {
                setPeriodStart(e.target.value);
                if (periodEnd && e.target.value > periodEnd) {
                  setPeriodEnd(e.target.value);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              min={periodStart}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Report Summary */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Generating report...</p>
        </div>
      ) : report ? (
        <>
          {/* Summary Cards */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
              <div className="text-sm text-gray-600 mb-1">Total Evaluations</div>
              <div className="text-2xl font-bold text-gray-900">{report.totalEvaluations}</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
              <div className="text-sm text-gray-600 mb-1">Violations</div>
              <div className="text-2xl font-bold text-gray-900">{report.totalViolations}</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500">
              <div className="text-sm text-gray-600 mb-1">Violation Rate</div>
              <div className="text-2xl font-bold text-gray-900">
                {(report.violationRate * 100).toFixed(1)}%
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
              <div className="text-sm text-gray-600 mb-1">Compliance Rate</div>
              <div className="text-2xl font-bold text-gray-900">
                {((1 - report.violationRate) * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Violations List */}
          {report.violations.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Rule Violations ({report.violations.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Crew</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rule</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Current</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Limit</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {report.violations.map((violation) => (
                      <tr key={violation.evaluationId} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">
                          <div className="font-medium text-gray-900">{violation.crewName}</div>
                          <div className="text-gray-500">{violation.base}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{violation.ruleName}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-red-600">
                          {violation.currentValue.toFixed(1)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {violation.limitValue.toFixed(1)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            severityColors[violation.violationSeverity] || severityColors.warning
                          }`}>
                            {violation.violationSeverity}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(violation.evaluationDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Shield className="w-16 h-16 text-green-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Violations Found</h3>
              <p className="text-gray-600">
                All crew members are compliant with regulatory rules for this period.
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Report Data</h3>
          <p className="text-gray-600">
            Select a period and click "Generate Report" to view compliance data.
          </p>
        </div>
      )}
    </div>
  );
}
