import { useState } from 'react';
import { ChevronDown, ChevronRight, GitBranch, Shield, FileText, Clock, Brain } from 'lucide-react';

interface SubAgent {
  id: string;
  name: string;
  icon: JSX.Element;
  technology: string;
  status: 'pending' | 'running' | 'completed';
  duration?: number;
  reasoning: string;
}

interface HierarchicalAgentViewProps {
  isExpanded: boolean;
  parentStatus: 'pending' | 'running' | 'completed' | 'error';
}

export default function HierarchicalAgentView({ isExpanded, parentStatus }: HierarchicalAgentViewProps) {
  const [showDetails, setShowDetails] = useState(true);

  // Sub-agents that Compliance Validator delegates to
  const subAgents: SubAgent[] = [
    {
      id: 'contract-interpreter',
      name: 'Contract Interpreter',
      icon: <FileText className="text-purple-500" size={16} />,
      technology: 'Claude Opus',
      status: parentStatus === 'completed' ? 'completed' : parentStatus === 'running' ? 'running' : 'pending',
      duration: 4.2,
      reasoning: 'Deep analysis of ambiguous CBA clauses and contract language'
    },
    {
      id: 'historical-precedent',
      name: 'Historical Precedent',
      icon: <Clock className="text-blue-500" size={16} />,
      technology: 'GPT-4o + Vector DB',
      status: parentStatus === 'completed' ? 'completed' : parentStatus === 'running' ? 'running' : 'pending',
      duration: 2.1,
      reasoning: 'Searches past similar cases and established interpretations'
    },
    {
      id: 'union-rules',
      name: 'Union Rules Checker',
      icon: <Shield className="text-green-500" size={16} />,
      technology: 'Rules Engine',
      status: parentStatus === 'completed' ? 'completed' : parentStatus === 'running' ? 'running' : 'pending',
      duration: 0.3,
      reasoning: 'Validates against explicit union agreement requirements'
    }
  ];

  if (!isExpanded) return null;

  const statusColors = {
    pending: 'bg-gray-50 border-gray-300',
    running: 'bg-blue-50 border-blue-300',
    completed: 'bg-green-50 border-green-300',
    error: 'bg-red-50 border-red-300'
  };

  return (
    <div className="ml-12 mt-3 space-y-2">
      {/* Hierarchical Indicator */}
      <div className="flex items-center space-x-2 text-xs text-gray-600 mb-3">
        <GitBranch size={14} />
        <span className="font-semibold">Delegating to specialized sub-agents...</span>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center hover:text-blue-600 transition-colors"
        >
          {showDetails ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <span className="ml-1">{showDetails ? 'Hide' : 'Show'} details</span>
        </button>
      </div>

      {showDetails && (
        <div className="space-y-2">
          {subAgents.map((agent, index) => (
            <div
              key={agent.id}
              className={`relative flex items-center space-x-3 p-3 rounded-lg border ${statusColors[agent.status]} transition-all duration-300`}
            >
              {/* Connection Line */}
              <div className="absolute -left-6 top-1/2 w-6 h-0.5 bg-gray-300" />

              {/* Agent Icon */}
              <div className="flex-shrink-0">
                {agent.icon}
              </div>

              {/* Agent Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-sm text-gray-900">{agent.name}</span>
                    <span className="px-2 py-0.5 bg-white rounded text-xs font-medium text-gray-600 border border-gray-300">
                      {agent.technology}
                    </span>
                  </div>
                  {agent.status === 'completed' && agent.duration && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={12} /> {agent.duration}s
                    </span>
                  )}
                  {agent.status === 'running' && (
                    <span className="text-xs text-blue-600 animate-pulse">Processing...</span>
                  )}
                </div>
                <p className="text-xs text-gray-600">{agent.reasoning}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Synthesis Step */}
      {parentStatus === 'completed' && showDetails && (
        <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center space-x-2 mb-2">
            <Brain className="text-purple-600" size={16} />
            <span className="font-semibold text-sm text-purple-900">Synthesis & Decision</span>
          </div>
          <p className="text-xs text-gray-700">
            Compliance Validator combines insights from all 3 sub-agents to make final compliance determination.
            Uses Claude Opus to synthesize conflicting signals and edge cases.
          </p>
        </div>
      )}
    </div>
  );
}
