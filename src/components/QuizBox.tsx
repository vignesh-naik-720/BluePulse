import { useEffect, useState } from 'react';

interface QuizQuestion {
  id: number;
  question: string;
  choices: string[];
  correctIndex: number;
  explanation?: string;
}

export default function QuizBox() {
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    fetchQuiz();
  }, []);

  const fetchQuiz = async () => {
    setLoading(true);
    try {
      // Add a timestamp to avoid browser caching and request with no-cache
      const url = `http://localhost:3001/api/generate-quiz?ts=${Date.now()}`;
      const res = await fetch(url, {
        method: 'GET',
        cache: 'no-cache',
        headers: { 'Cache-Control': 'no-cache' },
      });
      const data = await res.json();
      if (data.questions) {
        setQuestions(data.questions);
      } else {
        setQuestions([]);
      }
    } catch (err) {
      console.error('Error fetching quiz:', err);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const select = (qid: number, choiceIdx: number) => {
    setAnswers(prev => ({ ...prev, [qid]: choiceIdx }));
  };

  const submit = () => {
    if (!questions) return;
    let s = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctIndex) s += 1;
    });
    setScore(s);
  };

  return (
    <section className="glass rounded-2xl p-6 shadow-lg text-white">
      <h3 className="text-xl font-semibold mb-3">Marine Pollution Quiz</h3>
      <p className="text-sm muted mb-4">A short 5-question quiz to test your marine pollution awareness. Questions are generated and fact-checked using the Cerebras model.</p>

      {loading && <p className="text-white/70">Loading quiz...</p>}

      {!loading && questions && questions.length === 0 && (
        <p className="text-white/70">No quiz available right now.</p>
      )}

      {!loading && questions && questions.length > 0 && (
        <div className="space-y-4">
          {questions.map((q, i) => (
            <div key={q.id} className="bg-white/3 p-3 rounded">
              <p className="font-medium text-sm text-white">{i + 1}. {q.question}</p>
              <div className="mt-2 grid grid-cols-1 gap-2">
                {q.choices.map((c, idx) => {
                  const selected = answers[q.id] === idx;
                  const reveal = score !== null;
                  const correct = reveal && idx === q.correctIndex;
                  const wrong = reveal && selected && idx !== q.correctIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => select(q.id, idx)}
                      className={`text-left px-3 py-2 rounded ${selected ? 'ring-2 ring-cyan-400 bg-white/6' : 'bg-white/2'} ${correct ? 'border-2 border-green-400 bg-white/10' : ''} ${wrong ? 'border-2 border-red-500 bg-white/8' : ''}`}
                    >
                      <span className="mr-2">{String.fromCharCode(65 + idx)}.</span>
                      <span className="text-sm">{c}</span>
                    </button>
                  );
                })}
              </div>
              {score !== null && q.explanation && (
                <p className="mt-2 text-xs text-white/70">Explanation: {q.explanation}</p>
              )}
            </div>
          ))}

          <div className="flex items-center gap-3">
            <button onClick={submit} className="px-4 py-2 btn-accent rounded">Submit</button>
            <button onClick={() => { setAnswers({}); setScore(null); }} className="px-4 py-2 bg-white/5 rounded">Reset</button>
            <button onClick={fetchQuiz} className="ml-auto px-3 py-2 bg-white/5 rounded">Regenerate</button>
          </div>

          {score !== null && (
            <div className="mt-2 text-sm text-white/90">You scored {score} / {questions.length}</div>
          )}
        </div>
      )}
    </section>
  );
}
