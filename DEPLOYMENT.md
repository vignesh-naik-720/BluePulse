# BluePulse Deployment Guide

This guide covers deploying BluePulse to production using Vercel (frontend) and Railway (backend).

## Architecture Overview

BluePulse consists of two parts:
1. **Frontend**: React + Vite SPA (Single Page Application)
2. **Backend**: Express.js API server

Both need to be deployed separately.

## Option 1: Deploy to Vercel + Railway (Recommended)

### Step 1: Deploy Backend to Railway

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_URL
   git push -u origin main
   ```

2. **Create Railway Project**
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway will auto-detect Node.js

3. **Add Environment Variable**
   - In Railway dashboard, go to your project
   - Click "Variables" tab
   - Add: `CEREBRAS_API_KEY` with your API key

4. **Configure Start Command**
   - Go to "Settings" tab
   - Set Start Command: `node server.js`
   - Set Root Directory: `/` (if needed)

5. **Deploy**
   - Railway will automatically deploy
   - Copy your Railway URL (e.g., `https://yourapp.railway.app`)

### Step 2: Update Frontend API URLs

Before deploying the frontend, update the API endpoints:

**In `src/App.tsx`**, replace:
```typescript
const response = await fetch('http://localhost:3001/api/fetch-feeds');
```
With:
```typescript
const response = await fetch('https://yourapp.railway.app/api/fetch-feeds');
```

Also update the summarize endpoint in the same file.

**In `src/components/QnABox.tsx`**, replace:
```typescript
const response = await fetch('http://localhost:3001/api/summarize', {
```
With:
```typescript
const response = await fetch('https://yourapp.railway.app/api/summarize', {
```

### Step 3: Deploy Frontend to Vercel

1. **Create Vercel Project**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository

2. **Configure Build Settings**
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Add Environment Variables**
   - `VITE_SUPABASE_URL`: (copy from your `.env`)
   - `VITE_SUPABASE_ANON_KEY`: (copy from your `.env`)

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your frontend
   - Your app will be live at `https://yourapp.vercel.app`

## Option 2: All-in-One Deployment with Vercel Serverless Functions

Convert the Express backend to Vercel serverless functions.

### Step 1: Create API Routes

Create `api/fetch-feeds.js`:

```javascript
import Parser from 'rss-parser';

const parser = new Parser();

const RSS_FEEDS = [
  'https://www.unep.org/news-and-stories/rss.xml',
  'https://www.noaa.gov/news-and-features/feeds/ocean-coasts.xml',
  'https://www.theguardian.com/environment/rss',
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const allArticles = [];

    for (const feedUrl of RSS_FEEDS) {
      try {
        const feed = await parser.parseURL(feedUrl);
        const oceanKeywords = ['ocean', 'marine', 'sea', 'pollution', 'plastic', 'coastal', 'water', 'climate'];

        feed.items.slice(0, 3).forEach(item => {
          const combinedText = `${item.title} ${item.contentSnippet || ''}`.toLowerCase();
          const isRelevant = oceanKeywords.some(keyword => combinedText.includes(keyword));

          if (isRelevant) {
            allArticles.push({
              title: item.title,
              url: item.link,
              content: (item.contentSnippet || '').substring(0, 300),
              date: item.pubDate || item.isoDate || new Date().toISOString(),
            });
          }
        });
      } catch (error) {
        console.error(`Error fetching ${feedUrl}:`, error);
      }
    }

    allArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json({ articles: allArticles.slice(0, 7) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch feeds', articles: [] });
  }
}
```

Create `api/summarize.js`:

```javascript
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { articles, question } = req.body;
  const apiKey = process.env.CEREBRAS_API_KEY;

  if (!apiKey) {
    return res.status(400).json({ error: 'API key not configured' });
  }

  try {
    let prompt = '';

    if (question) {
      const articlesText = articles.map((a, i) =>
        `Article ${i + 1}: ${a.title}\n${a.content}`
      ).join('\n\n');

      prompt = `Based on these ocean pollution articles:\n\n${articlesText}\n\nAnswer: ${question}`;
    } else {
      const articlesText = articles.map((a, i) =>
        `${i + 1}. ${a.title}\n${a.content}`
      ).join('\n\n');

      prompt = `Summarize these ocean pollution articles in 3 sentences and provide one tip:\n\n${articlesText}\n\nReturn JSON: {"digest": "...", "tipOfTheDay": "..."}`;
    }

    const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: question ? 300 : 500,
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;

    if (question) {
      res.json({ answer: content });
    } else {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { digest: content, tipOfTheDay: 'Reduce single-use plastics.' };
      res.json(parsed);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to process request' });
  }
}
```

### Step 2: Update Frontend to Use Vercel Functions

In `src/App.tsx` and `src/components/QnABox.tsx`, change:
```typescript
'http://localhost:3001/api/fetch-feeds'
```
To:
```typescript
'/api/fetch-feeds'
```

### Step 3: Deploy to Vercel

Deploy with environment variable:
- `CEREBRAS_API_KEY`: Your Cerebras API key

Vercel will automatically detect and deploy the serverless functions.

## Environment Variables Reference

### Backend (Railway/Render)
- `CEREBRAS_API_KEY`: Your Cerebras API key
- `PORT`: (Optional) Server port, defaults to 3001

### Frontend (Vercel)
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
- `CEREBRAS_API_KEY`: (Only if using serverless functions)

## Testing Your Deployment

1. Visit your deployed URL
2. Wait 5-10 seconds for articles to load
3. Verify the Daily Digest and Tip appear
4. Click an article headline to test external links
5. Open the Q&A box and ask a question
6. Check browser DevTools for any errors

## Troubleshooting

### CORS Errors
- Ensure backend has proper CORS headers
- Check that API URLs are correct

### 502 Bad Gateway
- Backend may be starting up (wait 30 seconds)
- Check backend logs for errors

### Articles Not Loading
- RSS feeds may be down
- Check backend logs
- Some feeds may require User-Agent headers

### API Rate Limits
- Cerebras may have rate limits
- Implement caching or request throttling

## Monitoring

- **Railway**: View logs in the dashboard
- **Vercel**: Check Function logs in the dashboard
- **Errors**: Set up error tracking (e.g., Sentry)

## Scaling Considerations

1. **Caching**: Cache RSS feed results for 5-15 minutes
2. **Rate Limiting**: Implement rate limits on API endpoints
3. **CDN**: Vercel automatically provides CDN caching
4. **Database**: Add a database to store articles and reduce API calls

## Support

For issues or questions:
- Check the logs in your deployment platform
- Review the README.md for local development
- Ensure all environment variables are set correctly

Happy deploying!
