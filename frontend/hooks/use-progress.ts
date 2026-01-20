import { useState, useEffect } from 'react';
import { getProgress } from '@/lib/api';
import { POLLING_INTERVAL } from '@/lib/constants';
import type { ProgressResponse } from '@/types';

export function useProgress(uploadId: string | null) {
  const [data, setData] = useState<ProgressResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!uploadId) {
      setIsLoading(false);
      return;
    }

    const fetchProgress = async () => {
      try {
        const progressData = await getProgress(uploadId);
        setData(progressData);
        setIsLoading(false);
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
      }
    };

    fetchProgress();
    const interval = setInterval(fetchProgress, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [uploadId]);

  return { data, isLoading, error };
}
