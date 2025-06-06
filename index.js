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

// Upscaler Route
app.post('/upscale', upload.single('image_file'), async (req, res) => {
  try {
    const imagePath = req.file.path;

    const form = new FormData();
    form.append('image_file', fs.createReadStream(imagePath));

    const response = await axios.post(
      'https://clipdrop-api.co/super-resolution/v1',
      form,
      {
        headers: {
          ...form.getHeaders(),
          'x-api-key': process.env.CLIPDROP_API_KEY,
        },
        responseType: 'arraybuffer' // Important: handle binary image
      }
    );

    // Clean up local temp file
    fs.unlinkSync(imagePath);

    // Send upscaled image back to browser
    res.set('Content-Type', 'image/png');
    res.send(response.data);

  } catch (error) {
    // Error logging
    console.error('Upscale failed:', error.message);

    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Request setup error:', error.message);
    }

    res.status(500).json({ error: 'Upscaling failed. Please try again.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`MoreTranz Upscaler running on port ${PORT}`));
