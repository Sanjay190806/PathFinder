const DEVICE_ID_KEY = 'sanzz_os_device_id_v1';

export function getOrCreateDeviceId(): string {
  const existing = localStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;
  const id = crypto.randomUUID ? crypto.randomUUID() : `device-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  localStorage.setItem(DEVICE_ID_KEY, id);
  return id;
}

export function getDeviceName(): string {
  const ua = navigator.userAgent;
  const browser = ua.includes('Edg/') ? 'Edge' : ua.includes('Chrome/') ? 'Chrome' : ua.includes('Firefox/') ? 'Firefox' : 'Browser';
  const os = ua.includes('Windows') ? 'Windows' : ua.includes('Android') ? 'Android' : ua.includes('Mac') ? 'macOS' : 'Device';
  return `${browser} on ${os}`;
}

export function useDeviceId(): string {
  return getOrCreateDeviceId();
}
