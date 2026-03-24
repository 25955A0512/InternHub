import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import {
  LayoutDashboard, CheckSquare, Calendar, Award,
  Camera, CheckCircle, Clock, AlertCircle,
  Download, BarChart3
} from 'lucide-react';
import {
  getMyInternProfile, getMyTasksAsIntern, getMyAttendance,
  getMyReport, checkIn, checkOut, getMyCertificate,
  submitTask, getMyEvaluations
} from '../../utils/api';

const InternDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [report, setReport] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const loadData = async () => {
    try {
      const [profileRes, tasksRes, attendanceRes, reportRes, evalRes] = await Promise.all([
        getMyInternProfile(),
        getMyTasksAsIntern(),
        getMyAttendance(),
        getMyReport(),
        getMyEvaluations()
      ]);
      setProfile(profileRes.data.intern);
      setTasks(tasksRes.data.tasks);
      setAttendance(attendanceRes.data.attendance);
      setReport(reportRes.data.report);
      setEvaluations(evalRes.data.evaluations || []);
      try {
        const c = await getMyCertificate();
        setCertificate(c.data);
      } catch {}
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      const r = await checkIn({ face_verified: false });
      showMsg('success', r.data.message);
      loadData();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Error');
    }
  };

  const handleCheckOut = async () => {
    try {
      const r = await checkOut();
      showMsg('success', r.data.message);
      loadData();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Error');
    }
  };

  const handleSubmit = async (taskId) => {
    try {
      await submitTask(taskId);
      showMsg('success', 'Task submitted successfully!');
      loadData();
    } catch (err) {
      showMsg('error', err.response?.data?.message);
    }
  };

  const MsgBox = () => !message ? null : (
    <div className={message.type === 'success' ? 'msg-success' : 'msg-error'}>
      {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
      {message.text}
    </div>
  );

  const getStatusBadge = (status) => {
    const map = {
      approved: 'badge-green',
      submitted: 'badge-blue',
      overdue: 'badge-red',
      in_progress: 'badge-sky',
      pending: 'badge-yellow'
    };
    return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--primary)';
    return 'var(--warning)';
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '14px' }}>
      <div className="spinner"></div>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading dashboard...</p>
    </div>
  );

  const navItems = [
    {
      id: 'overview',
      icon: <LayoutDashboard size={15} />,
      label: 'Overview',
      content: (
        <div>
          <div className="page-header">
            <div>
              <h1 className="page-title">Overview</h1>
              <p className="page-subtitle">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <MsgBox />

          {/* Stats */}
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
            {[
              { label: 'Total Tasks', value: tasks.length, color: 'indigo', icon: <CheckSquare size={18} /> },
              { label: 'Completed', value: tasks.filter(t => t.status === 'approved').length, color: 'green', icon: <CheckCircle size={18} /> },
              { label: 'Attendance', value: `${report?.attendance_percentage || 0}%`, color: 'sky', icon: <Calendar size={18} /> },
              { label: 'Status', value: profile?.status || 'N/A', color: 'amber', icon: <Clock size={18} /> },
            ].map((s, i) => (
              <div key={i} className={`stat-card ${s.color} fade-up-${i + 1}`}>
                <div className="stat-accent"></div>
                <div className="stat-icon">{s.icon}</div>
                <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: '3px' }}>{s.value}</div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: '500' }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

            {/* Profile Card */}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 className="section-title">My Profile</h3>
                <span className={`badge ${profile?.status === 'active' ? 'badge-green' : profile?.status === 'pending' ? 'badge-yellow' : 'badge-red'}`}>
                  {profile?.status || 'No profile'}
                </span>
              </div>
              {profile ? (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {[
                    { label: 'Full Name', value: profile.full_name },
                    { label: 'College', value: profile.college },
                    { label: 'Role Applied', value: profile.role_applied },
                    { label: 'Skills', value: profile.skills || 'Not specified' },
                    { label: 'Mentor', value: profile.mentor_name || 'Not assigned yet' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 4 ? '1px solid var(--border-light)' : 'none', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: '500', flexShrink: 0 }}>{item.label}</span>
                      <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '600', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '55%' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon"><CheckSquare size={24} /></div>
                  <p>No profile found</p>
                  <span>Create your profile to get started</span>
                </div>
              )}
            </div>

            {/* Attendance Card */}
            <div className="card" style={{ padding: '20px' }}>
              <h3 className="section-title" style={{ marginBottom: '16px' }}>Today's Attendance</h3>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                <button onClick={handleCheckIn} className="btn btn-success" style={{ flex: 1, justifyContent: 'center' }}>
                  ✅ Check In
                </button>
                <button onClick={handleCheckOut} className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }}>
                  🚪 Check Out
                </button>
              </div>
              <button onClick={() => navigate('/intern/attendance')} className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginBottom: '16px' }}>
                <Camera size={14} /> Face Recognition Check-in
              </button>
              {report && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {[
                    { label: 'Present', value: report.present_days || 0, bg: 'var(--success-light)', color: 'var(--success)' },
                    { label: 'Absent', value: report.absent_days || 0, bg: 'var(--danger-light)', color: 'var(--danger)' },
                    { label: 'Rate', value: `${report.attendance_percentage || 0}%`, bg: 'var(--primary-light)', color: 'var(--primary)' },
                  ].map((item, i) => (
                    <div key={i} style={{ textAlign: 'center', padding: '12px 8px', background: item.bg, borderRadius: '10px' }}>
                      <div style={{ fontSize: '20px', fontWeight: '800', color: item.color }}>{item.value}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', marginTop: '2px' }}>{item.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Tasks Preview */}
          {tasks.length > 0 && (
            <div className="card" style={{ marginTop: '16px', overflow: 'hidden' }}>
              <div className="section-header">
                <span className="section-title">Recent Tasks</span>
                <span className="badge badge-blue">{tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length} Pending</span>
              </div>
              {tasks.slice(0, 3).map((task, i) => (
                <div key={task.id} className="table-row" style={{ padding: '14px 20px', borderBottom: i < 2 ? '1px solid var(--border-light)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '700', fontSize: '13.5px', color: 'var(--text-primary)', marginBottom: '2px' }}>{task.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Due: {new Date(task.deadline).toLocaleDateString()} · {task.mentor_name}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    {getStatusBadge(task.status)}
                    {(task.status === 'pending' || task.status === 'in_progress') && (
                      <button onClick={() => handleSubmit(task.id)} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }}>Submit</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    },

    {
      id: 'tasks',
      icon: <CheckSquare size={15} />,
      label: 'My Tasks',
      content: (
        <div>
          <div className="page-header">
            <div>
              <h1 className="page-title">My Tasks</h1>
              <p className="page-subtitle">{tasks.length} tasks assigned to you</p>
            </div>
          </div>
          <MsgBox />
          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="section-header">
              <span className="section-title">All Tasks</span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span className="badge badge-yellow">{tasks.filter(t => t.status === 'pending').length} Pending</span>
                <span className="badge badge-blue">{tasks.filter(t => t.status === 'submitted').length} Submitted</span>
                <span className="badge badge-green">{tasks.filter(t => t.status === 'approved').length} Approved</span>
              </div>
            </div>
            {tasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><CheckSquare size={24} /></div>
                <p>No tasks assigned yet</p>
                <span>Your mentor will assign tasks soon</span>
              </div>
            ) : tasks.map((task, i) => (
              <div key={task.id} className="table-row" style={{ padding: '16px 20px', borderBottom: i < tasks.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-primary)' }}>{task.title}</span>
                      <span className={`badge ${task.priority === 'high' ? 'badge-red' : task.priority === 'medium' ? 'badge-yellow' : 'badge-green'}`} style={{ fontSize: '10.5px' }}>
                        {task.priority}
                      </span>
                    </div>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.description}</p>
                    <div style={{ display: 'flex', gap: '14px', fontSize: '12px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                      <span>📅 Due: {new Date(task.deadline).toLocaleDateString()}</span>
                      <span>👨‍💼 {task.mentor_name}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }}>
                    {getStatusBadge(task.status)}
                    {(task.status === 'pending' || task.status === 'in_progress') && (
                      <button onClick={() => handleSubmit(task.id)} className="btn btn-primary" style={{ padding: '7px 16px', fontSize: '12.5px' }}>
                        Submit
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
      id: 'attendance',
      icon: <Calendar size={15} />,
      label: 'Attendance',
      content: (
        <div>
          <div className="page-header">
            <div>
              <h1 className="page-title">Attendance</h1>
              <p className="page-subtitle">Your attendance history and records</p>
            </div>
            <button onClick={() => navigate('/intern/attendance')} className="btn btn-primary">
              <Camera size={14} /> Face Check-in
            </button>
          </div>
          <MsgBox />

          {/* Attendance Stats */}
          {report && (
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
              {[
                { label: 'Total Days', value: report.total_days || 0, color: 'indigo', icon: <Calendar size={18} /> },
                { label: 'Present', value: report.present_days || 0, color: 'green', icon: <CheckCircle size={18} /> },
                { label: 'Absent', value: report.absent_days || 0, color: 'red', icon: <AlertCircle size={18} /> },
                { label: 'Rate', value: `${report.attendance_percentage || 0}%`, color: 'sky', icon: <Clock size={18} /> },
              ].map((s, i) => (
                <div key={i} className={`stat-card ${s.color}`}>
                  <div className="stat-accent"></div>
                  <div className="stat-icon">{s.icon}</div>
                  <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: '3px' }}>{s.value}</div>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: '500' }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div className="card" style={{ padding: '20px', marginBottom: '16px' }}>
            <h3 className="section-title" style={{ marginBottom: '14px' }}>Quick Actions</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button onClick={handleCheckIn} className="btn btn-success">✅ Manual Check In</button>
              <button onClick={handleCheckOut} className="btn btn-danger">🚪 Manual Check Out</button>
              <button onClick={() => navigate('/intern/attendance')} className="btn btn-primary">
                <Camera size={14} /> Face Recognition
              </button>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="section-header">
              <span className="section-title">Attendance History</span>
              {report && <span className="badge badge-blue">{report.attendance_percentage}% Rate</span>}
            </div>
            <div className="table-scroll">
              {attendance.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon"><Calendar size={24} /></div>
                  <p>No attendance records yet</p>
                  <span>Start by checking in today</span>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg)' }}>
                      {['Date', 'Check In', 'Check Out', 'Status', 'Face Verified'].map(h => (
                        <th key={h} style={{ padding: '11px 20px', textAlign: 'left', fontSize: '11.5px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map(a => (
                      <tr key={a.id} className="table-row" style={{ borderTop: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '14px 20px', fontSize: '13.5px', fontWeight: '600', color: 'var(--text-primary)' }}>
                          {new Date(a.date).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                          {a.check_in_time ? new Date(a.check_in_time).toLocaleTimeString() : '—'}
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                          {a.check_out_time ? new Date(a.check_out_time).toLocaleTimeString() : '—'}
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <span className="badge badge-green">{a.status}</span>
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: '16px' }}>
                          {a.face_verified ? '✅' : '❌'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )
    },

    {
      id: 'progress',
      icon: <BarChart3 size={15} />,
      label: 'My Progress',
      content: (
        <div>
          <div className="page-header">
            <div>
              <h1 className="page-title">My Progress</h1>
              <p className="page-subtitle">Track your performance and evaluation scores</p>
            </div>
          </div>

          {evaluations.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-icon"><BarChart3 size={24} /></div>
                <p>No evaluations yet</p>
                <span>Your mentor will evaluate your performance soon</span>
              </div>
            </div>
          ) : (
            evaluations.map((ev, i) => (
              <div key={i} className="card" style={{ padding: '24px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h3 style={{ fontWeight: '800', fontSize: '16px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                      Evaluation #{i + 1}
                    </h3>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                      By {ev.mentor_name} · {new Date(ev.evaluated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ textAlign: 'center', padding: '12px 20px', background: ev.total_score >= 80 ? 'var(--success-light)' : ev.total_score >= 60 ? 'var(--warning-light)' : 'var(--danger-light)', borderRadius: '12px' }}>
                    <div style={{ fontSize: '32px', fontWeight: '800', color: getScoreColor(ev.total_score), lineHeight: 1 }}>{ev.total_score}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '4px' }}>Total Score</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                  {[
                    { label: 'Attendance', value: ev.attendance_score },
                    { label: 'Task Completion', value: ev.task_score },
                    { label: 'Project Quality', value: ev.quality_score },
                    { label: 'Communication', value: ev.communication_score },
                    { label: 'Team Collaboration', value: ev.teamwork_score },
                  ].map((item, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', minWidth: '150px', flexShrink: 0 }}>
                        {item.label}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${item.value}%`, background: item.value >= 80 ? 'var(--success)' : item.value >= 60 ? 'var(--primary)' : 'var(--warning)' }}></div>
                        </div>
                      </div>
                      <span style={{ fontSize: '13.5px', fontWeight: '700', color: getScoreColor(item.value), minWidth: '36px', textAlign: 'right' }}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>

                {ev.remarks && (
                  <div style={{ padding: '14px 16px', background: 'var(--bg)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    <p style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                      Mentor Remarks
                    </p>
                    <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{ev.remarks}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )
    },

    {
      id: 'certificate',
      icon: <Award size={15} />,
      label: 'Certificate',
      content: (
        <div>
          <div className="page-header">
            <div>
              <h1 className="page-title">Certificate</h1>
              <p className="page-subtitle">Your internship completion certificate</p>
            </div>
          </div>
          <div className="card" style={{ overflow: 'hidden' }}>
            {certificate ? (
              <div>
                {/* Banner */}
                <div style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #4F46E5 100%)', padding: '48px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
                  <div style={{ position: 'absolute', bottom: '-30px', left: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
                  <div style={{ fontSize: '56px', marginBottom: '16px' }}>🏆</div>
                  <h2 style={{ fontWeight: '800', fontSize: '24px', color: 'white', marginBottom: '8px' }}>
                    Certificate of Completion
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
                    Your internship certificate is ready to download
                  </p>
                </div>

                {/* Download Area */}
                <div style={{ padding: '32px', textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '6px', alignItems: 'center', padding: '16px 28px', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '24px', minWidth: '220px' }}>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Issued On</span>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
                      {certificate.certificate?.issued_at
                        ? new Date(certificate.certificate.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                        : 'Recently'}
                    </span>
                  </div>
                  <div>
                    <a href={certificate.download_url} target="_blank" rel="noreferrer"
                      className="btn btn-primary"
                      style={{ display: 'inline-flex', padding: '13px 32px', fontSize: '15px', textDecoration: 'none' }}>
                      <Download size={15} /> Download Certificate
                    </a>
                  </div>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '14px' }}>
                    Scan the QR code on the certificate to verify authenticity
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ padding: '60px 32px', textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', background: 'var(--primary-light)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '36px' }}>
                  📜
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Not Yet Available
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '360px', margin: '0 auto 24px', lineHeight: '1.6' }}>
                  Complete your internship, get evaluated by your mentor, and HR will generate your certificate.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  {['1. Complete Tasks', '2. Get Evaluated', '3. HR Generates Certificate'].map((step, i) => (
                    <div key={i} style={{ padding: '8px 14px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12.5px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )
    }
  ];

  return <Layout navItems={navItems} portalName="Intern Portal" />;
};

export default InternDashboard;
