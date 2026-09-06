import { request } from '../apiClient';

export interface AccountDevice {
  id: string;
  userId: string;
  deviceId: string;
  deviceName: string;
  browser?: string | null;
  os?: string | null;
  lastSeenAt: string;
  createdAt: string;
}

export const deviceService = {
  async list(): Promise<AccountDevice[]> {
    const response = await request<{ success: boolean; devices: AccountDevice[] }>('/cloud/devices');
    return response.devices;
  },
  async rename(deviceId: string, deviceName: string): Promise<AccountDevice> {
    const response = await request<{ success: boolean; device: AccountDevice }>(`/cloud/devices/${encodeURIComponent(deviceId)}`, {
      method: 'PATCH',
      body: { deviceName },
    });
    return response.device;
  },
  async remove(deviceId: string): Promise<void> {
    await request(`/cloud/devices/${encodeURIComponent(deviceId)}`, { method: 'DELETE' });
  },
};
