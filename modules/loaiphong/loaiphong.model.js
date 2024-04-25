const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");

const LoaiPhongSchema = new mongoose.Schema(
  {
    TenLoaiPhong: {
      type: String,
      required: true,
      unique: true,
    },
    MoTa: {
      type: String,
    },
    TienNghi: {
      type: Array,
      required: true,
    },
    images: {
      type: Array,
    },
  },
  {
    timestamps: false,
  }
);

LoaiPhongSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("LoaiPhong", LoaiPhongSchema);
