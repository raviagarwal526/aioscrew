import { useState } from 'react';
import { MessageCircle, Send, CheckCircle, AlertCircle, Loader, Sparkles } from 'lucide-react';
import type { CrewMember, Trip } from '../types';

interface ConversationalClaimBuilderProps {
  currentUser: CrewMember;
  userTrips: Trip[];
  onClaimDataReady: (claimData: any) => void;
  onCancel: () => void;
}

interface Message {
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
}

interface ExtractedClaimData {
  claimType?: string;
  tripId?: string;
  amount?: number;
  hours?: number;
  days?: number;
  description?: string;
  complete: boolean;
  missingFields: string[];
}

export default function ConversationalClaimBuilder({
  currentUser,
  userTrips,
  onClaimDataReady,
  onCancel
}: ConversationalClaimBuilderProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hi ${currentUser.name}! I'm here to help you create a claim. Tell me about the claim you'd like to submit, and I'll ask any clarifying questions needed.

For example, you could say:
- "I need to claim international premium for my Panama trip last Tuesday"
- "I worked 8 hours of overtime last week"
- "I need per diem for my 3-day layover in Miami"

What claim would you like to submit?`,
      timestamp: new Date()
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedClaimData>({
    complete: false,
    missingFields: []
  });

  const CLAIM_TYPE_KEYWORDS = {
    international_premium: ['international', 'intl', 'premium', 'international flight', 'overseas'],
    per_diem: ['per diem', 'meal', 'meals', 'layover expenses', 'food allowance'],
    holiday_pay: ['holiday', 'christmas', 'thanksgiving', 'new year', 'holiday pay'],
    overtime: ['overtime', 'ot', 'extra hours', 'over hours'],
    layover_premium: ['layover', 'extended layover', 'long layover'],
    training_pay: ['training', 'recurrent', 'simulator', 'sim'],
    lead_premium: ['lead', 'check airman', 'instructor', 'evaluator'],
    deadhead: ['deadhead', 'positioning', 'repositioning']
  };

  const CLAIM_TYPE_CONFIGS = {
    international_premium: {
      label: 'International Premium',
      requiredFields: ['tripId'],
      baseAmount: 125,
      questions: {
        tripId: 'Which international trip is this claim for? (Please provide trip ID or date)'
      }
    },
    per_diem: {
      label: 'Per Diem',
      requiredFields: ['tripId', 'days'],
      questions: {
        tripId: 'Which trip is this for? (Please provide trip ID or date)',
        days: 'How many days are you claiming per diem for?'
      }
    },
    holiday_pay: {
      label: 'Holiday Pay',
      requiredFields: ['tripId'],
      baseAmount: 150,
      questions: {
        tripId: 'Which trip did you work on the holiday? (Please provide trip ID or date)'
      }
    },
    overtime: {
      label: 'Overtime',
      requiredFields: ['hours'],
      questions: {
        hours: 'How many overtime hours are you claiming?'
      }
    },
    layover_premium: {
      label: 'Layover Premium',
      requiredFields: ['tripId'],
      baseAmount: 50,
      questions: {
        tripId: 'Which trip had the extended layover? (Please provide trip ID or date)'
      }
    },
    training_pay: {
      label: 'Training Pay',
      requiredFields: ['description'],
      baseAmount: 200,
      questions: {
        description: 'What type of training did you complete?'
      }
    },
    lead_premium: {
      label: 'Lead/Check Airman Premium',
      requiredFields: ['tripId'],
      baseAmount: 100,
      questions: {
        tripId: 'Which trip did you serve as lead/check airman? (Please provide trip ID or date)'
      }
    },
    deadhead: {
      label: 'Deadhead Compensation',
      requiredFields: ['tripId'],
      baseAmount: 75,
      questions: {
        tripId: 'Which deadhead positioning is this for? (Please provide trip ID or date)'
      }
    }
  };

  const detectClaimType = (text: string): string | null => {
    const lowerText = text.toLowerCase();

    for (const [claimType, keywords] of Object.entries(CLAIM_TYPE_KEYWORDS)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return claimType;
      }
    }

    return null;
  };

  const extractTripId = (text: string): string | null => {
    // Try to extract trip ID (format: CM followed by numbers)
    const tripIdMatch = text.match(/\b(CM\d+)\b/i);
    if (tripIdMatch) {
      return tripIdMatch[1].toUpperCase();
    }

    // Try to find trip by date or route mentions
    const lowerText = text.toLowerCase();

    // Check for day references (last tuesday, yesterday, etc.)
    const dateKeywords = ['yesterday', 'today', 'last week', 'this week'];
    const hasDateKeyword = dateKeywords.some(kw => lowerText.includes(kw));

    if (hasDateKeyword) {
      // For demo purposes, return the most recent trip
      const sortedTrips = [...userTrips].sort((a, b) =>
        new Date(b.trip_date).getTime() - new Date(a.trip_date).getTime()
      );
      return sortedTrips[0]?.id || null;
    }

    // Check for route mentions (Panama, Miami, etc.)
    for (const trip of userTrips) {
      const routeParts = trip.route.toLowerCase().split(/[→\s-]+/);
      if (routeParts.some(part => lowerText.includes(part))) {
        return trip.id;
      }
    }

    return null;
  };

  const extractNumber = (text: string, context: 'hours' | 'days' | 'amount'): number | null => {
    const patterns = {
      hours: /(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)\b/i,
      days: /(\d+)\s*(?:days?|d)\b/i,
      amount: /\$?\s*(\d+(?:\.\d+)?)/
    };

    const match = text.match(patterns[context]);
    return match ? parseFloat(match[1]) : null;
  };

  const analyzeUserMessage = (text: string): ExtractedClaimData => {
    const claimType = detectClaimType(text);
    const tripId = extractTripId(text);
    const hours = extractNumber(text, 'hours');
    const days = extractNumber(text, 'days');
    const amount = extractNumber(text, 'amount');

    const data: ExtractedClaimData = {
      claimType,
      tripId: tripId || extractedData.tripId,
      hours: hours || extractedData.hours,
      days: days || extractedData.days,
      amount: amount || extractedData.amount,
      description: extractedData.description || text,
      complete: false,
      missingFields: []
    };

    // Determine what's still missing
    if (claimType && CLAIM_TYPE_CONFIGS[claimType as keyof typeof CLAIM_TYPE_CONFIGS]) {
      const config = CLAIM_TYPE_CONFIGS[claimType as keyof typeof CLAIM_TYPE_CONFIGS];
      const missing: string[] = [];

      for (const field of config.requiredFields) {
        if (!data[field as keyof ExtractedClaimData]) {
          missing.push(field);
        }
      }

      data.missingFields = missing;
      data.complete = missing.length === 0;

      // Calculate amount if possible
      if (!data.amount && config.baseAmount) {
        if (claimType === 'per_diem' && data.days) {
          // Try to get trip to determine domestic/international
          const trip = userTrips.find(t => t.id === data.tripId);
          const rate = trip?.is_international ? 95 : 75;
          data.amount = rate * data.days;
        } else if (claimType === 'overtime' && data.hours) {
          const hourlyRate = 85; // Base rate
          data.amount = data.hours * hourlyRate * 1.5;
        } else {
          data.amount = config.baseAmount;
        }
      }
    } else if (!claimType) {
      data.missingFields = ['claimType'];
    }

    return data;
  };

  const generateAssistantResponse = (data: ExtractedClaimData): string => {
    // If no claim type detected
    if (!data.claimType) {
      return "I'm not sure what type of claim you're trying to submit. Could you specify if it's for:\n\n" +
        "- International Premium\n" +
        "- Per Diem\n" +
        "- Holiday Pay\n" +
        "- Overtime\n" +
        "- Layover Premium\n" +
        "- Training Pay\n" +
        "- Lead/Check Airman Premium\n" +
        "- Deadhead Compensation";
    }

    const config = CLAIM_TYPE_CONFIGS[data.claimType as keyof typeof CLAIM_TYPE_CONFIGS];
    if (!config) {
      return "I understand you want to submit a claim, but I need more information. What type of claim is this?";
    }

    // If data is complete
    if (data.complete) {
      const trip = data.tripId ? userTrips.find(t => t.id === data.tripId) : null;
      let summary = `Perfect! I have all the information I need. Here's what I've gathered:\n\n`;
      summary += `**Claim Type:** ${config.label}\n`;

      if (trip) {
        summary += `**Trip:** ${trip.id} - ${trip.route} (${new Date(trip.trip_date).toLocaleDateString()})\n`;
      }

      if (data.hours) {
        summary += `**Hours:** ${data.hours}\n`;
      }

      if (data.days) {
        summary += `**Days:** ${data.days}\n`;
      }

      if (data.amount) {
        summary += `**Amount:** $${data.amount.toFixed(2)}\n`;
      }

      summary += `\nWould you like to proceed with this claim? I'll prepare it for your final review.`;
      return summary;
    }

    // Ask for missing information
    const missingField = data.missingFields[0];
    const question = config.questions?.[missingField as keyof typeof config.questions];

    if (question) {
      let response = `Great! I can help you with a ${config.label} claim.\n\n`;

      // Show what we have so far
      if (data.tripId) {
        const trip = userTrips.find(t => t.id === data.tripId);
        if (trip) {
          response += `Trip: ${trip.id} - ${trip.route}\n`;
        }
      }
      if (data.hours) response += `Hours: ${data.hours}\n`;
      if (data.days) response += `Days: ${data.days}\n`;

      response += `\n${question}`;

      // Add helpful context for trip selection
      if (missingField === 'tripId' && userTrips.length > 0) {
        response += `\n\nYour recent trips:\n`;
        userTrips.slice(0, 5).forEach(trip => {
          response += `- ${trip.id}: ${trip.route} on ${new Date(trip.trip_date).toLocaleDateString()}`;
          if (trip.is_international) response += ` (International)`;
          response += `\n`;
        });
      }

      return response;
    }

    return "I need a bit more information to complete your claim. Could you provide more details?";
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || isProcessing) return;

    const userMessage: Message = {
      role: 'user',
      content: userInput.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsProcessing(true);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Analyze the message
    const analyzedData = analyzeUserMessage(userInput);
    setExtractedData(analyzedData);

    // Generate response
    const response = generateAssistantResponse(analyzedData);

    const assistantMessage: Message = {
      role: 'assistant',
      content: response,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsProcessing(false);

    // If claim is complete, show the create button after a delay
    if (analyzedData.complete) {
      setTimeout(() => {
        const trip = analyzedData.tripId ? userTrips.find(t => t.id === analyzedData.tripId) : null;
        const config = analyzedData.claimType ?
          CLAIM_TYPE_CONFIGS[analyzedData.claimType as keyof typeof CLAIM_TYPE_CONFIGS] : null;

        onClaimDataReady({
          type: analyzedData.claimType,
          tripId: analyzedData.tripId || '',
          amount: analyzedData.amount?.toString() || '',
          hours: analyzedData.hours?.toString() || '',
          numberOfDays: analyzedData.days?.toString() || '',
          description: analyzedData.description || '',
          claimTypeLabel: config?.label || 'Other'
        });
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full h-[600px] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">AI Claim Assistant</h3>
                <p className="text-sm text-blue-100">Describe your claim in natural language</p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="text-white/80 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div className={`text-xs mt-2 ${
                  message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
          <div className="flex gap-3">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isProcessing}
            />
            <button
              onClick={handleSendMessage}
              disabled={!userInput.trim() || isProcessing}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
