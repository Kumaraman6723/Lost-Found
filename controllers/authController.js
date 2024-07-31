// controllers/authController.js
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const login = async (req, res) => {
  const { token, role } = req.body; // Accept role in the request body
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const {
      email,
      given_name: firstName,
      family_name: lastName,
    } = ticket.getPayload();

    if (role === "admin" && email !== "kumarprasadaman1234@gmail.com") {
      console.error("Invalid admin email:", email);
      return res.status(400).json({ message: "Invalid admin email" });
    }

    if (role === "user" && !email.endsWith("@ncuindia.edu")) {
      console.error("Invalid email domain:", email);
      return res.status(400).json({ message: "Invalid email domain" });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ firstName, lastName, email, role });
      await user.save();
    } else {
      user.role = role;
      await user.save();
    }

    res.status(200).json({ message: "Logged in successfully", user });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Error logging in", error });
  }
};

module.exports = { login };
