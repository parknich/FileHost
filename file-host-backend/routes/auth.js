const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const validator = require('validator');

const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
    let { username, email, password, key } = req.body;
  
    // Validate and sanitize inputs
    username = validator.trim(username);
    email = validator.trim(email);
    password = validator.trim(password);
    key = validator.trim(key);
  
    if (!validator.isLength(username, { min: 3, max: 30 })) {
      return res.status(400).json({ message: 'Username must be between 3 and 30 characters' });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    if (!validator.isLength(password, { min: 6 })) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    if (key !== 'parksfilehost23') {
      return res.status(400).json({ message: 'Invalid invite key' });
    }
  
    try {
      // Check if user already exists
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ message: 'User already exists' });
  
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      // Create a new user
      user = new User({
        username,
        email,
        password: hashedPassword,
      });
  
      await user.save();
  
      // Generate a JWT token
      const payload = {
        user: {
          id: user.id,
          username: user.username,
        },
      };
  
      jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
        if (err) throw err;
        res.json({ token });
      });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });
// Login
router.post('/login', async (req, res) => {
    let { identifier, password } = req.body;
  
    // Validate and sanitize inputs
    identifier = validator.trim(identifier);
    if (!validator.isAlphanumeric(identifier) && !validator.isEmail(identifier)) {
      return res.status(400).json({ message: 'Invalid identifier' });
    }
  
    try {
      const user = await User.findOne({
        $or: [{ email: identifier }, { username: identifier }],
      });
  
      if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
  
      const payload = {
        user: {
          id: user.id,
          username: user.username,
        },
      };
  
      jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
        if (err) throw err;
        res.json({ token });
      });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });

module.exports = router;
