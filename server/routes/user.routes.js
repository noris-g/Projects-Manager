const express = require("express");
const router = express.Router();
const { saveUserFromAuth0 } = require("../controllers/user.controller");
const User = require('../models/user.model')

router.post("/save", saveUserFromAuth0);
router.post("/signup", async (req, res) => {
try {
    console.log("GOT HERE1;")
    const { name, nickname, email, auth0Id } = req.body;
    console.log(name, nickname, email + "This is the request");

    if (!name || !nickname || !email) {
    return res.status(400).json({
        message: "All fields are required",
      });
    }

    // const userInUse = await User.findOne({ $or: [{ name }, { email }] });
    // if (userInUse) {
    //   const field = userInUse.name === name ? "name" : "Email";
    //   return res.status(409).json({ message: `${field} already in use` });
    // }

    const newUser = new User({
      username: name,
      nickname,
      email,
      auth0Id
    });

    await newUser.save();

    res.status(201).json({
      message: "Your account has been created!",
      user: {
        id: newUser._id,
        name: newUser.name,
        nickname: newUser.nickname,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error loooolllll", errors: error.message });
  }
})

module.exports = router;



