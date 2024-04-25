const express = require("express");
const {
  getAll,
  getUser,
  remove,
  register,
  login,
  getAccessToken,
  refreshAccessToken,
  logout,
  resetPassword,
  forgotPassword,
  finalRegister,
  removeList,
  create,
  update,
} = require("./user.controller");

const {
  verifyAccessToken,
  verifyRefreshToken,
  isAdmin,
} = require("../../middleware/verifyToken");

const router = express.Router();

router.get("/", [verifyAccessToken, isAdmin], getAll);
// router.get("/", getAll);

router.get("/get/:Email", getUser);

router.post("/create", [verifyAccessToken, isAdmin], create);
// router.post("/create", create);

// router.post("/register", register);

router.get("/final-register/:token", finalRegister);

// router.post("/login", login);

// router.post("/loginAdmin", [verifyAccessToken, isAdmin], login);

// router.post("/login", [isAdmin], login);

// router.get("/accesstoken", verifyAccessToken, getAccessToken);

// router.post("/refreshtoken", verifyRefreshToken, refreshAccessToken);

// router.get("/logout", logout);

// router.post("/forgotpassword", forgotPassword);

// router.put("/resetpassword", resetPassword);

// router.delete("/delete/:id", [verifyAccessToken, isAdmin], remove);

router.delete("/delete/:Email", [verifyAccessToken, isAdmin], remove);
// router.delete("/delete/:Email", remove);

// router.get("/delete/list", [verifyAccessToken, isAdmin], removeList);
router.get("/delete/list", removeList);

// router.put("/update/:Email", [verifyAccessToken, isAdmin], update);
router.put("/update/:Email", update);

module.exports = router;
