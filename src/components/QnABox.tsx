import { useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';

interface Article {
  title: string;
  url: string;
  content: string;
  date: string;
}

interface QnABoxProps {
  articles: Article[];
}

export default function QnABox({ articles }: QnABoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAskQuestion = async () => {
    if (!question.trim() || articles.length === 0) return;

    setLoading(true);
    setAnswer('');

    try {
      const response = await fetch('http://localhost:3001/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          articles,
          question: question.trim(),
        }),
      });

      const data = await response.json();

      if (data.error) {
        setAnswer(`Error: ${data.error}`);
      } else {
        setAnswer(data.answer || 'No answer available.');
      }
    } catch (error) {
      setAnswer('Failed to get an answer. Please ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskQuestion();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <div className="fixed bottom-8 right-8 z-50 flex items-center gap-3">
          <button
            onClick={() => setIsOpen(true)}
            className="relative p-5 w-20 h-20 btn-accent rounded-full shadow-2xl hover:scale-105 transform transition-transform ring-0 hover:ring-8 hover:ring-white/10 focus:outline-none"
            aria-label="Open Q&A"
          >
            <span className="absolute -top-3 -left-3 w-6 h-6 bg-white/10 rounded-full animate-pulse opacity-60"></span>
            <MessageCircle className="w-9 h-9 text-white mx-auto" />
          </button>

          {/* Hover label */}
          <div className="hidden group-hover:block lg:block">
            <div className="px-3 py-2 bg-white/6 glass rounded-full text-sm font-semibold">Ask about marine pollution</div>
          </div>
        </div>
      )}

      {/* Chat Box */}
      {isOpen && (
  <div className="fixed bottom-8 right-8 w-96 max-w-[calc(100vw-4rem)] glass rounded-2xl shadow-2xl border border-white/12 overflow-hidden z-50">
          {/* Header */}
          <div className="p-4 flex items-center justify-between" style={{background: 'linear-gradient(90deg, rgba(6,182,212,0.12), rgba(14,165,164,0.10))'}}>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-white" />
              <h3 className="text-white font-semibold">Ask About Articles</h3>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                setQuestion('');
                setAnswer('');
              }}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 max-h-96 overflow-y-auto">
            {/* Answer Display */}
            {answer && (
              <div className="mb-4 p-4 bg-white/5 rounded-xl">
                <p className="text-sm font-semibold text-cyan-300 mb-2">Answer:</p>
                <p className="text-white/90 text-sm leading-relaxed">{answer}</p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="mb-4 p-4 bg-white/5 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-200"></div>
                  <span className="text-white/70 text-sm ml-2">Thinking...</span>
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="space-y-2">
              <label htmlFor="question-input" className="text-white/70 text-sm">
                Ask a question about the ocean pollution articles:
              </label>
              <div className="flex gap-2">
                <input
                  id="question-input"
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g., What are the main causes?"
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  disabled={loading || articles.length === 0}
                />
                <button
                  onClick={handleAskQuestion}
                  disabled={loading || !question.trim() || articles.length === 0}
                  className="p-3 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Send question"
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>
              {articles.length === 0 && (
                <p className="text-xs text-white/50">Articles need to be loaded first</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
