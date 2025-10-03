import { Newspaper } from 'lucide-react';

interface DailyDigestProps {
  digest: string;
  loading: boolean;
}

export default function DailyDigest({ digest, loading }: DailyDigestProps) {
  return (
    <div className="glass rounded-2xl p-8 shadow-2xl border border-white/12">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 btn-accent rounded-xl flex items-center justify-center">
          <Newspaper className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold">Daily Digest</h2>
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
