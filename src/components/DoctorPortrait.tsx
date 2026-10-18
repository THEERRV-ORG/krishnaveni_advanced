import React from 'react';
import { Doctor } from '../types';

interface DoctorPortraitProps {
  doctor: Doctor;
  className?: string;
}

// Only a photo uploaded by the clinic (served from /api/doctor-photo) is shown; never a stock image.
function hasClinicPhoto(doctor: Doctor): boolean {
  return Boolean(doctor.avatarUrl && doctor.avatarUrl.startsWith('/api/doctor-photo'));
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

export const DoctorPortrait: React.FC<DoctorPortraitProps> = ({ doctor, className = '' }) => {
  if (hasClinicPhoto(doctor)) {
    return (
      <img
        src={doctor.avatarUrl}
        alt={`Portrait of ${doctor.name}`}
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
