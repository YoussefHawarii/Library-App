import express from "express";
import bootstrap from "./src/app.controller.js";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const port = process.env.PORT;
await bootstrap(app, express);
app.listen(port, () => {
  console.log(`app is running on port ${port}!`);
});
