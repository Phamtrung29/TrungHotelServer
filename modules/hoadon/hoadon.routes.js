const express = require("express");
const control = require("./hoadon.controller");
const router = express.Router();
const { verifyAccessToken, isAdmin } = require("../../middleware/verifyToken");

// router.post("/add", [verifyAccessToken, isAdmin], control.create);
router.post("/add", control.create);

router.get("/", control.getAll);

// router.get("/multidata", [verifyAccessToken, isAdmin], control.getHD_DP_KH);
router.get("/multidata", control.getHD_DP_KH);

// router.get("/staticdv", [verifyAccessToken, isAdmin], control.staticDV);
router.get("/staticdv", control.staticDV);

// router.get("/statictong", [verifyAccessToken, isAdmin], control.staticTotal);
router.get("/statictong", control.staticTotal);

router.get("/get/:id", control.getHD);

// router.get("/admin/get/:id", [verifyAccessToken, isAdmin], control.getHD);
router.get("/admin/get/:id", control.getHD);

router.put("/update/:id", control.update);

router.put("/huydv/:id", control.huydv);

router.put("/updatett/:id", control.updatett);

module.exports = router;
