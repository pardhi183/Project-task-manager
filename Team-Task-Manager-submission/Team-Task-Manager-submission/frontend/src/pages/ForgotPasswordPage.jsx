import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api/client.js';
import ErrorNotice from '../components/ErrorNotice.jsx';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState('email');
  const [form, setForm] = useState({ email: '', otp: '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submitEmail = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage('');

    try {
      const data = await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: { email: form.email }
      });
      setMessage(data.message);
      setOtpRequested(true);
      setStep('otp');
    } catch (apiError) {
      setError(apiError);
    } finally {
      setSaving(false);
    }
  };

  const submitOtp = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage('');

    try {
      const data = await apiRequest('/auth/verify-password-otp', {
        method: 'POST',
        body: { email: form.email, otp: form.otp }
      });
      setMessage(data.message);
      setStep('password');
    } catch (apiError) {
      setError(apiError);
    } finally {
      setSaving(false);
    }
  };

  const submitPassword = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage('');

    try {
      const data = await apiRequest('/auth/reset-password', {
        method: 'POST',
        body: form
      });
      setMessage(data.message);
      setStep('done');
    } catch (apiError) {
      setError(apiError);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="auth-layout">
      <section className="auth-panel compact-auth-panel">
        <div className="auth-copy">
          <div className="brand-mark large">TT</div>
          <h1>Reset Password</h1>
          <p>Use your registered email, verify the OTP, then create a new password.</p>
          <div className="auth-proof">
            <span><CheckCircle2 size={18} /> Registered email OTP</span>
            <span><CheckCircle2 size={18} /> 10 minute expiry</span>
            <span><CheckCircle2 size={18} /> Secure password update</span>
          </div>
        </div>

        {step === 'email' && (
          <form className="auth-form" onSubmit={submitEmail}>
            <div>
              <h2>Forgot password</h2>
              <p>Enter your registered email address. We will send a 6 digit OTP.</p>
            </div>
            <ErrorNotice error={error} />
            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
                required
              />
            </label>
            <button className="primary-button" disabled={saving}>
              {saving ? 'Sending OTP...' : 'Send OTP'}
            </button>
            {otpRequested && (
              <button type="submit" className="resend-otp-link" disabled={saving}>
                Resend OTP
              </button>
            )}
            <p className="form-switch"><Link to="/login">Back to login</Link></p>
          </form>
        )}

        {step === 'otp' && (
          <form className="auth-form" onSubmit={submitOtp}>
            <div>
              <h2>Enter OTP</h2>
              <p>Check your registered email and enter the 6 digit OTP.</p>
            </div>
            {message && <div className="notice success">{message}</div>}
            <ErrorNotice error={error} />
            <label>
              OTP
              <input
                inputMode="numeric"
                maxLength={6}
                value={form.otp}
                onChange={(event) => updateField('otp', event.target.value.replace(/\D/g, ''))}
                required
              />
            </label>
            <button className="primary-button" disabled={saving}>
              {saving ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button type="button" className="secondary-button" onClick={submitEmail} disabled={saving}>
              Resend OTP
            </button>
          </form>
        )}

        {step === 'password' && (
          <form className="auth-form" onSubmit={submitPassword}>
            <div>
              <h2>Create new password</h2>
              <p>Your OTP is verified. Choose a new password for your account.</p>
            </div>
            {message && <div className="notice success">{message}</div>}
            <ErrorNotice error={error} />
            <label>
              New password
              <input
                type="password"
                value={form.password}
                onChange={(event) => updateField('password', event.target.value)}
                minLength={8}
                required
              />
            </label>
            <button className="primary-button" disabled={saving}>
              {saving ? 'Updating...' : 'Update password'}
            </button>
          </form>
        )}

        {step === 'done' && (
          <div className="auth-form">
            <div>
              <h2>Password updated</h2>
              <p>You can now log in with your new password.</p>
            </div>
            {message && <div className="notice success">{message}</div>}
            <Link className="primary-button" to="/login">Go to login</Link>
          </div>
        )}
      </section>
    </main>
  );
};

export default ForgotPasswordPage;
