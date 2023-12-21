const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/uploads");
  },
  filename: function (req, file, cb) {
    const unique = uuidv4();
    const fileExtension = path.extname(file.originalname); // Using path.extname to get file extension
    cb(null, unique + fileExtension);
  },
});

const upload = multer({ storage: storage });
module.exports = upload;
