export const validation = (schema) => {
  return (resolver) => {
    return async (parent, args, context) => {
      const { error } = schema.validate(args, { abortEarly: false });
      if (error) {
        const message = error.details.map((err) => err.message);
        throw new Error(message.join(", "), { cause: 400 });
      }
      return resolver(parent, args, context);
    };
  };
};
