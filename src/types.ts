export type Role = 'patient' | 'admin';

export type ConsultationType = 'Online Consultation';

export type AppointmentStatus = 'Pending' | 'Confirmed' | 'CONFIRMED' | 'Completed' | 'Cancelled' | 'Rescheduled';

export type PaymentStatus = 'Pending' | 'Paid' | 'Refunded' | 'Failed';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone: string;
  avatar?: string;
}

export interface Doctor {
  id: string;
  name: string;
  title: string;
  qualification: string;
  specialization: string;
  experienceYears: number;
  bio: string;
  avatarUrl: string;
  consultationFee: number;
  availableDays: string[];
  workingHours: string;
  meetingLink?: string;
}

export interface DepartmentInfo {
  id: string;
  name: string;
  shortCode: string;
  tagline: string;
  overview: string;
  imageUrl: string;
  iconName: string;
  colorTheme: string;
  whatWeTreat: {
    condition: string;
    description: string;
    keySymptoms: string[];
  }[];
  consultationProtocol: {
    step: string;
    description: string;
  }[];
  expertGuidance: string[];
}

export interface Service {
  id: string;
  title: string;
  category: 'Neuro' | 'Ortho' | 'Gynic' | 'Sports' | 'Others' | 'Specialized' | 'General' | 'Online/Home' | 'General / Other';
  description: string;
  durationMinutes: number;
  feeINR: number;
  imageUrl: string;
  highlights: string[];
  recommendedFor: string[];
}

export interface TimeSlot {
  id: string;
  timeString: string; // e.g. "09:00 AM - 09:45 AM"
  slotType: 'Morning' | 'Afternoon' | 'Evening';
  maxCapacity: number;
  bookedCount: number;
  isAvailable: boolean;
}

export interface DaySchedule {
  date: string; // YYYY-MM-DD
  isHoliday: boolean;
  holidayReason?: string;
  slots: TimeSlot[];
}

export interface Appointment {
  id: string;
  patientId?: string;
  patientName: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  patientPhone: string;
  patientEmail: string;
  patientAddress: string;
  serviceId: string;
  serviceName: string;
  doctorName: string;
  consultationType: ConsultationType;
  date: string; // YYYY-MM-DD
  timeSlot: string;
  durationMinutes: number;
  status: AppointmentStatus;
  medicalHistory?: string;
  problemDescription: string;
  medicalReports: { name: string; url: string; uploadedAt: string }[];
  amountPaid: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  meetingLink?: string; // Google Meet or Zoom link
  meetingPassword?: string;
  invoiceNumber: string;
  createdAt: string;
  cancellationReason?: string;
  whatsappDispatched?: boolean;
  whatsappFrom?: string;
  whatsappTo?: string;
  whatsappStatus?: string;
  emailDispatched?: boolean;
  emailFrom?: string;
  emailTo?: string;
}

export interface PaymentRecord {
  id: string;
  appointmentId: string;
  patientName: string;
  serviceName: string;
  amount: number;
  gstAmount: number;
  totalAmount: number;
  currency: string;
  status: PaymentStatus;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  paymentMethod: string;
  createdAt: string;
  invoiceNumber: string;
}

export interface Testimonial {
  id: string;
  patientName: string;
  patientAge: number;
  treatment: string;
  rating: number;
  comment: string;
  photoUrl?: string;
  date: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Clinic' | 'Equipment' | 'Doctor' | 'Treatment';
  imageUrl: string;
  description: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  imageUrl: string;
  readTime: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'General' | 'Consultation' | 'Booking & Payment' | 'Neuro Rehab' | 'Online Consultation';
}

export interface AdminStats {
  todayAppointmentsCount: number;
  totalRevenueINR: number;
  pendingConsultationsCount: number;
  completedConsultationsCount: number;
  cancelledCount: number;
  totalPatientsCount: number;
  recentActivity: { id: string; text: string; timestamp: string; type: 'booking' | 'payment' | 'status' }[];
}

export interface ActivityLog {
  id: string;
  action: string;
  userEmail: string;
  details: string;
  timestamp: string;
}

export interface ClinicInfo {
  name: string;
  doctorName: string;
  doctorTitle: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  workingHours: string;
  googleMapsEmbed: string;
  gstin: string;
  teleConsultationLink?: string;
  googleMeetLink?: string;
  upiId?: string;
}
