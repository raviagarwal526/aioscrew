import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Users, CheckCircle, AlertTriangle, RefreshCw, Download } from 'lucide-react';

interface RosterBuilderViewProps {
  onBack: () => void;
}

interface RosterVersion {
  versionId: number;
  rosterPeriodStart: string;
  rosterPeriodEnd: string;
  versionName: string;
  versionType: string;
  totalViolations: number;
  totalCost: number;
  isActive: boolean;
}

export default function RosterBuilderView({ onBack }: RosterBuilderViewProps) {
  const [periodStart, setPeriodStart] = useState<string>('');
  const [periodEnd, setPeriodEnd] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [versions, setVersions] = useState<RosterVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);

  useEffect(() => {
    // Set default dates (next month)
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const start = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1);
    const end = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0);
    
    setPeriodStart(start.toISOString().split('T')[0]);
    setPeriodEnd(end.toISOString().split('T')[0]);
    
    loadVersions(start.toISOString().split('T')[0], end.toISOString().split('T')[0]);
  }, []);

  const loadVersions = async (start: string, end: string) => {
    try {
      const res = await fetch(`/api/crew-scheduling/roster/versions?periodStart=${start}&periodEnd=${end}`);
      const data = await res.json();
      setVersions(data);
    } catch (error) {
      console.error('Error loading versions:', error);
    }
  };

  const handleGenerate = async () => {
    if (!periodStart || !periodEnd) {
      alert('Please select a period');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch('/api/crew-scheduling/roster/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          periodStart,
          periodEnd,
          optimizationObjectives: {
            cost: 'minimize',
            utilization: 'maximize',
            fairness: 'balance'
          }
        })
      });

      if (res.ok) {
        const result = await res.json();
        alert(`Roster generated successfully! Version ID: ${result.versionId}, Violations: ${result.violations}`);
        loadVersions(periodStart, periodEnd);
      } else {
        throw new Error('Failed to generate roster');
      }
    } catch (error) {
      console.error('Error generating roster:', error);
      alert('Error generating roster');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async (versionId: number) => {
    if (!confirm('Publish this roster version? This will make it active and notify crew.')) {
      return;
    }

    try {
      const res = await fetch('/api/crew-scheduling/roster/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionId })
      });

      if (res.ok) {
        alert('Roster published successfully!');
        loadVersions(periodStart, periodEnd);
      } else {
        throw new Error('Failed to publish roster');
      }
    } catch (error) {
      console.error('Error publishing roster:', error);
      alert('Error publishing roster');
    }
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
            <h2 className="text-2xl font-bold text-gray-900">Roster Builder</h2>
            <p className="text-gray-600">Generate and manage crew rosters</p>
          </div>
        </div>
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
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !periodStart || !periodEnd}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4" />
                Generate Roster
              </>
            )}
          </button>
          {periodStart && periodEnd && (
            <button
              onClick={() => loadVersions(periodStart, periodEnd)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          )}
        </div>
      </div>

      {/* Roster Versions */}
      {versions.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Roster Versions</h3>
          <div className="space-y-3">
            {versions.map((version) => (
              <div
                key={version.versionId}
                className={`p-4 rounded-lg border-2 ${
                  version.isActive
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {version.versionName || `Version ${version.versionId}`}
                      </h4>
                      {version.isActive && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          Active
                        </span>
                      )}
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        version.versionType === 'published'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {version.versionType}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(version.rosterPeriodStart).toLocaleDateString()} -{' '}
                      {new Date(version.rosterPeriodEnd).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1 text-sm">
                        {version.totalViolations === 0 ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                        )}
                        <span className={version.totalViolations === 0 ? 'text-green-600' : 'text-red-600'}>
                          {version.totalViolations} violations
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Cost: ${version.totalCost.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!version.isActive && version.versionType === 'draft' && (
                      <button
                        onClick={() => handlePublish(version.versionId)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                      >
                        Publish
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedVersion(version.versionId)}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {versions.length === 0 && periodStart && periodEnd && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Roster Versions</h3>
          <p className="text-gray-600 mb-4">
            Generate a roster for the selected period to get started.
          </p>
        </div>
      )}
    </div>
  );
}
