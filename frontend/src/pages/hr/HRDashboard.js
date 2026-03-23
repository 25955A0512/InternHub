import { useState, useEffect } from 'react';
import '../../App.css';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getAllInterns, getAllMentors, updateInternStatus, assignMentor, generateCertificate } from '../../utils/api';

const HRDashboard = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [interns, setInterns] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [activeTab, setActiveTab] = useState('interns');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [internsRes, mentorsRes] = await Promise.all([getAllInterns(), getAllMentors()]);
      setInterns(internsRes.data.interns);
      setMentors(mentorsRes.data.mentors);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateInternStatus(id, { status });
      setMessage({ type: 'success', text: `Intern status updated to ${status}` });
      loadData();
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message }); }
  };

  const handleAssignMentor = async (internId, mentorId) => {
    try {
      await assignMentor(internId, { mentor_id: mentorId });
      setMessage({ type: 'success', text: 'Mentor assigned successfully!' });
      loadData();
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message }); }
  };

  const handleGenerateCertificate = async (internId) => {
    try {
      await generateCertificate({ intern_id: internId });
      setMessage({ type: 'success', text: 'Certificate generated successfully!' });
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message }); }
  };

  const filteredInterns = interns.filter(i =>
    i.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    i.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner"></div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f2f5' }}>
      {/* Sidebar */}
      <div className="sidebar" style={{ width: '260px', minHeight: '100vh', padding: '24px 16px', display: 'flex', flexDirection: 'column', position: 'fixed', left: 0, top: 0, bottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', marginBottom: '32px' }}>
          <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>👩‍💼</div>
          <div>
            <div style={{ color: 'white', fontWeight: '800', fontSize: '16px' }}>InternHub</div>
            <div style={{ color: '#475569', fontSize: '11px' }}>HR Portal</div>
          </div>
        </div>

        <nav style={{ flex: 1 }}>
          {[
            { id: 'interns', icon: '👥', label: 'All Interns' },
            { id: 'mentors', icon: '👨‍💼', label: 'All Mentors' },
          ].map(item => (
            <div key={item.id} onClick={() => setActiveTab(item.id)}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}>
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              <span style={{ fontSize: '14px' }}>{item.label}</span>
            </div>
          ))}
        </nav>

        <div style={{ padding: '16px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div className="avatar" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white' }}>
              {user?.email?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ color: 'white', fontSize: '12px', fontWeight: '600' }}>{user?.email}</div>
              <div style={{ color: '#475569', fontSize: '11px' }}>HR Manager</div>
            </div>
          </div>
          <button onClick={() => { logoutUser(); navigate('/login'); }}
            style={{ width: '100%', padding: '8px', background: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: '260px', flex: 1, padding: '32px' }}>
        <div style={{ marginBottom: '32px' }} className="fade-in">
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '4px' }}>HR Dashboard</h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {message && (
          <div style={{ padding: '12px 16px', borderRadius: '10px', marginBottom: '24px', fontSize: '14px', fontWeight: '500', background: message.type === 'success' ? '#d1fae5' : '#fee2e2', color: message.type === 'success' ? '#065f46' : '#991b1b', border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}` }} className="fade-in">
            {message.type === 'success' ? '✅' : '❌'} {message.text}
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }} className="fade-in">
          {[
            { label: 'Total Interns', value: interns.length, color: 'blue', icon: '👥' },
            { label: 'Active', value: interns.filter(i => i.status === 'active').length, color: 'green', icon: '✅' },
            { label: 'Pending', value: interns.filter(i => i.status === 'pending').length, color: 'orange', icon: '⏳' },
            { label: 'Mentors', value: mentors.length, color: 'purple', icon: '👨‍💼' },
          ].map((stat, i) => (
            <div key={i} className={`stat-card ${stat.color}`} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{stat.icon}</div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>{stat.value}</div>
              <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Interns Tab */}
        {activeTab === 'interns' && (
          <div className="card fade-in" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>All Interns</h3>
              <input
                className="input"
                placeholder="🔍 Search interns..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ maxWidth: '280px' }}
              />
            </div>
            <div>
              {filteredInterns.map((intern, i) => (
                <div key={intern.id} className="table-row" style={{ padding: '20px 24px', borderBottom: i < filteredInterns.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '14px', flex: 1 }}>
                      <div className="avatar" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white', width: '44px', height: '44px', fontSize: '16px', flexShrink: 0 }}>
                        {intern.full_name?.[0]?.toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                          <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '15px' }}>{intern.full_name}</span>
                          <span className={`badge ${intern.status === 'active' ? 'badge-green' : intern.status === 'pending' ? 'badge-yellow' : 'badge-red'}`}>
                            {intern.status}
                          </span>
                        </div>
                        <div style={{ color: '#64748b', fontSize: '13px', marginBottom: '4px' }}>{intern.email}</div>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#94a3b8' }}>
                          <span>🏛️ {intern.college}</span>
                          <span>💼 {intern.role_applied}</span>
                          <span>👨‍💼 {intern.mentor_name || 'No mentor'}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end', marginLeft: '16px' }}>
                      {intern.status === 'pending' && (
                        <>
                          <button onClick={() => handleStatusUpdate(intern.id, 'active')} className="btn-success" style={{ padding: '8px 16px', fontSize: '13px' }}>✅ Approve</button>
                          <button onClick={() => handleStatusUpdate(intern.id, 'rejected')} className="btn-danger" style={{ padding: '8px 16px', fontSize: '13px' }}>❌ Reject</button>
                        </>
                      )}
                      <select onChange={e => e.target.value && handleAssignMentor(intern.id, e.target.value)}
                        className="input" style={{ width: 'auto', padding: '8px 12px', fontSize: '13px' }}>
                        <option value="">Assign Mentor</option>
                        {mentors.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
                      </select>
                      {intern.status === 'active' && (
                        <button onClick={() => handleGenerateCertificate(intern.id)} className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>📜 Certificate</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mentors Tab */}
        {activeTab === 'mentors' && (
          <div className="card fade-in" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>All Mentors</h3>
            </div>
            <div>
              {mentors.map((mentor, i) => (
                <div key={mentor.id} className="table-row" style={{ padding: '20px 24px', borderBottom: i < mentors.length - 1 ? '1px solid #f1f5f9' : 'none', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div className="avatar" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', width: '44px', height: '44px', fontSize: '16px' }}>
                    {mentor.full_name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '15px', marginBottom: '4px' }}>{mentor.full_name}</div>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#64748b' }}>
                      <span>✉️ {mentor.email}</span>
                      <span>🏢 {mentor.department}</span>
                      <span>📞 {mentor.phone}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HRDashboard;
