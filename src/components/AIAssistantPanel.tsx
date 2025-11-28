import { useState, useRef, useEffect } from 'react';
import { ChevronRight, ChevronLeft, X } from 'lucide-react';
import ConversationalAI from './ConversationalAI';
import { UserRole } from '../types';

interface AIAssistantPanelProps {
  role: UserRole;
  context?: string;
  defaultWidth?: number; // Percentage (0-100), default 40
  className?: string;
}

export default function AIAssistantPanel({ 
  role, 
  context, 
  defaultWidth = 40,
  className = '' 
}: AIAssistantPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);

  // Clamp width between 0 and defaultWidth
  const clampedWidth = Math.max(0, Math.min(width, defaultWidth));

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !panelRef.current) return;

      const container = panelRef.current.parentElement;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const newWidth = ((containerRect.right - e.clientX) / containerRect.width) * 100;
      
      // Clamp between 0 and defaultWidth
      const clamped = Math.max(0, Math.min(newWidth, defaultWidth));
      setWidth(clamped);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, defaultWidth]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  if (isCollapsed) {
    return (
      <div className={`flex flex-col h-full ${className}`}>
        {/* Match nav bar height with invisible spacer */}
        <div className="h-[49px] flex-shrink-0"></div>
        <div className="flex-1 flex items-start">
          <button
            onClick={toggleCollapse}
            className="h-12 w-8 bg-blue-600 hover:bg-blue-700 text-white rounded-l-lg flex items-center justify-center transition-colors shadow-lg mt-2"
            title="Expand AI Assistant"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={panelRef}
      className={`flex h-full ${className}`}
      style={{ width: `${clampedWidth}%`, minWidth: '320px' }}
    >
      {/* Resize handle */}
      <div
        ref={resizeRef}
        onMouseDown={handleResizeStart}
        className="w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize transition-colors flex-shrink-0"
        title="Drag to resize"
      />
      
      {/* AI Assistant Panel Container - Full height */}
      <div className="flex-1 flex flex-col bg-white min-w-0 h-full z-10">
        {/* Header - Fixed at top, aligned with nav bar */}
        <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-blue-50 to-white border-b border-gray-200 flex-shrink-0" style={{ height: '49px' }}>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-700 truncate">AI Assistant</h3>
          </div>
          <button
            onClick={toggleCollapse}
            className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0 ml-2"
            title="Collapse AI Assistant"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Content Area - Takes remaining height */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          <ConversationalAI role={role} context={context} />
        </div>
      </div>
    </div>
  );
}

