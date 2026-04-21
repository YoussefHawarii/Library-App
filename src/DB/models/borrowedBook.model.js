import { Schema, model } from "mongoose";

export const borrowedBookStatus = {
  borrowed: "borrowed",
  returned: "returned",
  overdue: "overdue" 
};

const borrowedBookSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    borrowedAt: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    returnDate: { type: Date, default: null },
    status: {
      type: String,
      enum: Object.values(borrowedBookStatus),
      default: borrowedBookStatus.borrowed,
    },
    returned: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default model("BorrowedBook", borrowedBookSchema);
