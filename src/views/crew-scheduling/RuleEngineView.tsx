import { useState, useEffect } from 'react';
import { ArrowLeft, Shield, Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface RuleEngineViewProps {
  onBack: () => void;
}

interface RegulatoryRule {
  ruleId: number;
  ruleName: string;
  ruleType: string;
  jurisdiction: string;
  limitValue: number;
  limitUnit: string;
}

export default function RuleEngineView({ onBack }: RuleEngineViewProps) {
  const [rules, setRules] = useState<RegulatoryRule[]>([]);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>('FAA_DOMESTIC');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRules();
  }, [selectedJurisdiction]);

  const loadRules = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/crew-scheduling/rules?jurisdiction=${selectedJurisdiction}`);
      const data = await res.json();
      setRules(data);
    } catch (error) {
      console.error('Error loading rules:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const ruleTypes: Record<string, { label: string; color: string }> = {
    flight_time: { label: 'Flight Time', color: 'blue' },
    duty_time: { label: 'Duty Time', color: 'green' },
    rest: { label: 'Rest Period', color: 'purple' },
    annual: { label: 'Annual Limit', color: 'indigo' },
    monthly: { label: 'Monthly Limit', color: 'amber' },
    weekly: { label: '7-Day Limit', color: 'red' }
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
            <h2 className="text-2xl font-bold text-gray-900">Regulatory Rule Engine</h2>
            <p className="text-gray-600">Configure compliance rules and regulations</p>
          </div>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Rule
        </button>
      </div>

      {/* Jurisdiction Filter */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Jurisdiction
        </label>
        <select
          value={selectedJurisdiction}
          onChange={(e) => setSelectedJurisdiction(e.target.value)}
          className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="FAA_DOMESTIC">FAA Domestic (14 CFR §121.471)</option>
          <option value="FAA_INTERNATIONAL">FAA International</option>
          <option value="EASA">EASA</option>
          <option value="CUSTOM">Custom Rules</option>
        </select>
      </div>

      {/* Rules List */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading rules...</p>
        </div>
      ) : rules.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Rules Configured</h3>
          <p className="text-gray-600 mb-4">
            Add regulatory rules for {selectedJurisdiction} to enable compliance checking.
          </p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Add First Rule
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Active Rules</h3>
          <div className="space-y-3">
            {rules.map((rule) => {
              const ruleType = ruleTypes[rule.ruleType] || { label: rule.ruleType, color: 'gray' };
              return (
                <div
                  key={rule.ruleId}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{rule.ruleName}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full bg-${ruleType.color}-100 text-${ruleType.color}-700`}>
                          {ruleType.label}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                          {rule.jurisdiction}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Limit: <span className="font-semibold">{rule.limitValue} {rule.limitUnit}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Default FAA Rules Info */}
      {selectedJurisdiction === 'FAA_DOMESTIC' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            FAA Domestic Rules (14 CFR §121.471)
          </h3>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 text-blue-600" />
              <div>
                <strong>Annual Limit:</strong> 1,000 hours per calendar year
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 text-blue-600" />
              <div>
                <strong>Monthly Limit:</strong> 100 hours per calendar month
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 text-blue-600" />
              <div>
                <strong>7-Day Limit:</strong> 30 hours in any 7 consecutive days
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 text-blue-600" />
              <div>
                <strong>Minimum Rest:</strong> 8 hours between duty periods (9-11 hours based on scheduled flight time)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
