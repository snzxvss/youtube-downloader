const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const { downloadVideoFromFormat, status } = require('./youtube');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/download', async (req, res) => {
  if (!req.body.url) {
    res.status(400).send({ error: 'Missing URL' });
    return;
  }

  const id = await getVideoID(req.body.url);
  if (!id) {
    res.status(400).send({ error: 'Invalid URL' });
    return;
  }

  const extension = 'MP4';
  const videoQuality = '2160P';
  const audioQuality = '128 bits/sec';

  const result = await downloadVideoFromFormat(id, extension, videoQuality, audioQuality);
  if (result.error) {
    res.status(500).send({ error: result.error });
  } else {
    const filePath = result.filePath;
    res.download(filePath, (err) => {
      if (err) {
        res.status(500).send({ error: 'Failed to download file' });
      }
    });
  }
});

app.listen(9356, () => {
  console.log('Server opened on http://localhost:9356');
});

async function getVideoID(url) {
  try {
    const ytdl = require("@distube/ytdl-core");
    return ytdl.getVideoID(url);
  } catch (e) {
    console.log('Invalid URL');
    return null;
  }
}