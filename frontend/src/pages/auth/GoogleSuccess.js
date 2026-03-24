import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMe } from '../../utils/api';

const GoogleSuccess = () => {
  const [searchParams] = useSearchParams();
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleGoogleLogin = async () => {
      const token = searchParams.get('token');
      const role = searchParams.get('role');

      if (!token) {
        navigate('/login');
        return;
      }

      // Store token
      localStorage.setItem('token', token);

      // Get user info
      try {
        const res = await getMe();
        loginUser(token, res.data.user);

        // Redirect based on role
        if (role === 'admin') navigate('/admin/dashboard');
        else if (role === 'hr') navigate('/hr/dashboard');
        else if (role === 'mentor') navigate('/mentor/dashboard');
        else navigate('/intern/dashboard');

      } catch (err) {
        navigate('/login');
      }
    };

    handleGoogleLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '14px',
      background: 'var(--bg)',
      fontFamily: 'Plus Jakarta Sans, sans-serif'
    }}>
      <div className="spinner"></div>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
        Completing Google Sign In...
      </p>
    </div>
  );
};

export default GoogleSuccess;