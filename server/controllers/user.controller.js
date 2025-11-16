const User = require("../models/user.model");

// POST /api/users/save
// Called AFTER Auth0 login/signup, using the Auth0 token
const saveUserFromAuth0 = async (req, res) => {
  try {
    const payload = req.auth?.payload;

    if (!payload) {
      return res.status(401).json({ message: "No auth payload found" });
    }

    const auth0Id = payload.sub;          // Auth0 user id
    const email = payload.email;
    const nickname = payload.nickname;

    if (!auth0Id || !email) {
      return res
        .status(400)
        .json({ message: "auth0Id or email missing from token" });
    }

    const username = nickname || email.split("@")[0];

    let user = await User.findOne({ auth0Id });

    if (!user) {
      user = await User.create({
        auth0Id,
        email,
        nickname,
      });
    }

    return res.status(200).json({ user });
  } catch (err) {
    console.error("saveUserFromAuth0 error:", err);
    return res
      .status(500)
      .json({ message: "Error saving user", error: err.message });
  }
};

module.exports = {
  saveUserFromAuth0,
};
