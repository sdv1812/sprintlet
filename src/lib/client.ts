export function getClientId(): string {
  if (typeof window === 'undefined') return '';

  let clientId = localStorage.getItem('clientId');
  if (!clientId) {
    clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('clientId', clientId);
  }
  return clientId;
}

export function getUserName(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('userName');
}

export function setUserName(name: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('userName', name);
}
