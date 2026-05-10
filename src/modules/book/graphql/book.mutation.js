import * as bookService from "./book.graphql.service.js";
import * as bookArgs from "./types/book.types.request.js";
import { OneBookResponse } from "./types/book.types.response.js";

export const bookMutation = {
  addBook: {
    type: OneBookResponse,
    args: bookArgs.addBook,
    resolve: bookService.addBook,
  },
  deleteBook: {
    type: OneBookResponse,
    args: bookArgs.oneBook,
    resolve: bookService.deleteBook,
  },
  restoreBook: {
    type: OneBookResponse,
    args: bookArgs.oneBook,
    resolve: bookService.restoreBook,
  },
};
