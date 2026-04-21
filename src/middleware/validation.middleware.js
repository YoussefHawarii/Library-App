const validation = (schema) => {
  return (req, res, next) => {
    const data = { ...req.body, ...req.params, ...req.query };
    if (req.file || req.files?.length) {
      data.file = req.file || req.files;
    }
    const results = schema.validate(data, { abortEarly: false });
    if (results.error) {
      return res.status(400).json({ message: results.error.details.map((detail) => detail.message).join(", ") });
    }
    return next();
  };
};

export default validation;
