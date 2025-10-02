import { Lightbulb } from 'lucide-react';

interface TipOfTheDayProps {
  tip: string;
  loading: boolean;
}

export default function TipOfTheDay({ tip, loading }: TipOfTheDayProps) {
  return (
    <div className="bg-gradient-to-br from-emerald-400/20 to-teal-500/20 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-emerald-300/30">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl animate-pulse">
          <Lightbulb className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">Tip of the Day</h2>
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
