import { Save, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiRequest } from '../api/client.js';
import ErrorNotice from '../components/ErrorNotice.jsx';
import TaskCard from '../components/TaskCard.jsx';
import { useAuth } from '../state/AuthContext.jsx';

const emptyTask = {
  title: '',
  description: '',
  assignedUser: '',
  status: 'Todo',
  dueDate: ''
};

const ProjectPage = () => {
  const { projectId } = useParams();
  const { isAdmin } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ status: '', assignedUser: '' });
  const [taskForm, setTaskForm] = useState(emptyTask);
  const [projectForm, setProjectForm] = useState({ name: '', description: '', teamMembers: [] });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.assignedUser) params.set('assignedUser', filters.assignedUser);
    return params.toString();
  }, [filters]);

  const loadProject = async () => {
    const [projectData, userData] = await Promise.all([
      apiRequest(`/projects/${projectId}`),
      apiRequest('/users')
    ]);
    setProject(projectData.project);
    setProjectForm({
      name: projectData.project.name,
      description: projectData.project.description,
      teamMembers: projectData.project.teamMembers.map((member) => member._id)
    });
    setUsers(userData.users);
  };

  const loadTasks = async () => {
    const data = await apiRequest(`/projects/${projectId}/tasks${query ? `?${query}` : ''}`);
    setTasks(data.tasks);
  };

  useEffect(() => {
    Promise.all([loadProject(), loadTasks()])
      .catch(setError)
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => {
    loadTasks().catch(setError);
  }, [query]);

  const projectMembers = users.filter((user) => projectForm.teamMembers.includes(user._id));

  const saveProject = async (event) => {
    event.preventDefault();
    setError(null);

    try {
      const data = await apiRequest(`/projects/${projectId}`, {
        method: 'PUT',
        body: projectForm
      });
      setProject(data.project);
    } catch (apiError) {
      setError(apiError);
    }
  };

  const createTask = async (event) => {
    event.preventDefault();
    setError(null);

    try {
      await apiRequest(`/projects/${projectId}/tasks`, {
        method: 'POST',
        body: taskForm
      });
      setTaskForm(emptyTask);
      await loadTasks();
    } catch (apiError) {
      setError(apiError);
    }
  };

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

  const deleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;

    try {
      await apiRequest(`/tasks/${taskId}`, { method: 'DELETE' });
      await loadTasks();
    } catch (apiError) {
      setError(apiError);
    }
  };

  const toggleProjectMember = (userId) => {
    setProjectForm((current) => ({
      ...current,
      teamMembers: current.teamMembers.includes(userId)
        ? current.teamMembers.filter((id) => id !== userId)
        : [...current.teamMembers, userId]
    }));
  };

  if (loading) return <p className="muted">Loading project...</p>;
  if (!project) return <div className="empty-state">Project not found.</div>;

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow"><Link to="/projects">Projects</Link></p>
          <h2>{project.name}</h2>
        </div>
      </header>
      <ErrorNotice error={error} />
      {isAdmin && (
        <form className="management-form" onSubmit={saveProject}>
          <div className="form-grid">
            <label>
              Name
              <input
                value={projectForm.name}
                onChange={(event) => setProjectForm((current) => ({ ...current, name: event.target.value }))}
                required
              />
            </label>
            <label>
              Description
              <input
                value={projectForm.description}
                onChange={(event) => setProjectForm((current) => ({ ...current, description: event.target.value }))}
              />
            </label>
          </div>
          <div className="member-picker">
            {users.map((member) => (
              <label key={member._id} className="checkbox-row">
                <input
                  type="checkbox"
                  checked={projectForm.teamMembers.includes(member._id)}
                  onChange={() => toggleProjectMember(member._id)}
                />
                <span>{member.name}</span>
                <small>{member.role}</small>
              </label>
            ))}
          </div>
          <button className="primary-button">
            <Save size={18} />
            Save project
          </button>
        </form>
      )}
      {isAdmin && (
        <form className="management-form" onSubmit={createTask}>
          <div className="section-heading">
            <h3>Create task</h3>
          </div>
          <div className="form-grid task-form-grid">
            <label>
              Title
              <input
                value={taskForm.title}
                onChange={(event) => setTaskForm((current) => ({ ...current, title: event.target.value }))}
                required
              />
            </label>
            <label>
              Assigned user
              <select
                value={taskForm.assignedUser}
                onChange={(event) => setTaskForm((current) => ({ ...current, assignedUser: event.target.value }))}
                required
              >
                <option value="">Select member</option>
                {projectMembers.map((member) => (
                  <option value={member._id} key={member._id}>{member.name}</option>
                ))}
              </select>
            </label>
            <label>
              Due date
              <input
                type="date"
                value={taskForm.dueDate}
                onChange={(event) => setTaskForm((current) => ({ ...current, dueDate: event.target.value }))}
                required
              />
            </label>
            <label>
              Status
              <select
                value={taskForm.status}
                onChange={(event) => setTaskForm((current) => ({ ...current, status: event.target.value }))}
              >
                <option>Todo</option>
                <option>In Progress</option>
                <option>Done</option>
              </select>
            </label>
          </div>
          <label>
            Description
            <textarea
              value={taskForm.description}
              onChange={(event) => setTaskForm((current) => ({ ...current, description: event.target.value }))}
              rows={3}
            />
          </label>
          <button className="primary-button">Create task</button>
        </form>
      )}
      <section>
        <div className="section-heading">
          <h3>Tasks</h3>
          <div className="filters">
            <select
              value={filters.status}
              onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
              aria-label="Filter by status"
            >
              <option value="">All statuses</option>
              <option>Todo</option>
              <option>In Progress</option>
              <option>Done</option>
            </select>
            <select
              value={filters.assignedUser}
              onChange={(event) => setFilters((current) => ({ ...current, assignedUser: event.target.value }))}
              aria-label="Filter by assignee"
            >
              <option value="">All assignees</option>
              {projectMembers.map((member) => (
                <option value={member._id} key={member._id}>{member.name}</option>
              ))}
            </select>
          </div>
        </div>
        {tasks.length === 0 ? (
          <div className="empty-state">No tasks match the current filters.</div>
        ) : (
          <div className="task-grid">
            {tasks.map((task) => (
              <div className="task-with-actions" key={task._id}>
                <TaskCard task={task} onStatusChange={updateStatus} />
                {isAdmin && (
                  <button
                    className="icon-button danger"
                    onClick={() => deleteTask(task._id)}
                    title="Delete task"
                    aria-label="Delete task"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProjectPage;
