import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

// ── Step 2: OTP Verification Screen ─────────────────────────
function OTPScreen({ email, onSuccess }) {
  const [otp, setOtp]             = useState(['', '', '', '', '', '']);
  const [loading, setLoading]     = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) return setError('Please enter the complete 6-digit code');
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post('/api/auth/verify-otp', { email, otp: code });
      onSuccess(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    setSuccess('');
    try {
      await axios.post('/api/auth/resend-otp', { email });
      setSuccess('A new OTP has been sent to your email!');
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-card page-enter">
      <div className="auth-logo">
        <span className="auth-logo-icon">◈</span>
        <span className="auth-logo-text">NovBank</span>
      </div>

      <div className="otp-icon">✉️</div>
      <h1 className="auth-title">Check your email</h1>
      <p className="auth-subtitle">
        We sent a 6-digit code to<br />
        <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>
      </p>

      {error   && <div className="auth-error">{error}</div>}
      {success && <div className="auth-success">{success}</div>}

      <div className="otp-boxes" onPaste={handlePaste}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={el => inputRefs.current[i] = el}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            className={`otp-box ${digit ? 'filled' : ''}`}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            autoFocus={i === 0}
          />
        ))}
      </div>

      <button className="auth-btn" onClick={handleVerify} disabled={loading}>
        {loading ? <span className="btn-spinner" /> : 'Verify Email'}
      </button>

      <p className="resend-text">
        Didn't receive it?{' '}
        {countdown > 0 ? (
          <span className="resend-countdown">Resend in {countdown}s</span>
        ) : (
          <button className="resend-btn" onClick={handleResend} disabled={resending}>
            {resending ? 'Sending...' : 'Resend OTP'}
          </button>
        )}
      </p>

      <p className="auth-switch" style={{ marginTop: '8px' }}>
        Wrong email? <Link to="/register">Go back</Link>
      </p>
    </div>
  );
}

// ── Step 1: Registration Form ────────────────────────────────
export default function RegisterPage() {
  const [form, setForm]         = useState({ fullName: '', email: '', password: '', confirm: '' });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [step, setStep]         = useState(1);
  const [regEmail, setRegEmail] = useState('');
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    setError('');
    try {
      await axios.post('/api/auth/register', {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
      });
      setRegEmail(form.email);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSuccess = (userData) => {
    localStorage.setItem('novbank_token', userData.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
    navigate('/');
    window.location.reload();
  };

  if (step === 2) {
    return (
      <div className="auth-page">
        <div className="auth-bg">
          <div className="auth-orb orb-1" />
          <div className="auth-orb orb-2" />
        </div>
        <OTPScreen email={regEmail} onSuccess={handleOTPSuccess} />
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb orb-1" />
        <div className="auth-orb orb-2" />
      </div>

      <div className="auth-card page-enter">
        <div className="auth-logo">
          <span className="auth-logo-icon">◈</span>
          <span className="auth-logo-text">NovBank</span>
        </div>

        <h1 className="auth-title">Open an account</h1>
        <p className="auth-subtitle">Get started with $5,000 demo balance</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="fullName" placeholder="John Doe"
              value={form.fullName} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Email address</label>
            <input type="email" name="email" placeholder="you@example.com"
              value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" placeholder="Min 6 characters"
              value={form.password} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" name="confirm" placeholder="••••••••"
              value={form.confirm} onChange={handleChange} required />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <span className="btn-spinner" /> : '→  Send Verification Code'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}