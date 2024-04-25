const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");

const DatPhongSchema = new mongoose.Schema(
  {
    Phong: {
      type: mongoose.Types.ObjectId,
      ref: "Phong",
    },
    ThongTinKH: {
      type: mongoose.Types.ObjectId,
      ref: "ThongTinKH",
    },
    NgayBatDau: {
      type: String,
      required: true,
    },
    NgayKetThuc: {
      type: String,
      required: true,
    },
    TongNgay: {
      type: Number,
    },
    TrangThai: {
      type: String,
      default: "Chờ xử lý",
    },
  },
  {
    timestamps: true,
  }
);

DatPhongSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("DatPhong", DatPhongSchema);
