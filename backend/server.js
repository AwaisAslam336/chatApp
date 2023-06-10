const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const connectDB = require("./config/db");
const PORT = process.env.PORT || 5000;
const userRoute = require("./Routes/userRoute");
const chatRoute = require("./Routes/chatRoute");
const {
  notFound,
  errorHandler,
} = require("./Middlewares/errorHandlerMiddleware");

connectDB();
const app = express();
app.use(express.json());
app.use("/api/user", userRoute);
app.use("/api/chat", chatRoute);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, console.log(`app is running on port ${PORT}...`));
