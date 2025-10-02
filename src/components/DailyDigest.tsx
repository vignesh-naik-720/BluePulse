import { Newspaper } from 'lucide-react';

interface DailyDigestProps {
  digest: string;
  loading: boolean;
}

export default function DailyDigest({ digest, loading }: DailyDigestProps) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl">
          <Newspaper className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">Daily Digest</h2>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-4 bg-white/20 rounded animate-pulse"></div>
          <div className="h-4 bg-white/20 rounded animate-pulse w-5/6"></div>
          <div className="h-4 bg-white/20 rounded animate-pulse w-4/6"></div>
        </div>
      ) : (
        <p className="text-white/90 text-lg leading-relaxed">
          {digest || 'Loading latest ocean pollution news...'}
        </p>
      )}
    </div>
  );
}
