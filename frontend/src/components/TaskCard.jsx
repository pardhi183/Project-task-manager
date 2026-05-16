import { CalendarClock } from 'lucide-react';
import StatusBadge from './StatusBadge.jsx';

const formatDate = (date) => new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric'
}).format(new Date(date));

const TaskCard = ({ task, onStatusChange, canEditStatus = true }) => {
  const overdue = task.status !== 'Done' && new Date(task.dueDate) < new Date();
  const assignees = task.assignedUsers?.length
    ? task.assignedUsers.map((user) => user.name).join(', ')
    : task.assignedUser?.name;

  return (
    <article className={`task-card ${overdue ? 'overdue' : ''}`}>
      <div className="task-card-header">
        <div>
          <h3>{task.title}</h3>
          <p>{task.project?.name}</p>
        </div>
        <StatusBadge status={task.status} />
      </div>
      {task.description && <p className="task-description">{task.description}</p>}
      <div className="task-meta-row">
        <span><CalendarClock size={16} /> {formatDate(task.dueDate)}</span>
        <span>{assignees}</span>
      </div>
      {canEditStatus && (
        <select
          value={task.status}
          onChange={(event) => onStatusChange?.(task._id, event.target.value)}
          aria-label={`Change status for ${task.title}`}
        >
          <option>Todo</option>
          <option>In Progress</option>
          <option>Done</option>
        </select>
      )}
    </article>
  );
};

export default TaskCard;
