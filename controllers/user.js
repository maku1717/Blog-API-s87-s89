//Dependencies and Modules
const bcrypt = require("bcryptjs");
const User = require("../models/User.js");
const auth = require("../auth");
const { errorHandler } = require("../auth.js");
const jwt = require("jsonwebtoken");

//User Registration and checking for duplicate emails and mobile number
module.exports.registerUser = async (req, res) => {
  try {
    if (!req.body.email.includes("@")) {
      return res.status(400).send({ message: "Email invalid" });
    } else if (req.body.password.length < 8) {
      return res
        .status(400)
        .send({ message: "Password must be atleast 8 characters" });
    }

    // duplicate emails and mobile number

    const existingUser = await User.findOne({ email: req.body.email });

    if (existingUser) {
      return res.status(400).send({ message: "Email already registered" });
    }

    const newUser = new User({
      userName: req.body.userName,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10),
    });

    await newUser.save();

    return res.status(201).send({
      message: "Registered successfully",
    });
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

//User Login
module.exports.loginUser = async (req, res) => {
  try {
    if (!req.body.email.includes("@")) {
      return res.status(400).send({ message: "Email invalid" });
    }

    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).send({ message: "Email not found" });
    }

    const isPasswordCorrect = bcrypt.compareSync(
      req.body.password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).send({ message: "Incorrect email or password" });
    }

    return res.status(200).send({
      message: "User logged in successfully",
      access: auth.createAccessToken(user),
    });
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

module.exports.retrieveUserDetails = async (req, res) => {
  try {
    // Extract token from Authorization header
    const token = req.header("Authorization").replace("Bearer ", "");

    if (!token) {
      return res.status(401).send({ message: "Authentication token required" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); // Decode the token to get user info
    console.log(decoded);
    // Find user by ID from decoded token
    const user = await User.findById(decoded.id).select("-password"); // Do not return the password field

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Return user details (excluding sensitive fields like password)
    res.status(200).send({ user });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server error, please try again later." });
  }
};

module.exports.updateUserAsAdmin = async (req, res) => {
  const { userId } = req.params;

  try {
    // Find the user by userId
    const user = await User.findById(userId);

    // Check if the user exists
    if (!user) {
      return res.send({ message: "User not found" });
    }
    if (user.isAdmin) {
      return res.send({ message: "User is already an admin" });
    }

    // Update the user's admin status
    user.isAdmin = true;

    // Save the updated user
    await user.save();

    return res
      .status(200)
      .send({ message: "User updated as admin successfully" });
  } catch (error) {
    console.error(error);
    return res.send({ message: "Server error" });
  }
};

module.exports.updatePassword = async (req, res) => {
  try {
    const { newPassword } = req.body; // Get new password from the request body

    if (!newPassword || newPassword.length < 8) {
      return res
        .status(400)
        .send({ message: "Password must be at least 8 characters long." });
    }

    // Extract user information from the authenticated request (from the token)
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); // Make sure JWT_SECRET is set in your environment variables

    // Find the user by their ID
    const user = await User.findById(decoded.id); // decoded.userId is the user's ID from the JWT

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Hash the new password before saving it to the database
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Save the updated user
    await user.save();

    res.status(200).send({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server error, please try again later." });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Authorization token missing or invalid" });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Extract user ID from token
    const userId = decoded.id;

    // Fields user is allowed to update
    const { firstName, lastName, mobileNo } = req.body;

    // Validate input
    if (!firstName || !lastName || !mobileNo) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Update user in database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, mobileNo },
      { new: true, runValidators: true }
    ).select("-password"); // exclude password from response

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
