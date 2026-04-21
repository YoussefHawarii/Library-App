import User from "../../DB/models/user.model.js";
import Book from "../../DB/models/book.model.js";
import BorrowedBook, { borrowedBookStatus } from "../../DB/models/borrowedBook.model.js";
import OTP from "../../DB/models/OTP.model.js";
import { hashPassword, comparePassword } from "../../utils/hashing/hash.js";
import { encrypt } from "../../utils/encryption/encryption.js";
import Randomstring from "randomstring";
import { emailEmitter } from "../../utils/emails/email.event.js";
import { generateToken } from "../../utils/token/token.js";

export const sendOTP = async (req, res, next) => {
  // Check if the email already exists
  const existingUser = await User.findOne({ email: req.body.email });
  if (existingUser) {
    return next(new Error("Email already exists"), { cause: 400 });
  }
  // send OTP to the user's email(simulate)
  const otp = Randomstring.generate({ length: 5, charset: "numeric" });
  await OTP.create({ email: req.body.email, otp });
  emailEmitter.emit("sendOTPEmail", { email: req.body.email, otp, username: req.body.name });

  return res.status(201).json({ message: "OTP has been sent successfully!" });
};

export const signUp = async (req, res, next) => {
  const { email, otp } = req.body;
  // Check if the email exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new Error("Email already exists"), { cause: 400 });
  }
  // Check if the OTP is correct
  const otpRecord = await OTP.findOne({ email, otp });
  if (!otpRecord) {
    return next(new Error("Invalid OTP"), { cause: 400 });
  }
  //hash the password
  const hashedPassword = hashPassword({ password: req.body.password });
  // encrypt the phone number
  const encryptedPhone = encrypt({ data: req.body.phone });
  // Create a new user
  await User.create({ ...req.body, password: hashedPassword, phone: encryptedPhone, isActived: true });
  // Send thank you email
  emailEmitter.emit("sendThankYouEmail", { email, username: req.body.name });
  return res.status(201).json({ message: "account has been created successfully!" });
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;
  // Check if the email exists
  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    return next(new Error("Email not found"), { cause: 400 });
  }
  console.log(password, existingUser.password);
  // Check if the password is correct
  if (!comparePassword({ password, hashedPassword: existingUser.password })) {
    return next(new Error("Invalid password"), { cause: 400 });
  }
  //generate a token (simulate)
  const access_token = generateToken({
    payload: { id: existingUser._id, email: existingUser.email },
    options: { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN },
  });
  const refresh_token = generateToken({
    payload: { id: existingUser._id, email: existingUser.email },
    options: { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN },
  });
  return res.status(200).json({ message: "You have logged in successfully!", access_token, refresh_token });
};

//borrow book
export const borrowBook = async (req, res, next) => {
  const userId = req.user._id;
  const { bookId } = req.params;

  const user = await User.findById(userId);
  if (!user || user.isDeleted) {
    return next(new Error("User not found"), { cause: 404 });
  }

  // Prevent borrowing same book twice if not returned yet
  const activeBorrowedRecord = await BorrowedBook.findOne({
    userId,
    bookId,
    returned: false,
  });
  if (activeBorrowedRecord) {
    return next(new Error("You have already borrowed this book"), { cause: 400 });
  }

  const book = await Book.findById(bookId);
  if (!book || book.isDeleted) {
    return next(new Error("Book not found"), { cause: 404 });
  }

  if (book.availableCopies < 1) {
    return next(new Error("No copies available for this book"), { cause: 400 });
  }

  // decrease available copies
  book.availableCopies -= 1;
  await book.save();

  const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  // Create record in BorrowedBook collection (this is the main link)
  const borrowedBookRecord = await BorrowedBook.create({
    userId,
    bookId,
    dueDate,
    returned: false,
    status: borrowedBookStatus.borrowed,
  });

  // Optional: keep user embedded history if you still want it
  user.borrowedBooks.push({ bookId, dueDate });
  await user.save();

  return res.status(201).json({
    message: "Book borrowed successfully!",
    data: borrowedBookRecord,
  });
};

//delete user(authenticated users only)
export const deleteUser = async (req, res, next) => {
  const userId = req.user._id;
  const user = await User.findById(userId);
  if (!user) {
    return next(new Error("User not found"), { cause: 404 });
  }
  if (user.isDeleted) {
    return next(new Error("User already deleted"), { cause: 400 });
  }
  user.isDeleted = true;
  user.isActived = false;
  await user.save();
  return res.status(200).json({ message: "User Soft deleted successfully!" });
};
