/**
 * JWT from POST /api/auth/login (stored in localStorage).
 * Offline demo: set REACT_APP_USE_LOCAL_STORE=true — token is still set by local mock login.
 */
const TOKEN_KEY = 'eventsync_allocation_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}
