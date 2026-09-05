import React from "react";

export interface YouTubeResourceItem {
  id: string;
  title: string;
  channel_title: string;
  url: string;
  resource_type: "YOUTUBE_VIDEO" | "YOUTUBE_PLAYLIST";
  difficulty: string;
  language: string;
  video_count?: number;
  quality_score: number;
  source: string;
  description: string;
}

interface YouTubeResourceCardProps {
  resource: YouTubeResourceItem;
}

export const YouTubeResourceCard: React.FC<YouTubeResourceCardProps> = ({ resource }) => {
  const isPlaylist = resource.resource_type === "YOUTUBE_PLAYLIST";

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 hover:border-red-300 transition-all shadow-xs">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 uppercase tracking-wider">
            <span className="h-2 w-2 rounded-full bg-red-600" />
            {resource.channel_title}
          </div>
          <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-bold text-red-700 border border-red-200">
            {isPlaylist ? `Playlist (${resource.video_count || 10}+ videos)` : "Video Course"}
          </span>
        </div>

        <h4 className="text-base font-bold text-slate-900 leading-snug">
          {resource.title}
        </h4>

        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {resource.description}
        </p>

        <div className="flex flex-wrap gap-1.5 pt-1">
          <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
            {resource.difficulty}
          </span>
          <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
            {resource.language}
          </span>
          <span className="rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
            100% Free YouTube
          </span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-400 font-medium">
          Source: {resource.source}
        </span>
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-red-600 hover:text-red-800 transition-colors flex items-center gap-1"
        >
          Watch on YouTube ↗
        </a>
      </div>
    </div>
  );
};
