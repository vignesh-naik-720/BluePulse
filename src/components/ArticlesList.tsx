import { ExternalLink, Calendar } from 'lucide-react';

interface Article {
  title: string;
  url: string;
  content: string;
  date: string;
}

interface ArticlesListProps {
  articles: Article[];
  loading: boolean;
}

export default function ArticlesList({ articles, loading }: ArticlesListProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
      <h2 className="text-2xl font-bold text-white mb-6">Latest Headlines</h2>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 bg-white/5 rounded-xl space-y-2">
              <div className="h-4 bg-white/20 rounded animate-pulse"></div>
              <div className="h-3 bg-white/20 rounded animate-pulse w-4/5"></div>
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <p className="text-white/70 text-center py-8">No articles found. Please check back later.</p>
      ) : (
        <div className="space-y-4">
          {articles.map((article, index) => (
            <a
              key={index}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-300 group border border-transparent hover:border-cyan-400/30"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-cyan-300 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-white/60 text-sm line-clamp-2 mb-2">{article.content}</p>
                  <div className="flex items-center gap-2 text-white/50 text-xs">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(article.date)}</span>
                  </div>
                </div>
                <ExternalLink className="w-5 h-5 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
