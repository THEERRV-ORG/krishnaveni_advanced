import React from 'react';

const STEPS = [
  {
    title: 'Book a slot',
    body: "Choose a date and time and describe what's troubling you. Attach any scans, X-rays or reports you have.",
  },
  {
    title: 'Video consultation',
    body: 'Forty-five minutes on Google Meet with Dr. Tejaswini: your history, a movement assessment on camera, and a reading of your reports.',
  },
  {
    title: 'Home exercise plan',
    body: 'You leave with a written programme to follow at home, and follow-up sessions to progress it when you are ready.',
  },
];

const CHECKLIST = [
  'Loose, comfortable clothing',
  'A clear space about two metres long',
  'Phone or laptop propped up so your whole body is in view',
  'Your scans or reports, if you have them',
];

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-16 sm:py-24 scroll-mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <span className="band mb-5" />
        <h2 className="text-3xl sm:text-4xl text-ink">How a consultation works</h2>

        <ol className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {STEPS.map((step, idx) => (
            <li key={step.title} className="md:border-l md:border-line md:pl-6 first:md:border-l-0 first:md:pl-0">
              <span className="font-serif text-5xl text-primary leading-none">{idx + 1}</span>
              <h3 className="mt-4 text-xl text-ink">{step.title}</h3>
              <p className="mt-2 text-ink-soft leading-relaxed">{step.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-14 bg-primary-wash rounded-md p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6">
          <h3 className="md:col-span-4 text-xl text-ink">What to have ready</h3>
          <ul className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-ink">
            {CHECKLIST.map(item => (
              <li key={item} className="flex gap-3">
                <span aria-hidden className="mt-2.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
