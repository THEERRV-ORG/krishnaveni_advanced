import React, { useState } from 'react';
import { Star, Quote, User, ThumbsUp, PlusCircle } from 'lucide-react';
import { Testimonial } from '../types';

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ testimonials }) => {
  const [items, setItems] = useState<Testimonial[]>(testimonials);
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [treatment, setTreatment] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleAddTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !comment) return;

    const newTestimonial: Testimonial = {
      id: 'test-' + Date.now(),
      patientName: name,
      patientAge: 35,
      treatment: treatment || 'Physiotherapy Treatment',
      rating,
      comment,
      date: new Date().toISOString().split('T')[0]
    };

    setItems([newTestimonial, ...items]);
    setShowAddForm(false);
    setName('');
    setTreatment('');
    setComment('');
  };

  return (
    <section id="testimonials" className="py-20 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider">
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>Patient Experiences & Outcomes</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Stories of Recovery & Hope
          </h2>
          <p className="text-slate-600 text-base">
            Read how personalized evidence-based physical therapy with Dr. P. Sai Tejaswini has restored mobility, independence, and comfort for our patients.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {items.map((t) => (
            <div
              key={t.id}
              className="bg-white/80 backdrop-blur-xl border border-slate-200/90 rounded-[28px] p-7 shadow-xl shadow-blue-900/5 hover:shadow-2xl hover:bg-white transition-all duration-300 space-y-4 relative flex flex-col justify-between group"
            >
              <Quote className="w-10 h-10 text-blue-100 group-hover:text-blue-200 transition-colors absolute top-6 right-6 -z-0" />

              <div className="space-y-3 relative z-10">
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < t.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                    />
                  ))}
                </div>

                <p className="text-slate-700 text-sm leading-relaxed italic">
                  "{t.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                {t.photoUrl ? (
                  <img
                    src={t.photoUrl}
                    alt={t.patientName}
                    className="w-11 h-11 rounded-full object-cover border-2 border-blue-500 shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                    {t.patientName.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{t.patientName}</h4>
                  <p className="text-xs text-blue-600 font-semibold">{t.treatment}</p>
                  <p className="text-[10px] text-slate-400">{t.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="text-center">
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs px-6 py-3 rounded-full shadow-md border border-slate-200/80 transition-all"
            >
              <PlusCircle className="w-4 h-4 text-blue-600" />
              <span>Share Your Recovery Experience</span>
            </button>
          ) : (
            <form onSubmit={handleAddTestimonial} className="max-w-lg mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-xl text-left space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Share Your Experience</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Treatment Received</label>
                  <input
                    type="text"
                    value={treatment}
                    onChange={(e) => setTreatment(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Rating</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value={5}>5 Stars ★★★★★</option>
                  <option value={4}>4 Stars ★★★★☆</option>
                  <option value={3}>3 Stars ★★★☆☆</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Feedback</label>
                <textarea
                  rows={3}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white font-bold text-xs px-5 py-2 rounded-full shadow hover:bg-blue-700 transition-all"
                >
                  Submit Testimonial
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </section>
  );
};
