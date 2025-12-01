import { useState, useRef, useEffect } from 'react';
import { ArrowUp, Paperclip, Sparkles, LayoutDashboard, Maximize2, ChevronRight, ChevronLeft } from 'lucide-react';
import { ChatMessage, UserRole } from '../types';
import { agentResponses, suggestedPrompts } from '../data/mockData';

interface ConversationalAIProps {
  role: UserRole;
  context?: string;
  fullWidth?: boolean;
  onToggleDashboard?: () => void;
  isDashboardCollapsed?: boolean;
  onDashboardTrigger?: (dashboardType: string, context: any) => void;
  onToggleChat?: () => void;
  isChatCollapsed?: boolean;
  onReset?: () => void;
}

export default function ConversationalAI({ 
  role, 
  context, 
  fullWidth = false,
  onToggleDashboard,
  isDashboardCollapsed = false,
  onDashboardTrigger,
  onToggleChat,
  isChatCollapsed = false,
  onReset
}: ConversationalAIProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get time-appropriate greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 18) return 'Afternoon';
    return 'Evening';
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // Reset Chat Handler
  const handleResetChat = () => {
    setMessages([]);
    setInput('');
    setIsTyping(false);
    if (onReset) {
      onReset();
    }
  };

  // Query classification logic
  const classifyQuery = (text: string): { needsDashboard: boolean; dashboardType?: string; context?: any } => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('schedule') || lowerText.includes('trip') || lowerText.includes('next day off') || lowerText.includes('calendar') || lowerText.includes('when is my') || lowerText.includes('upcoming')) return { needsDashboard: true, dashboardType: 'schedule', context: { view: 'calendar' } };
    if (lowerText.includes('pay') || lowerText.includes('claim') || lowerText.includes('per diem') || lowerText.includes('salary') || lowerText.includes('earnings') || lowerText.includes('compensation')) return { needsDashboard: true, dashboardType: 'payroll', context: { view: 'claims' } };
    if (lowerText.includes('training') || lowerText.includes('certification') || lowerText.includes('recurrent') || lowerText.includes('qualification')) return { needsDashboard: true, dashboardType: 'training', context: { view: 'training' } };
    if (lowerText.includes('bid') || lowerText.includes('bidding')) return { needsDashboard: true, dashboardType: 'bidding', context: { view: 'bids' } };
    return { needsDashboard: false };
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    const classification = classifyQuery(text);
    setTimeout(() => {
      const responseKey = Object.keys(agentResponses[role] || {}).find(key => text.toLowerCase().includes(key.toLowerCase()));
      let response = responseKey ? agentResponses[role][responseKey] : `I understand you're asking about "${text}". As an AI assistant for ${role} operations, I can help with schedule management, claim processing, roster optimization, and more.`;
      if (classification.needsDashboard && onDashboardTrigger) {
        onDashboardTrigger(classification.dashboardType!, classification.context);
        response = `${response}\n\nI've opened the ${classification.dashboardType} dashboard for you.`;
      }
      const assistantMessage: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: response, timestamp: new Date(), context: context };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handlePromptClick = (prompt: string) => {
    handleSendMessage(prompt);
  };

  // Collapsed State UI - Minimal, just icon and button
  if (isChatCollapsed) {
    return (
      <div className="h-full w-full flex flex-col items-center py-4 bg-white border-l border-gray-200 gap-4">
        <button 
          onClick={onToggleChat}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Expand Chat"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        
        {/* Sparkles Icon - as a small indicator */}
        <div className="p-2 bg-blue-50 rounded-lg group relative cursor-help">
          <Sparkles className="w-5 h-5 text-blue-600" />
          {/* Tooltip on hover */}
          <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            AI Assistant
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${fullWidth ? 'bg-gray-50/50' : 'bg-white'}`}>
      {/* Header (Only for split view) */}
      {!fullWidth && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 flex-shrink-0">
          <div 
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded-lg transition-colors"
            onClick={handleResetChat}
            title="Start New Chat"
          >
            <div className="p-1.5 bg-blue-50 rounded-lg">
              <Sparkles className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-800">AI Assistant</h3>
          </div>
          <div className="flex items-center gap-1">
            {onToggleChat && (
              <button onClick={onToggleChat} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Collapse Chat">
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            )}
            {onToggleDashboard && (
              <button onClick={onToggleDashboard} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title={isDashboardCollapsed ? "Show Dashboard" : "Hide Dashboard"}>
                {isDashboardCollapsed ? <Maximize2 className="w-4 h-4 text-gray-600" /> : <LayoutDashboard className="w-4 h-4 text-gray-600" />}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className={`flex-1 overflow-y-auto ${fullWidth ? 'px-4' : 'p-4'} min-h-0`}>
        {/* 
           Container logic:
           - fullWidth: centers content with max-w
           - messages.length === 0: centers content vertically
           - otherwise: natural top-to-bottom flow
        */}
        <div className={`${fullWidth ? 'max-w-[48rem] mx-auto' : ''} ${messages.length === 0 ? 'h-full flex flex-col justify-center' : ''}`}>
          
          {/* Empty State - Centered */}
          {messages.length === 0 ? (
            <div className={`flex flex-col items-center justify-center ${fullWidth ? '-mt-20' : 'mt-10'}`}>
              <div className="mb-8 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                <Sparkles className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className={`text-4xl font-medium text-gray-900 mb-12 text-center tracking-tight`}>
                {getGreeting()}, Captain Martinez
              </h2>
              
              {/* Input Area Centered for Empty State */}
              <div className="w-full max-w-2xl relative">
                <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.05)] border border-gray-200 p-4 transition-shadow hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage(input);
                    }}
                    className="relative"
                  >
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="How can I help you today?"
                      className="w-full text-lg text-gray-700 placeholder-gray-400 bg-transparent border-none focus:ring-0 p-0 pr-12 resize-none outline-none"
                      autoFocus
                    />
                    <div className="flex justify-between items-center mt-4">
                      <button type="button" className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                        <Paperclip className="w-5 h-5" />
                      </button>
                      <button
                        type="submit"
                        disabled={!input.trim()}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          input.trim() 
                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md' 
                            : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                        }`}
                      >
                        <ArrowUp className="w-5 h-5" />
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Suggested Prompts */}
              <div className="mt-8 flex flex-wrap justify-center gap-2 max-w-2xl">
                {suggestedPrompts[role]?.slice(0, 3).map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePromptClick(prompt)}
                    className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Chat Messages - Top Aligned */
            <div className={`space-y-6 ${fullWidth ? 'py-10' : 'py-4'}`}>
              {messages.map((message) => (
                <div key={message.id} className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                   {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[85%] ${message.role === 'user' ? 'bg-blue-600 text-white rounded-2xl px-5 py-3 shadow-sm' : 'bg-white border border-gray-100 rounded-2xl px-5 py-3 shadow-sm'}`}>
                    <p className={`text-[15px] leading-relaxed ${message.role === 'user' ? 'text-white' : 'text-gray-800'}`}>
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex items-center gap-1 mt-2 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Floating Input Area for Non-Empty State */}
      {messages.length > 0 && (
        <div className={`${fullWidth ? 'px-4 pb-6 pt-2 bg-gray-50/50' : 'p-4 bg-white border-t border-gray-200'} flex-shrink-0`}>
          <div className={fullWidth ? 'max-w-[48rem] mx-auto' : ''}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-3 transition-shadow hover:shadow-md">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(input);
                }}
                className="flex items-center gap-2"
              >
                <button type="button" className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                  <Paperclip className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Reply..."
                  className="flex-1 text-base text-gray-700 placeholder-gray-400 bg-transparent border-none focus:ring-0 p-2 outline-none"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    input.trim() 
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm' 
                      : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
