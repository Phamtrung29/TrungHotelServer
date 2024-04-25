const express = require("express");
const control = require("./datphong.controller");
const router = express.Router();
const { isAdmin, verifyAccessToken } = require("../../middleware/verifyToken");

router.post("/create", [verifyAccessToken, isAdmin], control.create);
// router.post("/create", control.create);

router.post("/add", control.autoCreate);

// router.get("/", [verifyAccessToken, isAdmin], control.getAll);
router.get("/", control.getAll);

// router.get("/multidata", [verifyAccessToken, isAdmin], control.getMultiAllData);
router.get("/multidata", control.getMultiAllData);

router.get("/list", control.getList);

router.get("/static", control.getStaticDashboard);

// router.get("/get/:id", [verifyAccessToken, isAdmin], control.getById);
router.get("/get/:id", control.getById);

router.get("/cancel/:id", control.cancelBooking);

router.put("/update/:id", control.update);
router.put("/updateday/:id", control.updateDay);

router.delete("/:id", [verifyAccessToken, isAdmin], control.remove);
// router.delete("/:id", control.remove);

module.exports = router;
