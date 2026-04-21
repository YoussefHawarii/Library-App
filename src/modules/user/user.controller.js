import { Router } from "express";
import validation from "../../middleware/validation.middleware.js";
import { asyncHandler } from "../../utils/errors/asyncHandler.js";
import * as userValidation from "./user.validation.js";
import * as userService from "./user.service.js";
import Authentication from "../../middleware/Authentication.middleware.js";
import Authorization from "../../middleware/Authorization.middleware.js";
import endPoints from "./user.endpoints.js";

const router = Router();

router.post("/sendOTP", validation(userValidation.sendOTP), asyncHandler(userService.sendOTP));
router.post("/signUp", validation(userValidation.signUp), asyncHandler(userService.signUp));
router.post("/login", validation(userValidation.login), asyncHandler(userService.login));
router.post("/borrowedBooks/:bookId", Authentication, Authorization(endPoints.borrowBook), asyncHandler(userService.borrowBook));
router.delete("/delete", Authentication, Authorization(endPoints.deleteUser), asyncHandler(userService.deleteUser));

export default router;
