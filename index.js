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
    console.log('Request failed: No URL provided');
    return res.status(400).json({ error: 'YouTube URL is required' });
  }

  try {
    console.log('Fetching transcript for URL:', url);
    const transcript = await YoutubeTranscript.fetchTranscript(url);
    if (!transcript || transcript.length === 0) {
      console.log('No transcript available for URL:', url);
      return res.status(404).json({ error: 'No transcript available for this video' });
    }
    const text = transcript.map((item) => item.text).join(' ');
    console.log('Transcript fetched successfully, length:', text.length);
    res.json({ transcript: text });
  } catch (error) {
    console.error('Error fetching transcript:', error.message, error.stack);
    res.status(500).json({ error: error.message || 'Failed to fetch transcript' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});