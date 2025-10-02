import express from 'express';
import cors from 'cors';
import Parser from 'rss-parser';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const parser = new Parser();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// RSS Feed URLs
const RSS_FEEDS = [
  'https://www.unep.org/news-and-stories/rss.xml',
  'https://www.noaa.gov/news-and-features/feeds/ocean-coasts.xml',
  'https://www.theguardian.com/environment/rss',
];

// Fetch and parse RSS feeds
app.get('/api/fetch-feeds', async (req, res) => {
  try {
    const allArticles = [];

    for (const feedUrl of RSS_FEEDS) {
      try {
        const feed = await parser.parseURL(feedUrl);
        const oceanKeywords = ['ocean', 'marine', 'sea', 'pollution', 'plastic', 'coastal', 'water', 'climate', 'fish', 'coral'];

        feed.items.slice(0, 3).forEach(item => {
          const combinedText = `${item.title} ${item.contentSnippet || item.content || ''}`.toLowerCase();
          const isRelevant = oceanKeywords.some(keyword => combinedText.includes(keyword));

          if (isRelevant) {
            allArticles.push({
              title: item.title,
              url: item.link,
              content: (item.contentSnippet || item.content || '').replace(/<[^>]*>/g, '').substring(0, 300),
              date: item.pubDate || item.isoDate || new Date().toISOString(),
            });
          }
        });
      } catch (error) {
        console.error(`Error fetching ${feedUrl}:`, error.message);
      }
    }

    // Sort by date and return top 7
    allArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
    const topArticles = allArticles.slice(0, 7);

    res.json({ articles: topArticles });
  } catch (error) {
    console.error('Error fetching feeds:', error);
    res.status(500).json({ error: 'Failed to fetch feeds', articles: [] });
  }
});

// Call Cerebras API for summarization
app.post('/api/summarize', async (req, res) => {
  try {
    const { articles, question } = req.body;
    const apiKey = process.env.CEREBRAS_API_KEY;

    if (!apiKey || apiKey === 'your_cerebras_api_key_here') {
      return res.status(400).json({
        error: 'Cerebras API key not configured. Please add CEREBRAS_API_KEY to your .env file.'
      });
    }

    let prompt = '';

    if (question) {
      // Q&A mode
      const articlesText = articles.map((a, i) =>
        `Article ${i + 1}: ${a.title}\n${a.content}`
      ).join('\n\n');

      prompt = `Based on these ocean pollution articles:\n\n${articlesText}\n\nAnswer this question: ${question}\n\nProvide a clear, concise answer based only on the information in the articles.`;
    } else {
      // Daily digest mode
      const articlesText = articles.map((a, i) =>
        `${i + 1}. ${a.title}\n${a.content}`
      ).join('\n\n');

      prompt = `You are an expert ocean-environment analyst. Based on these recent ocean pollution articles:\n\n${articlesText}\n\nProvide a response in this exact JSON format:\n{\n  "digest": "A 3-sentence summary of the key ocean pollution issues covered in these articles",\n  "tipOfTheDay": "One practical tip individuals can do today to help reduce marine pollution"\n}\n\nReturn ONLY valid JSON, no other text.`;
    }

    const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: question ? 300 : 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cerebras API error:', errorText);
      throw new Error(`Cerebras API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    if (question) {
      res.json({ answer: content });
    } else {
      // Parse JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        res.json(parsed);
      } else {
        // Fallback if JSON parsing fails
        res.json({
          digest: content,
          tipOfTheDay: 'Reduce single-use plastics by carrying a reusable water bottle and shopping bag.',
        });
      }
    }
  } catch (error) {
    console.error('Error calling Cerebras:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate summary',
      digest: 'Unable to generate summary at this time.',
      tipOfTheDay: 'Reduce single-use plastics by carrying a reusable water bottle and shopping bag.',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
