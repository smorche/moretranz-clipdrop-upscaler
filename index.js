const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

const upload = multer({ dest: 'uploads/' });
app.use(cors());
app.use(express.static('public'));

const CLIPDROP_API_KEY = process.env.CLIPDROP_API_KEY || 'YOUR_API_KEY';

app.post('/upscale', upload.single('image_file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const formData = new FormData();
    formData.append('image_file', fs.createReadStream(req.file.path));
    formData.append('target_width', '2048');
    formData.append('target_height', '2048');

    const response = await axios.post('https://clipdrop-api.co/image-upscaling/v1/upscale', formData, {
      headers: {
        ...formData.getHeaders(),
        'x-api-key': CLIPDROP_API_KEY
      },
      responseType: 'stream'
    });

    res.setHeader('Content-Type', 'image/png');
    response.data.pipe(res);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Upscaling failed' });
  } finally {
    fs.unlink(req.file.path, () => {});
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});