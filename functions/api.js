const express = require("express");
const serverless = require("serverless-http");
const app = express();
const router = express.Router();
require("dotenv").config();

const PORT = process.env.PORT || 4000;

const dbConnect = require("../database");
const globalMiddelwares = require("../middleware");

globalMiddelwares(app, __dirname);

app.listen(PORT, async () => {
  console.info("Listening on port " + PORT);
  await dbConnect(app);
});

app.use("/.netlify/functions/api", router);
module.exports.handler = serverless(app);
