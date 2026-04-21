export const asyncHandler = (fn) => {
  return (req, res, next) => {
    return fn(req, res, next).catch((error) => {
      if (Object.keys(error).length === 0) {
        return next(new Error(error.message));
      }
      return next(error);
    });
  };
};
