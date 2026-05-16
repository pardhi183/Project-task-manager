import { BriefcaseBusiness, TrendingUp, UserRound } from 'lucide-react';
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
  const { user } = useAuth();

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Profile</p>
          <h2>Profile details</h2>
        </div>
      </header>

      <section className="profile-layout profile-layout-readonly">
        <article className="profile-preview">
          <img
            className="profile-avatar"
            src={user.profilePicture || defaultAvatar}
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

        <div className="management-form profile-form">
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
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;
