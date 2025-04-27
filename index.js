import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { YoutubeTranscript } from 'youtube-transcript';
import winston from 'winston';

dotenv.config();

// Set up Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'app.log' }),
  ],
});

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// Validate YouTube URL or ID
const isValidYouTubeUrl = (url) => {
  const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|embed\/|v\/|.+\?v=)?([^&\n?]{11})/;
  return regex.test(url) || /^[a-zA-Z0-9_-]{11}$/.test(url);
};

app.post('/transcript', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    logger.warn('Request failed: No URL provided');
    return res.status(400).json({ error: 'YouTube URL is required' });
  }

  if (!isValidYouTubeUrl(url)) {
    logger.warn(`Invalid YouTube URL provided: ${url}`);
    return res.status(400).json({ error: 'Invalid YouTube URL or video ID' });
  }

  try {
    logger.info(`Fetching transcript for URL: ${url}`);
    const transcript = await YoutubeTranscript.fetchTranscript(url);
    if (!transcript || transcript.length === 0) {
      logger.warn(`No transcript available for URL: ${url}`);
      return res.status(404).json({ error: 'No transcript available for this video' });
    }
    const text = transcript.map((item) => item.text).join(' ');
    logger.info(`Transcript fetched successfully for ${url}, length: ${text.length}`);
    res.json({ transcript: text });
  } catch (error) {
    logger.error(`Error fetching transcript for ${url}: ${error.message}`, { stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch transcript' });
  }
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});