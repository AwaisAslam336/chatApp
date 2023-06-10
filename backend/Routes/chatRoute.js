const express = require("express");
const router = express.Router();
const { protect } = require("../Middlewares/authMiddleware");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroupChat,
  addUserInGroupChat,
  removeUserFromGroupChat,
} = require("../Controllers/chatController");

router.post("/", protect, accessChat);
router.get("/", protect, fetchChats);
router.post("/group", protect, createGroupChat);
router.put("/group/rename", protect, renameGroupChat);
router.put("/group/add", protect, addUserInGroupChat);
router.put("/group/remove", protect, removeUserFromGroupChat);

module.exports = router;
