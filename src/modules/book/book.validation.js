import joi from "joi";

export const addBookSchema = joi
  .object({
    title: joi.string().required(),
    author: joi.string().required(),
    genre: joi.string().required(),
    publishedYear: joi.number().required(),
    availableCopies: joi.number().min(0).required(),
  })
  .required();
