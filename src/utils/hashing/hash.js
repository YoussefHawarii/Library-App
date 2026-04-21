import bycrypt from "bcrypt";

export const hashPassword = ({ password, rounds = Number(process.env.SALTED_ROUNDS) }) => {
  return bycrypt.hashSync(password, rounds);
};

export const comparePassword = ({ password, hashedPassword }) => {
  return bycrypt.compareSync(password, hashedPassword);
};
