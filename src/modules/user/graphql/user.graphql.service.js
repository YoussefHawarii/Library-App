import mongoose from "mongoose";
import User from "../../../DB/models/user.model.js";
import { encrypt } from "../../../utils/encryption/encryption.js";
import { comparePassword, hashPassword } from "../../../utils/hashing/hash.js";
import { generateToken } from "../../../utils/token/token.js";

export const Allusers = async () => {
  const data = await User.find().populate("borrowedBooks.bookId");
  return data;
};

export const Oneuser = async (_, args, context) => {
  const { id } = args;
  const data = await User.findById(id).populate("borrowedBooks.bookId");
  return data;
};

export const signUp = async (_, args) => {
  const { name, email, phone, password } = args;

  //check if the email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("Email already exists");
  }
  //hash the password
  const hashedPassword = hashPassword({ password });
  // encrypt the phone number
  const encryptedPhone = encrypt({ phone });

  const newUser = User.create({ name, email, phone: encryptedPhone, password: hashedPassword });
  return newUser;
};

export const login = async (_, args) => {
  const { email, password } = args;

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }
  const isPasswordValid = comparePassword({ password, hashedPassword: user.password });
  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }
  const access_token = generateToken({
    payload: { id: user._id, email: user.email },
    options: { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN },
  });
  const refresh_token = generateToken({
    payload: { id: user._id, email: user.email },
    options: { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN },
  });
  return { access_token, refresh_token };
};

export const deleteUser = async (_, args) => {
  const { id } = args;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid user ID", { cause: 400 });
  }
  const data = await User.findById(id);
  if (!data) {
    throw new Error("User not found", { cause: 404 });
  }
  if (data.isDeleted) {
    throw new Error("User already deleted", { cause: 400 });
  }

  data.isDeleted = true;
  data.isActived = false;
  await data.save();
  return "User deleted successfully";
};
