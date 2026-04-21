import { Router } from "express";
import * as LibraryService from "./library.service.js";
import { asyncHandler } from "../../utils/errors/asyncHandler.js";
import validation from "../../middleware/validation.middleware.js";
import * as libraryValidation from "./library.validation.js";

const router = Router();

router.post("/", validation(libraryValidation.createLibrarySchema), asyncHandler(LibraryService.createLibrary));
router.patch("/:id", validation(libraryValidation.updateLibrarySchema), asyncHandler(LibraryService.updateLibrary));
router.get("/", asyncHandler(LibraryService.getLibrary));
router.get("/:id", asyncHandler(LibraryService.getLibraryById));
router.post("/:libraryId/addBook", asyncHandler(LibraryService.addBookToLibrary));
router.delete("/:libraryId/removeBook/:bookId", asyncHandler(LibraryService.removeBookFromLibrary));
router.get("/:libraryId/genre/:genre", asyncHandler(LibraryService.getLibraryBooksByGenre));
router.get("/:libraryId/genres", asyncHandler(LibraryService.getLibraryGenres));

export default router;
