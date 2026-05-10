//types of return from resolver

import { GraphQLBoolean, GraphQLID, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from "graphql";
import { OneBookResponse } from "../../../book/graphql/types/book.types.response.js";

const BorrowedBook = new GraphQLObjectType({
  name: "BorrowedBook",
  fields: {
    BorrowedBookData: {
      type: OneBookResponse,
      resolve: (parent) => parent.bookId,
    },
    borrowedDate: { type: GraphQLString },
    dueDate: { type: GraphQLString },
    returnDate: { type: GraphQLString },
  },
});

export const Oneuser = new GraphQLObjectType({
  name: "One_User",
  fields: {
    _id: { type: GraphQLID },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    phone: { type: GraphQLString },
    role: { type: GraphQLString },
    borrowedBooks: { type: new GraphQLList(BorrowedBook) },
    isActived: { type: GraphQLBoolean },
    isDeleted: { type: GraphQLBoolean },
  },
});

export const Allusers = new GraphQLList(Oneuser);

export const LoginResponse = new GraphQLObjectType({
  name: "LoginResponse",
  fields: {
    access_token: { type: GraphQLString },
    refresh_token: { type: GraphQLString },
  },
});
