import { useState, useEffect } from 'react';
import '../../App.css';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  getMyTasksAsMentor,
  getAllInterns,
  createTask,
  updateTaskStatus,
  createEvaluation
} from '../../utils/api';

const MentorDashboard = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [interns, setInterns] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [taskForm, setTaskForm] = useState({
    title: '', description: '',
    assigned_to: '', deadline: '', priority: 'medium'
  });
  const [evalForm, setEvalForm] = useState({
    intern_id: '', attendance_score: '',
    task_score: '', quality_score: '',
    communication_score: '', teamwork_score: '', remarks: ''
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [tasksRes, internsRes] = await Promise.all([
        getMyTasksAsMentor(),
        getAllInterns()
      ]);
      setTasks(tasksRes.data.tasks);
      setInterns(internsRes.data.interns);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await createTask(taskForm);
      setMessage('✅ Task created successfully!');
      setTaskForm({ title: '', description: '', assigned_to: '', deadline: '', priority: 'medium' });
      loadData();
    } catch (err) {
      setMessage('❌ ' + err.response?.data?.message);
    }
  };

  const handleEvaluate = async (e) => {
    e.preventDefault();
    try {
      await createEvaluation(evalForm);
      setMessage('✅ Evaluation submitted!');
      setEvalForm({ intern_id: '', attendance_score: '', task_score: '', quality_score: '', communication_score: '', teamwork_score: '', remarks: '' });
    } catch (err) {
      setMessage('❌ ' + err.response?.data?.message);
    }
  };

  const handleLogout = () => { logoutUser(); navigate('/login'); };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-blue-600 text-xl">Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-green-700 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">👨‍💼 Mentor Portal</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">👋 {user?.email}</span>
          <button onClick={handleLogout} className="bg-white text-green-700 px-4 py-1 rounded font-semibold">Logout</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        {message && (
          <div className={`p-3 rounded mb-4 ${message.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow text-center">
            <p className="text-3xl font-bold text-green-600">{interns.length}</p>
            <p className="text-gray-500 text-sm">Total Interns</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow text-center">
            <p className="text-3xl font-bold text-blue-600">{tasks.length}</p>
            <p className="text-gray-500 text-sm">Tasks Assigned</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow text-center">
            <p className="text-3xl font-bold text-orange-600">
              {tasks.filter(t => t.status === 'submitted').length}
            </p>
            <p className="text-gray-500 text-sm">Pending Review</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['overview', 'create task', 'evaluate'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-semibold capitalize ${activeTab === tab ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg font-bold text-gray-700">Tasks Overview</h2>
            </div>
            {tasks.length === 0 ? (
              <p className="p-6 text-gray-500 text-center">No tasks created yet</p>
            ) : (
              <div className="divide-y">
                {tasks.map(task => (
                  <div key={task.id} className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{task.title}</p>
                      <p className="text-sm text-gray-500">Assigned to: {task.intern_name}</p>
                      <p className="text-xs text-gray-400">Deadline: {new Date(task.deadline).toLocaleDateString()}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        task.status === 'approved' ? 'bg-green-100 text-green-700' :
                        task.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'}`}>
                        {task.status}
                      </span>
                      {task.status === 'submitted' && (
                        <button
                          onClick={async () => {
                            await updateTaskStatus(task.id, { status: 'approved' });
                            setMessage('✅ Task approved!');
                            loadData();
                          }}
                          className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600">
                          Approve
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create Task Tab */}
        {activeTab === 'create task' && (
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-bold text-gray-700 mb-4">Create New Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <input type="text" placeholder="Task Title" required
                value={taskForm.title}
                onChange={e => setTaskForm({...taskForm, title: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"/>
              <textarea placeholder="Description" rows="3"
                value={taskForm.description}
                onChange={e => setTaskForm({...taskForm, description: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"/>
              <select required
                value={taskForm.assigned_to}
                onChange={e => setTaskForm({...taskForm, assigned_to: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">Select Intern</option>
                {interns.map(i => (
                  <option key={i.id} value={i.id}>{i.full_name}</option>
                ))}
              </select>
              <input type="date" required
                value={taskForm.deadline}
                onChange={e => setTaskForm({...taskForm, deadline: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"/>
              <select value={taskForm.priority}
                onChange={e => setTaskForm({...taskForm, priority: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <button type="submit"
                className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700">
                Create Task
              </button>
            </form>
          </div>
        )}

        {/* Evaluate Tab */}
        {activeTab === 'evaluate' && (
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-bold text-gray-700 mb-4">Evaluate Intern</h2>
            <form onSubmit={handleEvaluate} className="space-y-4">
              <select required
                value={evalForm.intern_id}
                onChange={e => setEvalForm({...evalForm, intern_id: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">Select Intern</option>
                {interns.map(i => (
                  <option key={i.id} value={i.id}>{i.full_name}</option>
                ))}
              </select>
              {[
                { key: 'attendance_score', label: 'Attendance Score' },
                { key: 'task_score', label: 'Task Score' },
                { key: 'quality_score', label: 'Quality Score' },
                { key: 'communication_score', label: 'Communication Score' },
                { key: 'teamwork_score', label: 'Teamwork Score' }
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label} (0-100)</label>
                  <input type="number" min="0" max="100" required
                    value={evalForm[key]}
                    onChange={e => setEvalForm({...evalForm, [key]: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"/>
                </div>
              ))}
              <textarea placeholder="Remarks" rows="3"
                value={evalForm.remarks}
                onChange={e => setEvalForm({...evalForm, remarks: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"/>
              <button type="submit"
                className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700">
                Submit Evaluation
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorDashboard;