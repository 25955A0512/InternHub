import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { LogOut, Menu, X, ChevronRight } from 'lucide-react';

const Layout = ({ navItems, portalName, accentColor }) => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(navItems[0]?.id);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNav = (id) => { setActiveTab(id); setMenuOpen(false); };

  const NavItem = ({ item }) => (
    <div onClick={() => handleNav(item.id)}
      className={`nav-item ${activeTab === item.id ? 'active' : ''}`}>
      <span style={{ display: 'flex', alignItems: 'center', opacity: activeTab === item.id ? 1 : 0.6 }}>
        {item.icon}
      </span>
      <span style={{ flex: 1 }}>{item.label}</span>
      {activeTab === item.id && <ChevronRight size={13} style={{ opacity: 0.5 }} />}
    </div>
  );

  const UserSection = () => (
    <div style={{ padding: '12px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <div className="avatar" style={{ width: '34px', height: '34px', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: 'white', fontSize: '13px' }}>
          {user?.email?.[0]?.toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
          <div style={{ color: '#818CF8', fontSize: '11px', fontWeight: '600', textTransform: 'capitalize' }}>{user?.role}</div>
        </div>
      </div>
      <button onClick={() => { logoutUser(); navigate('/login'); }}
        style={{ width: '100%', padding: '7px 12px', background: 'rgba(239,68,68,0.08)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '8px', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.18s' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}>
        <LogOut size={12} /> Sign Out
      </button>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Desktop Sidebar */}
      <div className="sidebar sidebar-desktop"
        style={{ width: '248px', minHeight: '100vh', padding: '18px 10px', display: 'flex', flexDirection: 'column', position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100 }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', marginBottom: '24px' }}>
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z" fill="white"/>
              <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" fill="white" opacity="0.7"/>
            </svg>
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: '800', fontSize: '14.5px', letterSpacing: '-0.2px' }}>InternHub</div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10.5px' }}>{portalName}</div>
          </div>
        </div>

        {/* Nav */}
        <div style={{ padding: '0 8px', marginBottom: '8px', fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Menu
        </div>
        <nav style={{ flex: 1, overflow: 'auto' }}>
          {navItems.map(item => <NavItem key={item.id} item={item} />)}
        </nav>

        {/* Bell */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
          <NotificationBell />
        </div>
        <UserSection />
      </div>

      {/* Mobile Header */}
      <div className="mobile-header"
        style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, background: '#1E1B4B', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '30px', height: '30px', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z" fill="white"/>
              <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" fill="white" opacity="0.7"/>
            </svg>
          </div>
          <span style={{ color: 'white', fontWeight: '800', fontSize: '15px' }}>InternHub</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <NotificationBell />
          <button onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', width: '34px', height: '34px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {menuOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu"
          style={{ position: 'fixed', top: '58px', left: 0, right: 0, bottom: 0, zIndex: 150, background: '#1E1B4B', padding: '12px 10px', overflowY: 'auto' }}>
          <div style={{ padding: '0 8px', marginBottom: '8px', fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '1px' }}>Menu</div>
          <nav style={{ marginBottom: '20px' }}>
            {navItems.map(item => <NavItem key={item.id} item={item} />)}
          </nav>
          <UserSection />
        </div>
      )}

      {/* Main Content */}
      <div className="main-content"
        style={{ marginLeft: '248px', flex: 1, padding: '28px', minHeight: '100vh' }}>
        {navItems.map(item => (
          activeTab === item.id ? <div key={item.id} className="fade-up">{item.content}</div> : null
        ))}
      </div>
    </div>
  );
};

export default Layout;