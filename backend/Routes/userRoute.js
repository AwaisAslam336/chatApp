const express = require("express");
const router = express.Router();
const uploader = require("../Middlewares/multer");
const { protect } = require("../Middlewares/authMiddleware");
const {
  loginUser,
  registerUser,
  allUser,
} = require("../Controllers/userController");

router.post("/login", loginUser);
router.post("/", uploader.single("pic"), registerUser);
router.get("/", protect, allUser);

module.exports = router;
