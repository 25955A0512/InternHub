import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Users, UserCheck, Award, Search, CheckCircle, AlertCircle, Trophy } from 'lucide-react';
import { getAllInterns, getAllMentors, updateInternStatus, assignMentor, generateCertificate } from '../../utils/api';
import Leaderboard from '../shared/Leaderboard';

const HRDashboard = () => {
  const [interns, setInterns] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { loadData(); }, []);

  const showMsg = (type, text) => { setMessage({ type, text }); setTimeout(() => setMessage(null), 4000); };

  const loadData = async () => {
    try {
      const [i, m] = await Promise.all([getAllInterns(), getAllMentors()]);
      setInterns(i.data.interns);
      setMentors(m.data.mentors);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleStatus = async (id, status) => {
    try { await updateInternStatus(id, { status }); showMsg('success', `Status updated to ${status}`); loadData(); }
    catch (err) { showMsg('error', err.response?.data?.message); }
  };

  const handleMentor = async (internId, mentorId) => {
    try { await assignMentor(internId, { mentor_id: mentorId }); showMsg('success', 'Mentor assigned!'); loadData(); }
    catch (err) { showMsg('error', err.response?.data?.message); }
  };

  const handleCert = async (internId) => {
    try { await generateCertificate({ intern_id: internId }); showMsg('success', 'Certificate generated!'); }
    catch (err) { showMsg('error', err.response?.data?.message); }
  };

  const MsgBox = () => !message ? null : (
    <div className={message.type === 'success' ? 'msg-success' : 'msg-error'}>
      {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
      {message.text}
    </div>
  );

  const filtered = interns.filter(i =>
    i.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    i.email?.toLowerCase().includes(search.toLowerCase()) ||
    i.college?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '14px' }}>
      <div className="spinner"></div>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading...</p>
    </div>
  );

  const navItems = [
    {
      id: 'interns',
      icon: <Users size={15} />,
      label: 'All Interns',
      content: (
        <div>
          <div className="page-header">
            <div>
              <h1 className="page-title">Intern Management</h1>
              <p className="page-subtitle">Approve, assign mentors and manage all interns</p>
            </div>
          </div>
          <MsgBox />

          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
            {[
              { label: 'Total Interns', value: interns.length, color: 'indigo', icon: <Users size={18} /> },
              { label: 'Active', value: interns.filter(i => i.status === 'active').length, color: 'green', icon: <CheckCircle size={18} /> },
              { label: 'Pending', value: interns.filter(i => i.status === 'pending').length, color: 'amber', icon: <AlertCircle size={18} /> },
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

          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="section-header">
              <span className="section-title">All Interns ({filtered.length})</span>
              <div style={{ position: 'relative', width: '260px' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input" placeholder="Search interns..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  style={{ paddingLeft: '32px' }} />
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><Users size={24} /></div>
                <p>No interns found</p>
              </div>
            ) : filtered.map((intern, i) => (
              <div key={intern.id} className="table-row" style={{ padding: '16px 20px', borderBottom: i < filtered.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div className="avatar" style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: 'white', fontSize: '14px', flexShrink: 0 }}>
                      {intern.full_name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-primary)' }}>{intern.full_name}</span>
                        <span className={`badge ${intern.status === 'active' ? 'badge-green' : intern.status === 'pending' ? 'badge-yellow' : intern.status === 'completed' ? 'badge-blue' : 'badge-red'}`}>
                          {intern.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '3px' }}>{intern.email}</div>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                        <span>🏛 {intern.college}</span>
                        <span>💼 {intern.role_applied}</span>
                        <span>👨‍💼 {intern.mentor_name || 'No mentor'}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {intern.status === 'pending' && (
                      <>
                        <button onClick={() => handleStatus(intern.id, 'active')} className="btn btn-success" style={{ padding: '7px 14px', fontSize: '12.5px' }}>✅ Approve</button>
                        <button onClick={() => handleStatus(intern.id, 'rejected')} className="btn btn-danger" style={{ padding: '7px 14px', fontSize: '12.5px' }}>❌ Reject</button>
                      </>
                    )}
                    <select onChange={e => e.target.value && handleMentor(intern.id, e.target.value)}
                      className="input" style={{ width: 'auto', padding: '7px 12px', fontSize: '12.5px', cursor: 'pointer' }}>
                      <option value="">Assign Mentor</option>
                      {mentors.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
                    </select>
                    {intern.status === 'active' && (
                      <button onClick={() => handleCert(intern.id)} className="btn btn-primary" style={{ padding: '7px 14px', fontSize: '12.5px' }}>
                        <Award size={13} /> Certificate
                      </button>
                    )}
                    {intern.status === 'active' && (
                      <button onClick={() => handleStatus(intern.id, 'completed')} className="btn btn-ghost" style={{ padding: '7px 14px', fontSize: '12.5px' }}>
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'mentors',
      icon: <UserCheck size={15} />,
      label: 'All Mentors',
      content: (
        <div>
          <div className="page-header">
            <div>
              <h1 className="page-title">Mentors</h1>
              <p className="page-subtitle">{mentors.length} mentors registered</p>
            </div>
          </div>
          <MsgBox />
          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="section-header">
              <span className="section-title">All Mentors</span>
              <span className="badge badge-blue">{mentors.length} Total</span>
            </div>
            {mentors.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><UserCheck size={24} /></div>
                <p>No mentors registered</p>
              </div>
            ) : mentors.map((m, i) => (
              <div key={m.id} className="table-row" style={{ padding: '16px 20px', borderBottom: i < mentors.length - 1 ? '1px solid var(--border-light)' : 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="avatar" style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, var(--success), #059669)', color: 'white', fontSize: '14px' }}>
                  {m.full_name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-primary)', marginBottom: '3px' }}>{m.full_name}</div>
                  <div style={{ display: 'flex', gap: '14px', fontSize: '12.5px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                    <span>✉️ {m.email}</span>
                    <span>🏢 {m.department}</span>
                    <span>📞 {m.phone}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },

    // ✅ LEADERBOARD TAB
    {
      id: 'leaderboard',
      icon: <Trophy size={15} />,
      label: 'Leaderboard',
      content: <Leaderboard />
    }
  ];

  return <Layout navItems={navItems} portalName="HR Portal" />;
};

export default HRDashboard;