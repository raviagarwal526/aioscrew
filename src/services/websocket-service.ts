/**
 * WebSocket service for real-time crew operations updates
 * Provides live updates for flights, crew status, disruptions, and alerts
 * Uses Socket.IO for WebSocket communication
 */

import { io, Socket } from 'socket.io-client';

export type WebSocketEventType =
  | 'flight-update'
  | 'crew-status-update'
  | 'disruption-alert'
  | 'duty-time-warning'
  | 'reserve-callout'
  | 'connection-status';

export interface WebSocketMessage {
  type: WebSocketEventType;
  timestamp: Date;
  data: any;
}

export interface FlightUpdate {
  flightId: string;
  status: 'scheduled' | 'boarding' | 'departed' | 'in-flight' | 'arrived' | 'delayed' | 'cancelled';
  departureTime?: string;
  arrivalTime?: string;
  delayMinutes?: number;
  gate?: string;
  crewAffected?: string[];
}

export interface CrewStatusUpdate {
  crewId: string;
  status: 'active' | 'rest' | 'reserve' | 'off-duty';
  location?: string;
  dutyTime?: number;
  maxDutyTime?: number;
  currentFlight?: string;
}

export interface DisruptionAlert {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: 'cancellation' | 'delay' | 'mechanical' | 'weather' | 'crew';
  flightId: string;
  message: string;
  crewAffected: number;
  aiRecommendation?: string;
}

export interface DutyTimeWarning {
  crewId: string;
  crewName: string;
  currentDuty: number;
  maxDuty: number;
  percentUsed: number;
  flightId?: string;
  timeRemaining: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface ReserveCallout {
  id: string;
  reserveId: string;
  reserveName: string;
  flightId: string;
  status: 'pending' | 'accepted' | 'declined' | 'no-response';
  calledAt: Date;
  respondedAt?: Date;
  responseTime?: number;
}

class WebSocketService {
  private socket: Socket | null = null;
  private listeners: Map<WebSocketEventType, Set<(data: any) => void>> = new Map();

  constructor() {
    // Initialize listener sets
    const eventTypes: WebSocketEventType[] = [
      'flight-update',
      'crew-status-update',
      'disruption-alert',
      'duty-time-warning',
      'reserve-callout',
      'connection-status'
    ];
    eventTypes.forEach(type => this.listeners.set(type, new Set()));
  }

  /**
   * Connect to Socket.IO server
   */
  connect() {
    if (this.socket?.connected) {
      console.log('Socket.IO already connected');
      return;
    }

    // Determine the server URL
    const serverUrl = import.meta.env.VITE_API_URL ||
      (import.meta.env.DEV ? 'http://localhost:8080' : window.location.origin);

    console.log(`Connecting to Socket.IO server: ${serverUrl}`);

    try {
      this.socket = io(serverUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 10000,
        timeout: 20000
      });

      this.socket.on('connect', () => {
        console.log('✓ Socket.IO connected:', this.socket?.id);
        this.notifyListeners('connection-status', { connected: true });
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket.IO disconnected:', reason);
        this.notifyListeners('connection-status', { connected: false });
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error.message);
      });

      // Subscribe to custom events
      this.socket.on('flight-update', (data: FlightUpdate) => {
        this.notifyListeners('flight-update', data);
      });

      this.socket.on('crew-status-update', (data: CrewStatusUpdate) => {
        this.notifyListeners('crew-status-update', data);
      });

      this.socket.on('disruption-alert', (data: DisruptionAlert) => {
        this.notifyListeners('disruption-alert', data);
      });

      this.socket.on('duty-time-warning', (data: DutyTimeWarning) => {
        this.notifyListeners('duty-time-warning', data);
      });

      this.socket.on('reserve-callout', (data: ReserveCallout) => {
        this.notifyListeners('reserve-callout', data);
      });
    } catch (error) {
      console.error('Failed to create Socket.IO connection:', error);
    }
  }

  /**
   * Disconnect from Socket.IO server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Subscribe to specific event type
   */
  subscribe(eventType: WebSocketEventType, callback: (data: any) => void) {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.add(callback);
    }

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(eventType);
      if (listeners) {
        listeners.delete(callback);
      }
    };
  }

  /**
   * Send message to server
   */
  send(type: string, data: any) {
    if (this.socket?.connected) {
      this.socket.emit(type, data);
    } else {
      console.warn('Socket.IO not connected, cannot send message');
    }
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Private methods

  private notifyListeners(eventType: WebSocketEventType, data: any) {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in listener for ${eventType}:`, error);
        }
      });
    }
  }
}

// Singleton instance
export const websocketService = new WebSocketService();

// Auto-connect on module load (can be disabled if needed)
if (typeof window !== 'undefined') {
  // Connect after a short delay to allow app to initialize
  setTimeout(() => {
    websocketService.connect();
  }, 1000);
}
