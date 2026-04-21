import Book from "../../DB/models/book.model.js";

export const addBook = async (req, res, next) => {
  const { title, author, genre, publishedYear, availableCopies } = req.body;
  //need to check if the book already exists
  const existingBook = await Book.findOne({ title, author, isDeleted: false });
  if (existingBook) {
    return next(new Error("Book already exists"), { cause: 400 });
  }
  // add book
  const newBook = new Book({
    title,
    author,
    genre,
    publishedYear,
    availableCopies,
  });
  await newBook.save();
  res.status(201).json({ message: "Book added successfully", book: newBook });
};
//delete book
export const deleteBook = async (req, res, next) => {
  const { id } = req.params;
  const book = await Book.findById(id);
  if (!book || book.isDeleted) {
    return next(new Error("Book not found"), { cause: 400 });
  }
  book.isDeleted = true;
  await book.save();
  res.status(200).json({ message: "Book deleted successfully" });
};
// restore book
export const restoreBook = async (req, res, next) => {
  const { id } = req.params;
  const book = await Book.findById(id);
  if (!book || !book.isDeleted) {
    return next(new Error("Book not found or not deleted"), { cause: 400 });
  }
  book.isDeleted = false;
  await book.save();
  res.status(200).json({ message: "Book restored successfully" });
};
//get all books
export const getAllBooks = async (req, res, next) => {
  const books = await Book.find({ isDeleted: false }).select("-isDeleted -createdAt -updatedAt -__v");
  res.status(200).json({ books });
};
//Retrieve Book by id
export const getBookById = async (req, res, next) => {
  const { id } = req.params;
  const book = await Book.findOne({ _id: id, isDeleted: false }).select("-isDeleted -createdAt -updatedAt -__v");
  if (!book || book.isDeleted) {
    return next(new Error("Book not found"), { cause: 400 });
  }
  res.status(200).json({ book });
};
//Get books by genre
export const getBooksByGenre = async (req, res, next) => {
  const { genre } = req.params;
  const books = await Book.find({ genre, isDeleted: false }).select("-isDeleted -createdAt -updatedAt -__v");
  if (books.length === 0) {
    return res.status(200).json({ message: `No books found in genre: ${genre}`, books: [] });
  }
  res.status(200).json({ genre, books, totalBooks: books.length });
};