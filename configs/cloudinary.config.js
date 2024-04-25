const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

const maxSize = 40000;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  allowedFormats: ["jpg", "png"],
  params: {
    folder: "TrungHotel",
  },
});

const uploadCloud = multer({
  storage: storage,
  // fileFilter: (req, file, cb) => {
  //   if (
  //     file.mimetype == "image/png" ||
  //     file.mimetype == "image/jpg" ||
  //     file.mimetype == "image/jpeg"
  //   ) {
  //     cb(null, true);
  //   } else {
  //     cb(null, false);
  //     return cb(new Error("Chỉ cho phép định dạng .png .jpg .jpeg"));
  //   }
  // },
  // limits: {
  //   fileSize: maxSize,
  // },
});

// const opts = {
//   folder: "TrungHotel",
//   resource_type: "image",
// };

// module.exports = uploadCloud;
// const uploadImage = (image) => {
//   return new Promise((resolve, reject) => {
//     cloudinary.uploader.upload(image, opts, (error, result) => {
//       if (result && result.secure_url) {
//         console.log(result.secure_url);
//         return resolve(result.secure_url);
//       }
//       console.log(error.message);
//       return reject({ mes: error.message });
//     });
//   });
// };

// module.exports = (image) => {
//   return new Promise((resolve, reject) => {
//     cloudinary.uploader.upload(image, opts, (error, result) => {
//       if (result && result.secure_url) {
//         console.log(result.secure_url);
//         return resolve(result.secure_url);
//       }
//       console.log(error.message);
//       return reject({ mes: error.message });
//     });
//   });
// };

// module.exports.uploadMultipleImages = (images) => {
//   return new Promise((resolve, reject) => {
//     const uploads = images.map((base) => uploadImage(base));
//     Promise.all(uploads)
//       .then((values) => resolve(values))
//       .catch((err) => reject(err));
//   });
// };

module.exports = cloudinary;
