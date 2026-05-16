import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api/client.js';
import ErrorNotice from '../components/ErrorNotice.jsx';
import { useAuth } from '../state/AuthContext.jsx';

const ProjectsPage = () => {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', targetRole: 'User', teamMembers: [] });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const [projectData, userData] = await Promise.all([
      apiRequest('/projects'),
      isAdmin ? apiRequest('/users') : Promise.resolve({ users: [] })
    ]);
    setProjects(projectData.projects);
    setUsers(userData.users);
  };

  useEffect(() => {
    loadData()
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  const toggleMember = (userId) => {
    setForm((current) => ({
      ...current,
      teamMembers: current.teamMembers.includes(userId)
        ? current.teamMembers.filter((id) => id !== userId)
        : [...current.teamMembers, userId]
    }));
  };

  const createProject = async (event) => {
    event.preventDefault();
    setError(null);

    try {
      await apiRequest('/projects', {
        method: 'POST',
        body: form
      });
      setForm({ name: '', description: '', targetRole: 'User', teamMembers: [] });
      await loadData();
    } catch (apiError) {
      setError(apiError);
    }
  };

  const deleteProject = async (projectId) => {
    if (!window.confirm('Delete this project and all of its tasks?')) return;

    try {
      await apiRequest(`/projects/${projectId}`, { method: 'DELETE' });
      await loadData();
    } catch (apiError) {
      setError(apiError);
    }
  };

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Projects</p>
          <h2>Workspace projects</h2>
        </div>
      </header>
      <ErrorNotice error={error} />
      {isAdmin && (
        <form className="management-form" onSubmit={createProject}>
          <div className="form-grid">
            <label>
              Project name
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                required
              />
            </label>
            <label>
              Description
              <input
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              />
            </label>
            <label>
              Creating for
              <select
                value={form.targetRole}
                onChange={(event) => setForm((current) => ({ ...current, targetRole: event.target.value, teamMembers: [] }))}
              >
                <option>User</option>
                <option>Employee</option>
                <option>Admin</option>
              </select>
            </label>
          </div>
          <div className="member-picker">
            {users.filter((member) => member.role === form.targetRole).map((member) => (
              <label key={member._id} className="checkbox-row">
                <input
                  type="checkbox"
                  checked={form.teamMembers.includes(member._id)}
                  onChange={() => toggleMember(member._id)}
                />
                <span>{member.name}</span>
                <small>{member.role}</small>
              </label>
            ))}
          </div>
          <button className="primary-button">
            <Plus size={18} />
            Create project
          </button>
        </form>
      )}
      {loading ? (
        <p className="muted">Loading projects...</p>
      ) : projects.length === 0 ? (
        <div className="empty-state">No projects available.</div>
      ) : (
        <section className="project-grid">
          {projects.map((project) => (
            <article className="project-card" key={project._id}>
              <div>
                <h3>{project.name}</h3>
                <p>{project.description || 'No description provided.'}</p>
                <span className="audience-pill">{project.targetRole || 'User'} project</span>
              </div>
              <div className="project-card-footer">
                <span>{project.teamMembers.length} members</span>
                <div className="button-row">
                  <Link className="secondary-button" to={`/projects/${project._id}`}>Open</Link>
                  {isAdmin && (
                    <button
                      className="icon-button danger"
                      onClick={() => deleteProject(project._id)}
                      title="Delete project"
                      aria-label="Delete project"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
};

export default ProjectsPage;
