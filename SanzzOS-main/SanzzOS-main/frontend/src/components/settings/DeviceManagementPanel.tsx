import React, { useEffect, useState } from 'react';
import { MonitorSmartphone } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { AccountDevice, deviceService } from '../../services/cloud/deviceService';
import { useAuthStore } from '../../app/store/useAuthStore';
import { getOrCreateDeviceId } from '../../hooks/useDeviceId';

export const DeviceManagementPanel: React.FC = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [devices, setDevices] = useState<AccountDevice[]>([]);
  const currentDeviceId = getOrCreateDeviceId();

  const load = async () => {
    if (!isAuthenticated) return;
    try {
      setDevices(await deviceService.list());
    } catch {
      setDevices([]);
    }
  };

  useEffect(() => {
    load();
  }, [isAuthenticated]);

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center gap-3 border-b border-border-subtle/50 pb-3">
        <MonitorSmartphone className="h-4 w-4 text-accentPurple" />
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Devices</p>
          <h3 className="mt-1 text-lg font-semibold text-textPrimary">Signed-in devices</h3>
        </div>
      </div>
      {devices.length === 0 ? <p className="text-xs text-textSecondary">{isAuthenticated ? 'No device records yet. Push a cloud snapshot to register this device.' : 'Sign in to view devices.'}</p> : (
        <div className="flex flex-col gap-2">
          {devices.map((device) => (
            <div key={device.id} className="flex items-center justify-between gap-3 rounded-xl border border-border-subtle bg-black/35 p-3 text-xs">
              <div className="min-w-0">
                <p className="font-semibold text-textPrimary">{device.deviceName} {device.deviceId === currentDeviceId ? '(current)' : ''}</p>
                <p className="truncate text-textMuted">Last seen {new Date(device.lastSeenAt).toLocaleString()}</p>
              </div>
              {device.deviceId !== currentDeviceId && <Button size="sm" variant="outline" onClick={() => deviceService.remove(device.deviceId).then(load)}>Remove</Button>}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
