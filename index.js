const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Routes
const userRoutes = require("./routes/user.js");
const blogRoutes = require("./routes/blog.js");

require("dotenv").config();

const app = express();

app.use(express.json());

const corsOptions = {
  // origin: ["http://localhost:8000", "http://localhost:5173"],
  origin: "*",
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

mongoose.connect(process.env.MONGODB_STRING);

mongoose.connection.once("open", () => {
  console.log("Now connected to MongoDB Atlas");
});

//Backend Routes
app.use("/users", userRoutes);
app.use("/blog", blogRoutes);

app.listen(process.env.PORT || 3000, () => {
  console.log(`API is now connected on PORT ${process.env.PORT || 3000}`);
});

module.exports = { app, mongoose };
