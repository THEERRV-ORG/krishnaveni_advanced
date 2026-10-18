import React, { useState } from 'react';
import { X, FileCode, Server, Database, Container, Shield, BookOpen } from 'lucide-react';

interface DocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocsModal: React.FC<DocsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'prisma' | 'docker' | 'nginx' | 'api' | 'readme'>('prisma');

  if (!isOpen) return null;

  const prismaSchema = `// Prisma Schema for Krishnaveni Advanced Physiotherapy & Rehabilitation Services
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  PATIENT
  ADMIN
  DOCTOR
}

enum ConsultationType {
  ONLINE_VIDEO
  CLINIC_VISIT
  HOME_VISIT
}

enum AppointmentStatus {
  PENDING
  CONFIRMED
  COMPLETED
  CANCELLED
  RESCHEDULED
}

enum PaymentStatus {
  PENDING
  PAID
  REFUNDED
  FAILED
}

model User {
  id           String        @id @default(uuid())
  email        String        @unique
  passwordHash String
  name         String
  phone        String
  role         Role          @default(PATIENT)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  appointments Appointment[]
}

model Doctor {
  id              String        @id @default(uuid())
  name            String
  qualification   String
  specialization  String
  experienceYears Int
  consultationFee Float
  avatarUrl       String?
  appointments    Appointment[]
}

model Service {
  id              String        @id @default(uuid())
  title           String
  category        String
  description     String
  durationMinutes Int
  feeINR          Float
  imageUrl        String?
  appointments    Appointment[]
}

model Appointment {
  id                 String            @id @default(uuid())
  patientId          String?
  patient            User?             @relation(fields: [patientId], references: [id])
  patientName        String
  patientAge         Int
  patientGender      String
  patientPhone       String
  patientEmail       String
  patientAddress     String?
  doctorId           String?
  doctor             Doctor?           @relation(fields: [doctorId], references: [id])
  serviceId          String
  service            Service           @relation(fields: [serviceId], references: [id])
  consultationType   ConsultationType  @default(ONLINE_VIDEO)
  date               String
  timeSlot           String
  durationMinutes    Int
  status             AppointmentStatus @default(CONFIRMED)
  problemDescription String?
  medicalHistory     String?
  amountPaid         Float
  paymentStatus      PaymentStatus     @default(PAID)
  razorpayOrderId    String?
  razorpayPaymentId  String?
  meetingLink        String?
  meetingPassword    String?
  invoiceNumber      String            @unique
  createdAt          DateTime          @default(now())
  updatedAt          DateTime          @updatedAt
  payments           Payment[]
}

model Payment {
  id                String        @id @default(uuid())
  appointmentId     String
  appointment       Appointment   @relation(fields: [appointmentId], references: [id])
  amount            Float
  gstAmount         Float
  totalAmount       Float
  currency          String        @default("INR")
  status            PaymentStatus @default(PAID)
  razorpayPaymentId String        @unique
  razorpayOrderId   String
  invoiceNumber     String
  createdAt         DateTime      @default(now())
}
`;

  const dockerCompose = `version: '3.8'

services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    restart: always

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: krishnaveni_user
      POSTGRES_PASSWORD: secret_password
      POSTGRES_DB: krishnaveni_rehab_db
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
`;

  const nginxConf = `server {
    listen 80;
    server_name krishnavenirehab.com www.krishnavenirehab.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
`;

  const swaggerSpec = `POST /api/appointments
Description: Create new appointment and process Razorpay payment
Body: { patientName, patientAge, patientGender, patientPhone, patientEmail, serviceId, consultationType, date, timeSlot, amountPaid }
Returns: 201 Created Appointment Object with Google Meet Link

GET /api/slots?date=YYYY-MM-DD
Description: Get available doctor slots for specified date
Returns: { date, slots: [{ timeString, isAvailable, bookedCount }] }

POST /api/payments/razorpay/create-order
Description: Initialize Razorpay transaction order
Body: { amount, serviceName, patientName }

`;

  const readmeContent = `# Krishnaveni Advanced Physiotherapy & Rehabilitation Services Web Application

Production-ready web application for Dr. P. Sai Tejaswini, MPT (Neuro), MIAP.

## Features
- Online Physiotherapy Consultation Booking (Google Meet / Zoom HD Links)
- Razorpay Payment Gateway Integration with GST Invoices
- Patient & Admin Dashboards
- Reports & CSV Data Export

## Tech Stack
- Frontend: React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion
- Backend: Express.js, TypeScript
- Port: 3000 (0.0.0.0 binding)
`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="bg-slate-900 text-slate-100 max-w-4xl w-full rounded-3xl shadow-2xl overflow-hidden border border-slate-800 my-auto relative">
        
        {/* Header */}
        <div className="bg-slate-950 p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-base">
            <FileCode className="w-5 h-5 text-amber-400" />
            <span>Architecture & Deployment Specs</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-950 px-6 py-2 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs font-bold">
          {[
            { id: 'prisma', label: 'Prisma Schema' },
            { id: 'docker', label: 'Docker Compose' },
            { id: 'nginx', label: 'Nginx Config' },
            { id: 'api', label: 'REST API Specs' },
            { id: 'readme', label: 'README Setup' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === tab.id ? 'bg-cyan-500 text-slate-950 font-extrabold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Code Content Box */}
        <div className="p-6 max-h-[65vh] overflow-y-auto font-mono text-xs">
          <pre className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-cyan-300 overflow-x-auto whitespace-pre">
            {activeTab === 'prisma' && prismaSchema}
            {activeTab === 'docker' && dockerCompose}
            {activeTab === 'nginx' && nginxConf}
            {activeTab === 'api' && swaggerSpec}
            {activeTab === 'readme' && readmeContent}
          </pre>
        </div>

        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-5 py-2 rounded-xl"
          >
            Close Tech Specs
          </button>
        </div>

      </div>
    </div>
  );
};
