import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { ChatMessage, UserRole } from '../types';
import { agentResponses, suggestedPrompts } from '../data/mockData';

interface ConversationalAIProps {
  role: UserRole;
  context?: string;
}

export default function ConversationalAI({ role, context }: ConversationalAIProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const responseKey = Object.keys(agentResponses[role] || {}).find(key =>
        text.toLowerCase().includes(key.toLowerCase())
      );

      const response = responseKey
        ? agentResponses[role][responseKey]
        : `I understand you're asking about "${text}". As an AI assistant for ${role} operations, I can help with schedule management, claim processing, roster optimization, and more. Could you rephrase your question or try one of the suggested prompts?`;

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        context: context
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handlePromptClick = (prompt: string) => {
    handleSendMessage(prompt);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="flex items-center gap-3 px-4 py-4 border-b bg-gradient-to-r from-blue-50 to-white">
        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
          <Sparkles className="text-white w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900">AI Assistant</h3>
          <p className="text-xs text-gray-600">Powered by AI from dCortex</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[400px] max-h-[600px]">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-50 mb-4">
              <Sparkles className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-gray-600 mb-2 font-semibold">Hello! How can I help you today?</p>
            <p className="text-sm text-gray-500 mb-6">Ask me anything about crew operations</p>
            <div className="space-y-2">
              <p className="text-xs text-gray-500 mb-2 font-medium">Suggested questions:</p>
              {suggestedPrompts[role]?.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePromptClick(prompt)}
                  className="block w-full text-left px-4 py-2 text-sm bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 rounded-lg transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.context && (
                <div className="text-xs opacity-75 mb-1 italic">{message.context}</div>
              )}
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <div className={`text-xs mt-1 ${
                message.role === 'user' ? 'text-gray-600' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(input);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me about crew operations..."
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
