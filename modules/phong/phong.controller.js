const Phong = require("./phong.model");
const LoaiPhong = require("../loaiphong/loaiphong.model");
const asyncHandler = require("express-async-handler");
const cloudinary = require("../../configs/cloudinary.config");
const moment = require("moment");

const create = asyncHandler(async (req, res) => {
  const { IDLoaiPhong, Tang, MaPhong, SoNguoi, DienTich, GiaPhong } = req.body;

  if (!IDLoaiPhong || !Tang || !MaPhong || !SoNguoi || !DienTich || !GiaPhong)
    return res.status(400).json({
      success: false,
      mes: "Thiếu trường dữ liệu",
    });

  const loaiphong = await LoaiPhong.findById(IDLoaiPhong);

  if (!loaiphong) throw new Error("Loại phòng không tồn tại");

  const data = {
    MaPhong: MaPhong,
    LoaiPhong: IDLoaiPhong,
    Tang: Tang,
    SoNguoi: SoNguoi,
    DienTich: DienTich,
    GiaPhong: GiaPhong,
  };

  const newPhong = await Phong.create(data);
  return res.status(200).json({
    success: newPhong ? true : false,
    mes: newPhong ? newPhong : "Đã xảy ra lỗi!!!",
  });
});

const getAll = asyncHandler(async (req, res) => {
  let query = req.query || {};
  const result = await Phong.find(query);

  return res.status(200).json({
    success: result ? true : false,
    data: result ? result : "Đã xảy ra lỗi",
  });
});

const getPhong = asyncHandler(async (req, res) => {
  const { MaPhong } = req.params;
  if (!MaPhong) throw new Error("Không tìm thấy phòng!!!");
  const result = await Phong.findOne({ MaPhong: MaPhong });

  return res.status(200).json({
    success: result ? true : false,
    mes: result ? result : "Đã xảy ra lỗi",
  });
});

const getById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new Error("Không tìm thấy phòng!!!");
  const result = await Phong.findById(id);

  return res.status(200).json({
    success: result ? true : false,
    mes: result ? result : "Đã xảy ra lỗi",
  });
});

// const excludedFields = "-refreshToken -password -role -createdAt -updatedAt";
const fieldsLoaiPhong = "_id TenLoaiPhong TienNghi";
const getMultiDataPhong = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  console.log(pid);
  const multiData = await Phong.findById(pid).populate(
    "IDLoaiPhong",
    fieldsLoaiPhong
  );
  return res.status(200).json({
    success: multiData ? true : false,
    data: multiData,
  });
});

const getMultiAllData = asyncHandler(async (req, res) => {
  let query = req.query || {};
  const multiData = await Phong.find(query).populate(
    "LoaiPhong",
    fieldsLoaiPhong
  );
  return res.status(200).json({
    success: multiData ? true : false,
    data: multiData,
  });
});

const update = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { IDLoaiPhong, Tang, MaPhong, SoNguoi, DienTich, GiaPhong } = req.body;

  if (!IDLoaiPhong || !Tang || !MaPhong || !SoNguoi || !DienTich || !GiaPhong)
    return res.status(400).json({
      success: false,
      mes: "Thiếu trường dữ liệu",
    });

  const loaiphong = await LoaiPhong.findById(IDLoaiPhong);

  if (!loaiphong) throw new Error("Loại phòng không tồn tại");

  const data = {
    MaPhong: MaPhong,
    LoaiPhong: IDLoaiPhong,
    Tang: Tang,
    SoNguoi: SoNguoi,
    DienTich: DienTich,
    GiaPhong: GiaPhong,
  };

  const response = await Phong.findByIdAndUpdate(id, data, {
    new: true,
  });

  return res.status(200).json({
    success: response ? true : false,
    mes: response ? response : "Đã xảy ra lỗi",
  });
});

const remove = asyncHandler(async (req, res) => {
  const { id, images } = req.params;

  if (!id) throw new Error("Không tìm thấy phòng");

  const findPhong = await Phong.findById(id);

  if (findPhong.LichDat.length > 0) {
    return res.status(200).json({
      success: false,
      mes: "Không thể xoá vì phòng đã có lịch sử đơn đặt",
    });
  }

  if (images) {
    const arrImgId = images.split(",");
    if (arrImgId?.length > 0)
      for (let i = 1; i < arrImgId?.length; i++) {
        let item = arrImgId[i].split("TrungHotel/")[1];
        item = "TrungHotel/" + arrImgId[i]?.split(".")[0];
        if (item) {
          await cloudinary.uploader.destroy(item);
        }
      }
  }

  const result = await Phong.findByIdAndDelete(id);

  return res.status(200).json({
    success: result ? true : false,
    mes: result ? "Xoá phòng thành công" : "Đã xảy ra lỗi!!!",
  });
});

const uploadSingleImage = asyncHandler(async (req, res) => {
  // const { TenLoaiPhong } = req.params;
  const { id, image, isCre } = req.body;

  const findPhong = await Phong.findById(id);
  if (!isCre && findPhong.images.length > 0) {
    //retrieve current image ID
    let imgId = findPhong.images[0].split("TrungHotel/")[1];
    imgId = "TrungHotel/" + imgId.split(".")[0];
    if (imgId) {
      await cloudinary.uploader.destroy(imgId);
    }
    await Phong.findByIdAndUpdate(id, { $pop: { images: -1 } });
  }

  const result = await cloudinary.uploader.upload(image, {
    folder: "TrungHotel",
  });
  const phongUpdate = await Phong.findByIdAndUpdate(
    id,
    { $push: { images: result.secure_url } },
    { new: true }
  );

  return res.status(200).json({
    success: phongUpdate ? true : false,
    mes: phongUpdate ? phongUpdate : "Đã xảy ra lỗi",
  });
});

const filterPhong = (phongs) => {
  const tempRoom = [];

  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const year = today.getFullYear() + "";
  const month =
    today.getMonth() < 10
      ? "0" + (today.getMonth() + 1)
      : "" + (today.getMonth() + 1);
  const fday =
    firstDay.getDate() < 10
      ? "0" + firstDay.getDate()
      : "" + firstDay.getDate();
  const lday =
    lastDay.getDate() < 10 ? "0" + lastDay.getDate() : "" + lastDay.getDate();
  const start = `${fday}-${month}-${year}`;
  const end = `${lday}-${month}-${year}`;

  for (const item of phongs) {
    let count = 0;
    if (item.LichDat.length > 0) {
      for (const booking of item.LichDat) {
        if (
          moment(booking.NgayBatDau, "DD-MM-YYYY").isBetween(
            moment(start, "DD-MM-YYYY"),
            moment(end, "DD-MM-YYYY")
          )
        ) {
          count++;
        }
      }
    }

    if (count > 0) {
      tempRoom.push({
        label: item.MaPhong,
        value: count,
      });
    }
  }
  return tempRoom;
};

const getStaticPhong = asyncHandler(async (req, res) => {
  const response = await Phong.find({});
  const result = filterPhong(response);

  return res.status(200).json(result);
});

module.exports = {
  create,
  getAll,
  getPhong,
  getById,
  getMultiDataPhong,
  getMultiAllData,
  update,
  remove,
  uploadSingleImage,
  getStaticPhong,
};
