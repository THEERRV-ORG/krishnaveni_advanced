import { ClinicInfo, Doctor, Service, Testimonial, GalleryItem, BlogPost, FAQItem, Appointment, DaySchedule } from '../types';

export const INITIAL_CLINIC_INFO: ClinicInfo = {
  name: 'Krishnaveni Advanced Physiotherapy & Rehabilitation Services',
  doctorName: 'Dr. P. Sai Tejaswini',
  doctorTitle: 'MPT (Neuro), MIAP - Comprehensive Physiotherapy Specialist',
  phone: '+91 94906 05809',
  whatsapp: '+91 94906 05809',
  email: 'krishnavenirehab@gmail.com',
  address: '100% Online Tele-Rehabilitation & Video Consultations (Pan-India & Global)',
  workingHours: 'Monday - Saturday: 09:30 AM - 08:00 PM | Sunday: 09:30 AM - 01:00 PM (Prior Appointment)',
  googleMapsEmbed: '',
  gstin: '37AAAAA0000A1Z5',
  teleConsultationLink: 'https://meet.jit.si/KrishnaveniRehab_DrSaiTejaswini',
  upiId: '9490605809@axl'
};

export const INITIAL_DOCTOR: Doctor = {
  id: 'doc-01',
  name: 'Dr. P. Sai Tejaswini',
  title: 'Chief Physiotherapist & Rehabilitation Specialist',
  qualification: 'MPT (Neurology), BPT, MIAP, Certified Bobath, Taping & PNF Practitioner',
  specialization: 'Comprehensive Physiotherapy Care (Neurological, Orthopedic, Sports, Post-Op, Women’s Health, Cardiology & Pulmonology)',
  experienceYears: 4,
  bio: 'Dr. P. Sai Tejaswini is a highly respected Physiotherapist (MPT Neuro, MIAP) with 4 years of clinical excellence providing comprehensive, evidence-based physiotherapy care across specialized physical conditions—including neurological recovery, orthopaedic joint & spine pain, post-surgical rehabilitation, sports injuries, and women’s health. She provides personalized, evidence-based rehabilitation with all consultation and physical therapy sessions offered with transparent patient care.',
  avatarUrl: 'https://images.unsplash.com/photo-1594824813624-912f7a0ce733?auto=format&fit=crop&q=80&w=800',
  consultationFee: 1,
  availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  workingHours: '09:30 AM - 08:00 PM'
};

export const INITIAL_SERVICES: Service[] = [
  {
    id: 'srv-01',
    title: 'Neuro Consultation',
    category: 'Neuro',
    description: 'Specialist consultation for neurological conditions (Stroke, Paralysis, Parkinson’s, Cerebral Palsy, Neuropathy, Bell’s Palsy, Ataxia). Patient writes their specific symptoms, health issues, and uploads scans.',
    durationMinutes: 45,
    feeINR: 1,
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=600',
    highlights: ['Specialist Assessment by Dr. P. Sai Tejaswini', 'Personalized Rehabilitation Roadmap', 'Review of Attached Scans & Reports', 'Home Care & Exercise Prescription'],
    recommendedFor: ['Stroke & Paralysis', 'Parkinson’s Disease', 'Cerebral Palsy', 'Peripheral Neuropathy', 'Bell’s Palsy & Facial Weakness']
  },
  {
    id: 'srv-02',
    title: 'Ortho Consultation',
    category: 'Ortho',
    description: 'Specialist consultation for orthopedic, joint, spine, and musculoskeletal conditions (Back Pain, Sciatica, Disc Bulge, Neck Stiffness, Frozen Shoulder, Knee Pain). Patient writes their pain issues and uploads reports.',
    durationMinutes: 45,
    feeINR: 1,
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600',
    highlights: ['Spine & Joint Evaluation', 'Postural & Biomechanical Assessment', 'Review of X-rays & MRI Scans', 'Targeted Physical Therapy Protocol'],
    recommendedFor: ['Sciatica & Lumbar Disc Pain', 'Cervical Spondylosis & Neck Strain', 'Frozen Shoulder', 'Knee Osteoarthritis', 'Chronic Back Pain']
  },
  {
    id: 'srv-03',
    title: 'Gynic Consultation',
    category: 'Gynic',
    description: 'Specialist women’s health physiotherapy consultation for antenatal/postnatal care, pelvic floor muscle weakness, diastasis recti, and pregnancy-related pain. Patient writes their concerns in confidence and uploads records.',
    durationMinutes: 45,
    feeINR: 1,
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=600',
    highlights: ['Women’s Health & Pelvic Assessment', 'Safe Antenatal / Postnatal Guidance', 'Diastasis Recti Conditioning', 'Confidential Medical Review'],
    recommendedFor: ['Antenatal & Postnatal Care', 'Pelvic Floor Strengthening', 'Diastasis Recti', 'Pregnancy Back & Pelvic Pain', 'Post-Delivery Recovery']
  },
  {
    id: 'srv-04',
    title: 'Sports Consultation',
    category: 'Sports',
    description: 'Specialist sports injury evaluation, athletic rehab, certified kinesiology taping assessment, ligament injury recovery (ACL/MCL/Meniscus), and return-to-sport planning. Patient writes their athletic injury details and uploads reports.',
    durationMinutes: 45,
    feeINR: 1,
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600',
    highlights: ['Sports Injury Biomechanical Analysis', 'Certified Kinesio Taping Assessment', 'Ligament & Muscle Rehab Planning', 'Return-to-Play Conditioning'],
    recommendedFor: ['ACL, MCL & Meniscus Tears', 'Ankle & Wrist Sprains', 'Tennis & Golfer’s Elbow', 'Rotator Cuff Strains', 'Athletic Overuse Injuries']
  },
  {
    id: 'srv-05',
    title: 'Others Consultation',
    category: 'Others',
    description: 'Specialist consultation for general body aches, post-surgical rehabilitation (TKR, THR, Spine surgeries, Fractures), chronic pain syndromes, or custom movement rehabilitation. Patient writes their custom concerns and uploads reports.',
    durationMinutes: 45,
    feeINR: 1,
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=600',
    highlights: ['Post-Surgical Rehab Evaluation', 'Comprehensive Movement Analysis', 'Full-Body Pain Assessment', 'Personalized Exercise Roadmap'],
    recommendedFor: ['Post-Surgical Recovery (TKR / THR)', 'General Body & Joint Pains', 'Post-Trauma Mobility Care', 'Myofascial Pain Syndrome', 'Custom Rehabilitation Conditions']
  }
];

export const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    patientName: 'K. Venkat Rao',
    patientAge: 62,
    treatment: 'Stroke Recovery (Hemiplegia)',
    rating: 5,
    comment: 'After my ischemic stroke, I could hardly move my right arm. Dr. Sai Tejaswini’s dedicated Bobath techniques and constant encouragement brought back 90% of my arm movement in 3 months! Her online consultations were super convenient for weekly progress checks.',
    date: '2026-06-15',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'test-2',
    patientName: 'Sunitha Reddy',
    patientAge: 44,
    treatment: 'Cervical Spondylosis & Neck Stiffness',
    rating: 5,
    comment: 'Being an IT manager working 10 hours a day, severe neck radiation pain was affecting my life. Dr. Tejaswini diagnosed cervical nerve impingement and guided me through ergonomic exercises and online video sessions. Painless now!',
    date: '2026-07-02',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'test-3',
    patientName: 'M. Ramesh Babu',
    patientAge: 58,
    treatment: 'Post Knee Replacement (TKR)',
    rating: 5,
    comment: 'I booked online consultation video sessions with Dr. Tejaswini after my knee surgery. Highly professional guidance, genuine empathy, and systematic exercise demonstration over Google Meet. Best online physiotherapy service!',
    date: '2026-07-18',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
  }
];

export const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Clinic Reception & Waiting Lounge',
    category: 'Clinic',
    imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800',
    description: 'Clean, hygienic, air-conditioned waiting area with patient assistance desk.'
  },
  {
    id: 'gal-2',
    title: 'Advanced Neuro Rehab Arena',
    category: 'Equipment',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800',
    description: 'Equipped with tilt tables, parallel bars, body-weight support harness, and balance trainers.'
  },
  {
    id: 'gal-3',
    title: 'Dr. P. Sai Tejaswini in Consultation',
    category: 'Doctor',
    imageUrl: '/src/assets/images/doctor_sai_tejaswini_1785345975042.jpg',
    description: 'Dr. Tejaswini evaluating patient neuro motor responses during a clinical session.'
  },
  {
    id: 'gal-4',
    title: 'Gait & Balance Rehabilitation',
    category: 'Treatment',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800',
    description: 'Structured gait correction for stroke and spinal cord injury recovery.'
  },
  {
    id: 'gal-5',
    title: 'Electrotherapy & Pain Relief Unit',
    category: 'Equipment',
    imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800',
    description: 'Modern TENS, IFT, Ultrasound, and Class 4 Laser Therapy equipment.'
  }
];

export const INITIAL_BLOGS: BlogPost[] = [
  {
    id: 'blog-1',
    title: 'Understanding Neuroplasticity in Post-Stroke Recovery',
    excerpt: 'How the brain rewires itself after a stroke and why early physical therapy is critical within the golden window.',
    content: `Stroke is one of the leading causes of long-term disability. However, the human brain possesses a remarkable phenomenon called neuroplasticity — the ability of neural networks to reorganize, form new connections, and relearn lost motor functions.

Key Pillars of Neuroplasticity in Rehabilitation:
1. High Repetition & Targeted Exercises: Repeating functional movements stimulates cortical motor mapping.
2. Bobath & PNF Concepts: Guiding normal movement patterns prevents compensatory bad postures.
3. Task-Specific Training: Practicing real-life tasks like grasping a cup or standing up from a chair.
4. Consistent Online & In-clinic Guidance: Regular weekly evaluation ensures progressive overload.`,
    author: 'Dr. P. Sai Tejaswini, MPT (Neuro), MIAP',
    date: '2026-07-10',
    category: 'Neurology & Stroke',
    imageUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=600',
    readTime: '4 min read'
  },
  {
    id: 'blog-2',
    title: '5 Desk Ergonomic Fixes to Prevent Tech-Neck & Lumbar Pain',
    excerpt: 'Simple daily posture adjustments and micro-stretches for software professionals and desk workers.',
    content: `With prolonged screen time, modern professionals frequently suffer from Cervical Spondylosis and Lumbar disc strains.

Top 5 Ergonomic Principles:
1. Eye-Level Display: Keep top 1/3rd of screen at direct eye level.
2. 90-Degree Rule: Elbows, hips, and knees positioned at 90 degrees with lumbar cushion support.
3. The 30-Minute Microbreak: Stand up and do 3 chin-tucks and standing back extensions every 30 minutes.
4. Avoid Text-Neck: Raising smartphone to eye level reduces neck load from 27kg down to 5kg!`,
    author: 'Dr. P. Sai Tejaswini, MPT (Neuro), MIAP',
    date: '2026-06-25',
    category: 'Ergonomics & Ortho',
    imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=600',
    readTime: '3 min read'
  }
];

export const INITIAL_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'Online Consultation',
    question: 'How does an Online Physiotherapy Consultation work?',
    answer: 'Once you book an online consultation, you receive a Google Meet/Zoom link along with meeting credentials. During your video call, Dr. P. Sai Tejaswini conducts a comprehensive movement and posture assessment, reviews your medical scans/reports, and prescribes a personalized home exercise regimen with a downloadable PDF prescription.'
  },
  {
    id: 'faq-2',
    category: 'Booking & Payment',
    question: 'What payment modes are accepted and is instant confirmation provided?',
    answer: 'We accept Credit/Debit cards, UPI (Google Pay, PhonePe, Paytm), NetBanking via Razorpay. Upon successful payment, your appointment is instantly confirmed with an automated email receipt, invoice, and Google Meet/Zoom link.'
  },
  {
    id: 'faq-3',
    category: 'Neuro Rehab',
    question: 'What conditions fall under Neurological Rehabilitation?',
    answer: 'Dr. P. Sai Tejaswini specializes in Stroke (Hemiplegia), Parkinson’s disease, Spinal Cord Injury, Brain Trauma, Multiple Sclerosis, Guillain-Barré Syndrome (GBS), Facial Palsy, and Balance/Gait ataxia.'
  },
  {
    id: 'faq-4',
    category: 'General',
    question: 'Can I upload my MRI scans or X-ray reports before consultation?',
    answer: 'Yes! During the appointment booking process or via your Patient Dashboard, you can securely upload PDF or JPG medical reports so Dr. Tejaswini can review them prior to your session.'
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'APT-2026-1001',
    patientId: 'pat-101',
    patientName: 'Rajesh Kumar',
    patientAge: 52,
    patientGender: 'Male',
    patientPhone: '+91 98480 12345',
    patientEmail: 'rajesh.k@gmail.com',
    patientAddress: 'Door No 12-4, MG Road, Jubilee Hills, Hyderabad',
    serviceId: 'srv-01',
    serviceName: 'Neuro Consultation',
    doctorName: 'Dr. P. Sai Tejaswini',
    consultationType: 'Online Consultation',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '10:00 AM - 10:45 AM',
    durationMinutes: 45,
    status: 'Confirmed',
    problemDescription: 'Post ischemic stroke weakness on left side, difficulty holding objects and gait unsteadiness.',
    medicalHistory: 'Hypertension controlled with medication.',
    medicalReports: [{ name: 'Brain_MRI_Scan_2026.pdf', url: 'https://example.com/reports/mri.pdf', uploadedAt: '2026-07-28' }],
    amountPaid: 500,
    paymentStatus: 'Paid',
    razorpayOrderId: 'order_Nx88192a71',
    razorpayPaymentId: 'pay_Pz99182371',
    meetingLink: 'https://meet.jit.si/KrishnaveniRehab_DrSaiTejaswini',
    meetingPassword: 'KPV-NEURO-2026',
    invoiceNumber: 'INV-2026-8801',
    createdAt: '2026-07-28T14:30:00.000Z'
  },
  {
    id: 'APT-2026-1002',
    patientId: 'pat-102',
    patientName: 'Anitha Sharma',
    patientAge: 38,
    patientGender: 'Female',
    patientPhone: '+91 99890 54321',
    patientEmail: 'anitha.sharma@yahoo.com',
    patientAddress: 'Flat 302, Green Meadows, Guntur',
    serviceId: 'srv-02',
    serviceName: 'Ortho Consultation',
    doctorName: 'Dr. P. Sai Tejaswini',
    consultationType: 'Online Consultation',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    timeSlot: '04:00 PM - 04:45 PM',
    durationMinutes: 45,
    status: 'Confirmed',
    problemDescription: 'Severe L4-L5 disc protrusion radiating pain down right leg while sitting.',
    medicalHistory: 'No diabetes or thyroid.',
    medicalReports: [],
    amountPaid: 400,
    paymentStatus: 'Paid',
    razorpayOrderId: 'order_Nx88192a72',
    razorpayPaymentId: 'pay_Pz99182372',
    meetingLink: 'https://meet.google.com/kpv-orth-reh',
    meetingPassword: 'KPV-SPINE-2026',
    invoiceNumber: 'INV-2026-8802',
    createdAt: '2026-07-29T09:15:00.000Z'
  }
];

export const INITIAL_TIME_SLOTS = [
  { id: 'slot-1', timeString: '09:00 AM - 09:45 AM', slotType: 'Morning' as const, maxCapacity: 2, bookedCount: 0, isAvailable: true },
  { id: 'slot-2', timeString: '10:00 AM - 10:45 AM', slotType: 'Morning' as const, maxCapacity: 2, bookedCount: 1, isAvailable: true },
  { id: 'slot-3', timeString: '11:00 AM - 11:45 AM', slotType: 'Morning' as const, maxCapacity: 2, bookedCount: 0, isAvailable: true },
  { id: 'slot-3b', timeString: '12:00 PM - 12:45 PM', slotType: 'Morning' as const, maxCapacity: 2, bookedCount: 0, isAvailable: true },
  { id: 'slot-4', timeString: '02:00 PM - 02:45 PM', slotType: 'Afternoon' as const, maxCapacity: 2, bookedCount: 0, isAvailable: true },
  { id: 'slot-5', timeString: '03:00 PM - 03:45 PM', slotType: 'Afternoon' as const, maxCapacity: 2, bookedCount: 0, isAvailable: true },
  { id: 'slot-6', timeString: '04:00 PM - 04:45 PM', slotType: 'Afternoon' as const, maxCapacity: 2, bookedCount: 1, isAvailable: true },
  { id: 'slot-7', timeString: '05:00 PM - 05:45 PM', slotType: 'Evening' as const, maxCapacity: 2, bookedCount: 0, isAvailable: true },
  { id: 'slot-8', timeString: '06:00 PM - 06:45 PM', slotType: 'Evening' as const, maxCapacity: 2, bookedCount: 0, isAvailable: true },
  { id: 'slot-9', timeString: '07:00 PM - 07:45 PM', slotType: 'Evening' as const, maxCapacity: 2, bookedCount: 0, isAvailable: true },
  { id: 'slot-10', timeString: '08:00 PM - 08:45 PM', slotType: 'Evening' as const, maxCapacity: 2, bookedCount: 0, isAvailable: true }
];
