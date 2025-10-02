import { useEffect, useState } from 'react';
import { Waves } from 'lucide-react';
import DailyDigest from './components/DailyDigest';
import TipOfTheDay from './components/TipOfTheDay';
import ArticlesList from './components/ArticlesList';
import QnABox from './components/QnABox';

interface Article {
  title: string;
  url: string;
  content: string;
  date: string;
}

interface SummaryData {
  digest: string;
  tipOfTheDay: string;
  error?: string;
}

function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [summary, setSummary] = useState<SummaryData>({ digest: '', tipOfTheDay: '' });
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoadingArticles(true);
    try {
      const response = await fetch('http://localhost:3001/api/fetch-feeds');
      const data = await response.json();

      if (data.articles && data.articles.length > 0) {
        setArticles(data.articles);
        fetchSummary(data.articles);
      } else {
        setArticles([]);
        setSummary({
          digest: 'No recent ocean pollution articles found. Please check back later.',
          tipOfTheDay: 'Reduce single-use plastics by carrying a reusable water bottle and shopping bag.',
        });
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      setArticles([]);
      setSummary({
        digest: 'Unable to fetch articles. Please ensure the backend server is running on port 3001.',
        tipOfTheDay: 'Reduce single-use plastics by carrying a reusable water bottle and shopping bag.',
      });
    } finally {
      setLoadingArticles(false);
    }
  };

  const fetchSummary = async (articlesToSummarize: Article[]) => {
    setLoadingSummary(true);
    try {
      const response = await fetch('http://localhost:3001/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          articles: articlesToSummarize,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setSummary({
          digest: `Error: ${data.error}`,
          tipOfTheDay: data.tipOfTheDay || 'Reduce single-use plastics by carrying a reusable water bottle and shopping bag.',
        });
      } else {
        setSummary({
          digest: data.digest || 'Summary unavailable.',
          tipOfTheDay: data.tipOfTheDay || 'Reduce single-use plastics by carrying a reusable water bottle and shopping bag.',
        });
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
      setSummary({
        digest: 'Unable to generate summary. Please ensure the backend server is running.',
        tipOfTheDay: 'Reduce single-use plastics by carrying a reusable water bottle and shopping bag.',
      });
    } finally {
      setLoadingSummary(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900 relative overflow-hidden">
      {/* Animated Wave Background */}
      <div className="absolute top-0 left-0 w-full opacity-30 pointer-events-none">
        <img src="/waves.svg" alt="" className="w-full h-64 object-cover" />
      </div>

      {/* Header */}
      <header className="relative z-10 pt-12 pb-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl shadow-2xl">
              <Waves className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-white tracking-tight">BluePulse</h1>
              <p className="text-cyan-200 text-lg">Marine Pollution Daily Digest</p>
            </div>
          </div>
          <p className="text-white/80 max-w-2xl">
            Stay informed about ocean pollution with AI-powered summaries of the latest environmental news
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 pb-24">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Daily Digest */}
          <DailyDigest digest={summary.digest} loading={loadingSummary} />

          {/* Tip of the Day */}
          <TipOfTheDay tip={summary.tipOfTheDay} loading={loadingSummary} />

          {/* Articles List */}
          <ArticlesList articles={articles} loading={loadingArticles} />
        </div>
      </main>

      {/* Q&A Floating Box */}
      <QnABox articles={articles} />

      {/* Footer */}
      <footer className="relative z-10 py-8 px-6 text-center text-white/60 text-sm">
        <p>Powered by Cerebras AI &amp; RSS feeds from UNEP, NOAA, and The Guardian</p>
      </footer>
    </div>
  );
}

export default App;
