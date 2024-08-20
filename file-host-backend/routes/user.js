const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// Route to get the username from the token
router.get('/me', authMiddleware, (req, res) => {
  try {
    // Return username from the token payload
    res.json({ username: req.user.username });
  } catch (error) {
    console.error('Error getting user info:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
