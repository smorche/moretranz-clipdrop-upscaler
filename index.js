const express = require('express');
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

// Upscale image route
app.post('/upscale', upload.single('image_file'), async (req, res) => {
  const imagePath = req.file?.path;

  if (!imagePath) {
    return res.status(400).json({ error: 'No image file received' });
  }

  try {
    const form = new FormData();
    form.append('image_file', fs.createReadStream(imagePath));

    const clipdropRes = await axios.post(
      'https://clipdrop-api.co/super-resolution/v1',
      form,
      {
        headers: {
          ...form.getHeaders(),
          'x-api-key': process.env.CLIPDROP_API_KEY
        },
        responseType: 'arraybuffer'
      }
    );

    fs.unlinkSync(imagePath); // cleanup temp file

    res.set('Content-Type', 'image/png');
    res.send(clipdropRes.data);

  } catch (error) {
    console.error('Upscaling failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    res.status(500).json({ error: 'Upscaling failed. Please try a different image.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ MoreTranz Upscaler running on port ${PORT}`);
});
