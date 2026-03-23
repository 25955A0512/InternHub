import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const demoAccounts = [
  { role: 'Admin', email: 'admin@internship.com', password: 'admin123', color: '#7C3AED', bg: '#F5F3FF' },
  { role: 'HR Manager', email: 'hr1@test.com', password: 'hr123', color: '#0EA5E9', bg: '#E0F2FE' },
  { role: 'Mentor', email: 'mentor1@test.com', password: 'mentor123', color: '#10B981', bg: '#D1FAE5' },
  { role: 'Intern', email: 'intern1@test.com', password: 'intern123', color: '#F59E0B', bg: '#FEF3C7' },
];

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await login(formData);
      loginUser(res.data.token, res.data.user);
      const role = res.data.user.role;
      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'hr') navigate('/hr/dashboard');
      else if (role === 'mentor') navigate('/mentor/dashboard');
      else navigate('/intern/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #EEF2FF 0%, #F8FAFF 50%, #F0FDF4 100%)',
      display: 'flex',
      fontFamily: 'Plus Jakarta Sans, sans-serif'
    }}>

      {/* Left Panel — Hidden on mobile */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(160deg, #1E1B4B 0%, #312E81 60%, #4F46E5 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px',
        position: 'relative',
        overflow: 'hidden'
      }} className="hidden lg:flex">

        {/* BG Circles */}
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '280px', height: '280px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
        <div style={{ position: 'absolute', top: '40%', right: '10%', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(129,140,248,0.1)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '56px' }}>
            <div style={{ width: '46px', height: '46px', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', borderRadius: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z" fill="white" opacity="0.9"/>
                <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" fill="white" opacity="0.7"/>
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: '800', fontSize: '20px', color: 'white', letterSpacing: '-0.3px' }}>InternHub</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: '400' }}>Internship Management Platform</div>
            </div>
          </div>

          <h1 style={{ fontSize: '46px', fontWeight: '800', color: 'white', lineHeight: '1.1', letterSpacing: '-1px', marginBottom: '20px' }}>
            Manage your<br />
            <span style={{ color: '#A5B4FC' }}>internship</span><br />
            program.
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.55)', lineHeight: '1.7', maxWidth: '380px', marginBottom: '48px' }}>
            From intern registration to AI face recognition attendance, task management, evaluations and digital certificates — all in one platform.
          </p>

          {/* Features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { icon: '📸', text: 'AI Face Recognition Attendance' },
              { icon: '📋', text: 'Smart Task & Project Management' },
              { icon: '📜', text: 'Digital Certificates with QR Verification' },
              { icon: '📊', text: 'Real-time Analytics & Reports' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.08)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>
                  {f.icon}
                </div>
                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.65)', fontWeight: '500' }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div style={{
        width: '100%',
        maxWidth: '480px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
        background: 'white'
      }}>
        <div style={{ width: '100%', maxWidth: '380px' }} className="fade-up">

          {/* Mobile Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '36px' }}>
            <div style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z" fill="white"/>
                <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" fill="white" opacity="0.7"/>
              </svg>
            </div>
            <span style={{ fontWeight: '800', fontSize: '18px', color: '#111827' }}>InternHub</span>
          </div>

          <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#111827', marginBottom: '6px', letterSpacing: '-0.4px' }}>Sign in</h2>
          <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '28px' }}>Welcome back! Enter your credentials to continue.</p>

          {error && (
            <div className="msg-error">⚠️ {error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Email Address</label>
              <input
                type="email" name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="input"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Password</label>
              <input
                type="password" name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                className="input"
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '15px', justifyContent: 'center', marginTop: '4px', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                  Signing in...
                </>
              ) : 'Sign In →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: '#6B7280', marginTop: '20px', fontSize: '14px' }}>
            No account?{' '}
            <Link to="/register" style={{ color: '#4F46E5', fontWeight: '700', textDecoration: 'none' }}>
              Create one →
            </Link>
          </p>

          {/* Demo */}
          <div style={{ marginTop: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ flex: 1, height: '1px', background: '#F3F4F6' }} />
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Quick Demo</span>
              <div style={{ flex: 1, height: '1px', background: '#F3F4F6' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {demoAccounts.map((a, i) => (
                <button key={i}
                  onClick={() => setFormData({ email: a.email, password: a.password })}
                  style={{ padding: '10px 12px', background: a.bg, borderRadius: '10px', cursor: 'pointer', border: `1.5px solid ${a.color}25`, transition: 'all 0.18s', textAlign: 'left', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 4px 12px ${a.color}20`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: a.color, marginBottom: '2px' }}>{a.role}</div>
                  <div style={{ fontSize: '11px', color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.email}</div>
                </button>
              ))}
            </div>
            <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: '11px', marginTop: '8px' }}>Click any role to auto-fill</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;