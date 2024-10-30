const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const File = require('../models/File'); // Your File model

// Helper function to ensure directory exists
const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Extract username from token
const extractUsernameFromToken = (token) => {
  try {
    // Verify the token and extract payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Access the username from the payload
    return decoded.user.username;
  } catch (err) {
    console.error('Token is invalid:', err.message);
    return null;
  }
};

// Setup storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Extract token from headers
    const token = req.headers['x-auth-token'];
    const username = extractUsernameFromToken(token) || 'null'; // Use extracted username or fallback

    const uploadPath = path.join(__dirname, `../uploads/${username}`);
    
    // Ensure the directory exists or create it if it doesn't
    ensureDirectoryExists(uploadPath);

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const filename = file.originalname;
    cb(null, filename);
  }
});

const upload = multer({ storage });

// Upload file route
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const token = req.headers['x-auth-token'];
    const username = extractUsernameFromToken(token);

    if (!username) return res.status(401).json({ message: 'Unauthorized' });

    // Save file information to the database
    const newFile = new File({
      name: req.file.filename,
      url: `/uploads/${username}/${req.file.filename}` // Update URL path to include username
    });
    await newFile.save();

    // Check if the request is coming from ShareX (by checking a custom header)
    const isShareX = req.headers['x-sharex'] === 'true';

    if (isShareX) {
      // Simplified response for ShareX with only the URL
      return res.json({ url: `${req.protocol}://${req.get('host')}${newFile.url}` });
    }

    // Default response for other clients (e.g., dashboard)
    res.json(newFile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// List files route
router.get('/', async (req, res) => {
  try {
    const token = req.headers['x-auth-token'];
    const username = extractUsernameFromToken(token);

    if (!username) return res.status(401).json({ message: 'Unauthorized' });

    // Find files for the current user
    const files = await File.find({ url: { $regex: `^/uploads/${username}/` } });
    res.json(files);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete file route
router.delete('/:id', async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ message: 'File not found' });

    // Delete file from server
    const filePath = path.join(__dirname, '../uploads', file.url.replace('/uploads/', ''));
    fs.unlink(filePath, (err) => {
      if (err) return res.status(500).json({ message: 'Failed to delete file' });
    });

    await File.deleteOne({ _id: req.params.id }); // Use deleteOne to remove the document
    res.json({ message: 'File deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
