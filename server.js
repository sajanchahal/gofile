const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const { pipeline } = require('stream');
const { promisify } = require('util');

const app = express();
const PORT = process.env.PORT || 8080;
const pipe = promisify(pipeline);

const apiKey = process.env.API_KEY || '73442b2f-d5be-4cf7-9e5c-cda2436c1851';

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/upload', async (req, res) => {
  const { url } = req.body;

  try {
    // Fetch the file from the provided URL
    const fileResponse = await axios({
      url,
      method: 'GET',
      responseType: 'stream'
    });

    const fileName = url.split('/').pop();
    const formData = new FormData();
    formData.append('file', fileResponse.data, fileName);
    formData.append('apiKey', apiKey);

    // Upload the file to GoFile
    const gofileResponse = await axios.post('https://api.gofile.io/uploadFile', formData, {
      headers: {
        ...formData.getHeaders()
      }
    });

    if (gofileResponse.data.status !== 'ok') {
      return res.status(500).send(`Error uploading file: ${gofileResponse.data.data.message}`);
    }

    res.send(`<p>File uploaded successfully. <a href="${gofileResponse.data.data.downloadPage}">Download link</a></p>`);

  } catch (error) {
    console.error(error);
    res.status(500).send(`Error: ${error.message}`);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
