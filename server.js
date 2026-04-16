const express = require('express');
const ytdlp = require('yt-dlp-exec');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/audio', async (req, res) => {
  const url = req.query.url;
  
  if (!url) {
    return res.status(400).json({ error: 'Missing URL parameter' });
  }

  try {
    const info = await ytdlp(url, {
      dumpSingleJson: true,
      noWarnings: true,
      noCheckCertificates: true,
    });

    // 找到最佳音訊格式（無視頻）
    const audio = info.formats
      .filter(f => f.acodec !== 'none' && f.vcodec === 'none')
      .sort((a, b) => (b.abr || 0) - (a.abr || 0))[0];

    if (!audio) {
      return res.status(404).json({ error: 'No audio stream found' });
    }

    res.json({
      title: info.title,
      duration: info.duration,
      audioUrl: audio.url,
      bitrate: audio.abr
    });
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Failed to process video' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🎵 Audio API running on port ${PORT}`);
});
