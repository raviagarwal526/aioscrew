/**
 * React hook for real-time admin agent activity via Socket.IO
 */

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:3001' : window.location.origin);

export interface AgentActivity {
  claim_id: string;
  agent_name: string;
  activity: 'started' | 'completed' | 'failed' | 'flagged';
  status: string;
  processing_time_ms?: number;
  confidence?: number;
  error?: string;
  message?: string;
  timestamp: string;
}

export function useAdminAgentActivity() {
  const [activities, setActivities] = useState<AgentActivity[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Connect to Socket.IO server
    const socket = io(API_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔌 Admin WebSocket connected');
      setIsConnected(true);
      
      // Join admin room
      socket.emit('join:admin');
    });

    socket.on('disconnect', () => {
      console.log('🔌 Admin WebSocket disconnected');
      setIsConnected(false);
    });

    socket.on('agent_activity', (data: { type: string; data: AgentActivity; timestamp: string }) => {
      if (data.type === 'agent_activity') {
        setActivities(prev => {
          // Add new activity at the beginning
          const updated = [data.data, ...prev];
          // Keep only last 10 activities
          return updated.slice(0, 10);
        });
      }
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    return () => {
      socket.emit('leave:admin');
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  return { activities, isConnected };
}
