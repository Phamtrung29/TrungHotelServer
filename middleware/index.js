const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");

const globalMiddelwares = (app, dir) => {
  app.use("/public", express.static(path.join(dir, "public")));
  app.use(
    cors({
      origin: true,
      methods: ["POST", "PUT", "GET", "DELETE"],
      credentials: true,
    })
  );
  app.use(express.urlencoded());
  app.use(express.json());
  app.use(morgan("dev"));
  app.use(cookieParser());

  app.use("/api/user", require("../modules/user"));
  app.use("/api/account", require("../modules/account"));
  app.use("/api/loaiphong", require("../modules/loaiphong"));
  app.use("/api/phong", require("../modules/phong"));
  app.use("/api/dichvu", require("../modules/dichvu"));
  app.use("/api/datphong", require("../modules/datphong"));
  app.use("/api/thongtinkh", require("../modules/thongtinkh"));
  app.use("/api/hoadon", require("../modules/hoadon"));
};

module.exports = globalMiddelwares;
