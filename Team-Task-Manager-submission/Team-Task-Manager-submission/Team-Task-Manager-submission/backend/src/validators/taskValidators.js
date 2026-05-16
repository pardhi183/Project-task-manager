import { body, param, query } from 'express-validator';

export const taskIdValidator = [
  param('taskId').isMongoId().withMessage('Valid task id is required')
];

export const projectTasksValidator = [
  param('projectId').isMongoId().withMessage('Valid project id is required'),
  query('status').optional().isIn(['Todo', 'In Progress', 'Done']).withMessage('Invalid task status'),
  query('assignedUser').optional().isMongoId().withMessage('Assigned user must be a valid id')
];

export const createTaskValidator = [
  param('projectId').isMongoId().withMessage('Valid project id is required'),
  body('title').trim().isLength({ min: 2, max: 160 }).withMessage('Title must be 2-160 characters'),
  body('description').optional().trim().isLength({ max: 3000 }).withMessage('Description is too long'),
  body('assignedUser').isMongoId().withMessage('Assigned user must be a valid id'),
  body('status').optional().isIn(['Todo', 'In Progress', 'Done']).withMessage('Invalid task status'),
  body('dueDate').isISO8601().withMessage('Due date must be a valid date')
];

export const updateTaskValidator = [
  ...taskIdValidator,
  body('title').optional().trim().isLength({ min: 2, max: 160 }).withMessage('Title must be 2-160 characters'),
  body('description').optional().trim().isLength({ max: 3000 }).withMessage('Description is too long'),
  body('assignedUser').optional().isMongoId().withMessage('Assigned user must be a valid id'),
  body('status').optional().isIn(['Todo', 'In Progress', 'Done']).withMessage('Invalid task status'),
  body('dueDate').optional().isISO8601().withMessage('Due date must be a valid date')
];

export const statusValidator = [
  ...taskIdValidator,
  body('status').isIn(['Todo', 'In Progress', 'Done']).withMessage('Invalid task status')
];
