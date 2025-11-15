const express = require("express");
const router = express.Router();
const { saveUserFromAuth0 } = require("../controllers/user.controller");
const User = require('../models/user.model')

router.post("/save", saveUserFromAuth0);
router.post("/signup", async (req, res) => {
  try {
    const { email, auth0Id } = req.body;

    if (!email || !auth0Id) {
      return res.status(400).json({
        message: "Email and Auth0 ID are required",
      });
    }

    // Check if the user already exists
    let existingUser = await User.findOne({ auth0Id });

    if (existingUser) {
      return res.status(200).json({
        message: "User already exists",
        user: existingUser,
      });
    }

    // Create new user
    const newUser = new User({
      email,
      auth0Id,
      nickname: email.split("@")[0], // auto-generate a username
    });

    await newUser.save();

    res.status(201).json({
      message: "Your account has been created!",
      user: {
        id: newUser._id,
        email: newUser.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      errors: error.message,
    });
  }
});


module.exports = router;



