const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const mongoosePaginate = require("mongoose-paginate");

const UserSchema = new mongoose.Schema(
  {
    Email: {
      type: String,
      required: true,
      unique: true,
    },
    HoVaTen: {
      type: String,
      required: true,
    },
    Password: {
      type: String,
      required: true,
    },
    SDT: {
      type: String,
      required: true,
    },
    Role: {
      type: String,
      default: "user",
    },
    refreshToken: {
      type: String,
    },
    passwordChangedAt: {
      type: String,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: String,
    },
    registerToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("Password")) {
    next();
  }
  const salt = bcrypt.genSaltSync(10);
  this.Password = await bcrypt.hash(this.Password, salt);
});

UserSchema.methods = {
  isCorrectPassword: async function (Password) {
    return await bcrypt.compare(Password, this.Password);
  },
  createPasswordChangedToken: function () {
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    this.passwordResetExpires = Date.now() + 3 * 60 * 1000;
    return resetToken;
  },
};

UserSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("User", UserSchema);
