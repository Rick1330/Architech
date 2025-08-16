/**
 * Performance monitoring hook for React components
 * Tracks render times and provides performance metrics
 */

import { useEffect, useRef, useCallback } from 'react';
import { logger } from '@/lib/logger';

interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  renderCount: number;
  averageRenderTime: number;
}

/**
 * Hook to monitor component performance
 * @param componentName - Name of the component being monitored
 * @returns Performance monitoring functions
 */
export function usePerformanceMonitor(componentName: string) {
  const renderStartTime = useRef<number>(0);
  const renderTimes = useRef<number[]>([]);
  const renderCount = useRef<number>(0);

  const startMeasurement = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);

  const endMeasurement = useCallback(() => {
    if (renderStartTime.current === 0) return;
    
    const renderTime = performance.now() - renderStartTime.current;
    renderTimes.current.push(renderTime);
    renderCount.current += 1;
    
    // Keep only last 100 measurements
    if (renderTimes.current.length > 100) {
      renderTimes.current.shift();
    }
    
    const averageRenderTime = renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length;
    
    // Log if render time is unusually high
    if (renderTime > 16) { // More than one frame at 60fps
      logger.warn('Slow component render detected', {
        componentName,
        payload: {
          renderTime,
          averageRenderTime,
          renderCount: renderCount.current
        }
      });
    }
    
    logger.performanceMetric('render_time', renderTime, componentName);
    
    renderStartTime.current = 0;
  }, [componentName]);

  const getMetrics = useCallback((): PerformanceMetrics => {
    const averageRenderTime = renderTimes.current.length > 0
      ? renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length
      : 0;
    
    return {
      componentName,
      renderTime: renderTimes.current[renderTimes.current.length - 1] || 0,
      renderCount: renderCount.current,
      averageRenderTime
    };
  }, [componentName]);

  // Measure render time automatically
  useEffect(() => {
    startMeasurement();
    return endMeasurement;
  });

  return {
    startMeasurement,
    endMeasurement,
    getMetrics
  };
}

/**
 * Hook to monitor async operations performance
 * @param operationName - Name of the operation being monitored
 * @returns Performance monitoring function for async operations
 */
export function useAsyncPerformanceMonitor(operationName: string) {
  const measureAsync = useCallback(async <T>(
    operation: () => Promise<T>,
    context?: Record<string, unknown>
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await operation();
      const duration = performance.now() - startTime;
      
      logger.performanceMetric(operationName, duration);
      
      if (duration > 1000) { // More than 1 second
        logger.warn('Slow async operation detected', {
          payload: {
            operationName,
            duration,
            ...context
          }
        });
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      logger.error('Async operation failed', {
        errorDetails: {
          message: (error as Error).message,
          stack: (error as Error).stack
        },
        payload: {
          operationName,
          duration,
          ...context
        }
      });
      throw error;
    }
  }, [operationName]);

  return { measureAsync };
}
