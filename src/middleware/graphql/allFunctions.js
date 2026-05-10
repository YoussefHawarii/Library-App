export const allFunctions = (...functions) => {
  return async (parent, args, context) => {
    let resolver = functions[0];
    const [, ...middlewares] = functions;
    for (const middleware of middlewares.reverse()) {
      resolver = middleware(resolver);
    }
    return resolver(parent, args, context);
  };
};
