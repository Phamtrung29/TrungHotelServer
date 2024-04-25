const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");

const HoaDonSchema = new mongoose.Schema(
  {
    DatPhong: {
      type: mongoose.Types.ObjectId,
      ref: "DatPhong",
    },
    ThongTinKH: {
      type: mongoose.Types.ObjectId,
      ref: "ThongTinKH",
    },
    DichVu: {
      type: Array,
    },
    GiaoDich: {
      type: Array,
    },
    TongTien: {
      type: Number,
    },
    TrangThai: {
      type: String,
      default: "Chưa thanh toán",
    },
  },
  {
    timestamps: true,
  }
);

HoaDonSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("HoaDon", HoaDonSchema);
