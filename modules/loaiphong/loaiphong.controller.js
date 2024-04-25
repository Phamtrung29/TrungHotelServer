const Loaiphong = require("./loaiphong.model");
const errorHandler = require("../../utils/errorHandler");
const asyncHandler = require("express-async-handler");
const cloudinary = require("../../configs/cloudinary.config");
const phongModel = require("../phong/phong.model");

const create = asyncHandler(async (req, res) => {
  const { TenLoaiPhong } = req.body;

  if (!TenLoaiPhong) throw new Error("Thiếu trường dữ liệu");

  const item = await Loaiphong.findOne({ TenLoaiPhong });

  if (item) throw new Error("Loại phòng đã tồn tại");
  else {
    const data = req.body;

    data.TienNghi = req.body.TienNghi.split(",");

    const newLoai = await Loaiphong.create(data);
    return res.status(200).json({
      success: newLoai ? true : false,
      mes: newLoai ? newLoai : "Đã xảy ra lỗi",
    });
  }
});

const getAll = async (req, res) => {
  try {
    let query = req.query || {};
    const result = await Loaiphong.find(query);

    return res.status(200).json({
      success: result ? true : false,
      data: result,
    });
  } catch (err) {
    console.error("Loaiphong getAll failed: " + err);
    errorHandler(err, res, req);
  }
};

const getLP = asyncHandler(async (req, res) => {
  const { TenLoaiPhong } = req.params;

  if (!TenLoaiPhong) throw new Error("Thiếu trường dữ liệu");

  const result = await Loaiphong.findOne({ TenLoaiPhong });
  return res.status(200).json({
    success: result ? true : false,
    mes: result ? result : "Đã xảy ra lỗi",
  });
});

const getList = async (req, res) => {
  try {
    const { page = 1, limit = 20, sortField, sortOrder } = req.query;
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: {},
    };

    if (sortField && sortOrder) {
      options.sort = {
        [sortField]: sortOrder,
      };
    }

    const result = await Loaiphong.paginate({}, options);
    return res.status(200).json(result);
  } catch (err) {
    console.error("Loaiphong list failed: " + err);
    errorHandler(err, res, req);
  }
};

const update = asyncHandler(async (req, res) => {
  const { TenLoaiPhong } = req.body;

  if (!TenLoaiPhong) throw new Error("Không tìm thấy loại phòng!");

  const data = req.body;

  data.TienNghi = req.body.TienNghi.split(",");

  const response = await Loaiphong.findOneAndUpdate(
    { TenLoaiPhong: TenLoaiPhong },
    {
      MoTa: data.MoTa,
      TienNghi: data.TienNghi,
    },
    {
      new: true,
    }
  );

  return res.status(200).json({
    success: response ? true : false,
    mes: response ? response : "Đã xảy ra lỗi",
  });
});

const remove = asyncHandler(async (req, res) => {
  const { TenLoaiPhong } = req.params;

  const findLP = await Loaiphong.findOne({ TenLoaiPhong: TenLoaiPhong });
  //retrieve current image ID
  if (findLP.images.length > 0) {
    let imgId = findLP.images[0].split("AnhOctHotel/")[1];
    imgId = "AnhOctHotel/" + imgId.split(".")[0];
    if (imgId) {
      await cloudinary.uploader.destroy(imgId);
    }
    await Loaiphong.findOneAndUpdate(
      {
        TenLoaiPhong: TenLoaiPhong,
      },
      { $pop: { images: -1 } }
    );
  }

  const findPhong = await phongModel.findOne({ Loaiphong: findLP._id });
  if (findPhong) {
    return res.status(200).json({
      success: false,
      mes: "Không thể xoá vì loại phòng có phòng đang tham chiếu đến",
    });
  }

  const result = await Loaiphong.findOneAndDelete({
    TenLoaiPhong: TenLoaiPhong,
  });
  return res.status(200).json({
    success: result ? true : false,
    mes: result ? "Xoá loại phòng thành công" : "Đã có lỗi xảy ra",
  });
});

const uploadSingleImage = asyncHandler(async (req, res) => {
  // const { TenLoaiPhong } = req.params;
  const { TenLoaiPhong, image, isCre } = req.body;

  const findLP = await Loaiphong.findOne({ TenLoaiPhong: TenLoaiPhong });
  if (!isCre && findLP.images.length > 0) {
    //retrieve current image ID
    let imgId = findLP.images[0].split("AnhOctHotel/")[1];
    imgId = "AnhOctHotel/" + imgId.split(".")[0];
    if (imgId) {
      await cloudinary.uploader.destroy(imgId);
    }
    await Loaiphong.findOneAndUpdate(
      {
        TenLoaiPhong: TenLoaiPhong,
      },
      { $pop: { images: -1 } }
    );
  }

  const result = await cloudinary.uploader.upload(image, {
    folder: "AnhOctHotel",
  });
  const phongUpdate = await Loaiphong.findOneAndUpdate(
    { TenLoaiPhong: TenLoaiPhong },
    { $push: { images: result.secure_url } },
    { new: true }
  );

  return res.status(200).json({
    success: phongUpdate ? true : false,
    mes: phongUpdate ? phongUpdate : "Đã xảy ra lỗi",
  });
});

// const uploadMultiImage = asyncHandler(async (req, res) => {
//   const { image } = req.body;
//   const result = await cloudinary.uploader.upload(image, {
//     folder: "AnhOctHotel",
//   });
//   return res.status(200).json({
//     success: result ? true : false,
//     mes: result ? result : "Đã xảy ra lỗi",
//   });
// });

module.exports = {
  create,
  getAll,
  getLP,
  getList,
  update,
  remove,
  uploadSingleImage,
  // uploadMultiImage,
};
