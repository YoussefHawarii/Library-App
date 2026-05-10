//types of args from resolver

import { GraphQLID, GraphQLNonNull, GraphQLString } from "graphql";

export const OneuserArgs = { id: { type: new GraphQLNonNull(GraphQLID) } };

export const SignUpArgs = {
  name: { type: new GraphQLNonNull(GraphQLString) },
  email: { type: new GraphQLNonNull(GraphQLString) },
  phone: { type: new GraphQLNonNull(GraphQLString) },
  password: { type: new GraphQLNonNull(GraphQLString) },
  role: { type: GraphQLString },
};

export const LoginArgs = {
  email: { type: new GraphQLNonNull(GraphQLString) },
  password: { type: new GraphQLNonNull(GraphQLString) },
};

export const DeleteUserArgs = { id: { type: new GraphQLNonNull(GraphQLID) } };
