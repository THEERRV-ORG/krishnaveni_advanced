import React from 'react';
import { 
  Award, 
  ShieldCheck, 
  Video, 
  Wallet, 
  HeartHandshake, 
  Users, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  const reasons = [
    {
      icon: Award,
      title: 'Expert Physiotherapist',
      desc: 'Led by Dr. P. Sai Tejaswini, MPT (Neuro), MIAP with 4 years of clinical excellence providing comprehensive care for all physical, orthopaedic, and neurological conditions.'
    },
    {
      icon: Video,
      title: 'Online Video Consultations',
      desc: 'Consult from the comfort of your home with Google Meet / Zoom HD links, posture evaluation, and digital prescriptions.'
    },
    {
      icon: Wallet,
      title: 'Affordable & Transparent Pricing',
      desc: 'No hidden charges. Transparent pricing for all physiotherapy treatments and consultations with full GST compliant tax receipts.'
    },
    {
      icon: ShieldCheck,
      title: '100% Secure Razorpay Payment',
      desc: 'Instant booking confirmation via Card, UPI, and NetBanking with automated invoice receipts & refund support.'
    },
    {
      icon: HeartHandshake,
      title: 'Certified Rehabilitation Center',
      desc: 'Equipped with modern electrotherapy, tilt tables, Bobath neuro-rehab equipment, and home-visit mobile care units.'
    },
    {
      icon: Users,
      title: 'High Patient Recovery Rate',
      desc: 'Over 5,000+ satisfied patients across Hyderabad, Secunderabad, and online consultations worldwide.'
    }
  ];

  return (
    <section className="py-20 bg-slate-950/80 backdrop-blur-md text-white border-y border-white/10 relative overflow-hidden z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Excellence in Physical Care</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Why Choose Krishnaveni Advanced Physiotherapy & Rehabilitation Services?
          </h2>
          <p className="text-slate-300 text-base">
            We merge advanced neurological science with human empathy to deliver transformative recovery outcomes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reasons.map((r, idx) => {
            const Icon = r.icon;
            return (
              <div
                key={idx}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 hover:border-cyan-400/40 hover:bg-white/10 transition-all duration-300 space-y-4 group hover:-translate-y-1 shadow-2xl shadow-slate-950/50"
              >
                <div className="w-12 h-12 rounded-2xl bg-cyan-400/20 text-cyan-300 flex items-center justify-center group-hover:scale-110 group-hover:bg-cyan-400 group-hover:text-slate-950 transition-all border border-cyan-400/30">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {r.title}
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {r.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
