const mongoose = require("mongoose");

const dbConnect = (app) => {
  mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const connection = mongoose.connection;
  connection.once("open", async () => {
    console.info("Connected to DataBase");
  });
};


module.exports = dbConnect;
