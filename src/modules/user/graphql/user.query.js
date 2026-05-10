// all query"get" field of users
import * as userResponse from "./types/user.types.response.js";
import * as userArgs from "./types/user.types.request.js";
import * as userService from "./user.graphql.service.js";
import { isAuthenticated } from "../../../middleware/graphql/Authentication.graphql.js";
import { validation } from "../../../middleware/graphql/validation.graphql.js";
import { getOneUserSchema } from "./user.graphql.validation.js";
import { allFunctions } from "../../../middleware/graphql/allFunctions.js";

export const userQuery = {
  Allusers: {
    type: userResponse.Allusers,
    resolve: userService.Allusers,
  },
  Oneuser: {
    type: userResponse.Oneuser,
    args: userArgs.OneuserArgs,
    resolve: allFunctions(userService.Oneuser, isAuthenticated(["admin"]), validation(getOneUserSchema)),
  },
};
