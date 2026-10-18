import React, { useState } from 'react';
import { 
  Video, 
  Phone, 
  Mail, 
  MessageSquare, 
  Clock, 
  Send, 
  CheckCircle2, 
  Globe2,
  ShieldCheck,
  Headphones
} from 'lucide-react';
import { ClinicInfo } from '../types';

interface ContactSectionProps {
  clinicInfo: ClinicInfo;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ clinicInfo }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !message) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    }, 4000);
  };

  return (
    <section id="contact" className="py-20 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/80 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-100/80 backdrop-blur-sm shadow-sm">
            <Headphones className="w-4 h-4 text-blue-600" />
            <span>Online Tele-Consultation Support</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Connect with Dr. P. Sai Tejaswini
          </h2>
          <p className="text-slate-600 text-base">
            Reach out directly for 100% online video consultation inquiries, digital exercise prescription queries, or medical scan reviews.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Online Contact & WhatsApp Cards */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-[32px] p-6 sm:p-8 shadow-xl shadow-blue-900/5 space-y-5">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200/60 pb-3 flex items-center gap-2">
                <Video className="w-5 h-5 text-blue-600" />
                <span>Online Tele-Rehab Channels</span>
              </h3>

              <div className="space-y-4 text-xs text-slate-700">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-900">WhatsApp Quick Consultation:</p>
                    <a
                      href={`https://wa.me/919490605809?text=Hello%20Dr.%20Sai%20Tejaswini,%20I%20would%20like%20to%20inquire%20about%20an%20online%20physiotherapy%20consultation`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-600 font-bold hover:underline flex items-center gap-1 mt-0.5"
                    >
                      Click to Chat on WhatsApp (+91 94906 05809)
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-900">Email Address:</p>
                    <a href="mailto:krishnavenirehab@gmail.com" className="text-blue-600 font-bold hover:underline mt-0.5 block">
                      krishnavenirehab@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-900">Direct Consultation Phone:</p>
                    <a href={`tel:${clinicInfo.phone}`} className="text-blue-600 font-bold hover:underline mt-0.5 block">
                      {clinicInfo.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2 border-t border-slate-200/60">
                  <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900">Consultation Timings:</p>
                    <p className="text-slate-600 mt-0.5">{clinicInfo.workingHours}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2 border-t border-slate-200/60">
                  <Globe2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900">Consultation Mode:</p>
                    <p className="text-slate-600 mt-0.5">100% Online Google Meet Video Consultations across India and International patients.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Online Benefits Card */}
            <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white rounded-[32px] p-6 shadow-xl space-y-3 border border-white/10">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Purely Online Physiotherapy</span>
              </div>
              <p className="text-sm font-bold text-white">Why Online Tele-Rehab?</p>
              <p className="text-xs text-slate-300 leading-relaxed">
                Skip clinic travel and waiting rooms. Dr. P. Sai Tejaswini conducts full movement assessments, posture analysis, guided exercise rehabilitation, and progress tracking remotely over encrypted video calls.
              </p>
            </div>

          </div>

          {/* Right Column: Direct Message Form */}
          <div className="lg:col-span-7">
            <div className="bg-white/70 backdrop-blur-2xl border border-white/80 rounded-[32px] p-8 shadow-2xl shadow-blue-950/5 space-y-6">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Send Direct Message to Dr. Tejaswini</h3>
                <p className="text-xs text-slate-500 mt-1">Have a medical question, pain condition, or scan review request? Submit your query below.</p>
              </div>

              {submitted ? (
                <div className="bg-emerald-50/80 border border-emerald-200 backdrop-blur-md p-6 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <p className="text-base font-bold text-emerald-900">Message Received!</p>
                  <p className="text-xs text-slate-600">Dr. Sai Tejaswini's team will get back to you via Email or WhatsApp shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Your Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white/90 border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Phone / WhatsApp Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-white/90 border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/90 border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Message / Pain & Symptom Inquiry *</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Describe your symptoms, pain issues, or question for Dr. P. Sai Tejaswini..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full bg-white/90 border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-4 rounded-full shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Message to Dr. Sai Tejaswini</span>
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
