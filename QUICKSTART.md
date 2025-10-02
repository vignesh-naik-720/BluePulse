# BluePulse Quick Start Guide

Get BluePulse running in 5 minutes!

## Prerequisites

- Node.js 18 or higher installed
- A Cerebras API key (get one at https://cerebras.ai)

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Key

Open the `.env` file and add your Cerebras API key:

```env
CEREBRAS_API_KEY=your_actual_api_key_here
```

### 3. Start Both Servers

**Terminal 1** - Start the backend:
```bash
npm run server
```

You should see: `Backend server running on http://localhost:3001`

**Terminal 2** - Start the frontend:
```bash
npm run dev
```

You should see: `Local: http://localhost:5173`

### 4. Open the App

Visit `http://localhost:5173` in your browser.

## What You'll See

1. **Header**: BluePulse logo with animated wave background
2. **Daily Digest**: AI-generated 3-sentence summary of ocean pollution news
3. **Tip of the Day**: A practical action you can take today
4. **Latest Headlines**: 5-7 clickable article links from UNEP, NOAA, and The Guardian
5. **Q&A Button**: Floating chat icon in the bottom-right corner

## How to Use the Q&A Feature

1. Click the blue floating chat icon
2. Wait for articles to load
3. Type a question like:
   - "What are the main sources of ocean pollution?"
   - "What can I do to help?"
   - "Tell me about plastic pollution"
4. Press Enter or click Send
5. Get an AI-powered answer based on the loaded articles

## Troubleshooting

### Articles Not Loading?

- Make sure the backend is running on port 3001
- Check the browser console for errors
- RSS feeds may be temporarily unavailable

### "Cerebras API key not configured"?

- Verify you added the key to `.env`
- Restart the backend server: `Ctrl+C` then `npm run server`

### Port Already in Use?

If port 3001 or 5173 is busy:

1. Edit `server.js` and change `PORT = 3001` to another port
2. Update the API URLs in `src/App.tsx` and `src/components/QnABox.tsx`

## Features to Try

- Click any headline to read the full article
- Ask follow-up questions in the Q&A box
- Refresh the page to see if new articles are available
- Try different questions about ocean conservation

## Next Steps

- Check out `README.md` for deployment instructions
- Customize the RSS feeds in `server.js`
- Modify the AI prompts to change the output style
- Add more features like article bookmarking or email notifications

Enjoy exploring ocean conservation with BluePulse!
