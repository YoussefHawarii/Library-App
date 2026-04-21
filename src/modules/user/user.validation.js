import joi from "joi";

//sendOTP validation
export const sendOTP = joi
  .object({
    name: joi.string().min(3).max(15).required(),
    email: joi.string().email().required(),
  })
  .required();
//signup validation
export const signUp = joi
  .object({
    name: joi.string().min(3).max(15).required(),
    email: joi.string().email().required(),
    password: joi.string().min(6).required(),
    phone: joi.string().required(),
    otp: joi.string().length(5).required(),
  })
  .required();
//login validation
export const login = joi
  .object({
    email: joi.string().email().required(),
    password: joi.string().min(6).required(),
  })
  .required();
