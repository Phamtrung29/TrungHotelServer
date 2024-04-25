const express = require("express");
const {
  create,
  getAll,
  getById,
  getBooking,
  update,
  remove,
} = require("./thongtinkh.controller");
const router = express.Router();

router.post("/add", create);

router.get("/", getAll);

router.get("/getbooking/:Email", getBooking);

router.get("/:id", getById);

router.put("/:id", update);

router.delete("/:id", remove);

module.exports = router;
