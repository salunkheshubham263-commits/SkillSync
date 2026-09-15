const multer = require("multer");
const path = require("path");
const fs = require("fs");

const imageDirectory = "src/uploads/projects/images";
const zipDirectory = "src/uploads/projects/files";

if (!fs.existsSync(imageDirectory)) {
  fs.mkdirSync(imageDirectory, { recursive: true });
}

if (!fs.existsSync(zipDirectory)) {
  fs.mkdirSync(zipDirectory, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "coverImage") {
      cb(null, imageDirectory);
    } else if (file.fieldname === "projectFile") {
      cb(null, zipDirectory);
    } else {
      cb(new Error("Invalid file field"));
    }
  },

  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

const fileFilter = function (req, file, cb) {
  if (file.fieldname === "coverImage") {
    const allowedImages = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowedImages.includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG, WEBP and GIF images are allowed"));
    }

    return cb(null, true);
  }

  if (file.fieldname === "projectFile") {
    if (file.mimetype !== "application/zip") {
      return cb(new Error("Only ZIP files are allowed"));
    }

    return cb(null, true);
  }

  cb(new Error("Invalid file field"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

module.exports = upload;