const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const File = require('../models/File'); // Your File model

// Helper function to ensure directory exists
const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Setup storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      // Ensure `username` is available from req.body or token
      const username = req.body.username || 'null'; // Fallback to 'null' if username is not provided
      console.log(req.body.username)
      const uploadPath = path.join(__dirname, `../uploads/${username}`);
      
      // Ensure the directory exists or create it if it doesn't
      fs.mkdirSync(uploadPath, { recursive: true });
  
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
    const { username } = req.body;
    if (!username) return res.status(400).json({ message: 'Username is required' });

    const newFile = new File({
      name: req.file.filename,
      url: `/uploads/${username}/${req.file.filename}` // Update URL path to include username
    });
    await newFile.save();
    res.json(newFile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// List files route
router.get('/', async (req, res) => {
  try {
    const files = await File.find();
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
    const filePath = path.join(__dirname, '../public/uploads', file.url.replace('/uploads/', ''));
    fs.unlink(filePath, (err) => {
      if (err) return res.status(500).json({ message: 'Failed to delete file' });
    });

    await file.remove();
    res.json({ message: 'File deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
