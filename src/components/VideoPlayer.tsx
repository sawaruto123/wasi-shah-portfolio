import React from 'react';
import { getVideoEmbed } from '../lib/video';

interface VideoPlayerProps {
  url: string;
  className?: string;
  title?: string;
}

/**
 * 智慧影片播放器：YouTube / Vimeo 用 iframe 嵌入，直接影片檔用 <video>。
 */
export const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, className = '', title = 'Video' }) => {
  const embed = getVideoEmbed(url);

  if (!embed) return null;

  if (embed.type === 'youtube' || embed.type === 'vimeo') {
    return (
      <div className={`relative w-full aspect-video ${className}`}>
        <iframe
          src={embed.src}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title={title}
        />
      </div>
    );
  }

  return (
    <video src={embed.src} controls preload="metadata" className={`w-full ${className}`}>
      Your browser does not support the video tag.
    </video>
  );
};
