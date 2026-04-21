import { Schema, model } from "mongoose";

const bookSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "please provide the book title"],
      trim: true,
    },
    author: {
      type: String,
      required: [true, "please provide the book author"],
      trim: true,
    },
    genre: {
      type: String,
      required: [true, "please provide the book genre"],
      trim: true,
    },
    publishedYear: {
      type: Number,
      required: [true, "please provide the book published year"],
    },
    availableCopies: {
      type: Number,
      required: [true, "please provide the number of available copies"],
      min: [0, "available copies cannot be negative"],
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default model("Book", bookSchema);
