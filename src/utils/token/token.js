import jwt from "jsonwebtoken";

export const generateToken = ({
    payload,
    signature = process.env.JWT_ENCRYPTION_SECRET,
    options = {} 
    }) => {
    return jwt.sign(payload, signature, options);
};

export const verifyToken = ({
    token,
    signature = process.env.JWT_ENCRYPTION_SECRET,
    options = {}
    }) => {
    return jwt.verify(token, signature, options);
    };
