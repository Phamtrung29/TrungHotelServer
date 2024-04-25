const DichVu = require("./dichvu.model");
const errorHandler = require("../../utils/errorHandler");
const asyncHandler = require("express-async-handler");

const create = asyncHandler(async (req, res) => {
  const { MaDichVu, TenDichVu, GiaDichVu } = req.body;

  if (!MaDichVu || !TenDichVu || !GiaDichVu)
    throw new Error("Thiếu trường dữ liệu!");

  if(parseFloat(GiaDichVu) != GiaDichVu)
  throw new Error("Giá dịch vụ phải là số nguyên")

  const newDichVu = await DichVu.create({
    MaDichVu: MaDichVu,
    TenDichVu: TenDichVu,
    GiaDichVu: parseFloat(GiaDichVu),
  });

  return res.status(200).json({
    success: newDichVu ? true : false,
    mes: newDichVu ? newDichVu : "Đã xảy ra lỗi!!!",
  });
});

const getAll = asyncHandler(async (req, res) => {
  let query = req.query || {};
  const result = await DichVu.find(query);

  return res.status(200).json({
    success: result ? true : false,
    data: result ? result : "Đã xảy ra lỗi",
  });
});

const getOne = asyncHandler(async (req, res) => {
  const { MaDichVu } = req.params;
  if(!MaDichVu) throw new Error("Mã dịch vụ bị thiếu!!!!")
    const result = await DichVu.findOne({MaDichVu: MaDichVu});

    return res.status(200).json({
      success: result ? true : false,
      data: result ? result : "Đã xảy ra lỗi!!!"
    });
});

const update = asyncHandler(async (req, res) => {
  const { MaDichVu } = req.params;
  if(!MaDichVu) throw new Error("Mã dịch vụ bị thiếu!!!!")
  const data = req.body;
  data.GiaDichVu = parseFloat(req.body.GiaDichVu)
  const result = await DichVu.findOneAndUpdate({MaDichVu: MaDichVu}, data, {
    new: true,
  });

  return res.status(200).json({
    success: result ? true : false,
    data: result ? result : "Đã xảy ra lỗi"
  });
});

const remove = asyncHandler (async (req, res) => {
  const { MaDichVu } = req.params;
  if(!MaDichVu) throw new Error("Mã dịch vụ bị thiếu!!!!")

  const delDV = await DichVu.findOneAndDelete({MaDichVu: MaDichVu})

  return res.status(200).json({
    success: delDV ? true : false,
    mes: delDV ? "Xóa dịch vụ thành công" : "Đã xảy ra lỗi"
  })
});

module.exports = {
  create,
  getAll,
  getOne,
  update,
  remove,
};
