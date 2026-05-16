import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';

const populateProject = (query) =>
  query
    .populate('createdBy', 'name email role')
    .populate('teamMembers', 'name email role');

const normalizeTeamMembers = (members = [], creatorId) => {
  const ids = new Set([creatorId.toString(), ...members.map((id) => id.toString())]);
  return [...ids];
};

export const getProjects = async (req, res, next) => {
  try {
    const filter = req.user.role === 'Admin'
      ? {}
      : { teamMembers: req.user._id };

    const projects = await populateProject(Project.find(filter).sort({ updatedAt: -1 }));
    res.json({ projects });
  } catch (error) {
    next(error);
  }
};

export const getProject = async (req, res, next) => {
  try {
    const project = await populateProject(Project.findById(req.params.projectId));
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isMember = project.teamMembers.some((member) => member._id.equals(req.user._id));
    if (req.user.role !== 'Admin' && !isMember) {
      return res.status(403).json({ message: 'You can only view assigned projects' });
    }

    res.json({ project });
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const teamMembers = normalizeTeamMembers(req.body.teamMembers, req.user._id);
    const count = await User.countDocuments({ _id: { $in: teamMembers } });

    if (count !== teamMembers.length) {
      return res.status(400).json({ message: 'One or more team members do not exist' });
    }

    const project = await Project.create({
      name: req.body.name,
      description: req.body.description,
      teamMembers,
      createdBy: req.user._id
    });

    const populatedProject = await populateProject(Project.findById(project._id));
    res.status(201).json({ project: populatedProject });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (req.body.name !== undefined) project.name = req.body.name;
    if (req.body.description !== undefined) project.description = req.body.description;
    if (req.body.teamMembers !== undefined) {
      const teamMembers = normalizeTeamMembers(req.body.teamMembers, project.createdBy);
      const count = await User.countDocuments({ _id: { $in: teamMembers } });

      if (count !== teamMembers.length) {
        return res.status(400).json({ message: 'One or more team members do not exist' });
      }

      project.teamMembers = teamMembers;
    }

    await project.save();
    const populatedProject = await populateProject(Project.findById(project._id));
    res.json({ project: populatedProject });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
