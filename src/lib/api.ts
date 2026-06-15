const API_BASE = '/api';

function getHeaders(): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('pmsp-token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function handleResponse(res: Response) {
  if (res.status === 401) {
    localStorage.removeItem('pmsp-token');
    window.location.href = '/';
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }
  return res.json();
}

export async function authLogin(employeeId: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employeeId, password }),
  });
  return handleResponse(res);
}

export async function getCurrentEntry() {
  const res = await fetch(`${API_BASE}/entries/current`, { headers: getHeaders() });
  return handleResponse(res);
}

export async function createEntry(shift: 'DAY' | 'NIGHT') {
  const res = await fetch(`${API_BASE}/entries`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ shift }),
  });
  return handleResponse(res);
}

export async function updateSubAssembly(id: string, subAssembly: any[]) {
  const res = await fetch(`${API_BASE}/entries/${id}/sub-assembly`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ subAssembly }),
  });
  return handleResponse(res);
}

export async function updateUnitParts(id: string, unitParts: any[]) {
  const res = await fetch(`${API_BASE}/entries/${id}/unit-parts`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ unitParts }),
  });
  return handleResponse(res);
}

export async function updateEtios(id: string, etios: any[]) {
  const res = await fetch(`${API_BASE}/entries/${id}/etios`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ etios }),
  });
  return handleResponse(res);
}

export async function saveDraft(id: string) {
  const res = await fetch(`${API_BASE}/entries/${id}/draft`, {
    method: 'PUT',
    headers: getHeaders(),
  });
  return handleResponse(res);
}

export async function submitEntry(id: string, signOff: any) {
  const res = await fetch(`${API_BASE}/entries/${id}/submit`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ signOff }),
  });
  return handleResponse(res);
}

export async function getHistory(page = 1, limit = 20) {
  const res = await fetch(`${API_BASE}/entries/history?page=${page}&limit=${limit}`, {
    headers: getHeaders(),
  });
  return handleResponse(res);
}

export async function getInventory() {
  const res = await fetch(`${API_BASE}/inventory`, { headers: getHeaders() });
  return handleResponse(res);
}

export async function adjustInventory(partName: string, lineType: string, adjustment: number) {
  const res = await fetch(`${API_BASE}/inventory/adjust`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ partName, lineType, adjustment }),
  });
  return handleResponse(res);
}

export async function updateInventoryThreshold(id: string, minThreshold: number, currentStock?: number) {
  const res = await fetch(`${API_BASE}/inventory/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ minThreshold, currentStock }),
  });
  return handleResponse(res);
}

export async function getTargets(shift = 'DAY') {
  const res = await fetch(`${API_BASE}/targets?shift=${shift}`, { headers: getHeaders() });
  return handleResponse(res);
}

export async function updateTarget(partName: string, lineType: string, shift: string, targetQty: number) {
  const res = await fetch(`${API_BASE}/targets`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ partName, lineType, shift, targetQty }),
  });
  return handleResponse(res);
}

export async function getAnalyticsStatus(shift = 'DAY') {
  const res = await fetch(`${API_BASE}/analytics/status?shift=${shift}`, { headers: getHeaders() });
  return handleResponse(res);
}

export async function getAuditLogs(action?: string) {
  const url = action ? `${API_BASE}/analytics/audit-logs?action=${action}` : `${API_BASE}/analytics/audit-logs`;
  const res = await fetch(url, { headers: getHeaders() });
  return handleResponse(res);
}
