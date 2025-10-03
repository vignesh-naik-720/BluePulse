import express from 'express';
import cors from 'cors';
import Parser from 'rss-parser';
import dotenv from 'dotenv';
import crypto from 'crypto';

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


app.get('/api/fetch-feeds', async (req, res) => {
  try {
    const allArticles = [];
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const cutoff = Date.now() - SEVEN_DAYS_MS;

    for (const feedUrl of RSS_FEEDS) {
      try {
        const feed = await parser.parseURL(feedUrl);
        const oceanKeywords = ['ocean', 'marine', 'sea', 'pollution', 'plastic', 'coastal', 'water', 'climate', 'fish', 'coral'];
        feed.items.slice(0, 20).forEach(item => {
          const combinedText = `${item.title} ${item.contentSnippet || item.content || ''}`.toLowerCase();
          const isRelevant = oceanKeywords.some(keyword => combinedText.includes(keyword));
          const pubTime = new Date(item.pubDate || item.isoDate || Date.now()).getTime();
          if (isRelevant && pubTime >= cutoff) {
            allArticles.push({
              title: item.title,
              url: item.link,
              content: (item.contentSnippet || item.content || '').replace(/<[^>]*>/g, '').substring(0, 1000),
              date: item.pubDate || item.isoDate || new Date().toISOString(),
            });
          }
        });
      } catch (err) {
        console.error(`Error fetching ${feedUrl}:`, err.message || err);
      }
    }

    allArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
    const topArticles = allArticles.slice(0, 7);
    res.json({ articles: topArticles });
  } catch (err) {
    console.error('Error fetching feeds:', err.message || err);
    res.status(500).json({ error: 'Failed to fetch feeds', articles: [] });
  }
});

app.post('/api/summarize', async (req, res) => {
  try {
    const { articles = [], question } = req.body || {};
    const apiKey = process.env.CEREBRAS_API_KEY;
    const model = process.env.CEREBRAS_MODEL || 'llama-3.3-70b';
    if (!apiKey) return res.status(400).json({ error: 'Cerebras API key not configured. Set CEREBRAS_API_KEY in .env' });

    let prompt = '';
    if (question) {
      const articlesText = (articles || []).map((a, i) => `Article ${i + 1}: ${a.title}\n${a.content}`).join('\n\n');
      prompt = `You are an expert ocean-environment analyst. Answer the user question about marine pollution. Use the provided articles as supporting context if relevant, but if no articles are provided, answer based on general, evidence-based domain knowledge (up to 2025). Do NOT ask the user for the articles — respond using your knowledge. Be factual, concise, and when possible cite Article N if the article context supports a claim.\n\nUser question: ${question}\n\nContext articles (optional):\n${articlesText || '[no articles provided]'}\n\nProvide a clear, evidence-based answer in plain text. Do not invent sources.`;
    } else {
      const articlesText = (articles || []).map((a, i) => `${i + 1}. ${a.title}\n${a.content}`).join('\n\n');
      prompt = `You are an expert ocean-environment analyst. Based on these recent ocean pollution articles from the past week:\n\n${articlesText}\n\nProvide a response in this exact JSON format:\n{\n  "digest": "A 3-sentence summary of the key ocean pollution issues covered in these articles",\n  "tipOfTheDay": "One practical tip individuals can do today to help reduce marine pollution"\n}\n\nReturn ONLY valid JSON, no other text.`;
    }

    const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], temperature: 0.7, max_tokens: question ? 300 : 500 }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Cerebras API error:', errText);
      return res.status(502).json({ error: 'Cerebras API error' });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || data.choices?.[0]?.text || '';

    if (question) return res.json({ answer: content });

    const jsonMatch = (content || '').match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return res.json(parsed);
      } catch (err) {
        console.error('Error parsing JSON from model:', err.message || err);
      }
    }

    return res.json({ digest: content, tipOfTheDay: 'Reduce single-use plastics by carrying a reusable water bottle and shopping bag.' });
  } catch (err) {
    console.error('Error in /api/summarize:', err.message || err);
    return res.status(500).json({ error: 'Failed to generate summary', digest: 'Unable to generate summary at this time.', tipOfTheDay: 'Reduce single-use plastics by carrying a reusable water bottle and shopping bag.' });
  }
});

app.get('/api/generate-quiz', async (req, res) => {
  try {
    const apiKey = process.env.CEREBRAS_API_KEY;
    const model = process.env.CEREBRAS_MODEL || 'llama-3.3-70b';
    if (!apiKey) return res.status(400).json({ error: 'Cerebras API key not configured. Set CEREBRAS_API_KEY in .env' });

    const requestId = crypto.randomUUID();
    const prompt = `Request ID: ${requestId}\n\nGenerate a 5-question multiple-choice quiz about marine pollution. Each question must be a concise factual question (no opinion). For each question provide exactly 4 choices labeled A-D, and indicate the correct choice index (0-3). Also include a 1-2 sentence explanation for the correct answer. Return ONLY valid JSON in this exact shape:\n{ "questions": [ { "question": "...", "choices": ["...","...","...","..."], "correctIndex": 1, "explanation": "..." } ] }`;

    const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], temperature: 0.5, top_p: 0.95, max_tokens: 600 }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Cerebras quiz API error:', errText);
      throw new Error('Cerebras API error');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || data.choices?.[0]?.text || '';
    const jsonMatch = (content || '').match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.questions && Array.isArray(parsed.questions)) {
          const normalized = parsed.questions.slice(0, 5).map((q, i) => ({ id: i + 1, question: q.question || q.prompt || '', choices: q.choices || q.options || [], correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0, explanation: q.explanation || '' }));
          return res.json({ requestId, questions: normalized });
        }
      } catch (err) {
        console.error('Error parsing quiz JSON from model:', err.message || err);
      }
    }

    function shuffleArray(arr) { for (let i = arr.length - 1; i > 0; i--) { const j = crypto.randomInt(0, i + 1); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; }

    const base = [
      { question: 'What is one of the largest sources of marine plastic pollution?', choices: ['Microbeads from cosmetics', 'Fishing gear and nets', 'Natural seaweed', 'Whale carcasses'], correct: 'Fishing gear and nets', explanation: 'Fishing gear and derelict nets are a major source of large plastic debris entering the ocean and entangling wildlife.' },
      { question: 'Which process breaks large plastic items into microplastics?', choices: ['Biodegradation by bacteria', 'Photodegradation and mechanical abrasion', 'Photosynthesis', 'Tidal uplift'], correct: 'Photodegradation and mechanical abrasion', explanation: 'Sunlight (photodegradation) and mechanical abrasion fragment plastics into microplastics over time.' },
      { question: 'What common single-use item contributes heavily to marine pollution?', choices: ['Reusable bottles', 'Cotton tote bags', 'Plastic straws and single-use bottles', 'Steel cutlery'], correct: 'Plastic straws and single-use bottles', explanation: 'Single-use plastic bottles and straws are commonly found in beach cleanups and contribute significantly to pollution.' },
      { question: 'Which chemical pollutant is especially harmful to marine life due to bioaccumulation?', choices: ['Salt', 'Microplastics', 'Mercury', 'Calcium'], correct: 'Mercury', explanation: 'Mercury bioaccumulates in marine food webs and can reach toxic levels in predators.' },
      { question: 'Which action most reduces plastic entering oceans at the consumer level?', choices: ['Using biodegradable glitter', 'Switching to single-use plastics', 'Reducing single-use plastics and improving disposal', 'Leaving trash on beaches for decomposition'], correct: 'Reducing single-use plastics and improving disposal', explanation: 'Reducing single-use plastics and ensuring proper disposal substantially reduces pollution entering waterways.' },
    ];

    const questions = base.map((b, idx) => { const choices = shuffleArray([...b.choices]); const correctIndex = choices.indexOf(b.correct); return { id: idx + 1, question: b.question, choices, correctIndex: correctIndex >= 0 ? correctIndex : 0, explanation: b.explanation }; });
    const shuffledQuestions = shuffleArray(questions);
    return res.json({ requestId, questions: shuffledQuestions });
  } catch (err) {
    console.error('Error generating quiz:', err.message || err);
    return res.status(500).json({ error: 'Failed to generate quiz', questions: [] });
  }
});

app.listen(PORT, '0.0.0.0', () => console.log(`Backend server running on http://localhost:${PORT}`));
        // Basic validation
