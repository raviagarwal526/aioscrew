import { useState, useEffect } from 'react';
import {
  Database, Users, Plane, DollarSign, AlertTriangle, Calendar,
  Globe, Settings, Play, CheckCircle, Loader, TrendingUp,
  Award, Clock, Briefcase, Zap, X, ChevronDown, ChevronUp,
  Brain, Sparkles, Trash2, ShieldAlert, RefreshCcw
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { TestDataAgentResponse } from '../services/dataGenerationService';

interface DataGenerationConfig {
  // Crew configuration
  totalCrewMembers: number;
  captains: number;
  firstOfficers: number;
  seniorFA: number;
  juniorFA: number;

  // Time range
  yearsOfHistory: number;
  startDate: string;

  // Trip configuration
  averageTripsPerMonth: number;
  internationalRatio: number; // 0-1

  // Claim patterns
  claimFrequency: number; // claims per crew member per year
  claimTypes: {
    internationalPremium: number;
    perDiem: number;
    holidayPay: number;
    overtime: number;
    layoverPremium: number;
    training: number;
    leadPremium: number;
    deadhead: number;
    other: number;
  };

  // Operational patterns
  violationRate: number; // violations per 1000 trips
  disruptionRate: number; // disruptions per 1000 trips

  // Bases and routes
  bases: string[];
  routes: string[];
  aircraftTypes: string[];

  // Realism settings
  useRealisticDistributions: boolean;
  useSeasonalPatterns: boolean;
  generateEdgeCases: boolean;
}

interface ScenarioPreset {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  config: Partial<DataGenerationConfig>;
  highlights: string[];
}

interface LLMOption {
  id: string;
  name: string;
  provider: 'ollama' | 'anthropic';
  model?: string;
  description: string;
  cost: string;
  latency: string;
  tier: 'free' | 'paid';
  default?: boolean;
  caution?: string;
}

interface GenerationSuccessSummary {
  success: true;
  crewMembers: number;
  trips: number;
  claims: number;
  violations: number;
  dataPoints: number;
  timestamp: string;
  aiInsights?: TestDataAgentResponse;
}

interface GenerationFailureSummary {
  success: false;
  error: string;
}

type GenerationResult = GenerationSuccessSummary | GenerationFailureSummary;

const LLM_OPTIONS: LLMOption[] = [
  {
    id: 'ollama-local',
    name: 'Ollama Local (Default)',
    provider: 'ollama',
    model: 'llama3.2:latest',
    description: 'Zero-cost local inference. Ideal for most test data creation flows.',
    cost: '$0 (local GPU)',
    latency: '2-5s',
    tier: 'free',
    default: true
  },
  {
    id: 'claude-sonnet',
    name: 'Claude Sonnet (Paid)',
    provider: 'anthropic',
    model: 'claude-sonnet-4-5-20250929',
    description: 'Balanced paid option when you need faster throughput or Ollama is unavailable.',
    cost: '$3 in / $15 out per 1M tokens',
    latency: '5-7s',
    tier: 'paid'
  },
  {
    id: 'claude-opus',
    name: 'Claude Opus (Premium)',
    provider: 'anthropic',
    model: 'claude-opus-4-20250514',
    description: 'Highest-fidelity reasoning for massive or highly nuanced scenario design.',
    cost: '$15 in / $75 out per 1M tokens',
    latency: '9-12s',
    tier: 'paid',
    caution: 'Use only when you truly need exhaustive reasoning.'
  }
];

const MASSIVE_DATA_THRESHOLD = 250000;

const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: 'normal',
    name: 'Normal Operations',
    description: 'Balanced, realistic airline operations with typical patterns',
    icon: Plane,
    config: {
      totalCrewMembers: 500,
      averageTripsPerMonth: 15,
      internationalRatio: 0.3,
      claimFrequency: 4,
      violationRate: 2,
      disruptionRate: 5,
      useRealisticDistributions: true,
      useSeasonalPatterns: true
    },
    highlights: ['Balanced workload', 'Typical claim patterns', 'Seasonal variations']
  },
  {
    id: 'stress_test',
    name: 'Stress Test - High Volume',
    description: 'Maximum crew, high trip volume, many claims for AI system testing',
    icon: Zap,
    config: {
      totalCrewMembers: 1000,
      averageTripsPerMonth: 22,
      internationalRatio: 0.5,
      claimFrequency: 8,
      violationRate: 5,
      disruptionRate: 12,
      generateEdgeCases: true
    },
    highlights: ['1000 crew members', 'High claim volume', 'Edge cases included']
  },
  {
    id: 'international_expansion',
    name: 'International Expansion',
    description: 'Heavy international operations with premium claims',
    icon: Globe,
    config: {
      totalCrewMembers: 750,
      averageTripsPerMonth: 18,
      internationalRatio: 0.8,
      claimFrequency: 6,
      claimTypes: {
        internationalPremium: 40,
        perDiem: 30,
        holidayPay: 5,
        overtime: 10,
        layoverPremium: 8,
        training: 2,
        leadPremium: 3,
        deadhead: 1,
        other: 1
      }
    },
    highlights: ['80% international flights', 'High premium claims', 'Extended layovers']
  },
  {
    id: 'holiday_season',
    name: 'Holiday Season Rush',
    description: 'Peak holiday travel with overtime and holiday pay claims',
    icon: Calendar,
    config: {
      totalCrewMembers: 600,
      averageTripsPerMonth: 20,
      claimFrequency: 7,
      claimTypes: {
        internationalPremium: 25,
        perDiem: 20,
        holidayPay: 20,
        overtime: 20,
        layoverPremium: 5,
        training: 2,
        leadPremium: 5,
        deadhead: 2,
        other: 1
      },
      useSeasonalPatterns: true
    },
    highlights: ['Peak travel period', 'High holiday pay', 'Increased overtime']
  },
  {
    id: 'compliance_audit',
    name: 'Compliance Audit Period',
    description: 'Increased violations and edge cases for compliance testing',
    icon: AlertTriangle,
    config: {
      totalCrewMembers: 400,
      averageTripsPerMonth: 16,
      violationRate: 15,
      disruptionRate: 20,
      generateEdgeCases: true,
      claimFrequency: 5
    },
    highlights: ['High violation rate', 'Compliance edge cases', 'Contract boundary testing']
  },
  {
    id: 'training_overhaul',
    name: 'Training & Development',
    description: 'Heavy training period with training pay claims',
    icon: Award,
    config: {
      totalCrewMembers: 500,
      averageTripsPerMonth: 12,
      claimFrequency: 5,
      claimTypes: {
        internationalPremium: 20,
        perDiem: 20,
        holidayPay: 5,
        overtime: 5,
        layoverPremium: 5,
        training: 30,
        leadPremium: 10,
        deadhead: 3,
        other: 2
      }
    },
    highlights: ['High training claims', 'Lead instructor premiums', 'New qualifications']
  },
  {
    id: 'crew_shortage',
    name: 'Crew Shortage Crisis',
    description: 'Understaffed period with excessive overtime and deadheads',
    icon: Users,
    config: {
      totalCrewMembers: 300,
      averageTripsPerMonth: 25,
      claimFrequency: 10,
      claimTypes: {
        internationalPremium: 20,
        perDiem: 15,
        holidayPay: 5,
        overtime: 30,
        layoverPremium: 10,
        training: 2,
        leadPremium: 3,
        deadhead: 10,
        other: 5
      }
    },
    highlights: ['Heavy overtime', 'Frequent deadheads', 'Crew fatigue patterns']
  },
  {
    id: 'contract_negotiation',
    name: 'Contract Negotiation',
    description: 'Mix of boundary-testing claims and grievances',
    icon: Briefcase,
    config: {
      totalCrewMembers: 550,
      claimFrequency: 6,
      violationRate: 8,
      generateEdgeCases: true,
      claimTypes: {
        internationalPremium: 20,
        perDiem: 20,
        holidayPay: 10,
        overtime: 15,
        layoverPremium: 10,
        training: 5,
        leadPremium: 5,
        deadhead: 5,
        other: 10
      }
    },
    highlights: ['Edge case claims', 'Contract boundary tests', 'Dispute scenarios']
  }
];

const DEFAULT_CONFIG: DataGenerationConfig = {
  totalCrewMembers: 500,
  captains: 25,
  firstOfficers: 25,
  seniorFA: 25,
  juniorFA: 25,
  yearsOfHistory: 10,
  startDate: '2015-01-01',
  averageTripsPerMonth: 15,
  internationalRatio: 0.3,
  claimFrequency: 4,
  claimTypes: {
    internationalPremium: 25,
    perDiem: 25,
    holidayPay: 10,
    overtime: 15,
    layoverPremium: 8,
    training: 5,
    leadPremium: 5,
    deadhead: 4,
    other: 3
  },
  violationRate: 2,
  disruptionRate: 5,
  bases: ['PTY', 'GUA', 'MIA', 'MEX'],
  routes: ['PTY-GUA', 'PTY-MIA', 'PTY-MEX', 'GUA-MIA', 'MIA-MEX'],
  aircraftTypes: ['737-800', '737-MAX8', 'E190'],
  useRealisticDistributions: true,
  useSeasonalPatterns: true,
  generateEdgeCases: false
};

export default function DataGenerationCard() {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [config, setConfig] = useState<DataGenerationConfig>(DEFAULT_CONFIG);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
    const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);
  const [selectedLLMId, setSelectedLLMId] = useState<string>(
    LLM_OPTIONS.find((option) => option.default)?.id || LLM_OPTIONS[0].id
  );
  const [confirmPaidUsage, setConfirmPaidUsage] = useState(false);
  const [cleanupStatus, setCleanupStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isCleaning, setIsCleaning] = useState(false);

  const handleScenarioSelect = (scenario: ScenarioPreset) => {
    setSelectedScenario(scenario.id);
    setConfig({ ...DEFAULT_CONFIG, ...scenario.config });
  };

  const calculateGenerationStats = () => {
    const totalTrips = config.totalCrewMembers * config.averageTripsPerMonth * 12 * config.yearsOfHistory;
    const totalClaims = config.totalCrewMembers * config.claimFrequency * config.yearsOfHistory;
    const totalViolations = Math.floor((totalTrips / 1000) * config.violationRate);
    const totalDisruptions = Math.floor((totalTrips / 1000) * config.disruptionRate);

    return {
      crewMembers: config.totalCrewMembers,
      trips: totalTrips,
      claims: totalClaims,
      violations: totalViolations,
      disruptions: totalDisruptions,
      timeSpan: `${config.yearsOfHistory} years`,
      dataPoints: config.totalCrewMembers + totalTrips + totalClaims + totalViolations + totalDisruptions
    };
  };

  const stats = calculateGenerationStats();
  const selectedLLM = LLM_OPTIONS.find((option) => option.id === selectedLLMId) || LLM_OPTIONS[0];
  const isMassiveRun = stats.dataPoints >= MASSIVE_DATA_THRESHOLD;
  const requiresPaidConfirmation = selectedLLM.tier === 'paid' && isMassiveRun;

  useEffect(() => {
    if (!requiresPaidConfirmation) {
      setConfirmPaidUsage(false);
    }
  }, [requiresPaidConfirmation, selectedLLMId]);

    const handleGenerate = async () => {
      if (requiresPaidConfirmation && !confirmPaidUsage) {
        return;
      }

      setIsGenerating(true);
      setProgress(0);
      setGenerationResult(null);
      setAiError(null);

    try {
      // Step 1: Import generation service
      setProgress(10);
      const { dataGenerationService } = await import('../services/dataGenerationService');

      // Step 2: Generate crew members
      setProgress(20);
      await new Promise(resolve => setTimeout(resolve, 300));

      // Step 3: Generate trips
      setProgress(40);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 4: Generate claims
      setProgress(60);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 5: Generate violations and disruptions
      setProgress(75);
      await new Promise(resolve => setTimeout(resolve, 300));

        // Step 6: Persist to database (simulated)
        setProgress(85);
        const data = await dataGenerationService.generate(config);
        await dataGenerationService.persistToDatabase(data);

        // Step 7: Request AI blueprint (Ollama-first)
        setProgress(92);
        let aiInsights: TestDataAgentResponse | null = null;
        try {
          const llmPreference =
            selectedLLM.provider === 'ollama'
              ? { provider: 'ollama' as const }
              : {
                  provider: 'anthropic' as const,
                  model: selectedLLM.model,
                  skipOllama: true
                };
          aiInsights = await dataGenerationService.requestLLMBlueprint(
            config,
            selectedScenario,
            llmPreference
          );
        } catch (aiErr) {
          console.warn('AI blueprint unavailable:', aiErr);
          setAiError(aiErr instanceof Error ? aiErr.message : 'Unable to reach AI blueprint service');
        }

        // Step 8: Complete
        setProgress(100);
      const stats = {
        crewMembers: data.crewMembers.length,
        trips: data.trips.length,
        claims: data.claims.length,
        violations: Math.floor((data.trips.length / 1000) * config.violationRate),
        disruptions: Math.floor((data.trips.length / 1000) * config.disruptionRate),
        timeSpan: `${config.yearsOfHistory} years`,
        dataPoints: data.crewMembers.length + data.trips.length + data.claims.length
      };

        setGenerationResult({
          success: true,
          ...stats,
          timestamp: new Date().toISOString(),
          aiInsights: aiInsights ?? undefined
        });
    } catch (error) {
      console.error('Generation error:', error);
      setGenerationResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCleanup = async () => {
    setIsCleaning(true);
    setCleanupStatus(null);
    const result = await dataGenerationService.cleanupTestData(true);
    setIsCleaning(false);

    if (result.success) {
      setGenerationResult(null);
      setSelectedScenario(null);
      setConfig(DEFAULT_CONFIG);
      setShowPreview(false);
      setProgress(0);
      setSelectedLLMId(LLM_OPTIONS.find((option) => option.default)?.id || LLM_OPTIONS[0].id);
      setConfirmPaidUsage(false);
      dataGenerationService.clearBlueprintCache();
      setCleanupStatus({
        type: 'success',
        message: result.message || 'All generated test data has been cleared. Ready for a fresh run.'
      });
    } else {
      setCleanupStatus({
        type: 'error',
        message: result.message || 'Failed to clean up test data. Please verify the backend connection.'
      });
    }
  };

  const disableGenerate = isGenerating || (requiresPaidConfirmation && !confirmPaidUsage);
  const aiInsights = generationResult && generationResult.success ? generationResult.aiInsights : undefined;
  const aiPlan = aiInsights?.aiPlan;
  const aiMeta = aiInsights;
  const crewSamples = aiPlan?.datasetSamples?.crewMembers ?? [];
  const tripSamples = aiPlan?.datasetSamples?.trips ?? [];
  const claimSamples = aiPlan?.datasetSamples?.claims ?? [];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
            <Database className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Test Data Generator</h2>
            <p className="text-sm text-gray-600">Generate realistic crew, trip, and claim data for testing</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Scenario Presets */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Scenario Presets</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          {SCENARIO_PRESETS.map((scenario) => {
            const Icon = scenario.icon;
            const isSelected = selectedScenario === scenario.id;

            return (
              <button
                key={scenario.id}
                onClick={() => handleScenarioSelect(scenario)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${
                    isSelected ? 'bg-blue-500' : 'bg-gray-100'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      isSelected ? 'text-white' : 'text-gray-600'
                    }`} />
                  </div>
                  {isSelected && (
                    <CheckCircle className="w-5 h-5 text-blue-500 ml-auto" />
                  )}
                </div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">{scenario.name}</h4>
                <p className="text-xs text-gray-600">{scenario.description}</p>
              </button>
            );
          })}
        </div>

        {selectedScenario && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <span className="font-medium">Scenario highlights:</span>{' '}
                {SCENARIO_PRESETS.find(s => s.id === selectedScenario)?.highlights.join(' • ')}
              </div>
            </div>
          </div>
        )}
      </div>

        {/* Quick Stats Preview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-900">Crew Members</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">{stats.crewMembers.toLocaleString()}</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <Plane className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium text-green-900">Trips</span>
          </div>
          <div className="text-2xl font-bold text-green-900">{stats.trips.toLocaleString()}</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-medium text-purple-900">Claims</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">{stats.claims.toLocaleString()}</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-orange-600" />
            <span className="text-xs font-medium text-orange-900">Violations</span>
          </div>
          <div className="text-2xl font-bold text-orange-900">{stats.violations.toLocaleString()}</div>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-3 border border-teal-200">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-medium text-teal-900">Time Span</span>
          </div>
          <div className="text-2xl font-bold text-teal-900">{stats.timeSpan}</div>
        </div>
      </div>

        {/* LLM Selection */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Brain className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">LLM Routing Preferences</h3>
              <p className="text-sm text-gray-600">Pick the model before submitting test data creation.</p>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 space-y-3">
              <label className="text-sm font-medium text-gray-700">Preferred Provider</label>
              <select
                value={selectedLLMId}
                onChange={(e) => setSelectedLLMId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {LLM_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name} — {option.cost}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500">
                We cache AI blueprints for identical scenario + LLM combinations, so reruns with the same
                settings reuse previous insights instantly.
              </p>
              <div className="text-sm text-gray-700">
                <div className="font-semibold text-gray-900">Currently selected:</div>
                <div>
                  {selectedLLM.name}{' '}
                  <span className="text-xs text-gray-500">
                    ({selectedLLM.cost} • {selectedLLM.latency})
                  </span>
                </div>
              </div>
              {requiresPaidConfirmation ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-2 text-sm text-amber-900">
                  <div className="flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div>
                      You are requesting ~{stats.dataPoints.toLocaleString()} data points with a paid LLM.
                      Please confirm you want to incur potential costs before proceeding.
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-amber-900 font-medium">
                    <input
                      type="checkbox"
                      checked={confirmPaidUsage}
                      onChange={(e) => setConfirmPaidUsage(e.target.checked)}
                      className="w-4 h-4 text-amber-600"
                    />
                    Yes, continue with {selectedLLM.name} for this large run.
                  </label>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {selectedLLM.tier === 'free'
                      ? 'Ollama stays free and local for this run.'
                      : 'Paid LLM selected for a normal-sized batch.'}
                  </span>
                </div>
              )}
            </div>
            <div className="lg:w-80 space-y-3">
              {LLM_OPTIONS.map((option) => {
                const isSelected = option.id === selectedLLMId;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelectedLLMId(option.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-white shadow-sm'
                        : 'border-transparent bg-white hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900">{option.name}</p>
                        <p className="text-xs text-gray-500">{option.description}</p>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          option.tier === 'free'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {option.tier === 'free' ? 'Free' : 'Paid'}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 space-y-1">
                      <div>Cost: {option.cost}</div>
                      <div>Latency: {option.latency}</div>
                      {option.caution && (
                        <div className="text-amber-700">⚠ {option.caution}</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      {/* Advanced Configuration */}
      <div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          Advanced Configuration
        </button>

        {showAdvanced && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Crew Composition */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Crew Members
                </label>
                <input
                  type="number"
                  value={config.totalCrewMembers}
                  onChange={(e) => setConfig({ ...config, totalCrewMembers: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of History
                </label>
                <input
                  type="number"
                  value={config.yearsOfHistory}
                  onChange={(e) => setConfig({ ...config, yearsOfHistory: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Avg Trips/Month per Crew
                </label>
                <input
                  type="number"
                  value={config.averageTripsPerMonth}
                  onChange={(e) => setConfig({ ...config, averageTripsPerMonth: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  International Ratio (0-1)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={config.internationalRatio}
                  onChange={(e) => setConfig({ ...config, internationalRatio: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Claims per Crew/Year
                </label>
                <input
                  type="number"
                  value={config.claimFrequency}
                  onChange={(e) => setConfig({ ...config, claimFrequency: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Violation Rate (per 1000 trips)
                </label>
                <input
                  type="number"
                  value={config.violationRate}
                  onChange={(e) => setConfig({ ...config, violationRate: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Realism Options */}
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.useRealisticDistributions}
                  onChange={(e) => setConfig({ ...config, useRealisticDistributions: e.target.checked })}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">Use realistic statistical distributions (seniority, base assignment)</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.useSeasonalPatterns}
                  onChange={(e) => setConfig({ ...config, useSeasonalPatterns: e.target.checked })}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">Apply seasonal patterns (holiday travel, summer peaks)</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.generateEdgeCases}
                  onChange={(e) => setConfig({ ...config, generateEdgeCases: e.target.checked })}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">Generate edge cases (boundary claims, unusual violations)</span>
              </label>
            </div>
          </div>
        )}
      </div>

        {/* Generation Actions */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <button
          onClick={handleGenerate}
              disabled={disableGenerate}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all"
        >
          {isGenerating ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Generating... {progress.toFixed(0)}%
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Generate Test Data
            </>
          )}
        </button>

        <button
          onClick={() => setShowPreview(!showPreview)}
          className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-all"
        >
          Preview
        </button>

            <button
              onClick={handleCleanup}
              disabled={isGenerating || isCleaning}
              className="px-6 py-3 border-2 border-red-200 text-red-700 rounded-lg hover:bg-red-50 font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isCleaning ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Cleaning...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Clean Test Data
                </>
              )}
            </button>
          </div>
          {cleanupStatus && (
            <div
              className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 border ${
                cleanupStatus.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              {cleanupStatus.type === 'success' ? <RefreshCcw className="w-4 h-4" /> : <X className="w-4 h-4" />}
              <span>{cleanupStatus.message}</span>
            </div>
          )}
      </div>

      {/* Progress Bar */}
      {isGenerating && (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 text-center">
            Generating realistic crew operations data...
          </p>
        </div>
      )}

      {/* Generation Result */}
        {generationResult && (
          <div
            className={`p-4 rounded-lg border-2 ${
              generationResult.success
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-start gap-3">
              {generationResult.success ? (
                <div className="w-full">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-green-900 mb-2">Data Generated Successfully!</h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                        <div>
                          <span className="text-green-700">Crew:</span>
                          <span className="font-semibold text-green-900 ml-1">{generationResult.crewMembers.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-green-700">Trips:</span>
                          <span className="font-semibold text-green-900 ml-1">{generationResult.trips.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-green-700">Claims:</span>
                          <span className="font-semibold text-green-900 ml-1">{generationResult.claims.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-green-700">Violations:</span>
                          <span className="font-semibold text-green-900 ml-1">{generationResult.violations.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-green-700">Total:</span>
                          <span className="font-semibold text-green-900 ml-1">{generationResult.dataPoints.toLocaleString()}</span>
                        </div>
                      </div>
                      <p className="text-xs text-green-700 mt-2">
                        Generated at {new Date(generationResult.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {aiMeta && aiPlan && (
                    <div className="mt-4 p-4 bg-white border border-green-100 rounded-lg space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">
                            AI Blueprint (Ollama-first)
                          </p>
                          <p className="text-sm text-gray-700 mt-1">{aiPlan.summary}</p>
                        </div>
                        <div className="text-xs text-gray-500 space-y-1">
                          <div><span className="font-semibold text-gray-700">Provider:</span> {aiMeta.provider}</div>
                          <div><span className="font-semibold text-gray-700">Model:</span> {aiMeta.model}</div>
                          <div><span className="font-semibold text-gray-700">Tokens:</span> {aiMeta.tokensUsed?.toLocaleString?.() || '—'}</div>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Recommended Steps</h5>
                          <ul className="space-y-1 text-sm text-gray-700">
                            {aiPlan.recommendedSteps?.map((step: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-green-500 mt-0.5">•</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">QA Checklist</h5>
                          <ul className="space-y-1 text-sm text-gray-700">
                            {aiPlan.qaChecklist?.map((item: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-blue-500 mt-0.5">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-3 gap-3">
                        <div className="bg-green-50 rounded-lg p-3">
                          <h6 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                            Crew Samples
                          </h6>
                          <ul className="space-y-1 text-xs text-gray-700">
                            {crewSamples.slice(0, 3).map((crew, idx) => (
                              <li key={`${crew.name}-${idx}`}>
                                <span className="font-semibold text-gray-900">{crew.name}</span> — {crew.role} ({crew.base})
                              </li>
                            ))}
                            {crewSamples.length === 0 && <li>No samples provided</li>}
                          </ul>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-3">
                          <h6 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                            Trip Samples
                          </h6>
                          <ul className="space-y-1 text-xs text-gray-700">
                            {tripSamples.slice(0, 3).map((trip, idx) => (
                              <li key={`${trip.route}-${idx}`}>
                                <span className="font-semibold text-gray-900">{trip.route}</span> ({trip.flightNumber}) — {trip.seasonality}
                              </li>
                            ))}
                            {tripSamples.length === 0 && <li>No samples provided</li>}
                          </ul>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-3">
                          <h6 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                            Claim Samples
                          </h6>
                          <ul className="space-y-1 text-xs text-gray-700">
                            {claimSamples.slice(0, 3).map((claim, idx) => (
                              <li key={`${claim.claimType}-${idx}`}>
                                <span className="font-semibold text-gray-900">{claim.claimType}</span> — {claim.amountHint}
                              </li>
                            ))}
                            {claimSamples.length === 0 && <li>No samples provided</li>}
                          </ul>
                        </div>
                      </div>
                      {(aiPlan.riskAlerts?.length || aiMeta.warning) && (
                        <div className="space-y-2">
                          {aiPlan.riskAlerts?.length > 0 && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-900">
                              <span className="font-semibold">Risk Alerts:</span>{' '}
                              {aiPlan.riskAlerts.join(' • ')}
                            </div>
                          )}
                          {aiMeta.warning && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-900">
                              {aiMeta.warning}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {aiError && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
                      AI blueprint unavailable: {aiError}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-900 mb-1">Generation Failed</h4>
                    <p className="text-sm text-red-700">{generationResult.error}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

      {/* Preview Panel */}
      {showPreview && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3">Generation Preview</h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total data points:</span>
              <span className="font-semibold">{stats.dataPoints.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date range:</span>
              <span className="font-semibold">
                {config.startDate} to {new Date().toISOString().split('T')[0]}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">International flights:</span>
              <span className="font-semibold">{(config.internationalRatio * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Estimated generation time:</span>
              <span className="font-semibold">~{Math.ceil(stats.dataPoints / 10000)} minutes</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
