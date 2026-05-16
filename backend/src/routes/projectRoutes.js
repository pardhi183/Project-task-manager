import express from 'express';
import {
  createProject,
  deleteProject,
  getProject,
  getProjects,
  updateProject
} from '../controllers/projectController.js';
import {
  createTask,
  getProjectTasks
} from '../controllers/taskController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import {
  createProjectValidator,
  projectIdValidator,
  updateProjectValidator
} from '../validators/projectValidators.js';
import {
  createTaskValidator,
  projectTasksValidator
} from '../validators/taskValidators.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getProjects)
  .post(authorize('Admin'), createProjectValidator, validate, createProject);

router
  .route('/:projectId')
  .get(projectIdValidator, validate, getProject)
  .put(authorize('Admin'), updateProjectValidator, validate, updateProject)
  .delete(authorize('Admin'), projectIdValidator, validate, deleteProject);

router
  .route('/:projectId/tasks')
  .get(projectTasksValidator, validate, getProjectTasks)
  .post(authorize('Admin'), createTaskValidator, validate, createTask);

export default router;
