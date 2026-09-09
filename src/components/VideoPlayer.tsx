import React from 'react';

interface VideoPlayerProps {
  url: string;
  className?: string;
  title?: string;
}

/**
 * 智慧影片播放器：YouTube / Vimeo 用 iframe 嵌入，直接影片檔用 <video>。
 */
export const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, className = '', title = 'Video' }) => {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  const vimeo = url.match(/vimeo\.com\/(\d+)/);

  if (yt) {
    return (
      <div className={`relative w-full aspect-video ${className}`}>
        <iframe
          src={`https://www.youtube.com/embed/${yt[1]}`}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title={title}
        />
      </div>
    );
  }

  if (vimeo) {
    return (
      <div className={`relative w-full aspect-video ${className}`}>
        <iframe
          src={`https://player.vimeo.com/video/${vimeo[1]}`}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; fullscreen"
          allowFullScreen
          title={title}
        />
      </div>
    );
  }

  return (
    <video src={url} controls preload="metadata" className={`w-full ${className}`}>
      Your browser does not support the video tag.
    </video>
  );
};
