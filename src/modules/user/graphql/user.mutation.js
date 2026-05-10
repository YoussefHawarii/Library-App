import * as userResponse from "./types/user.types.response.js";
import * as userArgs from "./types/user.types.request.js";
import * as userService from "./user.graphql.service.js";
import { GraphQLString } from "graphql";

export const userMutation = {
  signUp: {
    type: userResponse.Oneuser,
    args: userArgs.SignUpArgs,
    resolve: userService.signUp,
  },
  login: {
    type: userResponse.LoginResponse,
    args: userArgs.LoginArgs,
    resolve: userService.login,
  },
  deleteUser: {
    type: GraphQLString,
    args: userArgs.DeleteUserArgs,
    resolve: userService.deleteUser,
  },
};
