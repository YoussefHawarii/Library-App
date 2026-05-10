import User from "../../DB/models/user.model.js";
import { verifyToken } from "../../utils/token/token.js";

export const isAuthenticated = (roles) => {
  return (resolver) => {
    return async (parent, args, context) => {
      const authorization = context?.authorization || context?.headers?.authorization;
      if (!authorization) {
        throw new Error("token required", { cause: 401 });
      }
      //get token from header with Beare format
      if (!authorization.startsWith("Bearer ")) {
        throw new Error("invalid token format", { cause: 401 });
      }
      const token = authorization.split(" ")[1];
      const decoded = verifyToken({ token });
      const { id } = decoded;
      const user = await User.findById(id).select("-password").lean();
      if (!user) throw new Error("user not found", { cause: 404 });

      //authorization
      if (roles && !roles.includes(user.role)) {
        throw new Error("forbidden", { cause: 403 });
      }

      context.user = user;
      return resolver(parent, args, context);
    };
  };
};
