import { useState, useEffect, useRef } from 'react';
import { apiClient } from '../api/client';
import type { JobStatus } from '../types/api';

export function useJobPolling(jobId: string | null, intervalMs: number = 3000) {
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!jobId) {
      setJobStatus(null);
      setError(null);
      setIsPolling(false);
      return;
    }

    setIsPolling(true);
    setError(null);

    const poll = async () => {
      try {
        const status = await apiClient.getJobStatus(jobId);
        setJobStatus(status);
        
        if (status.status === 'SUCCESS' || status.status === 'FAILURE') {
          setIsPolling(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Polling failed');
        setIsPolling(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    };

    // Initial poll
    poll();

    // Set up interval
    intervalRef.current = setInterval(poll, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [jobId, intervalMs]);

  return { jobStatus, error, isPolling };
}