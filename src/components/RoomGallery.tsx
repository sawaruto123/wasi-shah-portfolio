import React from 'react';
import { useContent } from '../lib/content';
import { thumbUrl } from '../lib/image';
import { Project } from '../types';

interface RoomGalleryProps {
  onSelectProject: (project: Project) => void;
}

export const RoomGallery: React.FC<RoomGalleryProps> = ({ onSelectProject }) => {
  const { projects } = useContent();
  return (
    <section
      id="room-gallery"
      className="room-anchor min-h-[120vh] flex flex-col justify-start px-5 sm:px-8 lg:px-12 max-w-[1720px] mx-auto pt-24 pb-28 md:pb-20"
    >
      <div className="flex items-center gap-3 mb-8">
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 border border-border-crisp font-mono text-[11px] font-bold text-ink">
          <span className="w-2 h-2 rounded-full bg-accent-orange" />
          03 · ARCHIVE
        </span>
        <div className="h-px flex-1 bg-border-crisp" />
      </div>

      <h2 className="font-display text-4xl sm:text-6xl font-black uppercase text-ink tracking-tight mb-10">
        Archive
      </h2>

      {/* 影像卡浮動網格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {projects.map((project) => (
          <article
            key={project.id}
            onClick={() => onSelectProject(project)}
            className="group relative rounded-3xl overflow-hidden spatial-card cursor-pointer"
          >
            <div className="relative w-full h-64 overflow-hidden">
              <img
                src={thumbUrl(project.image, 700, 450)}
                alt={project.title}
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#11263F]/85 via-[#11263F]/10 to-transparent" />
              <span className="absolute top-3 left-4 font-display text-lg font-black text-white/80">
                #{project.expNumber}
              </span>
              <div className="absolute bottom-3 inset-x-4">
                <h3 className="font-display text-lg font-bold text-white leading-tight">
                  {project.title}
                </h3>
                <span className="font-mono text-[10px] uppercase tracking-wider text-white/70">
                  {project.tag}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
