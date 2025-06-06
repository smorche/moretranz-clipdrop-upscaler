const express = require('express');
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });

// Serve static files (index.html, CSS, JS) from 'public' folder
app.use(express.static('public'));

// POST /upscale route
app.post('/upscale', upload.single('image_file'), async (req, res) => {
  const imagePath = req.file?.path;

  if (!imagePath) {
    return res.status(400).json({ error: 'No image file received' });
  }

  try {
    // Prepare image + operations payload for Claid.ai
    const form = new FormData();
    form.append('image', fs.createReadStream(imagePath));
    form.append(
      'operations',
      JSON.stringify([
        {
          type: 'upscale',
          scale: 2 // upscale by 2x, maintains aspect ratio
        }
      ])
    );

    // Send request to Claid API
    const response = await axios.post(
      'https://api.claid.ai/v1/process',
      form,
      {
        headers: {
          ...form.getHeaders(),
          'x-api-key': process.env.CLAID_API_KEY,
        },
        responseType: 'arraybuffer',
      }
    );

    // Delete temp image
    fs.unlinkSync(imagePath);

    // Return upscaled image
    res.set('Content-Type', 'image/png');
    res.send(response.data);

  } catch (error) {
    console.error('Upscaling failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    res.status(500).json({ error: 'Upscaling failed. Please try again.' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ MoreTranz Upscaler running at http://localhost:${PORT}`);
});
