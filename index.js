const express = require('express');
const app = express();
require('dotenv').config();

const PORT = process.env.PORT || 4000;

const dbConnect = require('./database');
const globalMiddelwares = require('./middleware');

globalMiddelwares(app, __dirname);


app.listen(PORT, async () => {
  console.info('Listening on port ' + PORT);
  await dbConnect(app);
});