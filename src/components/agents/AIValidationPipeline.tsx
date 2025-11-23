import { useState } from 'react';
import { Brain, CheckCircle2, Clock, Info, Sparkles, Zap } from 'lucide-react';

interface AgentStepProps {
  name: string;
  icon: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  duration?: number;
  description: string;
}

const AgentStep = ({ name, icon, status, duration, description }: AgentStepProps) => {
  const statusColors = {
    pending: 'bg-gray-100 text-gray-400 border-gray-300',
    running: 'bg-blue-50 text-blue-600 border-blue-400 animate-pulse',
    completed: 'bg-green-50 text-green-600 border-green-500',
    error: 'bg-red-50 text-red-600 border-red-500'
  };

  const iconMap: Record<string, string> = {
    '🔍': 'Flight Time',
    '💰': 'Premium Pay',
    '🛡️': 'Compliance',
    '⚖️': 'Final Decision'
  };

  return (
    <div className={`relative p-4 rounded-lg border-2 ${statusColors[status]} transition-all duration-300`}>
      <div className="flex items-start space-x-3">
        <div className="text-3xl">{icon}</div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm">{name}</h4>
            {status === 'running' && <Zap className="animate-bounce" size={16} />}
            {status === 'completed' && <CheckCircle2 size={16} />}
            {duration && status === 'completed' && (
              <span className="text-xs flex items-center gap-1">
                <Clock size={12} /> {duration.toFixed(1)}s
              </span>
            )}
          </div>
          <p className="text-xs mt-1 opacity-75">{description}</p>
        </div>
      </div>
    </div>
  );
};

interface AIValidationPipelineProps {
  isRunning: boolean;
  currentStep?: string;
  completedSteps?: string[];
  stepDurations?: Record<string, number>;
}

export default function AIValidationPipeline({
  isRunning,
  currentStep,
  completedSteps = [],
  stepDurations = {}
}: AIValidationPipelineProps) {
  const [showInfo, setShowInfo] = useState(false);

  const steps = [
    {
      id: 'flight-time',
      name: 'Flight Time Calculator',
      icon: '🔍',
      description: 'Analyzes flight hours, duty time, and regulatory compliance'
    },
    {
      id: 'premium-pay',
      name: 'Premium Pay Calculator',
      icon: '💰',
      description: 'Validates premium eligibility for international, holiday, and special assignments'
    },
    {
      id: 'compliance',
      name: 'Compliance Validator',
      icon: '🛡️',
      description: 'Checks CBA contracts, union rules, and regulatory requirements'
    },
    {
      id: 'decision',
      name: 'Final Decision',
      icon: '⚖️',
      description: 'Synthesizes all agent results into final recommendation'
    }
  ];

  const getStepStatus = (stepId: string): 'pending' | 'running' | 'completed' | 'error' => {
    if (completedSteps.includes(stepId)) return 'completed';
    if (currentStep === stepId) return 'running';
    return 'pending';
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-blue-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Brain className="text-white" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              AI Validation Pipeline
              <Sparkles className="text-yellow-500" size={16} />
            </h3>
            <p className="text-xs text-gray-600">
              Powered by <span className="font-semibold">Claude Sonnet 4.5</span> • Running in parallel
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
          title="Why AI?"
        >
          <Info size={20} className="text-blue-600" />
        </button>
      </div>

      {/* Why AI? Info Panel */}
      {showInfo && (
        <div className="mb-6 p-4 bg-white rounded-lg border border-blue-200">
          <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
            <Brain size={18} />
            Why AI/LLM vs Traditional Automation?
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-semibold text-gray-900 mb-2">✅ What AI/LLM Does Better:</h5>
              <ul className="space-y-1 text-gray-700">
                <li>• <strong>Complex reasoning</strong> across multiple contract clauses</li>
                <li>• <strong>Natural language</strong> understanding of claim descriptions</li>
                <li>• <strong>Contextual analysis</strong> of edge cases and exceptions</li>
                <li>• <strong>Adaptive learning</strong> from historical patterns</li>
                <li>• <strong>Explain decisions</strong> in human-readable format</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-gray-900 mb-2">❌ Why Not RPA/Rules-Based:</h5>
              <ul className="space-y-1 text-gray-700">
                <li>• <strong>Brittle rules</strong> break with contract changes</li>
                <li>• <strong>Can't handle</strong> ambiguous or conflicting clauses</li>
                <li>• <strong>Requires extensive</strong> manual rule programming</li>
                <li>• <strong>No reasoning</strong> ability for gray areas</li>
                <li>• <strong>Silent failures</strong> on unexpected inputs</li>
              </ul>
            </div>
          </div>
          <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
            <p className="text-xs text-gray-700">
              <strong>Technical:</strong> Using Claude Sonnet 4.5 (200K context window) with LangGraph orchestration
              for multi-agent reasoning. Each agent specializes in a domain (flight time, compliance, pay calculations)
              and collaborates to make nuanced decisions that traditional automation cannot handle.
            </p>
          </div>
        </div>
      )}

      {/* Agent Pipeline Grid */}
      <div className="grid grid-cols-2 gap-4">
        {steps.map((step, index) => (
          <div key={step.id} className="relative">
            <AgentStep
              name={step.name}
              icon={step.icon}
              status={getStepStatus(step.id)}
              duration={stepDurations[step.id]}
              description={step.description}
            />
            {index < steps.length - 1 && index % 2 === 0 && (
              <div className="absolute top-1/2 -right-2 w-4 h-0.5 bg-blue-300" />
            )}
          </div>
        ))}
      </div>

      {/* Status Footer */}
      {isRunning && (
        <div className="mt-4 p-3 bg-blue-100 rounded-lg border border-blue-300">
          <div className="flex items-center space-x-2">
            <Zap className="text-blue-600 animate-pulse" size={16} />
            <span className="text-sm font-medium text-blue-900">
              Processing in parallel - agents running simultaneously for 3x faster results
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
