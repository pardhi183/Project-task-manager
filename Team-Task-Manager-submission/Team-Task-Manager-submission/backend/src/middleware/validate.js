import { validationResult } from 'express-validator';

export const validate = (req, res, next) => {
  const result = validationResult(req);

  if (result.isEmpty()) return next();

  return res.status(422).json({
    message: 'Validation failed',
    errors: result.array().map((error) => ({
      field: error.path,
      message: error.msg
    }))
  });
};
