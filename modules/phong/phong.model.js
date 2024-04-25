const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");

const PhongSchema = new mongoose.Schema(
  {
    MaPhong: {
      type: String,
      required: true,
    },
    LoaiPhong: {
      type: mongoose.Types.ObjectId,
      ref: "LoaiPhong",
    },
    Tang: {
      type: String,
      required: true,
    },
    images: {
      type: Array,
    },
    SoNguoi: {
      type: Number,
      required: true,
    },
    DienTich: {
      type: Number,
      required: true,
    },
    GiaPhong: {
      type: Number,
      required: true,
    },
    LichDat: {
      type: Array,
    },
  },
  {
    timestamps: true,
  }
);

PhongSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Phong", PhongSchema);
