const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

// POST route for image upscaling
app.post('/upscale', upload.single('image_file'), async (req, res) => {
  try {
    const imagePath = req.file.path;

    // Prepare form-data for ClipDrop API
    const form = new FormData();
    form.append('image_file', fs.createReadStream(imagePath));

    // Send image to ClipDrop Upscaler API
    const response = await axios.post(
      'https://clipdrop-api.co/super-resolution/v1',
      form,
      {
        headers: {
          ...form.getHeaders(),
          'x-api-key': process.env.CLIPDROP_API_KEY,
        },
        responseType: 'arraybuffer' // ensures binary image response
      }
    );

    // Delete uploaded temp file
    fs.unlinkSync(imagePath);

    // Return image to browser
    res.set('Content-Type', 'image/png');
    res.send(response.data);
  } catch (error) {
    // Enhanced error logging
    console.error('Upscaling failed:', error.message);

    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }

    res.status(500).json({ error: 'Upscaling failed. Please try again.' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ MoreTranz ClipDrop Upscaler running on port ${PORT}`);
});
