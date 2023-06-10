const User = require("../Models/userModel");
const asyncHandler = require("express-async-handler");
const { generateToken } = require("../config/generateToken");
const cloudinary = require("../config/cloudinaryConfig");

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Email or Password is not valid");
  }
});

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const pic = req.file ? req.file.path : JSON.stringify(req.body.pic);
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Fill All Required Fields");
  }
  const userExist = await User.findOne({ email });

  if (userExist) {
    res.status(400);
    throw new Error("User Already Exists");
  }

  const upload = await cloudinary.v2.uploader.upload(pic);

  const newUser = await User.create({
    name,
    email,
    password,
    pic: upload.secure_url,
  });
  if (newUser) {
    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      pic: newUser.pic,
      token: generateToken(newUser._id),
    });
  } else {
    res.status(400);
    throw new Error("Failed: User Not Created");
  }
});

const allUser = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
});

module.exports = {
  loginUser,
  registerUser,
  allUser,
};
