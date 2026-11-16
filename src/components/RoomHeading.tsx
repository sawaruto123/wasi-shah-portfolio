import React from 'react';

interface RoomHeadingProps {
  number: string;
  label: string;
  title?: string;
  description?: string;
}

export const RoomHeading: React.FC<RoomHeadingProps> = ({ number, label, title, description }) => (
  <header className="room-heading">
    <div className="room-marker">
      <span className="room-marker-number">{number}</span>
      <span>{label}</span>
      <span className="room-marker-line" aria-hidden="true" />
    </div>
    {title && <h2 className="section-heading">{title}</h2>}
    {description && <p className="section-description">{description}</p>}
  </header>
);
