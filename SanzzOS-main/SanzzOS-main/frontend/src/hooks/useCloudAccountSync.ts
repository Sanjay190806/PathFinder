import { useCallback, useEffect, useState } from 'react';
import { cloudSyncService } from '../services/cloud/cloudSyncService';
import { CloudStatus } from '../services/cloud/cloudApiClient';

export function useCloudAccountSync() {
  const [status, setStatus] = useState<CloudStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setStatus(await cloudSyncService.getStatus());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const push = async () => {
    setLoading(true);
    try {
      const result = await cloudSyncService.pushLocalSnapshot();
      setMessage(result.message || result.error || null);
      await refresh();
      return result;
    } finally {
      setLoading(false);
    }
  };

  const pull = async () => {
    setLoading(true);
    try {
      const result = await cloudSyncService.pullCloudSnapshot();
      setMessage(result.message || result.error || null);
      await refresh();
      return result;
    } finally {
      setLoading(false);
    }
  };

  return { status, loading, message, refresh, push, pull };
}
