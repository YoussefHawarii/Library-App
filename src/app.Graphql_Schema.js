import { GraphQLObjectType, GraphQLSchema } from "graphql";
import { bookQuery } from "./modules/book/graphql/book.query.js";
import { bookMutation } from "./modules/book/graphql/book.mutation.js";
import { userQuery } from "./modules/user/graphql/user.query.js";
import { userMutation } from "./modules/user/graphql/user.mutation.js";
export const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "MainQuery",
    fields: {
      //getters of users
      ...userQuery,
      //getters of books
      ...bookQuery,

      //getter of libraries
    },
  }),
  mutation: new GraphQLObjectType({
    name: "MainMutation",
    fields: {
      //add,update,delete users
      ...userMutation,
      //add,update,delete books
      ...bookMutation,
    },
  }),
});
