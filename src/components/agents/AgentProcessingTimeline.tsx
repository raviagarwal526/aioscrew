import { AgentProcessingStep, agentConfig } from '../../types/agents';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface AgentProcessingTimelineProps {
  steps: AgentProcessingStep[];
}

export default function AgentProcessingTimeline({ steps }: AgentProcessingTimelineProps) {
  const getStatusIcon = (status: AgentProcessingStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-600" size={12} />;
      case 'flagged':
        return <AlertCircle className="text-orange-600" size={12} />;
      case 'error':
        return <XCircle className="text-red-600" size={12} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h5 className="font-semibold text-sm text-gray-700 mb-3">
        🤖 Agent Processing Timeline
      </h5>

      <div className="space-y-3">
        {steps.map((step, index) => {
          const config = agentConfig[step.agentType];
          return (
            <div key={index} className="flex items-start space-x-3">
              <div className={`h-8 w-8 rounded-full ${config.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                {step.agentAbbrev}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-sm">{step.agentName}</span>
                    {getStatusIcon(step.status)}
                  </div>
                  <span className="text-xs text-gray-500">{step.duration}s</span>
                </div>
                <p className="text-xs text-gray-600 mb-1">{step.summary}</p>
                {step.details.length > 0 && (
                  <div className="text-xs text-gray-600 space-y-0.5">
                    {step.details.map((detail, idx) => (
                      <div key={idx}>✓ {detail}</div>
                    ))}
                  </div>
                )}
                {step.confidence !== undefined && (
                  <div className="text-xs text-gray-500 mt-1">
                    Confidence: {Math.round(step.confidence * 100)}%
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
