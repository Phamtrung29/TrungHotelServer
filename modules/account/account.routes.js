const express = require("express");
const control = require("./account.controller");

const {
  verifyAccessToken,
  verifyRefreshToken,
  isAdmin,
} = require("../../middleware/verifyToken");

const router = express.Router();

router.post("/register", control.register);

router.get("/final-register/:token", control.finalRegister);

router.post("/login", control.login);

// router.post("/loginAdmin", [verifyAccessToken, isAdmin], control.loginAdmin);
router.post("/loginAdmin", control.loginAdmin);

router.get("/auth", [verifyAccessToken, isAdmin], control.auth);
// router.get("/auth", control.auth);

router.get("/accesstoken", verifyAccessToken, control.getAccessToken);

router.post("/refreshtoken", verifyRefreshToken, control.refreshAccessToken);

router.get("/logout", control.logout);

router.post("/forgotpassword", control.forgotPassword);

router.put("/resetpassword", control.resetPassword);

module.exports = router;
