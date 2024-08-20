const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Adjust according to your User model

const authMiddleware = async (req, res, next) => {
  // Get the token from the headers
  const token = req.header('x-auth-token');

  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user based on token data (assuming it contains user ID)
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Attach user object to request
    req.user = user;

    next();
  } catch (err) {
    console.error(err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
