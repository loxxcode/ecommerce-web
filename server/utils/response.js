// Standard response utility functions
export const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

export const errorResponse = (res, message = 'Error occurred', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

export const validationErrorResponse = (res, errors) => {
  return errorResponse(res, 'Validation failed', 400, errors);
};

export const notFoundResponse = (res, message = 'Resource not found') => {
  return errorResponse(res, message, 404);
};

export const unauthorizedResponse = (res, message = 'Unauthorized') => {
  return errorResponse(res, message, 401);
};

export const forbiddenResponse = (res, message = 'Forbidden') => {
  return errorResponse(res, message, 403);
};

export const conflictResponse = (res, message = 'Conflict') => {
  return errorResponse(res, message, 409);
};
