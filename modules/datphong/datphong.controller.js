const Datphong = require("./datphong.model");
const PhongMD = require("../phong/phong.model");
const HoaDon = require("../hoadon/hoadon.model");
const ThongTinKH = require("../thongtinkh/thongtinkh.model");
const errorHandler = require("../../utils/errorHandler");
const asyncHandler = require("express-async-handler");
const moment = require("moment");
const stripe = require("stripe")(
  "sk_test_51N9Nf4CcdPVMLpZJ6pe5UNmwcPnyCUXCakjwNuLEeP6tZkHGWc6K8Rb8CRKUSiMC56BRDCOrjQzQuPwEPHEcylbK00bb14mNbU"
);
const { v4: uuidv4 } = require("uuid");
const sendMail = require("../../utils/sendMail");

const vnd = 23000;

const formatMoney = (tien) => {
  let moneyFormat = "";
  const arrMoney = [];
  while (tien > 0) {
    if (tien % 1000 === 0) {
      arrMoney.push(tien % 1000);
      tien = tien / 1000;
    } else {
      arrMoney.push(tien % 1000);
      tien = Math.floor(tien / 1000);
    }
  }

  for (let i = arrMoney.length - 1; i >= 0; i--) {
    if (i === arrMoney.length - 1) {
      moneyFormat += arrMoney[i] + ".";
      continue;
    }

    if (arrMoney[i] > 99) {
      moneyFormat += arrMoney[i];
    }
    if (9 < arrMoney[i] && arrMoney[i] < 100) {
      moneyFormat += arrMoney[i] + "0";
    }
    if (arrMoney[i] < 10) {
      moneyFormat += arrMoney[i] + "00";
    }

    if (i > 0) {
      moneyFormat += ".";
    }
  }
  return moneyFormat;
};

const create = asyncHandler(async (req, res) => {
  const { Phong, NgayBatDau, NgayKetThuc, TongNgay, TenKH, SDT, Email } =
    req.body;
  if (!Phong || !NgayBatDau || !NgayKetThuc || !TenKH || !SDT || !Email)
    throw new Error("Thiếu dữ liệu đầu vào!!!");

  const findPhong = await PhongMD.findById(Phong);

  const findKH = await ThongTinKH.findOne({
    Email: Email,
    TenKH: TenKH,
    SDT: SDT,
  });
  if (!findPhong) throw new Error("Không tìm thấy phòng đã chọn");
  else {
    let KH;
    if (!findKH) {
      const newKH = new ThongTinKH({
        Email: Email,
        TenKH: TenKH,
        SDT: SDT,
      });
      KH = await newKH.save();
    } else {
      KH = findKH;
    }

    const newBook = new Datphong({
      Phong: Phong,
      ThongTinKH: KH._id,
      NgayBatDau: moment(NgayBatDau, "DD-MM-YYYY").format("DD-MM-YYYY"),
      NgayKetThuc: moment(NgayKetThuc, "DD-MM-YYYY").format("DD-MM-YYYY"),
      TongNgay: TongNgay,
      TrangThai: "Đã đặt",
    });

    const booking = await newBook.save();

    const roomtemp = await PhongMD.findOne({ _id: Phong });

    roomtemp.LichDat.push({
      DatPhong: booking._id,
      NgayBatDau: moment(NgayBatDau, "DD-MM-YYYY").format("DD-MM-YYYY"),
      NgayKetThuc: moment(NgayKetThuc, "DD-MM-YYYY").format("DD-MM-YYYY"),
      KhachHang: KH._id,
      TrangThai: booking.TrangThai,
    });
    await roomtemp.save();

    await HoaDon.create({
      DatPhong: booking._id,
      ThongTinKH: KH._id,
      TongTien: TongNgay * roomtemp.GiaPhong,
      TrangThai: "Đã đặt cọc",
    });

    return res.status(200).json({
      success: newBook ? true : false,
      mes: newBook ? "Tạo đơn đặt phòng thành công" : "Đã xảy ra lỗi!!!",
    });
  }
});

const autoCreate = asyncHandler(async (req, res) => {
  const {
    Phong,
    NgayBatDau,
    NgayKetThuc,
    TongNgay,
    MaPhong,
    DaThanhToan,
    TenKH,
    SDT,
    Email,
    token,
  } = req.body;

  const customer = await stripe.customers.create({
    email: token.email,
    source: token.id,
  });

  const payment = await stripe.charges.create(
    {
      amount: DaThanhToan * vnd,
      customer: customer.id,
      currency: "vnd",
      receipt_email: token.email,
    },
    {
      idempotencyKey: uuidv4(),
    }
  );

  if (payment) {
    if (!Phong || !NgayBatDau || !NgayKetThuc || !TenKH || !SDT || !Email)
      throw new Error("Thiếu dữ liệu đầu vào!!!");

    const findPhong = await PhongMD.findById(Phong);

    const findKH = await ThongTinKH.findOne({
      Email: Email,
      TenKH: TenKH,
      SDT: SDT,
    });
    if (!findPhong) throw new Error("Không tìm thấy phòng đã chọn");
    else {
      let KH;
      if (!findKH) {
        const newKH = new ThongTinKH({
          Email: Email,
          TenKH: TenKH,
          SDT: SDT,
        });
        KH = await newKH.save();
      } else {
        KH = findKH;
      }

      const newBook = new Datphong({
        Phong: Phong,
        ThongTinKH: KH._id,
        NgayBatDau: moment(NgayBatDau, "DD-MM-YYYY").format("DD-MM-YYYY"),
        NgayKetThuc: moment(NgayKetThuc, "DD-MM-YYYY").format("DD-MM-YYYY"),
        TongNgay: TongNgay,
        TrangThai: "Đã đặt",
      });

      const booking = await newBook.save();

      await HoaDon.create({
        DatPhong: booking._id,
        ThongTinKH: KH._id,
        GiaoDich: {
          MaGD: payment.id,
          DaThanhToan: DaThanhToan,
          NgayThanhToan: moment().format("hh:mm:ss A DD-MM-YYYY"),
        },
        TongTien: (DaThanhToan * 10) / 3,
        TrangThai: "Đã đặt cọc",
      });

      const roomtemp = await PhongMD.findOne({ _id: Phong });

      roomtemp.LichDat.push({
        DatPhong: booking._id,
        NgayBatDau: moment(NgayBatDau, "DD-MM-YYYY").format("DD-MM-YYYY"),
        NgayKetThuc: moment(NgayKetThuc, "DD-MM-YYYY").format("DD-MM-YYYY"),
        KhachHang: KH._id,
        TrangThai: booking.TrangThai,
      });
      await roomtemp.save();

      const html = `<p style="font-size: 16px;">
        Kính chào quý khách hàng ${TenKH},<br/>
      Cảm ơn quý khách hàng đã đặt phòng tại khách sạn chúng tôi – Trung Luxury Hotel.<br/>
      Chúng tôi xác nhận rằng quý đã đặt 1 phòng với số phòng <b> ${MaPhong} </b> từ ngày <b> ${NgayBatDau} </b> đến <b> ${NgayKetThuc} </b>
      và quý khách đã thanh toán <b> ${formatMoney(
        DaThanhToan * vnd
      )} đ </b> tương ứng với 30% số tiền đặt cọc. Email này là xác thực của quý khách khi check-in.<br/>
      Nếu có bất cứ thắc mắc gì vui lòng liên hệ với chúng tôi qua số máy: +84988888888.<br/>
      Chúng tôi mong đợi được đón tiếp quý khách.<br/>
        Trân trọng.<br/>
        <i> Trung Luxury Hotel </i>
  </p>`;

      const data = {
        Email,
        html,
        subject: "Xác nhận đặt phòng - Trung Luxury Hotel",
      };

      const rs = await sendMail(data);
      return res.status(200).json({
        success: newBook ? true : false,
        mes: newBook ? booking : "Đã xảy ra lỗi!!!",
      });
    }
  }
});

const getAll = asyncHandler(async (req, res) => {
  let query = req.query || {};
  const result = await Datphong.find(query);

  return res.status(200).json({
    success: result ? true : false,
    data: result ? result : "Đã xảy ra lỗi",
  });
});

const getMultiAllData = asyncHandler(async (req, res) => {
  let query = req.query || {};
  const multiData = await Datphong.find(query)
    .populate("Phong", "MaPhong _id")
    .populate("ThongTinKH", "TenKH SDT Email");
  return res.status(200).json({
    success: multiData ? true : false,
    data: multiData,
  });
});

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Datphong.findById(id).populate(
      "ThongTinKH",
      "TenKH SDT Email"
    );

    return res.status(200).json(result);
  } catch (err) {
    console.error("Datphong getById failed: " + err);
    const { status, message } = errorHandler(err);
    res.status(status).json({ message, entity: "Datphong" });
  }
};

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

    const result = await Datphong.paginate({}, options);
    return res.status(200).json(result);
  } catch (err) {
    console.error("Datphong list failed: " + err);
    const { status, message } = errorHandler(err);
    res.status(status).json({ message, entity: "Datphong" });
  }
};

const get7last = () => {
  const today = new Date();
  const last7day = [];
  for (let i = 0; i < 7; i++) {
    last7day.push(
      `${
        today.getDate() - i < 10
          ? "0" + (today.getDate() - i)
          : today.getDate() - i
      }-${
        today.getMonth() + 1 < 10
          ? "0" + (today.getMonth() + 1)
          : today.getMonth() + 1
      }-${today.getFullYear()}`
    );
  }
  return last7day;
};

const getStaticDashboard = asyncHandler(async (req, res) => {
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

  const regexMonth = new RegExp(`-${month}-`);
  // console.log(month);
  const DonDatThang = await Datphong.count({
    NgayBatDau: {
      $regex: regexMonth,
    },
    NgayKetThuc: {
      $regex: regexMonth,
    },
  });

  const gteThang = `${year}-${month}-${fday}`;
  const ltThang = `${year}-${month}-${lday}`;
  const KHThang = await ThongTinKH.count({
    createdAt: {
      $gte: new moment(gteThang),
      $lt: new moment(ltThang),
    },
  });

  const ToTal = await HoaDon.aggregate([
    {
      $match: {
        TrangThai: {
          $eq: "Đã thanh toán",
        },
      },
    },
    {
      $group: {
        _id: null,
        tongtien: { $sum: "$TongTien" },
      },
    },
  ]);

  const orderline = await Datphong.find({})
    .populate("Phong", "MaPhong")
    .populate("ThongTinKH", "TenKH");

  const TotalThang = await HoaDon.aggregate([
    {
      $match: {
        TrangThai: {
          $eq: "Đã thanh toán",
        },
        createdAt: {
          $gte: new Date(`${year}-${month}-${day}T00:00:01.983+00:00`),
          $lt: new Date(`${year}-${month}-${day}T23:59:59.983+00:00`),
        },
      },
    },
    {
      $group: {
        _id: null,
        tongtien_thang: { $sum: "$TongTien" },
      },
    },
  ]);

  const chartLabel = [];
  const chartValue = [];
  const day7 = get7last();

  day7.forEach((day) => {
    let count = 0;
    orderline.forEach((element) => {
      if (element.NgayBatDau.includes(day)) {
        count++;
      }
    });
    chartLabel.push(day);
    chartValue.push(count);
  });

  return res.status(200).json({
    donthang: DonDatThang,
    khthang: KHThang,
    total: ToTal.length > 0 ? ToTal[0]?.tongtien : 0,
    totalthang: TotalThang.length > 0 ? TotalThang[0]?.tongtien_thang : 0,
    orderline: orderline.slice(-5),
    chartLabel: chartLabel,
    chartValue: chartValue,
  });
});

const cancelBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new Error("Đơn đặt đã không còn tồn tại");

  // const datphong = await DatPhong.findByIdAndUpdate(id, {
  //   TrangThai: "Đã hủy"
  // }, {
  //   new: true
  // })
  const datphong = await Datphong.findByIdAndUpdate(
    id,
    {
      TrangThai: "Đã hủy",
    },
    {
      new: true,
    }
  );
  const hoadon = await HoaDon.findOne({ DatPhong: datphong._id });
  (hoadon.TrangThai = "Đã hủy"), hoadon.save();

  const phong = await PhongMD.findById(datphong.Phong);

  const temp = phong?.LichDat.filter((item) => {
    if (item.DatPhong.toString() !== datphong._id.toString()) return item;
  });

  phong.LichDat = temp;
  phong.save();

  return res.status(200).json({
    success: phong && hoadon && datphong ? true : false,
    mes:
      phong && hoadon && datphong
        ? "Huỷ đặt phòng thành công"
        : "Đã có lỗi xảy ra",
  });
});

const update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { Phong, TenKH, SDT, Email, NgayBatDau, NgayKetThuc } = req.body;
  if (!Phong || !TenKH || !SDT || !Email)
    throw new Error("Thiếu trường dữ liệu");

  const findDP = await Datphong.findById(id);

  if (!findDP) throw new Error("Không tìm thấy phòng");

  const findHD = await HoaDon.findOne({
    DatPhong: findDP._id,
    ThongTinKH: findDP.ThongTinKH,
  });

  const PhongTruoc = await PhongMD.findById(findDP.Phong);

  let tienDV = findHD.TongTien - findDP.TongNgay * PhongTruoc.GiaPhong;

  let change = 0;

  if (findDP.Phong !== Phong) {
    change++;
    findDP.Phong = Phong;
    findDP.markModified("Phong");
  }
  if (findDP.NgayBatDau !== NgayBatDau) {
    change++;
    findDP.NgayBatDau = NgayBatDau;
    findDP.markModified("NgayBatDau");
  }
  if (findDP.NgayKetThuc !== NgayKetThuc) {
    change++;
    findDP.NgayKetThuc = NgayKetThuc;
    findDP.markModified("NgayKetThuc");
  }

  const PhongSau = await PhongMD.findById(findDP.Phong);

  let TongTien = 0;
  let TongNgay = 0;

  if (change > 0) {
    TongNgay = moment(findDP.NgayKetThuc, "DD-MM-YYYY").diff(
      moment(findDP.NgayBatDau, "DD-MM-YYYY"),
      "days"
    );
    TongTien = tienDV + TongNgay * PhongSau.GiaPhong;
    findHD.TongTien = TongTien;
    findDP.TongNgay = TongNgay;
    findHD.markModified("TongTien");
    findDP.markModified("TongNgay");
  }

  const findKH = await ThongTinKH.findById(findDP.ThongTinKH);

  if (findKH.TenKH !== TenKH) {
    findKH.TenKH = TenKH;
    findKH.markModified("TenKH");
  }
  if (findKH.SDT !== SDT) {
    findKH.SDT = SDT;
    findKH.markModified("SDT");
  }
  if (findKH.Email !== Email) {
    findKH.Email = Email;
    findKH.markModified("Email");
  }

  const resDP = await findDP.save();
  const resKH = await findKH.save();
  await findHD.save();

  return res.status(200).json({
    success: resDP && resKH ? true : false,
    mes: resDP && resKH ? "Cập nhật đơn đặt thành công" : "Đã xảy ra lỗi",
  });
});

const updateDay = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { NgayBatDau, NgayKetThuc } = req.body;
  const dp = await Datphong.findById(id);
  const phong = await PhongMD.findById(dp.Phong);
  const hd = await HoaDon.findOne({ DatPhong: id });

  hd.TongTien = hd.TongTien - dp.TongNgay * phong.GiaPhong;

  const temp = phong?.LichDat.map((item) => {
    if (item.DatPhong.toString() === id.toString()) {
      item.NgayBatDau = NgayBatDau;
      item.NgayKetThuc = NgayKetThuc;
      return item;
    }
    return item;
  });

  const diff = moment(NgayKetThuc, "DD-MM-YYYY").diff(
    moment(NgayBatDau, "DD-MM-YYYY"),
    "days"
  );

  dp.NgayBatDau = NgayBatDau;
  dp.NgayKetThuc = NgayKetThuc;
  dp.TongNgay = diff;
  phong.LichDat = temp;

  hd.TongTien = hd.TongTien + dp.TongNgay * phong.GiaPhong;

  dp.markModified("NgayBatDau");
  dp.markModified("NgayKetThuc");
  dp.markModified("TongNgay");
  dp.save();

  hd.save();
  phong.save();

  return res.status(200).json({
    success: dp && phong ? true : false,
    mes:
      dp && phong
        ? "Cập nhật ngày đặt thành công"
        : "Đã xảy ra lỗi. Vui lòng thử lại!",
    // success: diff ? true : false,
    // mes: diff ? diff : "Đã xảy ra lỗi",
  });
});

const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await Datphong.deleteOne({ _id: id });
    return res.status(200).json(result);
  } catch (err) {
    console.error("Datphong delete failed: " + err);
    const { status, message } = errorHandler(err);
    res.status(status).json({ message, entity: "Datphong" });
  }
};

module.exports = {
  create,
  autoCreate,
  getAll,
  getMultiAllData,
  getById,
  getList,
  getStaticDashboard,
  cancelBooking,
  update,
  updateDay,
  remove,
};
