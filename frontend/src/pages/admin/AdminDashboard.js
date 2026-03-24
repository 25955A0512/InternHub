import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { LayoutDashboard, Users, UserCheck, BarChart3, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { getAllInterns, getAllMentors } from '../../utils/api';
import Leaderboard from '../shared/Leaderboard';
import { Trophy } from 'lucide-react';

const AdminDashboard = () => {
  const [interns, setInterns] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [i, m] = await Promise.all([getAllInterns(), getAllMentors()]);
      setInterns(i.data.interns);
      setMentors(m.data.mentors);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '14px' }}>
      <div className="spinner"></div>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading...</p>
    </div>
  );

  const navItems = [
    {
      id: 'overview', icon: <LayoutDashboard size={15} />, label: 'Dashboard',
      content: (
        <div>
          <div className="page-header">
            <div>
              <h1 className="page-title">Admin Dashboard</h1>
              <p className="page-subtitle">Complete system overview and management</p>
            </div>
            <div style={{ padding: '10px 16px', background: 'var(--primary-light)', borderRadius: '10px', border: '1px solid var(--primary)20' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
            {[
              { label: 'Total Interns', value: interns.length, color: 'indigo', icon: <Users size={18} /> },
              { label: 'Active', value: interns.filter(i => i.status === 'active').length, color: 'green', icon: <CheckCircle size={18} /> },
              { label: 'Pending', value: interns.filter(i => i.status === 'pending').length, color: 'amber', icon: <Clock size={18} /> },
              { label: 'Mentors', value: mentors.length, color: 'violet', icon: <UserCheck size={18} /> },
            ].map((s, i) => (
              <div key={i} className={`stat-card ${s.color} fade-up-${i + 1}`}>
                <div className="stat-accent"></div>
                <div className="stat-icon">{s.icon}</div>
                <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: '3px' }}>{s.value}</div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: '500' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>

            {/* Status Breakdown */}
            <div className="card" style={{ padding: '20px' }}>
              <h3 className="section-title" style={{ marginBottom: '16px' }}>Intern Status Breakdown</h3>
              {[
                { label: 'Active', value: interns.filter(i => i.status === 'active').length, color: 'var(--success)', bg: 'var(--success-light)' },
                { label: 'Pending', value: interns.filter(i => i.status === 'pending').length, color: 'var(--warning)', bg: 'var(--warning-light)' },
                { label: 'Completed', value: interns.filter(i => i.status === 'completed').length, color: 'var(--primary)', bg: 'var(--primary-light)' },
                { label: 'Rejected', value: interns.filter(i => i.status === 'rejected').length, color: 'var(--danger)', bg: 'var(--danger-light)' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ width: '32px', height: '32px', background: item.bg, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: item.color }}>{item.value}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>{item.label}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {interns.length > 0 ? Math.round((item.value / interns.length) * 100) : 0}%
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${interns.length > 0 ? (item.value / interns.length) * 100 : 0}%`, background: item.color }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="card" style={{ padding: '20px' }}>
              <h3 className="section-title" style={{ marginBottom: '16px' }}>Platform Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {[
                  { label: 'Total Users', value: interns.length + mentors.length, icon: '👥' },
                  { label: 'Active Internships', value: interns.filter(i => i.status === 'active').length, icon: '🎯' },
                  { label: 'Completion Rate', value: `${interns.length > 0 ? Math.round((interns.filter(i => i.status === 'completed').length / interns.length) * 100) : 0}%`, icon: '📊' },
                  { label: 'Mentor-to-Intern Ratio', value: mentors.length > 0 ? `1:${Math.round(interns.length / mentors.length)}` : 'N/A', icon: '⚖️' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: i < 3 ? '1px solid var(--border-light)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>{item.icon}</span>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>{item.label}</span>
                    </div>
                    <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Interns Table */}
          <div className="card" style={{ overflow: 'hidden', marginBottom: '16px' }}>
            <div className="section-header">
              <span className="section-title">All Interns</span>
              <span className="badge badge-blue">{interns.length} Total</span>
            </div>
            <div className="table-scroll">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg)' }}>
                    {['Intern', 'College', 'Role Applied', 'Mentor', 'Status'].map(h => (
                      <th key={h} style={{ padding: '11px 20px', textAlign: 'left', fontSize: '11.5px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {interns.map(intern => (
                    <tr key={intern.id} className="table-row" style={{ borderTop: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="avatar" style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: 'white', fontSize: '12px' }}>
                            {intern.full_name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '13.5px', color: 'var(--text-primary)' }}>{intern.full_name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{intern.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>{intern.college}</td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>{intern.role_applied}</td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>{intern.mentor_name || '—'}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <span className={`badge ${intern.status === 'active' ? 'badge-green' : intern.status === 'pending' ? 'badge-yellow' : intern.status === 'completed' ? 'badge-blue' : 'badge-red'}`}>
                          {intern.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mentors Table */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="section-header">
              <span className="section-title">All Mentors</span>
              <span className="badge badge-violet">{mentors.length} Total</span>
            </div>
            <div className="table-scroll">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg)' }}>
                    {['Mentor', 'Department', 'Phone'].map(h => (
                      <th key={h} style={{ padding: '11px 20px', textAlign: 'left', fontSize: '11.5px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mentors.map(m => (
                    <tr key={m.id} className="table-row" style={{ borderTop: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="avatar" style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, var(--success), #059669)', color: 'white', fontSize: '12px' }}>
                            {m.full_name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '13.5px', color: 'var(--text-primary)' }}>{m.full_name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{m.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>{m.department}</td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>{m.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )
    },
       {
      id: 'leaderboard',
      icon: <Trophy size={15} />,
      label: 'Leaderboard',
      content: <Leaderboard />
    }
  ];

  return <Layout navItems={navItems} portalName="Admin Portal" />;
};

export default AdminDashboard;
