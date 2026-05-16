import { AlertTriangle, Bell, CalendarDays, CheckCircle2, Clock3, LogIn, LogOut, ListTodo, ShieldCheck } from 'lucide-react';
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
  const [myAttendance, setMyAttendance] = useState(null);
  const [adminLoginAlerts, setAdminLoginAlerts] = useState([]);
  const [now, setNow] = useState(new Date());
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const isAdmin = user.role === 'Admin';

  const loadAdminLoginAlerts = async () => {
    if (!isAdmin) return;
    const alertData = await apiRequest('/admin-login-alerts');
    setAdminLoginAlerts(alertData.alerts || []);
  };

  const loadTasks = async () => {
    const requests = [
      apiRequest('/tasks/mine'),
      apiRequest('/attendance')
    ];

    if (isAdmin) requests.push(apiRequest('/admin-login-alerts'));

    const [taskData, attendanceData, alertData] = await Promise.all(requests);
    setTasks(taskData.tasks);
    setCounts(taskData.counts);
    setAttendance(attendanceData.attendance);
    setMyAttendance(attendanceData.myAttendance || attendanceData.attendance);
    if (alertData) setAdminLoginAlerts(alertData.alerts || []);
  };

  useEffect(() => {
    loadTasks()
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isAdmin) return undefined;
    const timer = window.setInterval(() => {
      loadAdminLoginAlerts().catch(setError);
    }, 15000);
    return () => window.clearInterval(timer);
  }, [isAdmin]);

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
  const pendingAdminAlerts = adminLoginAlerts.filter((alert) => alert.status === 'Pending');
  const formattedDate = now.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  const formattedTime = now.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  const formatDateTime = (value) => {
    if (!value) return 'Not marked';
    return new Date(value).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const punch = async (type) => {
    try {
      await apiRequest(`/attendance/${type}`, { method: 'POST' });
      await loadTasks();
    } catch (apiError) {
      setError(apiError);
    }
  };

  const approveAdminLogin = async (alertId) => {
    try {
      await apiRequest(`/admin-login-alerts/${alertId}/approve`, { method: 'PATCH' });
      await loadAdminLoginAlerts();
    } catch (apiError) {
      setError(apiError);
    }
  };

  return (
    <div className="page-stack">
      <header className="page-header">
        <div className="dashboard-greeting">
          <div className="time-screen">
            <CalendarDays size={20} />
            <div>
              <strong>{formattedTime}</strong>
              <span>{formattedDate}</span>
            </div>
          </div>
          <p className="eyebrow">Dashboard</p>
          <h2>Good to see you, {user.name}</h2>
        </div>
      </header>
      <ErrorNotice error={error} />
      {isAdmin && pendingAdminAlerts.length > 0 && (
        <section className="admin-alert-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Approval alerts</p>
              <h3>Admin login attempts</h3>
            </div>
            <Bell size={22} />
          </div>
          <div className="admin-alert-list">
            {pendingAdminAlerts.map((alert) => (
              <article className="admin-alert-card" key={alert._id}>
                <ShieldCheck size={22} />
                <div>
                  <strong>{alert.adminName || 'Admin account'}</strong>
                  <span>{alert.loginIdentifier} • Password: hidden • {alert.loginStatus} • {formatDateTime(alert.attemptedAt)}</span>
                </div>
                <button className="secondary-button" type="button" onClick={() => approveAdminLogin(alert._id)}>
                  Approve
                </button>
              </article>
            ))}
          </div>
        </section>
      )}
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
      <section className="punch-time-panel">
        <article>
          <span>Punch in time</span>
          <strong>{formatDateTime(myAttendance?.today?.punchInAt)}</strong>
        </article>
        <article>
          <span>Punch out time</span>
          <strong>{formatDateTime(myAttendance?.today?.punchOutAt)}</strong>
        </article>
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
              <span>Today punch time</span>
            </div>
            {(attendance || []).map((item) => (
              <div className="attendance-row" key={item.user._id}>
                <span>{item.user.name}</span>
                <span>{item.user.role}</span>
                <span>{item.presentDays}</span>
                <span>
                  {item.today
                    ? `${formatDateTime(item.today.punchInAt)} - ${item.today.punchOutAt ? formatDateTime(item.today.punchOutAt) : 'Still in'}`
                    : 'Not marked'}
                </span>
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
