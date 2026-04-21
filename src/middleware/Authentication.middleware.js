import User from "../DB/models/user.model.js";
import { asyncHandler } from "../utils/errors/asyncHandler.js";
import { verifyToken } from "../utils/token/token.js";

const Authentication = asyncHandler(async (req, res, next) => {
  let { authorization } = req.headers;
  if (!authorization) {
    return next(new Error("token required"), { cause: 401 });
  }
  //get token from header with Beare format
  if (!authorization.startsWith("Bearer ")) {
    return next(new Error("invalid token format"), { cause: 401 });
  }
  const token = authorization.split(" ")[1];
  const decoded = verifyToken({ token });
  const { id } = decoded;
  const user = await User.findById(id).select("-password").lean();
  if (!user) return next(new Error("user not found"), { cause: 404 });
  req.user = user;
  return next();
});

export default Authentication;
