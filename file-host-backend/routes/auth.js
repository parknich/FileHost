const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Signup
router.post("/signup", async (req, res) => {
  const { username, email, password, key } = req.body;
  if (key != "parksfilehost23") {
    return res.status(400).json({ message: "Invalid invite key" });
  } else {
    try {
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ message: "User already exists" });

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      user = new User({
        username,
        email,
        password: hashedPassword,
      });

      await user.save();

      const payload = {
        user: {
          id: user.id,
          username: user.username, // Adding username to the payload
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: "1h" },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
});

// Login
router.post("/login", async (req, res) => {
  const { identifier, password } = req.body;

  try {
    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const payload = {
      user: {
        id: user.id,
        username: user.username, // Adding username to the payload
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
