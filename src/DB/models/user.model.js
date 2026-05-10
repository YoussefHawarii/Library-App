import { Schema, model } from "mongoose";

export const roles = {
  ADMIN: "admin",
  USER: "user",
};

export const loginMethods = {
  GOOGLE: "google",
  SYSTEM: "system",
};

const userSchema = new Schema(
  {
    name: {
      type: String,
      lowercase: true,
      minlength: [3, "name must be at least 3 characters"],
      maxlength: [30, "name must be less than 30 characters"],
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
      required: function () {
        return this.provider == loginMethods.SYSTEM ? true : false;
      },
      minlength: [6, "password must be at least 6 characters"],
    },
    phone: {
      type: String,
      required: function () {
        return this.provider == loginMethods.SYSTEM ? true : false;
      },
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
    provider: {
      type: String,
      enum: Object.values(loginMethods),
      default: loginMethods.SYSTEM,
    },
  },

  { timestamps: true },
);

export default model("User", userSchema);
