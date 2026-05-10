import Book from "../../../DB/models/book.model.js";

export const addBook = async (_, args) => {
  const { input } = args;
  const { title, author, genre, publishedYear, availableCopies } = input;

  const existingBook = await Book.findOne({ title, author, isDeleted: false });
  if (existingBook) throw new Error("Book already exists");

  const newBook = await Book.create({
    title,
    author,
    genre,
    publishedYear,
    availableCopies,
  });

  return newBook;
};

export const oneBook = async (_, args) => {
  const { id } = args;
  const data = await Book.findById(id);
  return data;
};

export const allBooks = async (_, args) => {
  const books = await Book.find();
  return books; // [{},{},{}]
};

export const getBookByGenre = async (_, args) => {
  const { genre } = args;
  const data = await Book.find({ genre, isDeleted: false });
  if (data.length === 0) throw new Error(`no books found in genre ${genre}, make sure you entered correct genre type.`);
  return data;
};

export const deleteBook = async (_, args) => {
  const { id } = args;
  const data = await Book.findById(id);
  if (!data || data.isDeleted) throw new Error("either book has been deleted or not found!");
  data.isDeleted = true;
  await data.save();
  return data;
};

export const restoreBook = async (_, args) => {
  const { id } = args;
  const data = await Book.findById(id);
  if (!data || !data.isDeleted) throw new Error("book not found!");
  data.isDeleted = false;
  await data.save();
  return data;
};
