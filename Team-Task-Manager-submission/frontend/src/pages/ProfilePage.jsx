import { BriefcaseBusiness, Camera, Save, TrendingUp, UserRound } from 'lucide-react';
import { useState } from 'react';
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
  const [profilePicture, setProfilePicture] = useState(user.profilePicture || '');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

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
      setProfilePicture(reader.result);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const saveAdminPicture = async (event) => {
    event.preventDefault();
    if (!isAdmin) return;

    setSaving(true);
    setError(null);
    setSuccess('');

    try {
      const data = await apiRequest(`/users/${user._id}/profile`, {
        method: 'PATCH',
        body: {
          name: user.name,
          designation: user.designation || '',
          productivity: user.productivity || 0,
          profilePicture
        }
      });
      updateStoredUser(data.user);
      setSuccess('Profile picture updated successfully.');
    } catch (apiError) {
      setError(apiError);
    } finally {
      setSaving(false);
    }
  };

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

      <section className="profile-layout profile-layout-readonly">
        <article className="profile-preview">
          <img
            className="profile-avatar"
            src={profilePicture || defaultAvatar}
            alt={`${user.name} profile`}
          />
          <div>
            <h3>{user.name}</h3>
            <p>{user.designation || user.role}</p>
          </div>
          <div className="profile-stat-grid">
            <div>
              <TrendingUp size={18} />
              <span>Productivity</span>
              <strong>{user.productivity || 0}%</strong>
            </div>
            <div>
              <BriefcaseBusiness size={18} />
              <span>Serving</span>
              <strong>{serviceLength(user.createdAt)}</strong>
            </div>
          </div>
        </article>

        <form className="management-form profile-form" onSubmit={saveAdminPicture}>
          <div className="form-grid">
            <label>
              Name
              <input value={user.name || ''} disabled />
            </label>
            <label>
              Designation
              <input value={user.designation || user.role} disabled />
            </label>
          </div>
          <div className="profile-readonly-grid">
            <div>
              <UserRound size={18} />
              <span>Role</span>
              <strong>{user.role}</strong>
            </div>
            <div>
              <BriefcaseBusiness size={18} />
              <span>Serving in company</span>
              <strong>{serviceLength(user.createdAt)}</strong>
            </div>
            <div>
              <TrendingUp size={18} />
              <span>Productivity</span>
              <strong>{user.productivity || 0}%</strong>
            </div>
          </div>
          {isAdmin && (
            <>
              <label>
                Choose profile picture
                <div className="file-upload-row">
                  <Camera size={18} />
                  <input type="file" accept="image/*" onChange={uploadProfilePicture} />
                </div>
              </label>
              <button className="primary-button" disabled={saving}>
                <Save size={18} />
                {saving ? 'Saving...' : 'Save profile picture'}
              </button>
            </>
          )}
        </form>
      </section>
    </div>
  );
};

export default ProfilePage;
