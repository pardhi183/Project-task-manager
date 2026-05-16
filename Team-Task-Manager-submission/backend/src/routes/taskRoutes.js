import express from 'express';
import {
  deleteTask,
  getMyTasks,
  updateTask,
  updateTaskStatus
} from '../controllers/taskController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import {
  statusValidator,
  taskIdValidator,
  updateTaskValidator
} from '../validators/taskValidators.js';

const router = express.Router();

router.use(protect);

router.get('/mine', getMyTasks);
router.patch('/:taskId/status', statusValidator, validate, updateTaskStatus);
router
  .route('/:taskId')
  .put(updateTaskValidator, validate, updateTask)
  .delete(authorize('Admin'), taskIdValidator, validate, deleteTask);

export default router;
