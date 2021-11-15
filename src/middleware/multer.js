const { v4: uuid } = require("uuid");
const multer = require("multer");
const path = require("path");

const storageConfig = multer.diskStorage({
  destination: path.resolve(__dirname, "../../temp"),
  filename: (req, file, cb) => {
    cb(null, uuid() + path.extname(file.originalname).toLowerCase());
  },
});

const filesMiddleware = multer({
  storage: storageConfig,
}).single("my-file");

module.exports = {
  filesMiddleware,
};
