import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../utils/api';

const Register = () => {
  const [formData, setFormData] = useState({ email: '', password: '', role: 'intern' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(formData);
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #EEF2FF 0%, #F8FAFF 50%, #F0FDF4 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'Plus Jakarta Sans, sans-serif'
    }}>
      <div style={{ width: '100%', maxWidth: '420px', background: 'white', borderRadius: '20px', boxShadow: '0 8px 40px rgba(0,0,0,0.08)', overflow: 'hidden' }} className="fade-up">

        {/* Top Banner */}
        <div style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #4F46E5 100%)', padding: '28px 32px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', position: 'relative' }}>
            <div style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z" fill="white"/>
                <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" fill="white" opacity="0.7"/>
              </svg>
            </div>
            <span style={{ fontWeight: '800', fontSize: '17px', color: 'white' }}>InternHub</span>
          </div>
          <h1 style={{ fontWeight: '800', fontSize: '22px', color: 'white', letterSpacing: '-0.3px', position: 'relative' }}>Create Account</h1>
          <p style={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.6)', position: 'relative', marginTop: '4px' }}>Join InternHub and start your journey</p>
        </div>

        {/* Form */}
        <div style={{ padding: '28px 32px' }}>
          {error && <div className="msg-error" style={{ marginBottom: '16px' }}>⚠️ {error}</div>}
          {success && <div className="msg-success" style={{ marginBottom: '16px' }}>✅ {success}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange}
                placeholder="you@example.com" required className="input" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange}
                placeholder="Min. 6 characters" required className="input" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>I am a...</label>
              <select name="role" value={formData.role} onChange={handleChange} className="input">
                <option value="intern">🎓 Intern</option>
                <option value="mentor">👨‍💼 Mentor</option>
                <option value="hr">👩‍💼 HR Manager</option>
                <option value="admin">⚙️ Admin</option>
              </select>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary"
              style={{ justifyContent: 'center', padding: '12px', fontSize: '14.5px', marginTop: '4px', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: '#6B7280', marginTop: '20px', fontSize: '14px' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#4F46E5', fontWeight: '700', textDecoration: 'none' }}>Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;