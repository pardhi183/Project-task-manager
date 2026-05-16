import { BriefcaseBusiness, Camera, Save, TrendingUp, UserRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../api/client.js';
import ErrorNotice from '../components/ErrorNotice.jsx';
import { useAuth } from '../state/AuthContext.jsx';

const defaultAvatar = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220" viewBox="0 0 220 220"><rect width="220" height="220" fill="%23e0f2f1"/><circle cx="110" cy="78" r="40" fill="%230f766e"/><path d="M38 198c10-48 39-74 72-74s62 26 72 74" fill="%230f766e"/></svg>';

const serviceLength = (createdAt) => {
  if (!createdAt) return 'New member';

  const start = new Date(createdAt);
  const now = new Date();
  const totalMonths = Math.max(0, (now.getFullYear() - start.getFullYear()) * 12 + now.getMonth() - start.getMonth());
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (years && months) return `${years} year${years > 1 ? 's' : ''}, ${months} month${months > 1 ? 's' : ''}`;
  if (years) return `${years} year${years > 1 ? 's' : ''}`;
  if (months) return `${months} month${months > 1 ? 's' : ''}`;
  return 'Less than 1 month';
};

const ProfilePage = () => {
  const { user, isAdmin, updateStoredUser } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [selectedId, setSelectedId] = useState(user._id);
  const [form, setForm] = useState({
    name: user.name || '',
    designation: user.designation || '',
    productivity: user.productivity || 0,
    profilePicture: user.profilePicture || ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const selectedProfile = useMemo(
    () => profiles.find((profile) => profile._id === selectedId) || user,
    [profiles, selectedId, user]
  );

  const loadProfiles = async () => {
    const data = await apiRequest('/users/profiles');
    setProfiles(data.users || []);
    const firstProfile = isAdmin ? data.users?.[0] : data.users?.[0] || user;
    if (firstProfile) setSelectedId(firstProfile._id);
  };

  useEffect(() => {
    loadProfiles()
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setForm({
      name: selectedProfile.name || '',
      designation: selectedProfile.designation || '',
      productivity: selectedProfile.productivity || 0,
      profilePicture: selectedProfile.profilePicture || ''
    });
    setSuccess('');
  }, [selectedProfile]);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const uploadProfilePicture = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError({ message: 'Please choose an image file' });
      return;
    }

    if (file.size > 900 * 1024) {
      setError({ message: 'Profile picture must be smaller than 900 KB' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateForm('profilePicture', reader.result);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    if (!isAdmin) return;

    setError(null);
    setSuccess('');
    setSaving(true);

    try {
      const data = await apiRequest(`/users/${selectedId}/profile`, {
        method: 'PATCH',
        body: {
          ...form,
          productivity: Number(form.productivity)
        }
      });

      setProfiles((current) => current.map((profile) => (
        profile._id === data.user._id ? data.user : profile
      )));
      if (data.user._id === user._id) updateStoredUser(data.user);
      setSuccess('Profile updated successfully.');
    } catch (apiError) {
      setError(apiError);
    } finally {
      setSaving(false);
    }
  };

  const canEdit = isAdmin;

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Profile</p>
          <h2>Profile details</h2>
        </div>
      </header>

      <ErrorNotice error={error} />
      {success && <div className="notice success">{success}</div>}

      {loading ? (
        <p className="muted">Loading profile...</p>
      ) : (
        <section className="profile-layout">
          <article className="profile-preview">
            <img
              className="profile-avatar"
              src={selectedProfile.profilePicture || defaultAvatar}
              alt={`${selectedProfile.name} profile`}
            />
            <div>
              <h3>{selectedProfile.name}</h3>
              <p>{selectedProfile.designation || selectedProfile.role}</p>
            </div>
            <div className="profile-stat-grid">
              <div>
                <TrendingUp size={18} />
                <span>Productivity</span>
                <strong>{selectedProfile.productivity || 0}%</strong>
              </div>
              <div>
                <BriefcaseBusiness size={18} />
                <span>Serving</span>
                <strong>{serviceLength(selectedProfile.createdAt)}</strong>
              </div>
            </div>
          </article>

          <form className="management-form profile-form" onSubmit={saveProfile}>
            {isAdmin && (
              <label>
                Select profile
                <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
                  {profiles.map((profile) => (
                    <option key={profile._id} value={profile._id}>
                      {profile.name} - {profile.role}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <div className="form-grid">
              <label>
                Name
                <input
                  value={form.name}
                  onChange={(event) => updateForm('name', event.target.value)}
                  disabled={!canEdit}
                  required
                />
              </label>
              <label>
                Designation
                <input
                  value={form.designation}
                  onChange={(event) => updateForm('designation', event.target.value)}
                  disabled={!canEdit}
                  placeholder="Manager, Developer, HR"
                />
              </label>
            </div>

            <label>
              Profile picture
              <div className="file-upload-row">
                <Camera size={18} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={uploadProfilePicture}
                  disabled={!canEdit}
                />
              </div>
            </label>

            {form.profilePicture && (
              <div className="profile-upload-preview">
                <img src={form.profilePicture} alt="Selected profile preview" />
                {canEdit && (
                  <button type="button" className="secondary-button" onClick={() => updateForm('profilePicture', '')}>
                    Remove picture
                  </button>
                )}
              </div>
            )}

            <label>
              Productivity
              <input
                type="range"
                min="0"
                max="100"
                value={form.productivity}
                onChange={(event) => updateForm('productivity', event.target.value)}
                disabled={!canEdit}
              />
              <strong className="range-value">{form.productivity}%</strong>
            </label>

            <div className="profile-readonly-grid">
              <div>
                <UserRound size={18} />
                <span>Role</span>
                <strong>{selectedProfile.role}</strong>
              </div>
              <div>
                <BriefcaseBusiness size={18} />
                <span>Serving in company</span>
                <strong>{serviceLength(selectedProfile.createdAt)}</strong>
              </div>
            </div>

            {isAdmin ? (
              <button className="primary-button" disabled={saving}>
                <Save size={18} />
                {saving ? 'Saving...' : 'Save profile'}
              </button>
            ) : (
              <div className="notice">
                Only Admin can change profile picture, name, designation, and productivity.
              </div>
            )}
          </form>
        </section>
      )}
    </div>
  );
};

export default ProfilePage;
