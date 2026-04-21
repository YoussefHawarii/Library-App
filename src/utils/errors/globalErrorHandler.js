const globalErrorHandler = (err, req, res, next) => {
  const statusCode = err.cause || 500;
  const response = { success: false, message: err.message || "Internal Server Error" };
  if (process.env.NODE_ENV !== "development") response.stack = err.stack;
  return res.status(statusCode).json(response);
};

export default globalErrorHandler;
