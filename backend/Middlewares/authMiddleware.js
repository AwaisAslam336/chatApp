const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../Models/userModel");

const protect = asyncHandler(async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    //seperate token
    const token = req.headers.authorization.split(" ")[1];
    //decodes token id
    const decode = jwt.verify(token, process.env.JSON_SECRET);
    //retrieve user from DB without Password
    req.user = await User.findById(decode.id).select("-password");
    next();
  } else {
    res.status(401);
    throw new Error("Unauthorized, No Token");
  }
});

module.exports = { protect };
