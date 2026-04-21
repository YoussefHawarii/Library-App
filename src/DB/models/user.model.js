import { Schema, model } from "mongoose";

export const roles = {
  ADMIN: "admin",
  USER: "user",
};

const userSchema = new Schema(
  {
    name: {
      type: String,
      lowercase: true,
      minlength: [3, "name must be at least 3 characters"],
      maxlength: [15, "name must be less than 15 characters"],
      trim: true,
      required: [true, "please provide your name"],
    },
    email: {
      type: String,
      lowercase: true,
      match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      trim: true,
      required: [true, "please provide your email"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "please provide a password"],
      minlength: [6, "password must be at least 6 characters"],
    },
    phone: {
      type: String,
      required: [true, "please provide your phone number"],
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(roles),
      default: roles.USER,
    },
    borrowedBooks: [
      {
        bookId: { type: Schema.Types.ObjectId, ref: "Book" },
        borrowedDate: { type: Date, default: Date.now },
        dueDate: { type: Date, default: null }, //when the book should be returned
        returnDate: { type: Date, default: null }, //when the book was actually returned
      },
    ],
    isActived: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },

  { timestamps: true },
);

export default model("User", userSchema);
