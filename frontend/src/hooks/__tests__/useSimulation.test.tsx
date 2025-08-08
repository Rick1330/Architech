import { renderHook, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSimulation } from '../useSimulation';

// Mock the architect store
vi.mock('@/stores/useArchitectStore', () => ({
  useArchitectStore: vi.fn(() => ({
    addSimulationEvent: vi.fn(),
    updateNodeStatus: vi.fn(),
    startSimulation: vi.fn(),
    stopSimulation: vi.fn(),
    setSimulationSpeed: vi.fn(),
    nodes: [],
    edges: []
  })),
}));

// Mock the API client
vi.mock('@/lib/api/client', () => ({
  apiClient: {
    createSimulationSession: vi.fn(),
    startSimulation: vi.fn(),
    stopSimulation: vi.fn(),
  },
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock WebSocket client
vi.mock('@/lib/websocket/client', () => ({
  simulationWebSocket: {
    connect: vi.fn(),
    disconnect: vi.fn(),
    onMessage: vi.fn(() => vi.fn()),
    onError: vi.fn(() => vi.fn()),
    onDisconnect: vi.fn(() => vi.fn()),
    isConnected: false,
  },
}));

describe('useSimulation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useSimulation());

    expect(result.current.currentSession).toBeNull();
    expect(result.current.isConnected).toBe(false);
    expect(result.current.connectionError).toBeNull();
  });

  it('creates session successfully', async () => {
    const mockCreateSession = vi.fn().mockResolvedValue({
      session_id: 'session-1',
    });

    const { apiClient } = await import('@/lib/api/client');
    vi.mocked(apiClient).createSimulationSession = mockCreateSession;

    const { result } = renderHook(() => useSimulation());

    await act(async () => {
      await result.current.createSession('design-1');
    });

    expect(mockCreateSession).toHaveBeenCalledWith('design-1', undefined, undefined);
    expect(result.current.currentSession?.session_id).toBe('session-1');
  });

  it('handles session creation errors', async () => {
    const mockError = new Error('Failed to create session');
    const mockCreateSession = vi.fn().mockRejectedValue(mockError);

    const { apiClient } = await import('@/lib/api/client');
    vi.mocked(apiClient).createSimulationSession = mockCreateSession;

    const { result } = renderHook(() => useSimulation());

    await expect(act(async () => {
      await result.current.createSession('design-1');
    })).rejects.toThrow();

    expect(result.current.currentSession).toBeNull();
  });
});