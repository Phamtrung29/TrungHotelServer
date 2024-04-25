const express = require("express");
const control = require("./loaiphong.controller");
const router = express.Router();
const { verifyAccessToken, isAdmin } = require("../../middleware/verifyToken");

// router.post("/add", [verifyAccessToken, isAdmin], control.create);
router.post("/add", control.create);

router.get("/", control.getAll);

// router.get("/all", [verifyAccessToken, isAdmin], control.getAll);
router.get("/all", control.getAll);

router.get("/list", control.getList);

router.get("/get/:TenLoaiPhong", control.getLP);

// router.put("/update/:TenLoaiPhong",[verifyAccessToken, isAdmin],control.update);
router.put("/update/:TenLoaiPhong", control.update);

// router.delete( "/delete/:TenLoaiPhong", [verifyAccessToken, isAdmin], control.remove );
router.delete("/delete/:TenLoaiPhong", control.remove);

router.post("/uploadimage", control.uploadSingleImage);

module.exports = router;
