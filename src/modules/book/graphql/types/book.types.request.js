//types of args from resolver
import { GraphQLID, GraphQLInputObjectType, GraphQLInt, GraphQLNonNull, GraphQLString } from "graphql";

export const oneBook = { id: { type: new GraphQLNonNull(GraphQLID) } };

export const bookByGenre = { genre: { type: new GraphQLNonNull(GraphQLString) } };

const AddBookInput = new GraphQLInputObjectType({
  name: "AddBookInput",
  fields: {
    title: { type: new GraphQLNonNull(GraphQLString) },
    author: { type: new GraphQLNonNull(GraphQLString) },
    genre: { type: new GraphQLNonNull(GraphQLString) },
    publishedYear: { type: new GraphQLNonNull(GraphQLInt) },
    availableCopies: { type: new GraphQLNonNull(GraphQLInt) },
  },
});

export const addBook = {
  input: { type: new GraphQLNonNull(AddBookInput) },
};