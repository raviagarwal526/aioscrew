import { Brain, Loader, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { AgentActivity } from '../../types/agents';

interface AgentActivityFeedProps {
  activities: AgentActivity[];
  isProcessing: boolean;
}

export default function AgentActivityFeed({ activities, isProcessing }: AgentActivityFeedProps) {
  const getStatusIcon = (status: AgentActivity['status']) => {
    switch (status) {
      case 'processing':
        return <Loader className="animate-spin text-blue-900" size={16} />;
      case 'completed':
        return <CheckCircle className="text-green-600" size={16} />;
      case 'flagged':
        return <AlertCircle className="text-orange-600" size={16} />;
      case 'error':
        return <XCircle className="text-red-600" size={16} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-blue-50 border-2 border-blue-900 rounded-lg p-4 mb-6">
      <div className="flex items-start space-x-3">
        <div className="relative">
          <div className={`h-12 w-12 rounded-full bg-blue-900 flex items-center justify-center ${isProcessing ? 'animate-pulse' : ''}`}>
            <Brain className="text-white" size={24} />
          </div>
          {isProcessing && (
            <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white animate-bounce"></div>
          )}
        </div>

        <div className="flex-1">
          <h3 className="font-bold text-blue-900 mb-2">
            AI Agents {isProcessing ? 'Processing' : 'Active'}
          </h3>
          <div className="space-y-2 text-sm">
            {activities.length === 0 ? (
              <div className="text-gray-600">All agents idle - ready to process claims</div>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-2">
                  {getStatusIcon(activity.status)}
                  <span className="text-gray-800">
                    <span className="font-semibold">{activity.agentName}:</span> {activity.message}
                    {activity.confidence && (
                      <span className="text-gray-600 ml-1">
                        ({Math.round(activity.confidence * 100)}% confidence)
                      </span>
                    )}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <button className="text-blue-900 hover:underline text-sm whitespace-nowrap">
          View Agent Logs →
        </button>
      </div>
    </div>
  );
}
