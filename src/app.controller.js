import connectDB from "./DB/connection.js";
import cors from "cors";
import userRouter from "./modules/user/user.controller.js";
import bookRouter from "./modules/book/book.controller.js";
import libraryRouter from "./modules/library/library.controller.js";
import borrowedBookRouter from "./modules/borrowedBook/borrowedBook.controller.js";
import globalErrorHandler from "./utils/errors/globalErrorHandler.js";

const bootstrap = async (app, express) => {
  await connectDB();
  app.use(cors());
  app.use(express.json());
  app.use("/user", userRouter);
  app.use("/book", bookRouter);
  app.use("/library", libraryRouter);
  app.use("/borrowed-book", borrowedBookRouter);
  app.all("*url", (req, res) => {
    res.status(404).send("Not Found");
  });
  app.use(globalErrorHandler);
};

export default bootstrap;
