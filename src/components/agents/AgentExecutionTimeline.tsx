import { Check, Clock, Loader2 } from 'lucide-react';

interface TimelineStep {
  id: string;
  name: string;
  icon: string;
  technology: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  duration?: number;
  subSteps?: TimelineStep[];
}

interface AgentExecutionTimelineProps {
  steps: TimelineStep[];
}

const TimelineStepItem = ({ step, isLast }: { step: TimelineStep; isLast: boolean }) => {
  const statusIcons = {
    pending: <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-lg">{step.icon}</div>,
    running: (
      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center animate-pulse">
        <Loader2 className="text-white animate-spin" size={16} />
      </div>
    ),
    completed: (
      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
        <Check className="text-white" size={16} />
      </div>
    ),
    error: (
      <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-lg">!</div>
    )
  };

  const textStyles = {
    pending: 'text-gray-500',
    running: 'text-blue-900 font-medium',
    completed: 'text-gray-700 line-through opacity-60',
    error: 'text-red-700'
  };

  return (
    <div className="relative">
      <div className="flex items-start space-x-4">
        {/* Icon and connecting line */}
        <div className="relative flex flex-col items-center">
          {statusIcons[step.status]}
          {!isLast && (
            <div
              className={`w-0.5 h-full mt-2 ${
                step.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
              }`}
              style={{ minHeight: step.subSteps ? '120px' : '40px' }}
            />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 pb-8">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-semibold ${textStyles[step.status]}`}>
                {step.name}
              </span>
              {step.status === 'running' && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium animate-pulse">
                  Processing...
                </span>
              )}
              {step.status === 'completed' && step.duration && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock size={12} /> {step.duration.toFixed(1)}s
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 mt-1">
            <span className="text-xs text-gray-600">{step.technology}</span>
            {step.status === 'completed' && (
              <span className="text-xs text-green-600 font-medium">✓ Complete</span>
            )}
          </div>

          {/* Sub-steps (hierarchical agents) */}
          {step.subSteps && step.subSteps.length > 0 && (step.status === 'running' || step.status === 'completed') && (
            <div className="mt-3 ml-4 pl-4 border-l-2 border-indigo-200 space-y-3">
              {step.subSteps.map((subStep, index) => (
                <div key={subStep.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {subStep.status === 'completed' ? (
                      <div className="w-5 h-5 rounded-full bg-green-400 flex items-center justify-center">
                        <Check className="text-white" size={12} />
                      </div>
                    ) : subStep.status === 'running' ? (
                      <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-gray-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${subStep.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                        {subStep.name}
                      </span>
                      {subStep.status === 'completed' && subStep.duration && (
                        <span className="text-xs text-gray-400">{subStep.duration.toFixed(1)}s</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{subStep.technology}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function AgentExecutionTimeline({ steps }: AgentExecutionTimelineProps) {
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="mb-4">
        <h3 className="font-bold text-gray-900 mb-1">Execution Timeline</h3>
        <p className="text-xs text-gray-600">Real-time progress of AI agent validation</p>
      </div>
      <div className="space-y-0">
        {steps.map((step, index) => (
          <TimelineStepItem
            key={step.id}
            step={step}
            isLast={index === steps.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
