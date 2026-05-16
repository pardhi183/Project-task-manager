import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';

const populateTask = (query) =>
  query
    .populate('project', 'name description')
    .populate('assignedUser', 'name email role')
    .populate('assignedUsers', 'name email role')
    .populate('createdBy', 'name email role');

const ensureProjectAccess = async (projectId, user) => {
  const project = await Project.findById(projectId);
  if (!project) return { status: 404, message: 'Project not found' };

  const isMember = project.teamMembers.some((memberId) => memberId.equals(user._id));
  if (user.role !== 'Admin' && !isMember) {
    return { status: 403, message: 'You can only access assigned projects' };
  }

  return { project };
};

const ensureAssignableMembers = async (project, assignedUserIds = []) => {
  if (!assignedUserIds.length) return 'Select at least one assignee';

  const users = await User.find({ _id: { $in: assignedUserIds } });
  if (users.length !== assignedUserIds.length) return 'One or more assigned users do not exist';

  const invalidMember = users.some((user) => !project.teamMembers.some((memberId) => memberId.equals(user._id)));
  if (invalidMember) return 'Assigned users must be members of the project';

  const invalidRole = users.some((user) => user.role !== project.targetRole);
  if (invalidRole) return `Assigned users must be ${project.targetRole}s`;

  return null;
};

export const getMyTasks = async (req, res, next) => {
  try {
    const now = new Date();
    const tasks = await populateTask(
      Task.find({
        $or: [
          { assignedUser: req.user._id },
          { assignedUsers: req.user._id }
        ]
      }).sort({ dueDate: 1, updatedAt: -1 })
    );

    const counts = tasks.reduce(
      (summary, task) => {
        if (task.status === 'Done') summary.completed += 1;
        if (task.status !== 'Done') summary.pending += 1;
        if (task.status !== 'Done' && task.dueDate < now) summary.overdue += 1;
        return summary;
      },
      { completed: 0, pending: 0, overdue: 0 }
    );

    res.json({ tasks, counts });
  } catch (error) {
    next(error);
  }
};

export const getProjectTasks = async (req, res, next) => {
  try {
    const access = await ensureProjectAccess(req.params.projectId, req.user);
    if (access.status) return res.status(access.status).json({ message: access.message });

    const filter = { project: req.params.projectId };
    if (req.query.status) filter.status = req.query.status;
    if (req.user.role === 'Admin' && req.query.assignedUser) {
      filter.$or = [
        { assignedUser: req.query.assignedUser },
        { assignedUsers: req.query.assignedUser }
      ];
    }
    if (req.user.role !== 'Admin') {
      filter.$or = [
        { assignedUser: req.user._id },
        { assignedUsers: req.user._id }
      ];
    }

    const tasks = await populateTask(Task.find(filter).sort({ dueDate: 1, updatedAt: -1 }));
    res.json({ tasks });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const access = await ensureProjectAccess(req.params.projectId, req.user);
    if (access.status) return res.status(access.status).json({ message: access.message });

    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Only admins can create tasks' });
    }

    const assignedUsers = [...new Set(req.body.assignedUsers.map((id) => id.toString()))];
    const assignmentError = await ensureAssignableMembers(access.project, assignedUsers);
    if (assignmentError) return res.status(400).json({ message: assignmentError });

    const task = await Task.create({
      title: req.body.title,
      description: req.body.description,
      project: access.project._id,
      assignedUser: assignedUsers[0],
      assignedUsers,
      status: req.body.status,
      dueDate: req.body.dueDate,
      createdBy: req.user._id
    });

    const populatedTask = await populateTask(Task.findById(task._id));
    res.status(201).json({ task: populatedTask });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const access = await ensureProjectAccess(task.project, req.user);
    if (access.status) return res.status(access.status).json({ message: access.message });

    const isAssignee = task.assignedUser.equals(req.user._id) || task.assignedUsers.some((userId) => userId.equals(req.user._id));
    if (req.user.role !== 'Admin' && !isAssignee) {
      return res.status(403).json({ message: 'You can only update your assigned tasks' });
    }

    if (req.user.role !== 'Admin') {
      const allowedFields = Object.keys(req.body).every((field) => field === 'status');
      if (!allowedFields) {
        return res.status(403).json({ message: 'Members can only update task status' });
      }
    }

    if (req.body.assignedUsers !== undefined) {
      const assignedUsers = [...new Set(req.body.assignedUsers.map((id) => id.toString()))];
      const assignmentError = await ensureAssignableMembers(access.project, assignedUsers);
      if (assignmentError) return res.status(400).json({ message: assignmentError });
      task.assignedUser = assignedUsers[0];
      task.assignedUsers = assignedUsers;
    }

    ['title', 'description', 'status', 'dueDate'].forEach((field) => {
      if (req.body[field] !== undefined) task[field] = req.body[field];
    });

    await task.save();
    const populatedTask = await populateTask(Task.findById(task._id));
    res.json({ task: populatedTask });
  } catch (error) {
    next(error);
  }
};

export const updateTaskStatus = async (req, res, next) => {
  req.body = { status: req.body.status };
  return updateTask(req, res, next);
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Only admins can delete tasks' });
    }

    await task.deleteOne();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
