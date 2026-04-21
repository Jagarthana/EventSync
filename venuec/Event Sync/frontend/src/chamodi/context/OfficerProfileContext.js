import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getToken } from '../api/client';
import { profileService } from '../api/services';

const DEFAULT_ROLE = 'Venue and Resources Allocation Officer';

const DEFAULTS = {
  displayName: 'K. Perera',
  department: 'Facilities Management Unit',
  roleTitle: DEFAULT_ROLE,
  phone: '',
  avatarDataUrl: '',
  email: '',
};

function normalizeProfile(data, emailFallback) {
  if (!data) {
    return { ...DEFAULTS, email: emailFallback || '' };
  }
  const merged = {
    ...DEFAULTS,
    ...data,
    email: data.email || emailFallback || '',
    avatarDataUrl: typeof data.avatarDataUrl === 'string' ? data.avatarDataUrl : '',
  };
  if (!data.roleTitle || data.roleTitle === 'Facilities Officer') {
    merged.roleTitle = DEFAULT_ROLE;
  }
  return merged;
}

const OfficerProfileContext = createContext(null);

export function OfficerProfileProvider({ userEmail, children }) {
  const [profile, setProfile] = useState(() => normalizeProfile(null, userEmail));
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!getToken()) {
      setProfile(normalizeProfile(null, userEmail));
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data } = await profileService.get();
      setProfile(normalizeProfile(data, userEmail));
    } catch {
      setProfile(normalizeProfile(null, userEmail));
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    const onCustom = () => fetchProfile();
    window.addEventListener('allocation-profile-updated', onCustom);
    return () => window.removeEventListener('allocation-profile-updated', onCustom);
  }, [fetchProfile]);

  const updateProfile = useCallback(async (partial) => {
    const { data } = await profileService.update(partial);
    const next = normalizeProfile(data, userEmail);
    setProfile(next);
    window.dispatchEvent(new Event('allocation-profile-updated'));
    return next;
  }, [userEmail]);

  const value = useMemo(
    () => ({
      profile,
      loading,
      updateProfile,
      refreshProfile: fetchProfile,
    }),
    [profile, loading, updateProfile, fetchProfile]
  );

  return <OfficerProfileContext.Provider value={value}>{children}</OfficerProfileContext.Provider>;
}

export function useOfficerProfile() {
  const ctx = useContext(OfficerProfileContext);
  if (!ctx) {
    throw new Error('useOfficerProfile must be used within OfficerProfileProvider');
  }
  return ctx;
}
