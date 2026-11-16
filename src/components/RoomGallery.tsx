import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useContent } from '../lib/content';
import { thumbUrl } from '../lib/image';
import { SmartImage } from './SmartImage';
import { RoomHeading } from './RoomHeading';
import { Project } from '../types';

interface RoomGalleryProps {
  onSelectProject: (project: Project) => void;
}

const ProjectCard: React.FC<{ project: Project; onSelect: () => void }> = ({ project, onSelect }) => (
  <button type="button" onClick={onSelect} data-tour="card" className="project-card group" aria-label={`View project: ${project.title}`}>
    <div className="relative w-full aspect-[16/10] overflow-hidden">
      <SmartImage
        src={thumbUrl(project.image, 800, 500)}
        alt={project.title}
        className="absolute inset-0"
        imgClassName="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
      />
      <span className="media-label absolute top-4 left-4">{project.expNumber.padStart(2, '0')}</span>
      {(project.images?.length ?? 0) > 1 && (
        <span className="media-label absolute top-4 right-4">{project.images!.length} images</span>
      )}
    </div>
    <div className="card-caption">
      <div className="min-w-0">
        <p className="card-eyebrow">{project.tag}</p>
        <h3>{project.title}</h3>
      </div>
      <ArrowUpRight className="card-arrow" size={19} aria-hidden="true" />
    </div>
  </button>
);

export const RoomGallery: React.FC<RoomGalleryProps> = ({ onSelectProject }) => {
  const { projects } = useContent();
  return (
    <section id="room-gallery" className="room-anchor">
      <RoomHeading number="03" label="Archive" title="Selected work." description="Projects across design, creative code and experimentation." />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6">
        {projects.map((project) => <ProjectCard key={project.id} project={project} onSelect={() => onSelectProject(project)} />)}
      </div>
    </section>
  );
};
