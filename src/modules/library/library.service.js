import Library from "../../DB/models/library.model.js";
import Book from "../../DB/models/book.model.js";

//Create a new library
export const createLibrary = async (req, res, next) => {
  const { name, location, books } = req.body;
  // validate duplicate library name
  const existingLibrary = await Library.findOne({ name, location });
  if (existingLibrary) {
    return next(new Error("Library with the same name and location already exists"), { cause: 400 });
  }
  const newLibrary = new Library({ name, location, books });
  await newLibrary.save();
  return res.status(201).json({ message: "Library created successfully", library: newLibrary });
};

//Update library details
export const updateLibrary = async (req, res, next) => {
  const { id } = req.params;
  const updates = req.body;
  const updatedLibrary = await Library.findByIdAndUpdate(id, updates, { new: true }).populate("books");
  if (!updatedLibrary) {
    return res.status(404).json({ message: "Library not found" });
  }
  return res.status(200).json({ message: "Library updated successfully", library: updatedLibrary });
};

//Fetch libraries along with the books they contain
export const getLibrary = async (req, res, next) => {
  const libraries = await Library.find().populate("books");
  return res.status(200).json({ libraries });
};

//Get single library by ID with all books
export const getLibraryById = async (req, res, next) => {
  const { id } = req.params;
  const library = await Library.findById(id).populate("books");
  if (!library) {
    return next(new Error("Library not found"), { cause: 404 });
  }
  return res.status(200).json({ library });
};

//Add a single book to library
export const addBookToLibrary = async (req, res, next) => {
  const { libraryId } = req.params;
  const { bookId } = req.body;

  // Check if book exists
  const book = await Book.findById(bookId);
  if (!book || book.isDeleted) {
    return next(new Error("Book not found"), { cause: 404 });
  }

  // Add book to library (avoid duplicates)
  const library = await Library.findByIdAndUpdate(libraryId, { $addToSet: { books: bookId } }, { new: true }).populate("books");

  if (!library) {
    return next(new Error("Library not found"), { cause: 404 });
  }

  return res.status(200).json({ message: "Book added to library successfully", library });
};

//Remove a book from library
export const removeBookFromLibrary = async (req, res, next) => {
  const { libraryId, bookId } = req.params;

  const library = await Library.findByIdAndUpdate(libraryId, { $pull: { books: bookId } }, { new: true }).populate("books");

  if (!library) {
    return next(new Error("Library not found"), { cause: 404 });
  }

  return res.status(200).json({ message: "Book removed from library successfully", library });
};

//Get library books filtered by genre
export const getLibraryBooksByGenre = async (req, res, next) => {
  const { libraryId, genre } = req.params;

  const library = await Library.findById(libraryId).populate({
    path: "books",
    match: { genre, isDeleted: false },
  });

  if (!library) {
    return next(new Error("Library not found"), { cause: 404 });
  }

  return res.status(200).json({
    library: library.name,
    location: library.location,
    genre,
    books: library.books,
    totalBooks: library.books.length,
  });
};

//Get all genres available in a library
export const getLibraryGenres = async (req, res, next) => {
  const { libraryId } = req.params;

  const library = await Library.findById(libraryId).populate({
    path: "books",
    select: "genre",
  });

  if (!library) {
    return next(new Error("Library not found"), { cause: 404 });
  }

  const genres = [...new Set(library.books.map((book) => book.genre))];

  return res.status(200).json({
    library: library.name,
    genres,
    totalGenres: genres.length,
  });
};
