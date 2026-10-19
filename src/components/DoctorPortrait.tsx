import React from 'react';
import { Doctor } from '../types';

interface DoctorPortraitProps {
  doctor: Doctor;
  className?: string;
  /** Stand-in image shown until the clinic uploads a photo; without it, initials are shown. */
  placeholderSrc?: string;
}

// A photo uploaded by the clinic from the admin dashboard always wins over any placeholder.
function hasClinicPhoto(doctor: Doctor): boolean {
  return Boolean(doctor.avatarUrl && doctor.avatarUrl.startsWith('data:image/'));
}

function initials(name: string): string {
  return name
    .replace(/^Dr\.?\s*/i, '')
    .split(/\s+/)
    .filter(part => part.length > 1)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join('');
}

export const DoctorPortrait: React.FC<DoctorPortraitProps> = ({ doctor, className = '', placeholderSrc }) => {
  if (hasClinicPhoto(doctor)) {
    return (
      <img
        src={doctor.avatarUrl}
        alt={`Portrait of ${doctor.name}`}
        className={`object-cover object-top bg-paper-deep ${className}`}
      />
    );
  }

  if (placeholderSrc) {
    return (
      <img
        src={placeholderSrc}
        alt={`${doctor.name} — photo coming soon`}
        className={`object-cover object-top bg-paper-deep ${className}`}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={`${doctor.name} — photo coming soon`}
      className={`bg-primary-deep text-paper flex items-center justify-center ${className}`}
    >
      <span className="font-serif text-6xl tracking-wide opacity-90">{initials(doctor.name)}</span>
    </div>
  );
};
