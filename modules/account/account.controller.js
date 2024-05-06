const User = require("../user/user.model");
const errorHandler = require("../../utils/errorHandler");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../middleware/jwt");
const sendMail = require("../../utils/sendMail");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const makeToken = require("uniqid");
const asyncHandler = require('express-async-handler')


//Dangky bang email
const register = async (req, res) => {
  try {
    const { HoVaTen, Password, Email, SDT } = req.body;
    if (!HoVaTen || !Password || !Email || !SDT)
      return res.status(400).json({
        success: false,
        mes: "Vui lòng nhập đủ các trường",
      });

    const user = await User.findOne({ Email });

    if (user) throw new Error("Email đã được đăng ký bởi một tài khoản khác");
    else {
      const token = makeToken();
      res.cookie(
        "dataregister",
        { ...req.body, token },
        { httpOnly: true, maxAge: 15 * 60 * 1000 }
      );

      const html = `<p style="font-size: 16px;">Xin vui lòng click vào link dưới đây để hoàn tất quá trình đăng ký. 
    Link này sẽ hết hạn sau 15 phút kể từ bây giờ.
    <a href=${process.env.URL_SERVER}/api/user/final-register/${token}>Click here</a>
    </p>`;

      const data = {
        Email,
        html,
        subject: "Hoàn tất đăng ký tài khoản Trung Hotel",
      };

      const rs = await sendMail(data);
      return res.status(200).json({
        success: true,
        mes: "Hãy kiểm tra email để kích hoạt tài khoản",
      });
    }
  } catch (err) {
    console.error("User creation failed: " + err);
    // const { status, message } = errorHandler(err, res, req);
    errorHandler(err, res, req);
    // res.status(status).json({ message, entity: "User" });
  }
};

const finalRegister = async (req, res) => {
  try {
    const cookie = req.cookies;
    const { token } = req.params;
    if (!cookie || cookie?.dataregister?.token !== token) {
      res.clearCookie("dataregister");
      return res.redirect(`${process.env.URL_USER}/final-register/failed`);
    }
    const newUser = await User.create({
      Email: cookie?.dataregister?.Email,
      Password: cookie?.dataregister?.Password,
      HoVaTen: cookie?.dataregister?.HoVaTen,
      SDT: cookie?.dataregister?.SDT,
    });
    res.clearCookie("dataregister");
    if (newUser)
      return res.redirect(`${process.env.URL_USER}/final-register/success`);
    else return res.redirect(`${process.env.URL_USER}/final-register/failed`);
  } catch (err) {
    console.error("User creation failed: " + err);
    // const { status, message } = errorHandler(err, res, req);
    errorHandler(err, res, req);
    // res.status(status).json({ message, entity: "User" });
  }
};

//Refresh token => Cấp mới access token
// Access token => Xác thực người dùng, phân quyền
const login = async (req, res) => {
  try {
    const { Email, Password } = req.body;
    if (!Password || !Email)
      return res.status(400).json({
        success: false,
        mes: "Nhập thiếu trường dữ liệu",
      });

    const response = await User.findOne({ Email });
    if (response && (await response.isCorrectPassword(Password))) {
      const { Password, Role, refreshToken, ...userData } = response.toObject();
      const accessToken = generateAccessToken(response._id, Role);
      const newRefreshToken = generateRefreshToken(response._id);
      //Luu refresh token
      await User.findByIdAndUpdate(
        response._id,
        { refreshToken: newRefreshToken },
        { new: true }
      );
      res.cookie("refreshToken ", newRefreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: 60 * 60 * 1000,
        sameSite: "none",
      });
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        maxAge: 60 * 60 * 1000,
      })
      return res.status(200).json({
        success: true,
        userData,
      });
    } else {
      throw new Error("Thông tin tài khoản hoặc mật khẩu không chính xác");
    }
  } catch (err) {
    console.error("Đăng nhập thất bại: " + err);
    // const { status, message } = errorHandler(err, res, req);
    errorHandler(err, res, req);
    // res.status(status).json({ message, entity: "User" });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { Email, Password } = req.body;
    if (!Password || !Email)
      return res.status(400).json({
        success: false,
        mes: "Nhập thiếu trường dữ liệu",
      });

    const response = await User.findOne({ Email });
    if (response && (await response.isCorrectPassword(Password))) {
      const { Password, Role, refreshToken, ...userData } = response.toObject();
      if( Role !== 'admin') throw new Error('Vui lòng đăng nhập bằng tài khoản admin')
      const accessToken = generateAccessToken(response._id, Role);
      const newRefreshToken = generateRefreshToken(response._id);
      //Luu refresh token
      await User.findByIdAndUpdate(
        response._id,
        { refreshToken: newRefreshToken },
        { new: true }
      );
      res.cookie("refreshToken ", newRefreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: 60 * 60 * 1000,
        sameSite: "none",
      });
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        maxAge: 60 * 60 * 1000,
      })
      return res.status(200).json({
        success: true,
        userData,
      });
    } else {
      throw new Error("Thông tin tài khoản hoặc mật khẩu không chính xác");
    }
  } catch (err) {
    console.error("Đăng nhập thất bại: " + err);
    // const { status, message } = errorHandler(err, res, req);
    errorHandler(err, res, req);
    // res.status(status).json({ message, entity: "User" });
  }
};

const refreshAccessToken = async (req, res) => {
  try {
    //Lấy token từ cookies
    const cookie = req.cookies;
    //Check xem có token hay không
    if (!cookie && !cookie.refreshToken)
      throw new Error("No refresh token in cookies");
    jwt.verify(
      cookie.refreshToken,
      process.env.JWT_SECRET,
      async (err, decode) => {
        if (err) throw new Error("Invalid refresh token");
        //Check xem token có khớp với token đã lưu trong db
        const response = await User.findOne({
          _id: decode._id,
          refreshToken: cookie.refreshToken,
        });
        return res.status(200).json({
          success: response ? true : false,
          newAccessToken: response
            ? generateAccessToken(response._id, response.Role)
            : "refresh token not matched",
        });
      }
    );
  } catch (err) {
    console.error("RefreshToken thất bại: " + err);
    // const { status, message } = errorHandler(err, res, req);
    errorHandler(err, res, req);
    // res.status(status).json({ message, entity: "User" });
  }
};

const logout = async (req, res) => {
  try {
    const cookie = req.cookies;
    if (!cookie || !cookie.refreshToken)
      throw new Error("No refresh token in cookies");
    //Xóa refresh token ở db
    await User.findOneAndUpdate(
      { refreshToken: cookie.refreshToken },
      { refreshToken: "" },
      { new: true }
    );
    //Xoa refresh token o cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
    });
    return res.status(200).json({
      success: true,
      mes: "Logout is done",
    });
  } catch (err) {
    console.error("Đăng xuất thất bại: " + err);
    // const { status, message } = errorHandler(err, res, req);
    errorHandler(err, res, req);
    // res.status(status).json({ message, entity: "User" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { Email } = req.body;
    if (!Email) throw Error("Bạn chưa nhập Email!");
    const user = await User.findOne({ Email });
    if (!user) throw new Error("Không tìm thấy người dùng");
    const resetToken = user.createPasswordChangedToken();
    await user.save();

    const html = `<p style="font-size: 16px;">Xin vui lòng click vào link dưới đây để thay đổi mật khẩu của bạn. 
    Link này sẽ hết hạn sau 15 phút kể từ bây giờ.
    <a href=${process.env.URL_USER}/reset-password/${resetToken}>Click here</a>
    </p>`;

    const data = {
      Email,
      html,
      subject: "Reset your password",
    };

    const rs = await sendMail(data);
    return res.status(200).json({
      success: rs.response?.includes("OK") ? true : false,
      mes: rs.response?.includes("OK")
        ? "Vui lòng kiểm tra email của bạn!"
        : "Đã có lỗi vui lòng thử lại sau",
    });
  } catch (err) {
    console.error("ForgotPassword thất bại: " + err);
    // const { status, message } = errorHandler(err, res, req);
    errorHandler(err, res, req);
    // res.status(status).json({ message, entity: "User" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { Password, Token } = req.body;

    if (!Password) throw new Error("Bạn chưa nhập mật khẩu mới");
    if (!Token) throw new Error("Link của bạn đã hết hạn");

    const passwordResetToken = crypto
      .createHash("sha256")
      .update(Token)
      .digest("hex");
    const user = await User.findOne({
      passwordResetToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user)
      throw new Error("Link của bạn đã hết hạn. Vui lòng gửi yêu cầu mới");
    user.Password = Password;
    user.passwordResetToken = undefined;
    user.passwordChangedAt = Date.now();
    user.passwordResetExpires = undefined;
    await user.save();
    return res.status(200).json({
      success: user ? true : false,
      mes: user
        ? "Mật khẩu đã được đặt lại"
        : "Đặt lại mật khẩu không thành công",
    });
  } catch (err) {
    console.error("Resetpassword thất bại " + err);
    errorHandler(err, res, req);
  }
};

const getAccessToken = async (req, res) => {
  try {
    // const { _id } = req.User;

    // const user = await User.findById(_id).select(
    //   "-refreshToken -Password -Role"
    // );
    return res.status(200).json({
      success: true,
    });
  } catch (err) {
    console.error("Lấy user thất bại: " + err);
    // const { status, message } = errorHandler(err, res, req);
    errorHandler(err, res, req);
    // res.status(status).json({ message, entity: "User" });
  }
};

const auth = asyncHandler((req, res) => {
  return res.status(200).json({
    success: true
  })
})

module.exports = {
  register,
  finalRegister,
  login,
  loginAdmin,
  auth,
  refreshAccessToken,
  logout,
  forgotPassword,
  resetPassword,
  getAccessToken,
};
