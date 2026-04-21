import BorrowedBook, { borrowedBookStatus } from "../../DB/models/borrowedBook.model.js";
import Book from "../../DB/models/book.model.js";
import User from "../../DB/models/user.model.js";

// Retrieve overdue borrowed books that have not been returned.
export const getOverdueBooks = async (req, res, next) => {
  const now = new Date();
  const overdueBooks = await BorrowedBook.find({
    dueDate: { $lt: now },
    returned: false,
  })
    .populate("userId", "name email")
    .populate("bookId", "title author");
  res.status(200).json({ message: "Overdue books retrieved successfully", data: overdueBooks });
};
// Return a borrowed book.
export const returnBook = async (req, res, next) => {
  const userId = req.user._id;
  const { borrowedBookId } = req.params;

  const borrowedBook = await BorrowedBook.findById(borrowedBookId);
  if (!borrowedBook) {
    return next(new Error("Borrowed record not found"), { cause: 404 });
  }

  // Ensure user returns only their own borrowed record.
  if (borrowedBook.userId.toString() !== userId.toString()) {
    return next(new Error("You are not allowed to return this record"), { cause: 403 });
  }

  if (borrowedBook.returned) {
    return next(new Error("Book already returned"), { cause: 400 });
  }

  const book = await Book.findById(borrowedBook.bookId);
  if (!book || book.isDeleted) {
    return next(new Error("Book not found"), { cause: 404 });
  }

  const returnedAt = new Date();

  borrowedBook.returned = true;
  borrowedBook.returnDate = returnedAt;
  borrowedBook.status = borrowedBookStatus.returned;

  book.availableCopies += 1;

  await borrowedBook.save();
  await book.save();

  // Optional sync with user embedded borrowedBooks history
  await User.updateOne(
    {
      _id: userId,
      "borrowedBooks.bookId": borrowedBook.bookId,
      "borrowedBooks.returnDate": null,
    },
    {
      $set: { "borrowedBooks.$.returnDate": returnedAt },
    },
  );

  const data = await BorrowedBook.findById(borrowedBook._id).populate("userId", "name email").populate("bookId", "title author");
  return res.status(200).json({
    message: "Book returned successfully",
    data,
  });
};
