import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { YoutubeTranscript } from 'youtube-transcript';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

app.post('/transcript', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'YouTube URL is required' });
  }

  try {
    const transcript = await YoutubeTranscript.fetchTranscript(url);
    const text = transcript.map((item) => item.text).join(' ');
    res.json({ transcript: text });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transcript' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
