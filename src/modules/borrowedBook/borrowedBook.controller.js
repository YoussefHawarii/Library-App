import { Router } from "express";
import { asyncHandler } from "../../utils/errors/asyncHandler.js";
import * as borrowedBookService from "./borrowedBook.service.js";
import Authentication from "../../middleware/Authentication.middleware.js";

const router = Router();

router.get("/", asyncHandler(borrowedBookService.getOverdueBooks));
router.patch("/return/:borrowedBookId", Authentication, asyncHandler(borrowedBookService.returnBook));

export default router;
