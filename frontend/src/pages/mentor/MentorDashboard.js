import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { LayoutDashboard, ClipboardList, Star, CheckCircle, Clock, AlertCircle, Users, Trophy } from 'lucide-react';
import { getMyTasksAsMentor, getAllInterns, createTask, updateTaskStatus, createEvaluation } from '../../utils/api';
import Leaderboard from '../shared/Leaderboard';

const MentorDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [interns, setInterns] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assigned_to: '', deadline: '', priority: 'medium' });
  const [evalForm, setEvalForm] = useState({ intern_id: '', attendance_score: '', task_score: '', quality_score: '', communication_score: '', teamwork_score: '', remarks: '' });

  useEffect(() => { loadData(); }, []);

  const showMsg = (type, text) => { setMessage({ type, text }); setTimeout(() => setMessage(null), 4000); };

  const loadData = async () => {
    try {
      const [tasksRes, internsRes] = await Promise.all([getMyTasksAsMentor(), getAllInterns()]);
      setTasks(tasksRes.data.tasks);
      setInterns(internsRes.data.interns);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try { await createTask(taskForm); showMsg('success', 'Task created!'); setTaskForm({ title: '', description: '', assigned_to: '', deadline: '', priority: 'medium' }); loadData(); }
    catch (err) { showMsg('error', err.response?.data?.message); }
  };

  const handleEvaluate = async (e) => {
    e.preventDefault();
    try { await createEvaluation(evalForm); showMsg('success', 'Evaluation submitted!'); setEvalForm({ intern_id: '', attendance_score: '', task_score: '', quality_score: '', communication_score: '', teamwork_score: '', remarks: '' }); }
    catch (err) { showMsg('error', err.response?.data?.message); }
  };

  const handleApprove = async (taskId) => {
    try { await updateTaskStatus(taskId, { status: 'approved' }); showMsg('success', 'Task approved!'); loadData(); }
    catch (err) { showMsg('error', err.response?.data?.message); }
  };

  const MsgBox = () => !message ? null : (
    <div className={message.type === 'success' ? 'msg-success' : 'msg-error'}>
      {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
      {message.text}
    </div>
  );

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '14px' }}>
      <div className="spinner"></div>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading...</p>
    </div>
  );

  const InputStyle = { width: '100%', padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '14px', fontFamily: 'Plus Jakarta Sans, sans-serif', color: 'var(--text-primary)', background: 'var(--bg)', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.18s' };

  const navItems = [
    {
      id: 'overview',
      icon: <LayoutDashboard size={15} />,
      label: 'Overview',
      content: (
        <div>
          <div className="page-header">
            <div>
              <h1 className="page-title">Mentor Overview</h1>
              <p className="page-subtitle">Manage your interns and track their progress</p>
            </div>
          </div>
          <MsgBox />

          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
            {[
              { label: 'My Interns', value: interns.length, color: 'indigo', icon: <Users size={18} /> },
              { label: 'Tasks Assigned', value: tasks.length, color: 'sky', icon: <ClipboardList size={18} /> },
              { label: 'Pending Review', value: tasks.filter(t => t.status === 'submitted').length, color: 'amber', icon: <Clock size={18} /> },
              { label: 'Approved', value: tasks.filter(t => t.status === 'approved').length, color: 'green', icon: <CheckCircle size={18} /> },
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
              <span className="section-title">Tasks Overview</span>
              <span className="badge badge-yellow">{tasks.filter(t => t.status === 'submitted').length} Need Review</span>
            </div>
            {tasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><ClipboardList size={24} /></div>
                <p>No tasks created yet</p>
                <span>Go to Create Task tab to assign work</span>
              </div>
            ) : tasks.map((task, i) => (
              <div key={task.id} className="table-row" style={{ padding: '16px 20px', borderBottom: i < tasks.length - 1 ? '1px solid var(--border-light)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-primary)', marginBottom: '3px' }}>{task.title}</div>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                    Assigned to: <strong>{task.intern_name}</strong> · Due: {new Date(task.deadline).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  <span className={`badge ${task.status === 'approved' ? 'badge-green' : task.status === 'submitted' ? 'badge-blue' : task.status === 'overdue' ? 'badge-red' : 'badge-yellow'}`}>
                    {task.status}
                  </span>
                  {task.status === 'submitted' && (
                    <button onClick={() => handleApprove(task.id)} className="btn btn-success" style={{ padding: '6px 14px', fontSize: '12.5px' }}>Approve</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'create-task',
      icon: <ClipboardList size={15} />,
      label: 'Create Task',
      content: (
        <div>
          <div className="page-header">
            <div>
              <h1 className="page-title">Create Task</h1>
              <p className="page-subtitle">Assign a new task to your intern</p>
            </div>
          </div>
          <MsgBox />
          <div className="card" style={{ padding: '24px', maxWidth: '600px' }}>
            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Task Title</label>
                <input required type="text" placeholder="e.g. Build Login Page"
                  value={taskForm.title}
                  onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="input" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Description</label>
                <textarea placeholder="Describe the task in detail..."
                  value={taskForm.description}
                  onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
                  rows={3}
                  style={{ ...InputStyle, resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Assign To</label>
                <select required value={taskForm.assigned_to}
                  onChange={e => setTaskForm({ ...taskForm, assigned_to: e.target.value })}
                  style={InputStyle}>
                  <option value="">Select Intern</option>
                  {interns.map(i => <option key={i.id} value={i.id}>{i.full_name}</option>)}
                </select>
              </div>
              <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Deadline</label>
                  <input required type="date" value={taskForm.deadline}
                    onChange={e => setTaskForm({ ...taskForm, deadline: e.target.value })}
                    style={InputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Priority</label>
                  <select value={taskForm.priority}
                    onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}
                    style={InputStyle}>
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', padding: '12px' }}>
                Assign Task →
              </button>
            </form>
          </div>
        </div>
      )
    },
    {
      id: 'evaluate',
      icon: <Star size={15} />,
      label: 'Evaluate Intern',
      content: (
        <div>
          <div className="page-header">
            <div>
              <h1 className="page-title">Evaluate Intern</h1>
              <p className="page-subtitle">Score your intern on 5 key performance areas</p>
            </div>
          </div>
          <MsgBox />
          <div className="card" style={{ padding: '24px', maxWidth: '600px' }}>
            <form onSubmit={handleEvaluate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Select Intern</label>
                <select required value={evalForm.intern_id}
                  onChange={e => setEvalForm({ ...evalForm, intern_id: e.target.value })}
                  style={InputStyle}>
                  <option value="">Select Intern</option>
                  {interns.map(i => <option key={i.id} value={i.id}>{i.full_name}</option>)}
                </select>
              </div>

              <div style={{ padding: '16px', background: 'var(--bg)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' }}>Performance Scores (0–100)</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { key: 'attendance_score', label: '📅 Attendance' },
                    { key: 'task_score', label: '✅ Task Completion' },
                    { key: 'quality_score', label: '⭐ Project Quality' },
                    { key: 'communication_score', label: '💬 Communication' },
                    { key: 'teamwork_score', label: '🤝 Team Collaboration' },
                  ].map(field => (
                    <div key={field.key} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', minWidth: '160px' }}>{field.label}</span>
                      <input required type="number" min="0" max="100" placeholder="0-100"
                        value={evalForm[field.key]}
                        onChange={e => setEvalForm({ ...evalForm, [field.key]: e.target.value })}
                        style={{ ...InputStyle, width: '100px', textAlign: 'center' }} />
                      {evalForm[field.key] && (
                        <div style={{ flex: 1 }}>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${Math.min(evalForm[field.key], 100)}%` }}></div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Remarks</label>
                <textarea placeholder="Overall feedback and remarks..."
                  value={evalForm.remarks}
                  onChange={e => setEvalForm({ ...evalForm, remarks: e.target.value })}
                  rows={3}
                  style={{ ...InputStyle, resize: 'vertical' }} />
              </div>

              <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', padding: '12px' }}>
                Submit Evaluation →
              </button>
            </form>
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

  return <Layout navItems={navItems} portalName="Mentor Portal" />;
};

export default MentorDashboard;