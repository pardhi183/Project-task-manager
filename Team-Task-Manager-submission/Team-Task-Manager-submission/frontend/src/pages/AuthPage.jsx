import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import ErrorNotice from '../components/ErrorNotice.jsx';
import { useAuth } from '../state/AuthContext.jsx';

const AuthPage = ({ mode }) => {
  const isSignup = mode === 'signup';
  const navigate = useNavigate();
  const { user, login, signup } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    employeeId: '',
    password: '',
    role: 'User'
  });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (isSignup) {
        await signup(form);
      } else {
        await login({ email: form.email, password: form.password, role: form.role });
      }
      navigate('/');
    } catch (apiError) {
      setError(apiError);
      if (!isSignup && Number.isInteger(apiError.attemptsLeft)) {
        window.alert(`${apiError.message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="auth-layout">
      <section className="auth-panel">
        <div className="auth-copy">
          <div className="brand-mark large">TT</div>
          <h1>Team Task Manager</h1>
          <p>Plan projects, assign work, and keep every owner clear on what needs attention today.</p>
          <div className="auth-proof">
            <span><CheckCircle2 size={18} /> Role-based access</span>
            <span><CheckCircle2 size={18} /> Assignment dashboards</span>
            <span><CheckCircle2 size={18} /> Deadline visibility</span>
          </div>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div>
            <h2>{isSignup ? 'Create account' : 'Sign in'}</h2>
          </div>
          <ErrorNotice error={error} />
          {!isSignup && (
            <label>
              Sign in as
              <select value={form.role} onChange={(event) => updateField('role', event.target.value)}>
                <option>User</option>
                <option>Employee</option>
                <option>Admin</option>
              </select>
            </label>
          )}
          {isSignup && (
            <label>
              Name
              <input
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                minLength={2}
                required
              />
            </label>
          )}
          {isSignup ? (
            <>
              <label>
                Email
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField('email', event.target.value)}
                  required
                />
              </label>
              <label>
                Mobile number
                <input
                  inputMode="numeric"
                  maxLength={10}
                  value={form.mobileNumber}
                  onChange={(event) => updateField('mobileNumber', event.target.value.replace(/\D/g, ''))}
                  required
                />
              </label>
            </>
          ) : (
            <label>
              Email, Mobile number or Employee ID
              <input
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
                required
              />
            </label>
          )}
          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) => updateField('password', event.target.value)}
              minLength={8}
              required
            />
          </label>
          {!isSignup && (
            <Link className="forgot-password-link" to="/forgot-password">Forgot password?</Link>
          )}
          {isSignup && (
            <label>
              Role
              <select value={form.role} onChange={(event) => updateField('role', event.target.value)}>
                <option>Admin</option>
                <option>User</option>
                <option>Employee</option>
              </select>
            </label>
          )}
          {isSignup && form.role === 'Employee' && (
            <label>
              Employee ID
              <input
                type="number"
                min="5000"
                max="10000"
                value={form.employeeId}
                onChange={(event) => updateField('employeeId', event.target.value)}
                required
              />
            </label>
          )}
          <button className="primary-button" disabled={saving}>
            {saving ? 'Please wait...' : isSignup ? 'Create account' : 'Log in'}
          </button>
          <p className="form-switch">
            {isSignup ? 'Already have an account?' : 'Need an account?'}{' '}
            <Link to={isSignup ? '/login' : '/signup'}>{isSignup ? 'Log in' : 'Sign up'}</Link>
          </p>
        </form>
      </section>
    </main>
  );
};

export default AuthPage;
