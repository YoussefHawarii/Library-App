import connectDB from "./DB/connection.js";
import cors from "cors";
import userRouter from "./modules/user/user.controller.js";
import bookRouter from "./modules/book/book.controller.js";
import libraryRouter from "./modules/library/library.controller.js";
import borrowedBookRouter from "./modules/borrowedBook/borrowedBook.controller.js";
import globalErrorHandler from "./utils/errors/globalErrorHandler.js";
import helmet from "helmet";
import { createHandler } from "graphql-http/lib/use/express";
import { schema } from "../src/app.Graphql_Schema.js";
import { rateLimit } from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 5 minutes",
});

const bootstrap = async (app, express) => {
  await connectDB();
  app.use(cors());
  app.use(helmet());
  app.use(limiter);
  app.use(express.json());
  app.use(
    "/graphql",
    createHandler({
      schema,
      context: (req) => {
        const { authorization } = req.headers;
        return { authorization };
      },
      formatError: (err) => {
        return {
          message: err.originalError?.message,
          extensions: {
            success: false,
            statusCode: err.originalError?.cause || 500,
          },
        };
      },
    }),
  );
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
