import joi from "joi";

export const getOneUserSchema = joi
  .object({
    id: joi.string().required().min(3),
  })
  .required();
