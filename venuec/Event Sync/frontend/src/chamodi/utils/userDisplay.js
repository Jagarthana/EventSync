export function getInitialsFromName(name) {
  if (!name || typeof name !== 'string') return 'AO';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0]?.[0] || 'A').toUpperCase() + 'O';
}

/** Prefer display name when provided (e.g. from officer profile). */
export function getInitials(email, displayName) {
  if (displayName && typeof displayName === 'string' && displayName.trim()) {
    return getInitialsFromName(displayName);
  }
  if (!email || typeof email !== 'string') return 'AO';
  const local = email.split('@')[0];
  const parts = local.split(/[._-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  if (local.length >= 2) return local.slice(0, 2).toUpperCase();
  return (local[0] || 'A').toUpperCase() + 'O';
}
