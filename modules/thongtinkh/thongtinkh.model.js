const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");

const ThongTinKHSchema = new mongoose.Schema(
  {
    Email: {
      type: String,
      required: true,
    },
    TenKH: {
      type: String,
      required: true,
    },
    SDT: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

ThongTinKHSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("ThongTinKH", ThongTinKHSchema);
