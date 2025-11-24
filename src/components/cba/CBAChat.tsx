/**
 * CBA Dual-Perspective Chat Interface
 * Allows asking questions from both Claims Administrator and Union Representative perspectives
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, ThumbsUp, ThumbsDown, AlertTriangle, FileText, Building, Users } from 'lucide-react';

type Perspective = 'admin' | 'union';

interface ContractReference {
  section: string;
  title: string;
  text: string;
  relevance: number;
}

interface ChatResponse {
  answer: string;
  confidence: number;
  contractReferences: ContractReference[];
  perspective: Perspective;
  reasoning: string;
  warnings?: string[];
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  perspective?: Perspective;
  response?: ChatResponse;
  timestamp: Date;
}

export default function CBAChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [perspective, setPerspective] = useState<Perspective>('admin');
  const [loading, setLoading] = useState(false);
  const [showBothPerspectives, setShowBothPerspectives] = useState(false);
  const [adminResponse, setAdminResponse] = useState<ChatResponse | null>(null);
  const [unionResponse, setUnionResponse] = useState<ChatResponse | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleAskQuestion = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      if (showBothPerspectives) {
        // Ask from both perspectives
        const response = await fetch('http://localhost:3001/api/cba/ask-both', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: input }),
        });

        const data = await response.json();

        if (data.success) {
          setAdminResponse(data.admin);
          setUnionResponse(data.union);

          // Add both responses as messages
          const adminMessage: Message = {
            id: `${Date.now()}-admin`,
            role: 'assistant',
            content: data.admin.answer,
            perspective: 'admin',
            response: data.admin,
            timestamp: new Date(),
          };

          const unionMessage: Message = {
            id: `${Date.now()}-union`,
            role: 'assistant',
            content: data.union.answer,
            perspective: 'union',
            response: data.union,
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, adminMessage, unionMessage]);
        }
      } else {
        // Ask from single perspective
        const response = await fetch('http://localhost:3001/api/cba/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: input, perspective }),
        });

        const data = await response.json();

        if (data.success) {
          const assistantMessage: Message = {
            id: `${Date.now()}-assistant`,
            role: 'assistant',
            content: data.response.answer,
            perspective,
            response: data.response,
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, assistantMessage]);
        }
      }
    } catch (error) {
      console.error('Error asking question:', error);
      const errorMessage: Message = {
        id: `${Date.now()}-error`,
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your question. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (message: Message, isCorrect: boolean) => {
    if (!message.response) return;

    try {
      const sectionRef = message.response.contractReferences[0]?.section;
      if (!sectionRef) return;

      await fetch('http://localhost:3001/api/cba/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionRef,
          isCorrect,
          perspective: message.perspective,
        }),
      });

      alert(isCorrect ? 'Marked as correct!' : 'Marked as incorrect. Thank you for your feedback!');
    } catch (error) {
      console.error('Error validating response:', error);
      alert('Error recording validation');
    }
  };

  const getPerspectiveColor = (persp: Perspective) => {
    return persp === 'admin' ? 'blue' : 'green';
  };

  const getPerspectiveIcon = (persp: Perspective) => {
    return persp === 'admin' ? <Building className="w-4 h-4" /> : <Users className="w-4 h-4" />;
  };

  const getPerspectiveName = (persp: Perspective) => {
    return persp === 'admin' ? 'Claims Administrator' : 'Union Representative';
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">CBA Knowledge Graph Chat</h1>
          <p className="text-gray-600 text-sm">Ask questions about the Collective Bargaining Agreement</p>

          {/* Perspective Selector */}
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Perspective:</label>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setPerspective('admin');
                    setShowBothPerspectives(false);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    perspective === 'admin' && !showBothPerspectives
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Administrator
                  </div>
                </button>
                <button
                  onClick={() => {
                    setPerspective('union');
                    setShowBothPerspectives(false);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    perspective === 'union' && !showBothPerspectives
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Union Rep
                  </div>
                </button>
                <button
                  onClick={() => setShowBothPerspectives(true)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    showBothPerspectives
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Both Perspectives
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-6xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
              <p className="text-gray-600 text-sm">
                Ask a question about the CBA to get started
              </p>
              <div className="mt-6 space-y-2 text-left max-w-md mx-auto">
                <p className="text-sm text-gray-600 font-medium">Example questions:</p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Can a crew member claim international premium for a flight to Panama?</li>
                  <li>• What are the filing deadlines for premium pay claims?</li>
                  <li>• Do I need special qualification for international premium?</li>
                  <li>• How much is the holiday premium rate?</li>
                </ul>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : message.perspective === 'admin'
                    ? 'bg-blue-50 border border-blue-200'
                    : 'bg-green-50 border border-green-200'
                }`}
              >
                {message.role === 'assistant' && message.perspective && (
                  <div
                    className={`flex items-center gap-2 mb-2 text-sm font-medium ${
                      message.perspective === 'admin' ? 'text-blue-700' : 'text-green-700'
                    }`}
                  >
                    {getPerspectiveIcon(message.perspective)}
                    {getPerspectiveName(message.perspective)}
                  </div>
                )}

                <p className={message.role === 'user' ? 'text-white' : 'text-gray-900'}>
                  {message.content}
                </p>

                {message.response && (
                  <div className="mt-4 space-y-3">
                    {/* Confidence */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-600">Confidence:</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            message.response.confidence >= 0.8
                              ? 'bg-green-500'
                              : message.response.confidence >= 0.5
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${message.response.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600">
                        {(message.response.confidence * 100).toFixed(0)}%
                      </span>
                    </div>

                    {/* Warnings */}
                    {message.response.warnings && message.response.warnings.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                          <div className="text-sm">
                            {message.response.warnings.map((warning, idx) => (
                              <p key={idx} className="text-yellow-800">
                                {warning}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Contract References */}
                    {message.response.contractReferences.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-700 mb-2">Contract References:</p>
                        <div className="space-y-2">
                          {message.response.contractReferences.map((ref, idx) => (
                            <div key={idx} className="text-xs">
                              <p className="font-medium text-gray-900">
                                {ref.section} - {ref.title}
                              </p>
                              <p className="text-gray-600 line-clamp-2">{ref.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Reasoning */}
                    <details className="text-xs text-gray-600">
                      <summary className="cursor-pointer font-medium">View Reasoning</summary>
                      <p className="mt-2 text-gray-700">{message.response.reasoning}</p>
                    </details>

                    {/* Validation Buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                      <span className="text-xs text-gray-600">Was this answer helpful?</span>
                      <button
                        onClick={() => handleValidate(message, true)}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 text-xs"
                      >
                        <ThumbsUp className="w-3 h-3" />
                        Correct
                      </button>
                      <button
                        onClick={() => handleValidate(message, false)}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-xs"
                      >
                        <ThumbsDown className="w-3 h-3" />
                        Incorrect
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent" />
                  <span className="text-gray-600 text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
              placeholder="Ask a question about the CBA..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              onClick={handleAskQuestion}
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
