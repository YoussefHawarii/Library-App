const Autharized = (...roles) => {
  const flatRoles = roles.flat();
  return (req, res, next) => {
    if (!flatRoles.includes(req.user.role)) {
      return next(new Error("you are not authorized to access this route"), { cause: 403 });
    }
    return next();
  };
};

export default Autharized;
