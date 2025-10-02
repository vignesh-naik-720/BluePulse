# BluePulse – Marine Pollution Daily Digest

A beautiful, single-page web application that aggregates the latest ocean pollution news from multiple RSS feeds and uses Cerebras AI (Meta Llama) to generate daily summaries, actionable tips, and answer questions about marine conservation.

![BluePulse](https://via.placeholder.com/800x400/0ea5e9/ffffff?text=BluePulse+-+Ocean+News+Digest)

## Features

- **Real-time RSS Aggregation**: Fetches 5-7 latest articles from UNEP, NOAA, and The Guardian
- **AI-Powered Daily Digest**: 3-sentence summary of key ocean pollution issues
- **Tip of the Day**: Practical daily action individuals can take to reduce marine pollution
- **Interactive Q&A**: Ask questions about the fetched articles using Cerebras AI
- **Ocean-Themed UI**: Beautiful gradient backgrounds with animated wave effects
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Accessible**: ARIA labels and keyboard navigation support

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS with glass-morphism effects
- **Backend**: Express.js (Node.js)
- **AI**: Cerebras API with Meta Llama 3.3-70B
- **RSS Parsing**: rss-parser
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ and npm
- Cerebras API key ([Get one here](https://cerebras.ai))

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd bluepulse
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your Cerebras API key:

```env
CEREBRAS_API_KEY=your_actual_cerebras_api_key_here
```

**Important**: The Supabase credentials are pre-configured for this project. Only update `CEREBRAS_API_KEY`.

### 4. Start the Backend Server

In one terminal window, start the Express backend:

```bash
npm run server
```

The backend will run on `http://localhost:3001`

### 5. Start the Frontend Development Server

In another terminal window, start the Vite dev server:

```bash
npm run dev
```

The app will open at `http://localhost:5173`

### 6. Use the Application

- The app will automatically fetch and display the latest ocean pollution news
- View the AI-generated daily digest and tip of the day
- Click any article headline to read the full story
- Click the floating chat icon to ask questions about the articles

## Project Structure

```
bluepulse/
├── public/
│   └── waves.svg              # Animated wave background
├── src/
│   ├── components/
│   │   ├── ArticlesList.tsx   # Display RSS feed articles
│   │   ├── DailyDigest.tsx    # AI-generated 3-sentence summary
│   │   ├── TipOfTheDay.tsx    # Daily conservation tip
│   │   └── QnABox.tsx         # Interactive Q&A chat interface
│   ├── App.tsx                # Main application component
│   ├── index.css              # Global styles with Inter font
│   └── main.tsx               # React entry point
├── server.js                  # Express backend API
├── .env                       # Environment variables (not in git)
├── .env.example               # Example environment file
└── README.md                  # This file
```

## API Endpoints

### GET `/api/fetch-feeds`

Fetches and parses RSS feeds from UNEP, NOAA, and The Guardian.

**Response**:
```json
{
  "articles": [
    {
      "title": "Article Title",
      "url": "https://...",
      "content": "Article snippet...",
      "date": "2025-10-02T..."
    }
  ]
}
```

### POST `/api/summarize`

Calls Cerebras AI to generate summaries or answer questions.

**Request Body** (Daily Digest):
```json
{
  "articles": [...]
}
```

**Request Body** (Q&A):
```json
{
  "articles": [...],
  "question": "What are the main causes?"
}
```

**Response** (Digest):
```json
{
  "digest": "Three-sentence summary...",
  "tipOfTheDay": "One practical tip..."
}
```

**Response** (Q&A):
```json
{
  "answer": "Answer based on articles..."
}
```

## Building for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` folder.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `CEREBRAS_API_KEY`
   - `VITE_SUPABASE_URL` (pre-configured value)
   - `VITE_SUPABASE_ANON_KEY` (pre-configured value)
4. Deploy!

**Note**: For production deployment, you'll need to either:
- Deploy the backend separately (e.g., on Railway, Render, or Heroku)
- Use serverless functions (convert `server.js` routes to Vercel serverless functions)
- Update the API URLs in `App.tsx` and `QnABox.tsx` to point to your deployed backend

### Deploy Backend to Railway

1. Push your code to GitHub
2. Create a new project in [Railway](https://railway.app)
3. Add environment variable: `CEREBRAS_API_KEY`
4. Railway will automatically detect and run `server.js`
5. Update frontend API URLs to use your Railway URL

## Troubleshooting

### "Unable to fetch articles"

- Ensure the backend server is running on port 3001
- Check that RSS feed URLs are accessible
- Some feeds may block requests - consider adding a User-Agent header

### "Cerebras API key not configured"

- Verify `.env` file exists and contains valid `CEREBRAS_API_KEY`
- Restart the backend server after updating `.env`

### Articles not loading

- RSS feeds may be temporarily unavailable
- Check browser console for CORS errors
- Verify backend logs for parsing errors

### Port 3001 already in use

Edit `server.js` and change the `PORT` variable, then update the API URLs in `App.tsx` and `QnABox.tsx`.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for learning or commercial purposes.

## Acknowledgments

- RSS feeds provided by UNEP, NOAA, and The Guardian
- AI powered by Cerebras and Meta Llama
- Icons by Lucide React
- Built with React, Vite, and TailwindCSS
