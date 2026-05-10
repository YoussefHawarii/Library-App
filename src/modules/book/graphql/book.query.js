// all query"get" field of posts

import { GraphQLNonNull, GraphQLString } from "graphql";
import * as bookService from "./book.graphql.service.js";
import * as bookArgs from "./types/book.types.request.js";
import { AllBooksResponse, OneBookResponse } from "./types/book.types.response.js";

export const bookQuery = {
  bookByID: {
    type: OneBookResponse,
    args: bookArgs.oneBook,
    resolve: bookService.oneBook,
  },
  allbooks: {
    type: AllBooksResponse,
    resolve: bookService.allBooks,
  },
  bookByGenre: {
    type: AllBooksResponse,
    args: bookArgs.bookByGenre,
    resolve: bookService.getBookByGenre,
  },
};
