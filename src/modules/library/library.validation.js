import joi from 'joi';

export const createLibrarySchema = joi.object({
    name: joi.string().required(),
    location: joi.string().required(),
    books: joi.array().items(joi.string())
});

export const updateLibrarySchema = joi.object({
    id: joi.string().required(),
    name: joi.string(),
    location: joi.string(),
    books: joi.array().items(joi.string())
});