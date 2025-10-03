import { Lightbulb } from 'lucide-react';

interface TipOfTheDayProps {
  tip: string;
  loading: boolean;
}

export default function TipOfTheDay({ tip, loading }: TipOfTheDayProps) {
  return (
    <div className="glass rounded-2xl p-8 shadow-2xl border border-white/12">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 btn-accent rounded-xl animate-pulse flex items-center justify-center">
          <Lightbulb className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold">Tip of the Day</h2>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-4 bg-white/20 rounded animate-pulse"></div>
          <div className="h-4 bg-white/20 rounded animate-pulse w-3/4"></div>
        </div>
      ) : (
        <p className="text-white/90 text-lg leading-relaxed">
          {tip || 'Loading your daily ocean conservation tip...'}
        </p>
      )}
    </div>
  );
}
