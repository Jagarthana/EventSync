import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AllocationPageShell from '../components/AllocationPageShell';
import { useOfficerProfile } from '../context/OfficerProfileContext';
import { getInitialsFromName } from '../utils/userDisplay';
import '../styles/OfficerProfile.css';

const MAX_AVATAR_BYTES = 1.5 * 1024 * 1024;

function OfficerProfile() {
  const { profile, updateProfile } = useOfficerProfile();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    displayName: profile.displayName,
    email: profile.email,
    department: profile.department,
    roleTitle: profile.roleTitle,
    phone: profile.phone || '',
  });
  const [avatarDataUrl, setAvatarDataUrl] = useState(profile.avatarDataUrl || '');
  const [saved, setSaved] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    setForm({
      displayName: profile.displayName,
      email: profile.email,
      department: profile.department,
      roleTitle: profile.roleTitle,
      phone: profile.phone || '',
    });
    setAvatarDataUrl(profile.avatarDataUrl || '');
  }, [
    profile.displayName,
    profile.email,
    profile.department,
    profile.roleTitle,
    profile.phone,
    profile.avatarDataUrl,
  ]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setSaved(false);
    setSaveError('');
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    setPhotoError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setPhotoError('Please choose an image file (PNG, JPG, or WebP).');
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setPhotoError('Image must be about 1.5 MB or smaller.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setAvatarDataUrl(result);
      setSaved(false);
    };
    reader.onerror = () => setPhotoError('Could not read that file.');
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removePhoto = () => {
    setAvatarDataUrl('');
    setPhotoError('');
    setSaved(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError('');
    setSaving(true);
    try {
      await updateProfile({
        displayName: form.displayName.trim(),
        email: form.email.trim(),
        department: form.department.trim(),
        roleTitle: form.roleTitle.trim(),
        phone: form.phone.trim(),
        avatarDataUrl: avatarDataUrl || '',
      });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 3500);
    } catch (err) {
      setSaveError(err.message || 'Could not save profile');
    } finally {
      setSaving(false);
    }
  };

  const previewInitials = getInitialsFromName(form.displayName);

  const actions = (
    <Link to="/allocation-dashboard" className="es-btn es-btn--secondary">
      ← Back to dashboard
    </Link>
  );

  return (
    <AllocationPageShell
      eyebrow="ACCOUNT"
      title="Your profile"
      subtitle="Update your photo, name, and work details. Changes are saved to the server."
      actions={actions}
    >
      <div className="officer-profile__grid">
        <form className="officer-profile__card es-card" onSubmit={handleSubmit}>
          <h2 className="officer-profile__card-title">Profile &amp; contact</h2>
          <p className="officer-profile__hint">Your profile is stored securely on the server.</p>

          <div className="officer-profile__photo-block">
            <div className="officer-profile__photo-preview">
              {avatarDataUrl ? (
                <img src={avatarDataUrl} alt="" className="officer-profile__photo-img" />
              ) : (
                <span className="officer-profile__photo-initials" aria-hidden>
                  {previewInitials}
                </span>
              )}
            </div>
            <div className="officer-profile__photo-actions">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="officer-profile__file-input"
                onChange={handlePhotoChange}
                aria-label="Upload profile picture"
              />
              <button
                type="button"
                className="es-btn es-btn--primary officer-profile__upload-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
                Upload photo
              </button>
              {avatarDataUrl && (
                <button type="button" className="es-btn es-btn--secondary" onClick={removePhoto}>
                  Remove photo
                </button>
              )}
              <p className="officer-profile__photo-hint">PNG, JPG, or WebP · max ~1.5 MB</p>
              {photoError && (
                <p className="officer-profile__photo-error" role="alert">
                  {photoError}
                </p>
              )}
            </div>
          </div>

          <label className="officer-profile__field">
            <span>Full name</span>
            <input name="displayName" value={form.displayName} onChange={handleChange} autoComplete="name" required />
          </label>
          <label className="officer-profile__field">
            <span>Work email</span>
            <input name="email" type="email" value={form.email} onChange={handleChange} autoComplete="email" required />
          </label>
          <label className="officer-profile__field">
            <span>Department / unit</span>
            <input name="department" value={form.department} onChange={handleChange} />
          </label>
          <label className="officer-profile__field">
            <span>Role title</span>
            <input
              name="roleTitle"
              value={form.roleTitle}
              onChange={handleChange}
              placeholder="Venue and Resources Allocation Officer"
            />
          </label>
          <label className="officer-profile__field">
            <span>Phone (optional)</span>
            <input name="phone" value={form.phone} onChange={handleChange} autoComplete="tel" />
          </label>

          {saveError && (
            <p className="officer-profile__photo-error" role="alert">
              {saveError}
            </p>
          )}

          <div className="officer-profile__actions">
            <button type="submit" className="es-btn es-btn--primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            {saved && (
              <span className="officer-profile__saved" role="status">
                Profile updated
              </span>
            )}
          </div>
        </form>

        <aside className="officer-profile__aside es-card">
          <h3 className="officer-profile__aside-title">Live preview</h3>
          <p className="officer-profile__aside-text">How you appear in the header and sidebar after saving.</p>
          <div className="officer-profile__preview">
            {avatarDataUrl ? (
              <img src={avatarDataUrl} alt="" className="officer-profile__preview-img" />
            ) : (
              <div className="officer-profile__preview-avatar" aria-hidden>
                {previewInitials}
              </div>
            )}
            <div>
              <strong>{form.displayName || '—'}</strong>
              <div className="officer-profile__preview-meta">{form.roleTitle}</div>
              <div className="officer-profile__preview-meta">{form.department}</div>
            </div>
          </div>
        </aside>
      </div>
    </AllocationPageShell>
  );
}

export default OfficerProfile;
