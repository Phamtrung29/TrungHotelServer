const express = require("express");
const control = require("./phong.controller");
const router = express.Router();

const { isAdmin, verifyAccessToken } = require("../../middleware/verifyToken");

// router.post("/add", [verifyAccessToken, isAdmin], control.create);
router.post("/add", control.create);

router.get("/", control.getAll);

// router.get( "/multi/:pid", [verifyAccessToken, isAdmin], control.getMultiDataPhong );
router.get("/multi/:pid", control.getMultiDataPhong);

router.get("/multiphong", control.getMultiAllData);

// router.get("/get/:id", [verifyAccessToken, isAdmin], control.getById);
router.get("/get/:id", control.getById);

router.get("/maphong/:MaPhong", control.getPhong);

// router.get("/static", [verifyAccessToken, isAdmin], control.getStaticPhong);
router.get("/static", control.getStaticPhong);

// router.put("/update/:id", [verifyAccessToken, isAdmin], control.update);
router.put("/update/:id", control.update);

// router.delete("/delete/:id", [verifyAccessToken, isAdmin], control.remove);
router.delete("/delete/:id", control.remove);

router.post("/uploadimage", control.uploadSingleImage);

module.exports = router;
