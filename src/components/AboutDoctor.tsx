import React, { useState, useRef } from 'react';
import { 
  Award, 
  CheckCircle2, 
  GraduationCap, 
  Target, 
  Heart, 
  Sparkles, 
  Brain,
  Stethoscope,
  Activity,
  Camera,
  RefreshCw,
  UploadCloud,
  X,
  Link,
  Check,
  Image as ImageIcon
} from 'lucide-react';
import { Doctor, ClinicInfo } from '../types';

interface AboutDoctorProps {
  doctor: Doctor;
  clinicInfo: ClinicInfo;
  onOpenBooking: () => void;
  onDoctorUpdated?: (doctor: Doctor) => void;
}

const CURATED_SPECIALIST_PHOTOS = [
  {
    id: 'curated-1',
    title: 'Clinical Lab Coat & Stethoscope',
    subtitle: 'Warm professional portrait with stethoscope',
    url: 'https://images.unsplash.com/photo-1594824813624-912f7a0ce733?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'curated-2',
    title: 'Consultation & Clinic Setting',
    subtitle: 'Rehabilitation consultation room backdrop',
    url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'curated-3',
    title: 'Specialist Doctor Portrait',
    subtitle: 'Crisp medical portrait in healthcare facility',
    url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'curated-4',
    title: 'Senior Neuro Specialist',
    subtitle: 'Modern advanced clinical environment',
    url: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=800'
  }
];

export const AboutDoctor: React.FC<AboutDoctorProps> = ({ doctor, clinicInfo, onOpenBooking, onDoctorUpdated }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [selectedCuratedUrl, setSelectedCuratedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const applyPhotoChange = async (payload: { imageBase64?: string; imageUrl?: string; filename?: string }) => {
    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const res = await fetch('/api/admin/upload-doctor-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Failed to update specialist photo');
      }

      const data = await res.json();
      if (data.doctor && onDoctorUpdated) {
        onDoctorUpdated(data.doctor);
      }
      setUploadSuccess(true);
      setIsPhotoModalOpen(false);
      setTimeout(() => setUploadSuccess(false), 4500);
    } catch (err: any) {
      console.error('Error uploading doctor photo:', err);
      setUploadError(err.message || 'Error updating photo');
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please choose a valid image file (JPEG, PNG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image file is too large (max 5MB). Please choose a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      await applyPhotoChange({ imageBase64: base64Data, filename: file.name });
    };
    reader.onerror = () => {
      setUploadError('Failed to read file from your device.');
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;
    await applyPhotoChange({ imageUrl: customUrlInput.trim() });
  };

  const handleSelectCurated = async (url: string) => {
    setSelectedCuratedUrl(url);
    await applyPhotoChange({ imageUrl: url });
  };

  return (
    <section id="about" className="py-20 bg-slate-50/50 backdrop-blur-sm relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Title Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/80 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-100/80 backdrop-blur-sm shadow-sm">
            <Stethoscope className="w-4 h-4 text-blue-600" />
            <span>About Clinic & Specialist</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Krishnaveni Advanced Physiotherapy & Rehabilitation Services
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            Dedicated to restoring mobility, independence, and comfort through world-class physiotherapy care for neurological, orthopaedic, joint, spine, sports, post-surgical, and women's health cases.
          </p>
        </div>

        {/* Doctor Main Profile Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-white/60 backdrop-blur-xl rounded-[32px] p-8 sm:p-12 shadow-2xl shadow-blue-900/5 border border-white/60 relative overflow-hidden">
          
          {/* Left Column: Doctor Photo & Badges */}
          <div className="lg:col-span-5 space-y-6">
            <div className="relative mx-auto max-w-md group">
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-[32px] blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
              
              <div className="relative rounded-3xl overflow-hidden border-4 border-white shadow-2xl bg-slate-950">
                {/* Change / Replace Photo Action Button */}
                <div className="absolute top-4 right-4 z-20">
                  <button
                    type="button"
                    onClick={() => setIsPhotoModalOpen(true)}
                    className="bg-white/95 hover:bg-white text-slate-900 hover:text-blue-700 text-xs font-extrabold px-3.5 py-2 rounded-full shadow-lg backdrop-blur-md border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer group/btn"
                    title="Click to replace with new doctor photo or choose curated photo"
                  >
                    <Camera className="w-4 h-4 text-blue-600 group-hover/btn:scale-110 transition-transform" />
                    <span>Replace Photo</span>
                  </button>
                </div>

                {/* Upload notification banner */}
                {uploadSuccess && (
                  <div className="absolute top-4 left-4 z-20 bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 animate-bounce">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Specialist photo updated!</span>
                  </div>
                )}

                {uploadError && (
                  <div className="absolute top-4 left-4 z-20 bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                    <span>{uploadError}</span>
                  </div>
                )}

                <img
                  src={doctor.avatarUrl || '/api/doctor-photo'}
                  alt={doctor.name}
                  className="w-full h-[460px] object-cover object-top hover:scale-[1.02] transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-transparent p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold">{doctor.name}</h3>
                      <p className="text-cyan-300 font-semibold text-sm">{doctor.qualification}</p>
                      <p className="text-xs text-slate-300 mt-1">{doctor.title}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Helper under Photo */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(true)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Replace or update Dr. P. Sai Tejaswini's photo</span>
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl p-4 text-center shadow-md shadow-blue-900/5">
                <p className="text-2xl font-black text-blue-700">{doctor.experienceYears}+ Years</p>
                <p className="text-xs font-semibold text-slate-600 uppercase mt-0.5">Clinical Experience</p>
              </div>
              <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl p-4 text-center shadow-md shadow-cyan-900/5">
                <p className="text-xl font-black text-cyan-700">MPT (Neuro), MIAP</p>
                <p className="text-xs font-semibold text-slate-600 uppercase mt-0.5">Post Graduation</p>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Bio & Qualifications */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-blue-700 font-bold text-sm tracking-wide uppercase mb-1">
                <Brain className="w-5 h-5 text-cyan-600" />
                <span>Chief Physiotherapist & Rehab Specialist</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {doctor.name}
              </h3>
              <p className="text-sm font-semibold text-blue-600 mt-1">
                {doctor.specialization}
              </p>
            </div>

            <p className="text-slate-600 text-base leading-relaxed">
              {doctor.bio}
            </p>

            {/* Key Qualifications */}
            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span>Qualifications & Accreditations</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  'Master of Physiotherapy - MPT (Neurology)',
                  'Member of Indian Association of Physiotherapists (MIAP)',
                  'Bachelor of Physiotherapy - BPT',
                  'Certified Bobath Technique Practitioner',
                  'Certified Taping Practitioner',
                  'Proprioceptive Neuromuscular Facilitation (PNF)',
                  'Spinal Decompression & Manual Therapy'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white/70 backdrop-blur-md p-3 rounded-2xl border border-white/60 shadow-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mission & Vision */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200/60">
              <div className="bg-slate-950/90 backdrop-blur-md text-white rounded-2xl p-5 space-y-1.5 shadow-lg border border-white/10">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Target className="w-4 h-4" />
                  <span>Our Mission</span>
                </div>
                <p className="text-xs text-slate-300 leading-normal">
                  Every patient deserves hope, healing and the highest standard of care. Healing begins with trust. Our mission is to provide the highest quality of physiotherapy treatment with compassion, excellence, and integrity while ensuring the exceptional care remains accessible and affordable to all. We are dedicated to helping every patient recover with confidence, dignity and hope.
                </p>
              </div>

              <div className="bg-blue-950/90 backdrop-blur-md text-white rounded-2xl p-5 space-y-1.5 shadow-lg border border-white/10">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                  <Heart className="w-4 h-4" />
                  <span>Our Vision</span>
                </div>
                <p className="text-xs text-blue-100 leading-normal">
                  To be the premier rehabilitation destination for physical rehabilitation and online physiotherapy consultations.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-2">
              <button
                onClick={onOpenBooking}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3.5 rounded-2xl shadow-xl shadow-blue-200 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Activity className="w-4 h-4" />
                <span>Schedule Online Consultation with Dr. Tejaswini</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* REPLACE PHOTO MODAL */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Replace Specialist Doctor Photo</h3>
                  <p className="text-xs text-slate-500">Update Dr. P. Sai Tejaswini's portrait in About Clinic & Specialist</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Option 1: Upload from Device */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <UploadCloud className="w-4 h-4 text-blue-600" />
                  Option 1: Upload from Your Device (Computer / Phone)
                </h4>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/50 rounded-2xl p-6 text-center transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-slate-200 text-blue-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                    <Camera className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-800">Click to Browse and Select a New Photo File</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Supports high-resolution JPEG, PNG, WEBP (up to 5MB)</p>
                  {uploading && (
                    <div className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-blue-600">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Uploading & saving to clinic server...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Option 2: Choose Curated Portraits */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-emerald-600" />
                  Option 2: Instant 1-Click Curated Specialist Portraits
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {CURATED_SPECIALIST_PHOTOS.map((item) => {
                    const isSelected = doctor.avatarUrl === item.url || selectedCuratedUrl === item.url;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectCurated(item.url)}
                        className={`group relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all shadow-sm ${
                          isSelected
                            ? 'border-emerald-500 ring-2 ring-emerald-400 ring-offset-2'
                            : 'border-slate-200 hover:border-blue-400'
                        }`}
                      >
                        <img
                          src={item.url}
                          alt={item.title}
                          className="w-full h-32 object-cover object-top group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                        <div className="p-2 bg-white text-[11px]">
                          <p className="font-bold text-slate-900 truncate">{item.title}</p>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-emerald-600 text-white rounded-full p-1 shadow-md">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Option 3: Enter Image URL */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Link className="w-4 h-4 text-purple-600" />
                  Option 3: Paste Direct Image URL
                </h4>
                <form onSubmit={handleApplyUrl} className="flex gap-2">
                  <input
                    type="url"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    placeholder="https://example.com/doctor-photo.jpg"
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={uploading || !customUrlInput.trim()}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                  >
                    Apply URL
                  </button>
                </form>
              </div>

              {uploadError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
                  {uploadError}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
              <span className="text-slate-500">Changes update live across the entire website.</span>
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
              >
                Done / Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
