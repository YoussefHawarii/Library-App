import { Router } from "express";
import * as bookService from "./book.service.js";
import validation from "../../middleware/validation.middleware.js";
import * as bookValidation from "./book.validation.js";
import { asyncHandler } from "../../utils/errors/asyncHandler.js";

const router = Router();

//add a new book
router.post("/addBook", validation(bookValidation.addBookSchema), asyncHandler(bookService.addBook));
router.delete("/deleteBook/:id", asyncHandler(bookService.deleteBook));
router.patch("/restoreBook/:id", asyncHandler(bookService.restoreBook));
router.get("/getAllBooks", asyncHandler(bookService.getAllBooks));
router.get("/getBookById/:id", asyncHandler(bookService.getBookById));
router.get("/genre/:genre", asyncHandler(bookService.getBooksByGenre));

export default router;
