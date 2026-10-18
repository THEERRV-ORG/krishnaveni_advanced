import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Sparkles, 
  Activity, 
  ShieldCheck, 
  Info,
  X,
  Stethoscope,
  Video,
  Brain,
  Heart,
  Trophy,
  Smile,
  Wind,
  ChevronRight
} from 'lucide-react';
import { DepartmentInfo } from '../types';
import { CLINICAL_DEPARTMENTS } from '../data/departmentsData';

interface ServicesGridProps {
  onOpenBooking?: (preloadedIssue?: string) => void;
}

export const ServicesGrid: React.FC<ServicesGridProps> = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeDept, setActiveDept] = useState<DepartmentInfo | null>(null);

  const categories = [
    'All',
    'Neuro',
    'Ortho',
    'Post-Op',
    'Sports',
    'Gynae',
    'Cardiology & Pulmonology'
  ];

  const filteredDepts = selectedCategory === 'All'
    ? CLINICAL_DEPARTMENTS
    : CLINICAL_DEPARTMENTS.filter(d => 
        d.shortCode.toLowerCase().includes(selectedCategory.toLowerCase()) || 
        d.name.toLowerCase().includes(selectedCategory.toLowerCase())
      );

  const getIconForDept = (iconName: string) => {
    switch (iconName) {
      case 'Brain': return <Brain className="w-5 h-5" />;
      case 'Activity': return <Activity className="w-5 h-5" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5" />;
      case 'Heart': return <Heart className="w-5 h-5" />;
      case 'Trophy': return <Trophy className="w-5 h-5" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5" />;
      case 'Smile': return <Smile className="w-5 h-5" />;
      case 'Wind': return <Wind className="w-5 h-5" />;
      default: return <Stethoscope className="w-5 h-5" />;
    }
  };

  return (
    <section id="services" className="py-20 relative z-10 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/90 text-blue-700 text-xs font-black uppercase tracking-wider border border-blue-100 shadow-xs">
            <Stethoscope className="w-4 h-4 text-blue-600" />
            <span>Clinical Rehabilitation Departments</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            What We Treat Across Clinical Departments
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Detailed clinical scope and specialized physiotherapy protocols managed by <span className="font-bold text-blue-700">Dr. P. Sai Tejaswini, MPT (Neuro), MIAP</span>. Click any department below to view full conditions treated, symptoms, and examination procedures.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-10 p-2 bg-white rounded-full border border-slate-200 max-w-fit mx-auto shadow-sm">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-blue-600'
              }`}
            >
              {cat === 'All' ? 'All Departments' : cat}
            </button>
          ))}
        </div>

        {/* Department Cards Grid - Pure Clinical Presentation of What We Treat */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {filteredDepts.map((dept) => (
            <div
              key={dept.id}
              onClick={() => setActiveDept(dept)}
              className="bg-white border border-slate-200/90 rounded-[28px] overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-300 hover:-translate-y-1 transition-all duration-300 flex flex-col group cursor-pointer"
            >
              {/* Image Banner */}
              <div className="relative h-48 overflow-hidden bg-slate-100">
                <img
                  src={dept.imageUrl}
                  alt={dept.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/25 to-transparent" />
                
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md text-slate-900 text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1.5">
                  <span className="text-blue-600">{getIconForDept(dept.iconName)}</span>
                  <span>{dept.shortCode}</span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <p className="text-xs text-cyan-300 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>Clinical Department</span>
                  </p>
                  <h3 className="text-lg font-black leading-snug drop-shadow-sm text-white">
                    {dept.name}
                  </h3>
                </div>
              </div>

              {/* Card Body - Focused on What We Treat */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                
                <div className="space-y-3">
                  <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-2">
                    {dept.tagline}
                  </p>

                  {/* Conditions List */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Key Conditions Treated:</span>
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {dept.whatWeTreat.map((cond, cIdx) => (
                        <span
                          key={cIdx}
                          className="bg-slate-50 hover:bg-blue-50 text-slate-800 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-slate-200/80 transition-colors"
                        >
                          {cond.condition}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* View Details Action */}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDept(dept);
                    }}
                    className="w-full bg-slate-900 group-hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
                  >
                    <Info className="w-4 h-4 text-cyan-400" />
                    <span>View Conditions & Protocols</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Comprehensive Department Detail & "What We Treat" Reference Modal */}
      {activeDept && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
          <div className="bg-white max-w-4xl w-full rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-6 max-h-[92vh] flex flex-col">
            
            {/* Modal Header Banner */}
            <div className="relative bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 p-6 sm:p-8 text-white shrink-0">
              <button
                onClick={() => setActiveDept(null)}
                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="bg-blue-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  {activeDept.shortCode}
                </span>
                <span className="bg-emerald-500/90 text-white text-xs font-extrabold px-3 py-1 rounded-full">
                  Dr. P. Sai Tejaswini, MPT (Neuro), MIAP
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {activeDept.name}
              </h3>
              <p className="text-xs sm:text-sm text-cyan-200 mt-1 font-medium max-w-2xl">
                {activeDept.tagline}
              </p>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-6 sm:p-8 space-y-8 overflow-y-auto flex-1">
              
              {/* Department Overview */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-blue-900 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-blue-600" />
                  <span>Clinical Department Overview</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {activeDept.overview}
                </p>
              </div>

              {/* WHAT WE TREAT - Detailed Conditions Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <h4 className="text-base sm:text-lg font-black text-slate-900">
                      Conditions Treated in {activeDept.name}
                    </h4>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeDept.whatWeTreat.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-slate-200 hover:border-blue-400 rounded-2xl p-4 space-y-2 shadow-xs transition-all"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0 mt-1.5 ring-4 ring-blue-100" />
                        <div>
                          <h5 className="font-black text-slate-900 text-sm">
                            {item.condition}
                          </h5>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {/* Key Symptoms Tag List */}
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                        {item.keySymptoms.map((sym, sIdx) => (
                          <span
                            key={sIdx}
                            className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-md"
                          >
                            • {sym}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CONSULTATION PROTOCOL - What to Expect */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                    <Video className="w-4 h-4" />
                  </div>
                  <h4 className="text-base sm:text-lg font-black text-slate-900">
                    Clinical Examination & Video Consultation Steps:
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {activeDept.consultationProtocol.map((proto, pIdx) => (
                    <div key={pIdx} className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-3.5 space-y-1">
                      <p className="text-xs font-black text-emerald-950">{proto.step}</p>
                      <p className="text-xs text-slate-700 leading-relaxed">{proto.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expert Clinical Guidelines */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 space-y-2">
                <p className="text-xs font-black text-blue-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Dr. P. Sai Tejaswini's Specialist Clinical Guidance:</span>
                </p>
                <ul className="space-y-1 text-xs text-slate-700 list-disc list-inside">
                  {activeDept.expertGuidance.map((guide, gIdx) => (
                    <li key={gIdx}>{guide}</li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Modal Action Footer - Clean Medical Close */}
            <div className="bg-slate-900 p-4 sm:p-5 flex items-center justify-between gap-3 text-white shrink-0">
              <p className="text-xs text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>All consultations are conducted directly by Dr. P. Sai Tejaswini via the Appointment Booking portal.</span>
              </p>

              <button
                type="button"
                onClick={() => setActiveDept(null)}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors shrink-0"
              >
                Close Reference
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
