const HoaDon = require("./hoadon.model");
const DatPhong = require("../datphong/datphong.model");
const Phong = require("../phong/phong.model");
const errorHandler = require("../../utils/errorHandler");
const asyncHandler = require("express-async-handler");

const create = asyncHandler(async (req, res) => {
  const { IDDatPhong, IDKH } = req.body;

  if (!IDDatPhong || !IDKH) throw new Error("Thiếu trường dữ liệu");

  const item = await HoaDon.findOne({ DatPhong: IDDatPhong, ThongTinKH: IDKH });

  if (item) throw new Error("Hoá đơn đã tồn tại");
  else {
    const newLoai = await HoaDon.create(req.body);
    return res.status(200).json({
      success: newLoai ? true : false,
      mes: newLoai ? newLoai : "Đã xảy ra lỗi",
    });
  }
});

const getAll = async (req, res) => {
  try {
    let query = req.query || {};
    const result = await HoaDon.find(query);

    return res.status(200).json({
      success: result ? true : false,
      data: result,
    });
  } catch (err) {
    console.error("HoaDon getAll failed: " + err);
    errorHandler(err, res, req);
  }
};

const getHD_DP_KH = asyncHandler(async (req, res) => {
  let query = req.query || {};
  const multiData = await HoaDon.find(query)
    .populate("DatPhong", "NgayBatDau NgayKetThuc")
    .populate("ThongTinKH", "TenKH SDT Email");
  return res.status(200).json({
    success: multiData ? true : false,
    data: multiData ? multiData : "Đã xảy ra lỗi",
  });
});

const getHD = asyncHandler(async (req, res) => {
  const { TenLoaiPhong } = req.params;

  if (!TenLoaiPhong) throw new Error("Thiếu trường dữ liệu");

  const result = await HoaDon.findOne({ TenLoaiPhong });
  return res.status(200).json({
    success: result ? true : false,
    mes: result ? result : "Đã xảy ra lỗi",
  });
});

const getCurrentDay = () => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const year = today.getFullYear() + "";
  const month =
    today.getMonth() < 10
      ? "0" + (today.getMonth() + 1)
      : "" + (today.getMonth() + 1);
  const day =
    today.getDate() < 10 ? "0" + today.getDate() : "" + today.getDate();
  const fday =
    firstDay.getDate() < 10
      ? "0" + firstDay.getDate()
      : "" + firstDay.getDate();
  const lday =
    lastDay.getDate() < 10 ? "0" + lastDay.getDate() : "" + lastDay.getDate();
  return {
    day: day,
    month: month,
    year: year,
    firstDay: fday,
    lastDay: lday,
  };
};

const getMonthAgo = () => {
  const today = new Date();
  const firstDay = new Date(
    today.getMonth() > 0 ? today.getFullYear() : today.getFullYear() - 1,
    today.getMonth() > 0 ? today.getMonth() - 1 : 11,
    1
  );
  const lastDay = new Date(
    today.getMonth() > 0 ? today.getFullYear() : today.getFullYear() - 1,
    today.getMonth() > 0 ? today.getMonth() : 12,
    0
  );

  const year = firstDay.getFullYear() + "";
  const month =
    firstDay.getMonth() < 10
      ? "0" + (firstDay.getMonth() + 1)
      : "" + (firstDay.getMonth() + 1);
  const fday =
    firstDay.getDate() < 10
      ? "0" + firstDay.getDate()
      : "" + firstDay.getDate();
  const lday =
    lastDay.getDate() < 10 ? "0" + lastDay.getDate() : "" + lastDay.getDate();
  return {
    month: month,
    year: year,
    firstDay: fday,
    lastDay: lday,
  };
};

const getMonth2Ago = () => {
  const today = new Date();
  const firstDay = new Date(
    today.getMonth() > 1 ? today.getFullYear() : today.getFullYear() - 1,
    today.getMonth() > 1
      ? today.getMonth() - 2
      : today.getMonth() === 1
      ? 11
      : 10,
    1
  );
  const lastDay = new Date(
    today.getMonth() > 1 ? today.getFullYear() : today.getFullYear() - 1,
    today.getMonth() > 1
      ? today.getMonth() - 1
      : today.getMonth() === 1
      ? 12
      : 11,
    0
  );

  const year = firstDay.getFullYear() + "";
  const month =
    firstDay.getMonth() < 10
      ? "0" + (firstDay.getMonth() + 1)
      : "" + (firstDay.getMonth() + 1);
  const fday =
    firstDay.getDate() < 10
      ? "0" + firstDay.getDate()
      : "" + firstDay.getDate();
  const lday =
    lastDay.getDate() < 10 ? "0" + lastDay.getDate() : "" + lastDay.getDate();
  return {
    month: month,
    year: year,
    firstDay: fday,
    lastDay: lday,
  };
};

const filterDV = (hoadons) => {
  const tempHD = [];

  for (const element of hoadons) {
    if (element.DichVu.length > 0) {
      for (const item of element.DichVu) {
        let count = 0;
        if (tempHD.length > 0) {
          for (let i in tempHD) {
            if (tempHD[i].label === item.TenDichVu) {
              count++;
              tempHD[i].value = parseFloat(tempHD[i].value) + 1;
            }

            if (count === 0 && parseFloat(i) === tempHD.length - 1) {
              tempHD.push({
                label: item.TenDichVu,
                value: 1,
              });
            }
          }
        } else {
          tempHD.push({
            label: item.TenDichVu,
            value: 1,
          });
        }
      }
    }
  }
  return tempHD;
};

const staticDV = asyncHandler(async (req, res) => {
  const regexMonth = new RegExp(`-${getCurrentDay().month}-`);
  const response = await HoaDon.find({}).populate(
    "DatPhong",
    "NgayBatDau NgayKetThuc",
    {
      NgayBatDau: {
        $regex: regexMonth,
      },
      NgayKetThuc: {
        $regex: regexMonth,
      },
    }
  );

  const filterHD = [];
  for (let i in response) {
    if (response[i].DatPhong === null) continue;
    filterHD.push(response[i]);
  }
  const result = filterDV(filterHD);

  return res.status(200).json(result);
});

const staticTotal = asyncHandler(async (req, res) => {
  const current = getCurrentDay();
  const ago = getMonthAgo();
  const _2ago = getMonth2Ago();
  const TotalThang = await HoaDon.aggregate([
    {
      $match: {
        TrangThai: {
          $eq: "Đã thanh toán",
        },
        createdAt: {
          $gte: new Date(
            `${current.year}-${current.month}-${current.firstDay}T00:00:01.983+00:00`
          ),
          $lt: new Date(
            `${current.year}-${current.month}-${current.lastDay}T23:59:59.983+00:00`
          ),
        },
      },
    },
    {
      $group: {
        _id: null,
        total_tongtien: { $sum: "$TongTien" },
      },
    },
  ]);
  const TotalAgo = await HoaDon.aggregate([
    {
      $match: {
        TrangThai: {
          $eq: "Đã thanh toán",
        },
        createdAt: {
          $gte: new Date(
            `${ago.year}-${ago.month}-${ago.firstDay}T00:00:01.983+00:00`
          ),
          $lt: new Date(
            `${ago.year}-${ago.month}-${ago.lastDay}T23:59:59.983+00:00`
          ),
        },
      },
    },
    {
      $group: {
        _id: null,
        total_tongtien: { $sum: "$TongTien" },
      },
    },
  ]);
  const Total2Ago = await HoaDon.aggregate([
    {
      $match: {
        TrangThai: {
          $eq: "Đã thanh toán",
        },
        createdAt: {
          $gte: new Date(
            `${_2ago.year}-${_2ago.month}-${_2ago.firstDay}T00:00:01.983+00:00`
          ),
          $lt: new Date(
            `${_2ago.year}-${_2ago.month}-${_2ago.lastDay}T23:59:59.983+00:00`
          ),
        },
      },
    },
    {
      $group: {
        _id: null,
        total_tongtien: { $sum: "$TongTien" },
      },
    },
  ]);

  const result = [];
  result.push({
    label: `Tháng ${current.month}`,
    value: TotalThang[0].total_tongtien,
  });
  result.push({
    label: `Tháng ${ago.month}`,
    value: TotalAgo[0].total_tongtien,
  });
  result.push({
    label: `Tháng ${_2ago.month}`,
    value: Total2Ago[0].total_tongtien,
  });

  return res.status(200).json(result);
});

const update = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const request = req.body;

  if (!id) throw new Error("Không tìm thấy hóa đơn!");

  if (request.length === 0) throw new Error("Chưa có dịch vụ nào được thêm!!!");

  const response = await HoaDon.findById(id);

  const dvHoaDon = response.DichVu;

  const dpHoaDon = await DatPhong.findById(response.DatPhong).populate(
    "Phong",
    "GiaPhong"
  );

  request.forEach((element) => {
    let count = 0;
    if (dvHoaDon.length > 0)
      for (let i in dvHoaDon) {
        if (dvHoaDon[i].MaDichVu === element.MaDichVu) {
          count++;
          dvHoaDon[i].SoLuong += element.SoLuong;
        }

        if (count === 0 && parseFloat(i) === dvHoaDon.length - 1) {
          dvHoaDon.push(element);
        }
      }
    else {
      dvHoaDon.push(element);
    }
  });

  const tongTien = dvHoaDon.reduce((preVal, current) => {
    preVal += current.SoLuong * current.GiaDichVu;
    return preVal;
  }, dpHoaDon?.TongNgay * dpHoaDon?.Phong?.GiaPhong);

  response.DichVu = dvHoaDon;
  response.TongTien = tongTien;
  response.markModified("DichVu");
  response.markModified("TongTien");
  await response.save();

  return res.status(200).json({
    success: response ? true : false,
    // request: request,
    mes: response ? response : "Đã xảy ra lỗi",
    // hd: dvHoaDon,
  });
});

const huydv = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const request = req.body;

  if (!id) throw new Error("Không tìm thấy hóa đơn!");

  if (request.length === 0) throw new Error("Chưa có dịch vụ nào được thêm!!!");

  const response = await HoaDon.findById(id);

  const dvHoaDon = response.DichVu;

  const dpHoaDon = await DatPhong.findById(response.DatPhong).populate(
    "Phong",
    "GiaPhong"
  );

  request.forEach((element) => {
    if (dvHoaDon.length > 0)
      for (let i in dvHoaDon) {
        if (dvHoaDon[i].MaDichVu === element.MaDichVu) {
          if (dvHoaDon[i].SoLuong > element.SoLuong)
            dvHoaDon[i].SoLuong = dvHoaDon[i].SoLuong - element.SoLuong;
          else {
            dvHoaDon.splice(i, 1);
          }
        }
      }
  });

  const tongTien = dvHoaDon.reduce((preVal, current) => {
    preVal += current.SoLuong * current.GiaDichVu;
    return preVal;
  }, dpHoaDon?.TongNgay * dpHoaDon?.Phong?.GiaPhong);

  response.DichVu = dvHoaDon;
  response.TongTien = tongTien;
  response.markModified("DichVu");
  response.markModified("TongTien");
  await response.save();

  return res.status(200).json({
    success: response ? true : false,
    // request: tongTien,
    mes: response ? response : "Đã xảy ra lỗi",
    // hd: dvHoaDon,
  });
});

const updatett = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) throw new Error("Không tìm thấy hoá đơn");

  const hoadon = await HoaDon.findByIdAndUpdate(
    id,
    {
      TrangThai: "Đã thanh toán",
    },
    { new: true }
  );

  const datphong = await DatPhong.findByIdAndUpdate(
    hoadon.DatPhong,
    {
      TrangThai: "Đã thanh toán",
    },
    { new: true }
  );

  const phong = await Phong.findById(datphong.Phong);

  phong?.LichDat.forEach((element) => {
    if (element.DatPhong.toString() === datphong.Phong.toString()) {
      element.TrangThai = "Đã thanh toán";
    }
  });
  await phong.save();

  return res.status(200).json({
    success: phong ? true : false,
    mes: phong ? phong : "Thất bại",
  });
});

const remove = async (req, res) => {
  try {
    const { TenLoaiPhong } = req.params;

    const findLP = await HoaDon.findOne({ TenLoaiPhong: TenLoaiPhong });
    //retrieve current image ID
    let imgId = findLP.images[0].split("TrungHotel")[1];
    imgId = "TrungHotel/" + imgId.split(".")[0];
    if (imgId) {
      await cloudinary.uploader.destroy(imgId);
    }
    await HoaDon.findOneAndUpdate(
      {
        TenLoaiPhong: TenLoaiPhong,
      },
      { $pop: { images: -1 } }
    );

    const result = await HoaDon.findOneAndDelete({
      TenLoaiPhong: TenLoaiPhong,
    });
    return res.status(200).json({
      success: result ? true : false,
      mes: result ? "Xoá loại phòng thành công" : "Đã có lỗi xảy ra",
    });
  } catch (err) {
    console.error("HoaDon delete failed: " + err);
    errorHandler(err, res, req);
  }
};

module.exports = {
  create,
  getAll,
  getHD_DP_KH,
  getHD,
  staticDV,
  staticTotal,
  update,
  huydv,
  updatett,
  remove,
};
