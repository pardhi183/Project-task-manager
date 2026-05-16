import { body, param } from 'express-validator';

export const projectIdValidator = [
  param('projectId').isMongoId().withMessage('Valid project id is required')
];

export const createProjectValidator = [
  body('name').trim().isLength({ min: 2, max: 120 }).withMessage('Project name must be 2-120 characters'),
  body('description').optional().trim().isLength({ max: 2000 }).withMessage('Description is too long'),
  body('targetRole').optional().isIn(['Admin', 'User', 'Employee']).withMessage('Project audience must be Admin, User, or Employee'),
  body('teamMembers').optional().isArray().withMessage('Team members must be an array'),
  body('teamMembers.*').optional().isMongoId().withMessage('Every team member must be a valid user id')
];

export const updateProjectValidator = [
  ...projectIdValidator,
  body('name').optional().trim().isLength({ min: 2, max: 120 }).withMessage('Project name must be 2-120 characters'),
  body('description').optional().trim().isLength({ max: 2000 }).withMessage('Description is too long'),
  body('targetRole').optional().isIn(['Admin', 'User', 'Employee']).withMessage('Project audience must be Admin, User, or Employee'),
  body('teamMembers').optional().isArray().withMessage('Team members must be an array'),
  body('teamMembers.*').optional().isMongoId().withMessage('Every team member must be a valid user id')
];
