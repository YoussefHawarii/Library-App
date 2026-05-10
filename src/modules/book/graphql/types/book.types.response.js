//types of return from resolver

import { GraphQLBoolean, GraphQLID, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from "graphql";

export const OneBookResponse = new GraphQLObjectType({
  name: "Book",
  fields: {
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    author: { type: GraphQLString },
    genre: { type: GraphQLString },
    publishedYear: { type: GraphQLInt },
    availableCopies: { type: GraphQLInt },
    isDeleted: { type: GraphQLBoolean },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
    _id: { type: GraphQLID },
  },
});

export const AllBooksResponse = new GraphQLList(OneBookResponse);
