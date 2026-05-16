import { AlertTriangle, CheckCircle2, Clock3, LogIn, LogOut, ListTodo } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiRequest } from '../api/client.js';
import ErrorNotice from '../components/ErrorNotice.jsx';
import TaskCard from '../components/TaskCard.jsx';
import { useAuth } from '../state/AuthContext.jsx';

const DashboardPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [counts, setCounts] = useState({ completed: 0, pending: 0, overdue: 0 });
  const [attendance, setAttendance] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {
    const [taskData, attendanceData] = await Promise.all([
      apiRequest('/tasks/mine'),
      apiRequest('/attendance')
    ]);
    setTasks(taskData.tasks);
    setCounts(taskData.counts);
    setAttendance(attendanceData.attendance);
  };

  useEffect(() => {
    loadTasks()
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (taskId, status) => {
    try {
      await apiRequest(`/tasks/${taskId}/status`, {
        method: 'PATCH',
        body: { status }
      });
      await loadTasks();
    } catch (apiError) {
      setError(apiError);
    }
  };

  const total = tasks.length;
  const isAdmin = user.role === 'Admin';
  const myAttendance = isAdmin ? null : attendance;

  const punch = async (type) => {
    try {
      await apiRequest(`/attendance/${type}`, { method: 'POST' });
      await loadTasks();
    } catch (apiError) {
      setError(apiError);
    }
  };

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h2>Good to see you, {user.name}</h2>
        </div>
      </header>
      <ErrorNotice error={error} />
      <section className="punch-panel">
        <button
          className="punch-button punch-in"
          onClick={() => punch('punch-in')}
          disabled={Boolean(myAttendance?.isPunchedIn)}
        >
          <LogIn size={22} />
          Punch In
        </button>
        <button
          className="punch-button punch-out"
          onClick={() => punch('punch-out')}
          disabled={!myAttendance?.isPunchedIn}
        >
          <LogOut size={22} />
          Punch Out
        </button>
      </section>
      <section className="metric-grid">
        <article className="metric-card total">
          <ListTodo size={22} />
          <span>Total assigned</span>
          <strong>{total}</strong>
        </article>
        <article className="metric-card pending">
          <Clock3 size={22} />
          <span>Pending</span>
          <strong>{counts.pending}</strong>
        </article>
        <article className="metric-card completed">
          <CheckCircle2 size={22} />
          <span>Completed</span>
          <strong>{counts.completed}</strong>
        </article>
        <article className="metric-card danger">
          <AlertTriangle size={22} />
          <span>Overdue</span>
          <strong>{counts.overdue}</strong>
        </article>
      </section>
      <section>
        <div className="section-heading">
          <h3>Attendance</h3>
        </div>
        {isAdmin ? (
          <div className="attendance-table">
            <div className="attendance-row attendance-head">
              <span>Name</span>
              <span>Role</span>
              <span>Present days</span>
              <span>Today</span>
            </div>
            {(attendance || []).map((item) => (
              <div className="attendance-row" key={item.user._id}>
                <span>{item.user.name}</span>
                <span>{item.user.role}</span>
                <span>{item.presentDays}</span>
                <span>{item.isPunchedIn ? 'Punched in' : item.today?.punchOutAt ? 'Punched out' : 'Not marked'}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="metric-grid attendance-summary-grid">
            <article className="metric-card completed">
              <CheckCircle2 size={22} />
              <span>Present days</span>
              <strong>{myAttendance?.presentDays || 0}</strong>
            </article>
            <article className="metric-card pending">
              <Clock3 size={22} />
              <span>Today</span>
              <strong>{myAttendance?.isPunchedIn ? 'In' : myAttendance?.today?.punchOutAt ? 'Out' : 'No'}</strong>
            </article>
          </div>
        )}
      </section>
      <section>
        <div className="section-heading">
          <h3>My tasks</h3>
        </div>
        {loading ? (
          <p className="muted">Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <div className="empty-state">No assigned tasks yet.</div>
        ) : (
          <div className="task-grid">
            {tasks.map((task) => (
              <TaskCard key={task._id} task={task} onStatusChange={updateStatus} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default DashboardPage;
