import { roles } from "../../DB/models/user.model.js";

const endPoints = {
  borrowBook: [roles.USER],
  deleteUser: [roles.USER, roles.ADMIN],
};

export default endPoints;
