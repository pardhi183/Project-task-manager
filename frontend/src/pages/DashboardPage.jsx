import { AlertTriangle, CheckCircle2, Clock3, ListTodo } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiRequest } from '../api/client.js';
import ErrorNotice from '../components/ErrorNotice.jsx';
import TaskCard from '../components/TaskCard.jsx';
import { useAuth } from '../state/AuthContext.jsx';

const DashboardPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [counts, setCounts] = useState({ completed: 0, pending: 0, overdue: 0 });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {
    const data = await apiRequest('/tasks/mine');
    setTasks(data.tasks);
    setCounts(data.counts);
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

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h2>Good to see you, {user.name}</h2>
        </div>
      </header>
      <ErrorNotice error={error} />
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
