export const successResponse = (res, statusCode, data) => {
    return res.status(statusCode).json({
      status: 'success',
      data
    });
  };
  
  export const errorResponse = (res, statusCode, message) => {
    return res.status(statusCode).json({
      status: 'error',
      message
    });
  };