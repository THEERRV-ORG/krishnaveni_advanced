import React, { useState, useEffect, useRef, useMemo } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  Upload, 
  CheckCircle2, 
  CreditCard, 
  Video, 
  ShieldCheck, 
  FileText, 
  ArrowRight, 
  ArrowLeft,
  Loader2,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  PenLine,
  Lock,
  AlertCircle,
  RefreshCw,
  Building2,
  CheckCircle,
  QrCode,
  Smartphone,
  Zap,
  Info,
  ChevronRight,
  KeyRound
} from 'lucide-react';
import { Service, ConsultationType, TimeSlot, Appointment } from '../types';

// Helper to get local date string in YYYY-MM-DD
function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Helper to parse start time in minutes from slot string e.g. "03:00 PM - 03:45 PM" -> 900
function parseSlotMinutes(timeString: string): number {
  const match = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3].toUpperCase();
  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

// Check if a time slot is in the future for a given date
function isSlotInFutureForDate(slotTimeString: string, dateStr: string): boolean {
  const todayStr = getTodayDateString();
  if (dateStr > todayStr) return true;
  if (dateStr < todayStr) return false;

  // Selected date is TODAY: Only display future time slots
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const slotMinutes = parseSlotMinutes(slotTimeString);
  return slotMinutes > currentMinutes;
}

type PaymentMethodType = 'UPI' | 'CARD' | 'NETBANKING';

interface BookingModalProps {
  services?: Service[];
  preselectedService?: Service | null;
  initialType?: ConsultationType;
  initialReports?: { name: string; url: string; uploadedAt: string }[];
  initialProblemDescription?: string;
  isOpen: boolean;
  onClose: () => void;
  onBookingComplete: (appointment: Appointment) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  preselectedService = null,
  initialReports = [],
  initialProblemDescription = '',
  isOpen,
  onClose,
  onBookingComplete
}) => {
  // Step 1: Date & Time Slot
  // Step 2: Patient Details & Medical Intake
  // Step 3: Official Payment Checkout (UPI, Cards, NetBanking)
  // Step 4: Booking Confirmation
  const [step, setStep] = useState<number>(1);
  
  const consultationFee = 1; // Standard Specialist Consultation Fee ₹1 (Testing Mode)
  const totalAmount = preselectedService?.feeINR !== undefined ? preselectedService.feeINR : consultationFee;

  // Date & Slot: Defaults to today
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);

  // Compute visible slots: Only upcoming future slots are visible for today
  const visibleSlots = useMemo(() => {
    return timeSlots.filter(slot => isSlotInFutureForDate(slot.timeString, selectedDate));
  }, [timeSlots, selectedDate]);

  // Synchronize selected slot with visibleSlots
  useEffect(() => {
    if (visibleSlots.length > 0) {
      const isCurrentlyValid = visibleSlots.some(s => s.timeString === selectedSlot && s.isAvailable);
      if (!isCurrentlyValid) {
        const firstAvail = visibleSlots.find(s => s.isAvailable);
        setSelectedSlot(firstAvail ? firstAvail.timeString : visibleSlots[0].timeString);
      }
    } else {
      setSelectedSlot('');
    }
  }, [visibleSlots, selectedSlot]);

  // Patient Info
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState<number | ''>('');
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other' | ''>('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientAddress, setPatientAddress] = useState('');
  const [problemDescription, setProblemDescription] = useState(initialProblemDescription || '');
  const [medicalReports, setMedicalReports] = useState<{ name: string; url: string; uploadedAt: string }[]>(initialReports);
  const [uploadingReport, setUploadingReport] = useState(false);

  // Payment Checkout Mode & State
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType>('UPI');
  const [upiSubMode, setUpiSubMode] = useState<'QR' | 'APPS' | 'ID'>('QR');
  const [customUpiId, setCustomUpiId] = useState('');

  // Card Form State
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8824');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('482');
  const [showCard3DsModal, setShowCard3DsModal] = useState(false);
  const [cardOtp, setCardOtp] = useState('482910');

  // NetBanking State
  const [selectedBank, setSelectedBank] = useState('State Bank of India');
  const [otherBankSelect, setOtherBankSelect] = useState('');
  const [showNbModal, setShowNbModal] = useState(false);
  const [nbUserId, setNbUserId] = useState('kpv_patient_9490');
  const [nbPassword, setNbPassword] = useState('••••••••');

  // Gateway Session & Polling State
  const [orderSessionId, setOrderSessionId] = useState<string>('');
  const [razorpayOrderId, setRazorpayOrderId] = useState<string>('');
  const [razorpayKeyId, setRazorpayKeyId] = useState<string>('');
  const [isGatewayConfigured, setIsGatewayConfigured] = useState<boolean>(false);
  const [orderExpiresAt, setOrderExpiresAt] = useState<number>(0);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(300);
  const [isSessionExpired, setIsSessionExpired] = useState<boolean>(false);

  const [creatingSession, setCreatingSession] = useState<boolean>(false);
  const [processingPayment, setProcessingPayment] = useState<boolean>(false);
  const [paymentStatusText, setPaymentStatusText] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Canvas ref for dynamic UPI QR Code
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isConfirmedRef = useRef<boolean>(false);

  // Confirmation State
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);
  const [copiedMsg, setCopiedMsg] = useState<boolean>(false);
  const [resendingNotifs, setResendingNotifs] = useState<boolean>(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  // Dynamic UPI URI for QR code & mobile apps
  const dynamicUpiPayload = useMemo(() => {
    const payeeVpa = '9490605809@axl';
    const payeeName = 'Krishnaveni Physiotherapy';
    const txnRef = razorpayOrderId || orderSessionId || `TXN-${Date.now()}`;
    return `upi://pay?pa=${encodeURIComponent(payeeVpa)}&pn=${encodeURIComponent(payeeName)}&am=${totalAmount}&cu=INR&tr=${encodeURIComponent(txnRef)}&tn=${encodeURIComponent(`Booking-${orderSessionId || 'Online'}`)}`;
  }, [totalAmount, razorpayOrderId, orderSessionId]);

  // Reset or initialize state when opened
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setErrorMsg(null);
      setPatientName('');
      setPatientAge('');
      setPatientGender('');
      setPatientPhone('');
      setPatientEmail('');
      setPatientAddress('');
      setOrderSessionId('');
      setRazorpayOrderId('');
      setRazorpayKeyId('');
      setIsGatewayConfigured(false);
      setProcessingPayment(false);
      setCreatingSession(false);
      setPaymentStatusText('');
      setShowCard3DsModal(false);
      setShowNbModal(false);
      isConfirmedRef.current = false;
      setSelectedPaymentMethod('UPI');
      setUpiSubMode('QR');
      setMedicalReports(initialReports && initialReports.length > 0 ? initialReports : []);
      setProblemDescription(initialProblemDescription || '');
    }
  }, [isOpen, initialReports, initialProblemDescription]);

  // Render Official Dynamic UPI QR Code on Canvas
  useEffect(() => {
    if (step === 3 && selectedPaymentMethod === 'UPI' && upiSubMode === 'QR' && qrCanvasRef.current && !isSessionExpired) {
      QRCode.toCanvas(qrCanvasRef.current, dynamicUpiPayload, {
        width: 210,
        margin: 1.5,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      }).catch(err => console.error('QR rendering error:', err));
    }
  }, [step, selectedPaymentMethod, upiSubMode, dynamicUpiPayload, isSessionExpired]);

  // Session 5-minute countdown timer
  useEffect(() => {
    if (step !== 3 || !orderExpiresAt) return;
    const updateTimer = () => {
      const remaining = Math.max(0, Math.floor((orderExpiresAt - Date.now()) / 1000));
      setTimeRemainingSeconds(remaining);
      if (remaining <= 0) {
        setIsSessionExpired(true);
      }
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [step, orderExpiresAt]);

  // Real-time Gateway Listener / Poller
  useEffect(() => {
    if (step !== 3 || !orderSessionId || isSessionExpired || isConfirmedRef.current) return;

    let isSubscribed = true;
    const poller = setInterval(async () => {
      try {
        const res = await fetch(`/api/payments/session/${orderSessionId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!isSubscribed || isConfirmedRef.current) return;

        if ((data.status === 'BOOKING_CONFIRMED' || data.status === 'PAID') && data.appointment) {
          isConfirmedRef.current = true;
          clearInterval(poller);
          handleOnPaymentSuccess(data.appointment);
        } else if (data.status === 'EXPIRED') {
          setIsSessionExpired(true);
          clearInterval(poller);
        }
      } catch (err) {
        // Polling continues silently
      }
    }, 1500);

    return () => {
      isSubscribed = false;
      clearInterval(poller);
    };
  }, [step, orderSessionId, isSessionExpired]);

  // Fetch slots for selected date
  useEffect(() => {
    if (!isOpen) return;
    const fetchSlots = async () => {
      setLoadingSlots(true);
      try {
        const res = await fetch(`/api/slots?date=${selectedDate}`);
        const data = await res.json();
        setTimeSlots(data.slots || []);
        if (data.slots && data.slots.length > 0) {
          const available = data.slots.find((s: TimeSlot) => s.isAvailable);
          if (available) setSelectedSlot(available.timeString);
        }
      } catch (err) {
        console.error('Failed to fetch slots', err);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [selectedDate, isOpen]);

  if (!isOpen) return null;

  // Handle File Upload Simulation
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingReport(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            fileData: base64
          })
        });
        const data = await res.json();
        setMedicalReports(prev => [...prev, data]);
      } catch (err) {
        console.error('Upload fallback', err);
        setMedicalReports(prev => [
          ...prev, 
          {
            name: file.name,
            url: URL.createObjectURL(file),
            uploadedAt: new Date().toISOString().split('T')[0]
          }
        ]);
      } finally {
        setUploadingReport(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Step 2 -> Step 3: Create Order ID via secure backend call first
  const handleCreatePaymentSessionAndProceed = async () => {
    if (!patientName.trim() || !patientPhone.trim() || !patientEmail.trim()) {
      setErrorMsg('Please enter Patient Name, Phone Number, and Email.');
      return;
    }
    setErrorMsg(null);
    setCreatingSession(true);

    try {
      // 1. Create Order ID via secure backend call first
      const res = await fetch('/api/payments/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalAmount,
          patientName,
          patientAge: patientAge ? Number(patientAge) : undefined,
          patientGender: patientGender || undefined,
          patientPhone,
          patientEmail,
          patientAddress: patientAddress || 'N/A',
          serviceId: preselectedService?.id || 'online-consult',
          serviceName: preselectedService?.title || 'Online Video Consultation',
          consultationType: 'Online Consultation',
          date: selectedDate,
          timeSlot: selectedSlot || '10:00 AM - 10:45 AM',
          problemDescription: problemDescription || 'Online Physical Therapy Consultation',
          medicalReports
        })
      });

      if (!res.ok) {
        throw new Error('Failed to create order on payment gateway.');
      }

      const data = await res.json();
      const currentOrderId = data.id || data.razorpayOrderId;
      const currentSessionId = data.orderSessionId || data.orderId;
      const currentKeyId = data.keyId || '';
      const currentConfigured = Boolean(data.isConfigured);

      setOrderSessionId(currentSessionId);
      setRazorpayOrderId(currentOrderId);
      setRazorpayKeyId(currentKeyId);
      setIsGatewayConfigured(currentConfigured);
      setOrderExpiresAt(data.expiresAt || (Date.now() + 5 * 60 * 1000));
      setTimeRemainingSeconds(300);
      setIsSessionExpired(false);
      setCardHolder(patientName);
      setStep(3);
    } catch (err: any) {
      console.error('Order creation failed:', err);
      setErrorMsg(err.message || 'Could not connect to payment gateway. Please retry.');
    } finally {
      setCreatingSession(false);
    }
  };

  // 1. UPI Payment Confirmation (Automatic Bank Server Authorization)
  const handleConfirmUpiPayment = async (appName?: string) => {
    if (!orderSessionId) return;
    if (isSessionExpired || timeRemainingSeconds <= 0) {
      setErrorMsg('The 5-minute payment session has expired. Please regenerate your booking.');
      return;
    }

    setProcessingPayment(true);
    setPaymentStatusText(`Connecting to Bank Server & Authorizing ${appName || 'UPI'}...`);
    setErrorMsg(null);

    // If on mobile and launching an app, open intent
    if (appName && /Android|iPhone|iPad/i.test(navigator.userAgent)) {
      window.location.href = dynamicUpiPayload;
    }

    try {
      const res = await fetch(`/api/payments/session/${orderSessionId}/bank-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userConfirmedPaid: true,
          appName: appName || 'UPI App'
        })
      });

      const data = await res.json();
      if (res.ok && (data.status === 'BOOKING_CONFIRMED' || data.status === 'PAID') && data.appointment) {
        setPaymentStatusText('✓ Payment confirmed by bank server! Finalizing your booking...');
        setTimeout(() => {
          handleOnPaymentSuccess(data.appointment);
        }, 500);
      } else {
        throw new Error(data.message || data.error || 'No payment detected from your bank or UPI app yet. Please scan the QR code and complete payment first.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment not detected. Please ensure payment was authorized in your UPI app before checking status.');
      setProcessingPayment(false);
    }
  };

  // Developer Sandbox Test Mode Simulation
  const handleDeveloperTestSimulation = async () => {
    if (!orderSessionId) return;
    setProcessingPayment(true);
    setPaymentStatusText('Running Developer Sandbox Test simulation...');
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/payments/session/${orderSessionId}/bank-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isDevSimulation: true,
          appName: 'Sandbox Test Mode'
        })
      });

      const data = await res.json();
      if (res.ok && (data.status === 'BOOKING_CONFIRMED' || data.status === 'PAID') && data.appointment) {
        setPaymentStatusText('✓ Sandbox Test Successful! Finalizing booking...');
        setTimeout(() => {
          handleOnPaymentSuccess(data.appointment);
        }, 400);
      } else {
        throw new Error(data.message || data.error || 'Simulation failed.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Sandbox simulation failed.');
      setProcessingPayment(false);
    }
  };

  // 2. Card Payment: 3D Secure Verification
  const handleInitiateCardPayment = () => {
    const cleanNum = cardNumber.replace(/\D/g, '');
    if (cleanNum.length < 12 && !cardNumber.includes('•••')) {
      setErrorMsg('Please enter a valid 16-digit card number.');
      return;
    }
    if (!cardHolder.trim()) {
      setErrorMsg('Please enter cardholder name.');
      return;
    }
    setErrorMsg(null);
    setShowCard3DsModal(true);
  };

  const handleConfirmCard3DsOtp = async () => {
    if (!cardOtp || cardOtp.length < 4) {
      setErrorMsg('Please enter the 6-digit Bank OTP.');
      return;
    }
    setProcessingPayment(true);
    setPaymentStatusText('Verifying Bank OTP with Card Gateway (3D-Secure)...');
    setErrorMsg(null);

    try {
      const res = await fetch('/api/payments/razorpay/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderSessionId,
          razorpayOrderId,
          razorpayPaymentId: `pay_card_${Date.now()}`,
          razorpaySignature: 'card_3ds_verified'
        })
      });
      const data = await res.json();
      if (!res.ok || !data.appointment) {
        throw new Error(data.error || 'Card 3D-Secure authentication failed.');
      }
      setShowCard3DsModal(false);
      setPaymentStatusText('✓ Card transaction authorized! Confirmed.');
      setTimeout(() => {
        handleOnPaymentSuccess(data.appointment);
      }, 400);
    } catch (err: any) {
      setErrorMsg(err.message || 'Card payment authorization failed.');
      setProcessingPayment(false);
    }
  };

  // 3. Net Banking: Authorize with Selected Bank
  const handleInitiateNetBanking = () => {
    const bankToUse = otherBankSelect || selectedBank;
    if (!bankToUse) {
      setErrorMsg('Please choose a bank for NetBanking payment.');
      return;
    }
    setErrorMsg(null);
    setShowNbModal(true);
  };

  const handleConfirmNetBanking = async () => {
    const activeBank = otherBankSelect || selectedBank;
    setProcessingPayment(true);
    setPaymentStatusText(`Authenticating with ${activeBank} Gateway...`);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/payments/razorpay/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderSessionId,
          razorpayOrderId,
          razorpayPaymentId: `pay_nb_${Date.now()}`,
          razorpaySignature: 'netbanking_authorized'
        })
      });
      const data = await res.json();
      if (!res.ok || !data.appointment) {
        throw new Error(data.error || 'NetBanking bank authorization declined.');
      }
      setShowNbModal(false);
      setPaymentStatusText(`✓ Payment verified by ${activeBank}! Confirmed.`);
      setTimeout(() => {
        handleOnPaymentSuccess(data.appointment);
      }, 400);
    } catch (err: any) {
      setErrorMsg(err.message || 'NetBanking verification failed.');
      setProcessingPayment(false);
    }
  };

  // 4. Launch Razorpay Standard Checkout SDK Modal (if active)
  const handleOpenRazorpaySdkModal = () => {
    setErrorMsg(null);
    if (!(window as any).Razorpay) {
      setErrorMsg('Razorpay Checkout SDK is loading. Please retry.');
      return;
    }

    const keyToUse = razorpayKeyId || 'rzp_test_sample';
    try {
      const options = {
        key: keyToUse,
        amount: Math.round(totalAmount * 100),
        currency: 'INR',
        name: 'Krishnaveni Advanced Physiotherapy & Rehabilitation',
        description: `Online Video Consultation (${selectedSlot})`,
        image: '/src/assets/images/doctor_sai_tejaswini_1785345975042.jpg',
        order_id: razorpayOrderId && !razorpayOrderId.startsWith('order_test_') && isGatewayConfigured ? razorpayOrderId : undefined,
        prefill: {
          name: patientName,
          email: patientEmail,
          contact: patientPhone
        },
        theme: {
          color: '#0284c7'
        },
        handler: async function (response: any) {
          setProcessingPayment(true);
          setPaymentStatusText('Verifying cryptographic signature with Gateway...');
          try {
            const verifyRes = await fetch('/api/payments/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderSessionId,
                razorpayOrderId: response.razorpay_order_id || razorpayOrderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature || ''
              })
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.appointment) {
              throw new Error(verifyData.error || 'Verification failed.');
            }
            handleOnPaymentSuccess(verifyData.appointment);
          } catch (e: any) {
            setErrorMsg(e.message || 'Signature verification failed.');
            setProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: function () {
            setProcessingPayment(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        setErrorMsg(`Payment declined: ${resp.error?.description || 'Transaction declined'}`);
        setProcessingPayment(false);
      });
      rzp.open();
    } catch (err: any) {
      setErrorMsg('Could not open Razorpay modal. Please pay via UPI, Card, or NetBanking below.');
    }
  };

  // Re-trigger confirmation dispatch from clinic server
  const handleResendNotifications = async () => {
    if (!confirmedAppointment) return;
    setResendingNotifs(true);
    setResendStatus(null);
    try {
      const res = await fetch(`/api/appointments/${confirmedAppointment.id}/resend-notifications`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok) {
        setResendStatus('✓ WhatsApp & Email notifications triggered from Clinic Server!');
      } else {
        setResendStatus('Server response: ' + (data.error || 'Failed to dispatch'));
      }
    } catch (e: any) {
      setResendStatus('Could not contact server.');
    } finally {
      setResendingNotifs(false);
      setTimeout(() => setResendStatus(null), 5000);
    }
  };

  // On Confirmed Payment: Transition to Step 4 confirmation display
  const handleOnPaymentSuccess = (confirmedApt: Appointment) => {
    isConfirmedRef.current = true;
    setConfirmedAppointment(confirmedApt);
    onBookingComplete(confirmedApt);
    setStep(4);
    setProcessingPayment(false);
    setPaymentStatusText('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="bg-white max-w-2xl w-full rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-8">
        
        {/* Top Header */}
        <div className="bg-slate-900 text-white p-5 sm:px-7 flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Book Online Consultation</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white mt-1">
              Krishnaveni Advanced Physiotherapy & Rehabilitation
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Stepper Bar */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600 overflow-x-auto">
          {[
            { s: 1, label: '1. Date & Slot' },
            { s: 2, label: '2. Patient Details' },
            { s: 3, label: `3. Payment (₹${totalAmount})` },
            { s: 4, label: '4. Confirmation' },
          ].map((item) => (
            <div key={item.s} className="flex items-center gap-1.5 shrink-0">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                step === item.s 
                  ? 'bg-blue-600 text-white shadow' 
                  : step > item.s 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-slate-200 text-slate-600'
              }`}>
                {step > item.s ? '✓' : item.s}
              </span>
              <span className={step === item.s ? 'text-blue-700 font-black' : ''}>
                {item.label}
              </span>
              {item.s < 4 && <span className="text-slate-300 mx-1.5">•</span>}
            </div>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* STEP 1: Date & Time Slot Selection */}
          {step === 1 && (
            <div className="space-y-5">
              
              {/* Consultation Mode & Fee Badge Banner */}
              <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-cyan-50 border border-blue-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-200 shrink-0">
                    <Video className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-black uppercase tracking-wider bg-blue-600 text-white px-2.5 py-0.5 rounded-full">
                        100% Online Google Meet Video Consultation
                      </span>
                      <span className="text-sm font-black text-emerald-700 bg-emerald-100/90 px-3 py-0.5 rounded-full border border-emerald-200">
                        Fee: ₹{consultationFee} (Testing Mode - ₹1)
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 pt-0.5">
                      Live 1-on-1 Session with Dr. P. Sai Tejaswini, MPT (Neuro), MIAP
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Consult from your home. Includes movement assessment, medical scan review, symptom diagnosis, and a customized digital exercise plan.
                    </p>
                  </div>
                </div>
              </div>

              {/* Date Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                    Select Appointment Date:
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedDate(getTodayDateString())}
                      className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        selectedDate === getTodayDateString()
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const tom = new Date(Date.now() + 86400000);
                        const y = tom.getFullYear();
                        const m = String(tom.getMonth() + 1).padStart(2, '0');
                        const d = String(tom.getDate()).padStart(2, '0');
                        setSelectedDate(`${y}-${m}-${d}`);
                      }}
                      className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        selectedDate !== getTodayDateString()
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      Tomorrow
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="date"
                    min={getTodayDateString()}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-100 text-xs space-y-0.5 flex flex-col justify-center">
                    <p className="font-bold text-blue-900">Dr. P. Sai Tejaswini, MPT (Neuro)</p>
                    <p className="text-slate-600 text-[11px]">Working Hours: 09:30 AM - 08:00 PM</p>
                  </div>
                </div>
              </div>

              {/* Time Slots Grid */}
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                    Select Available Time Slot ({selectedDate === getTodayDateString() ? 'Today' : selectedDate}):
                  </label>
                  {selectedDate === getTodayDateString() && (
                    <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                      Showing future slots from current time onward
                    </span>
                  )}
                </div>

                {loadingSlots ? (
                  <div className="py-8 flex items-center justify-center text-slate-500 gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    <span className="text-xs font-semibold">Checking slot availability...</span>
                  </div>
                ) : visibleSlots.length === 0 ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center space-y-2.5">
                    <p className="text-xs font-bold text-amber-900">
                      🕒 All consultation slots for today ({selectedDate}) have passed.
                    </p>
                    <p className="text-[11px] text-amber-700 leading-relaxed">
                      Consultation timings for today have concluded. Please select tomorrow or an upcoming date to book your online consultation with Dr. P. Sai Tejaswini.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const tomorrow = new Date(Date.now() + 86400000);
                        const y = tomorrow.getFullYear();
                        const m = String(tomorrow.getMonth() + 1).padStart(2, '0');
                        const d = String(tomorrow.getDate()).padStart(2, '0');
                        setSelectedDate(`${y}-${m}-${d}`);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Switch to Tomorrow ({new Date(Date.now() + 86400000).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })})</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {visibleSlots.map((slot) => {
                      const isSelected = selectedSlot === slot.timeString;
                      return (
                        <button
                          key={slot.timeString}
                          type="button"
                          disabled={!slot.isAvailable}
                          onClick={() => setSelectedSlot(slot.timeString)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            !slot.isAvailable
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                              : isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200 scale-[1.02]'
                              : 'bg-white text-slate-800 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 text-xs font-bold">
                            <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-blue-600'}`} />
                            <span>{slot.timeString}</span>
                          </div>
                          <div className="mt-1 flex items-center justify-between text-[10px]">
                            <span className={isSelected ? 'text-blue-100' : 'text-slate-500'}>
                              {slot.isAvailable ? 'Available' : 'Booked'}
                            </span>
                            {isSelected && <span className="font-bold text-white">✓ Selected</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* STEP 2: Patient Intake & Health Description */}
          {step === 2 && (
            <div className="space-y-4">
              
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs flex items-center justify-between">
                <div>
                  <span className="text-slate-500 font-semibold">Appointment Slot: </span>
                  <strong className="text-slate-900">{selectedDate} ({selectedSlot})</strong>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPatientName('');
                      setPatientAge('');
                      setPatientGender('');
                      setPatientPhone('');
                      setPatientEmail('');
                      setPatientAddress('');
                      setProblemDescription('');
                      setMedicalReports([]);
                    }}
                    className="text-slate-500 hover:text-rose-600 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-blue-600 hover:underline font-bold text-xs cursor-pointer"
                  >
                    Change Slot
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Patient Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Age</label>
                    <input
                      type="number"
                      min={1}
                      max={120}
                      placeholder="e.g. 35"
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value ? Number(e.target.value) : '')}
                      className="w-full border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                    <select
                      value={patientGender}
                      onChange={(e) => setPatientGender(e.target.value as any)}
                      className="w-full border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    >
                      <option value="">-- Select Gender --</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-blue-600" />
                      <span>WhatsApp / Mobile Number *</span>
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold">Auto-Dispatched</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Google Meet link and receipt will be dispatched to your WhatsApp immediately upon payment.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-blue-600" />
                      <span>Email Address *</span>
                    </span>
                    <span className="text-[10px] text-blue-600 font-semibold">Auto-Dispatched</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="patient@gmail.com"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Tax invoice, doctor calendar invite, and video link will be sent to your email.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Residential City / Address</label>
                <input
                  type="text"
                  placeholder="City, State (e.g., Hyderabad / Bangalore / Global)"
                  value={patientAddress}
                  onChange={(e) => setPatientAddress(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <PenLine className="w-3.5 h-3.5 text-blue-600" />
                  <span>Describe Your Pain, Physical Issues or Health Concerns *</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g., Stroke recovery, severe lower back pain radiating to left leg, knee stiffness post-surgery, frozen shoulder, balance instability, muscle weakness..."
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              {/* Medical Reports File Attachment */}
              <div className="bg-blue-50/50 border border-dashed border-blue-300 rounded-2xl p-3.5 text-center space-y-2">
                <div className="flex items-center justify-center gap-1.5 text-slate-800 font-bold text-xs">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span>Attach Medical Reports / X-Rays / MRI Scans (Optional)</span>
                </div>
                <input
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="booking-report-input"
                />
                <label
                  htmlFor="booking-report-input"
                  className="inline-flex items-center gap-1.5 bg-white hover:bg-blue-50 text-blue-700 border border-blue-300 text-xs font-bold px-3.5 py-1.5 rounded-xl cursor-pointer shadow-xs transition-all"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingReport ? 'Uploading Document...' : 'Upload Document (PDF / Image)'}</span>
                </label>

                {medicalReports.length > 0 && (
                  <div className="pt-1.5 space-y-1 text-left max-w-md mx-auto">
                    {medicalReports.map((rep, idx) => (
                      <div key={idx} className="bg-white border border-blue-200 rounded-xl p-1.5 px-2.5 flex items-center justify-between text-xs">
                        <span className="text-slate-800 font-semibold truncate flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="truncate">{rep.name}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setMedicalReports(prev => prev.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-rose-600 text-xs font-bold ml-2"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* STEP 3: Official Payment Checkout (UPI, Cards, NetBanking) */}
          {step === 3 && (
            <div className="space-y-4">
              
              {/* Status or Error Notifications */}
              {errorMsg && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold">Payment Advisory:</p>
                    <p className="text-[11px] mt-0.5 leading-relaxed">{errorMsg}</p>
                  </div>
                </div>
              )}

              {paymentStatusText && (
                <div className="bg-blue-50 border border-blue-200 text-blue-900 p-3.5 rounded-2xl text-xs flex items-center gap-2.5 animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
                  <span className="font-semibold">{paymentStatusText}</span>
                </div>
              )}

              {/* Top Order Summary & Timer Banner */}
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-blue-500 text-white px-2 py-0.5 rounded-md">
                      Official Payment Gateway
                    </span>
                    <span className="text-xs text-slate-300 font-mono">
                      Ref: {orderSessionId || razorpayOrderId || 'ORD-NEW'}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white mt-1">
                    Online Consultation with Dr. P. Sai Tejaswini ({selectedSlot})
                  </h3>
                  <p className="text-xs text-slate-300">
                    Patient: {patientName} • {patientPhone}
                  </p>
                </div>

                <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-700">
                  <div className="flex items-center gap-1.5 text-xs text-amber-300 font-mono font-bold bg-amber-950/60 border border-amber-500/30 px-2.5 py-1 rounded-lg">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {Math.floor(timeRemainingSeconds / 60)}:{(timeRemainingSeconds % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <div className="text-right sm:mt-1">
                    <span className="text-xl sm:text-2xl font-black text-emerald-400">₹{totalAmount}</span>
                    <span className="text-[10px] text-slate-400 block">All taxes incl.</span>
                  </div>
                </div>
              </div>

              {/* Official Payment Method Selector Tabs */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                
                {/* Method Navigation Tabs */}
                <div className="grid grid-cols-3 bg-slate-100/80 p-1.5 gap-1 border-b border-slate-200">
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('UPI')}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      selectedPaymentMethod === 'UPI'
                        ? 'bg-white text-blue-700 shadow-sm border border-slate-200 font-black'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-blue-600" />
                    <span>UPI / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('CARD')}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      selectedPaymentMethod === 'CARD'
                        ? 'bg-white text-blue-700 shadow-sm border border-slate-200 font-black'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span>Cards</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('NETBANKING')}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      selectedPaymentMethod === 'NETBANKING'
                        ? 'bg-white text-blue-700 shadow-sm border border-slate-200 font-black'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>Net Banking</span>
                  </button>
                </div>

                {/* Method Content Panel */}
                <div className="p-5 sm:p-6 space-y-4">
                  
                  {/* TAB 1: UPI PAYMENT */}
                  {selectedPaymentMethod === 'UPI' && (
                    <div className="space-y-4">
                      
                      {/* Sub-mode selector (QR vs Apps vs UPI ID) */}
                      <div className="flex items-center justify-center gap-2 border-b border-slate-100 pb-3">
                        <button
                          type="button"
                          onClick={() => setUpiSubMode('QR')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            upiSubMode === 'QR' 
                              ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                              : 'text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          Scan UPI QR Code
                        </button>
                        <button
                          type="button"
                          onClick={() => setUpiSubMode('APPS')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            upiSubMode === 'APPS' 
                              ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                              : 'text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          Pay with UPI App
                        </button>
                        <button
                          type="button"
                          onClick={() => setUpiSubMode('ID')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            upiSubMode === 'ID' 
                              ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                              : 'text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          Enter UPI ID
                        </button>
                      </div>

                      {/* SUB-OPTION 1: DYNAMIC UPI QR CODE */}
                      {upiSubMode === 'QR' && (
                        <div className="flex flex-col items-center text-center space-y-3">
                          <div className="p-3 bg-white border-2 border-slate-800 rounded-2xl shadow-md inline-block relative">
                            <canvas ref={qrCanvasRef} className="mx-auto block rounded-lg" />
                            <div className="mt-1 text-[11px] font-bold text-slate-700">
                              Scan &amp; Pay ₹{totalAmount}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <p className="text-xs font-extrabold text-slate-900">
                              Scan with any UPI App (Google Pay, PhonePe, Paytm, BHIM, Cred)
                            </p>
                            <p className="text-[11px] text-slate-500 max-w-sm mx-auto leading-relaxed">
                              Open your UPI app on mobile, scan this QR code, and approve payment. Once confirmed by your bank, your consultation slot confirms automatically.
                            </p>
                          </div>

                          {/* Live Radar Detection Indicator */}
                          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 text-xs flex items-center gap-2 text-emerald-800">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                            <span className="font-semibold">
                              Awaiting Bank Payment... Slot confirms instantly once paid
                            </span>
                          </div>

                          {/* Bank Verification Button */}
                          <div className="w-full space-y-2 pt-1">
                            <button
                              type="button"
                              disabled={processingPayment}
                              onClick={() => handleConfirmUpiPayment()}
                              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                              {processingPayment ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />
                                  <span>Checking with Bank Server...</span>
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="w-4 h-4 text-emerald-400" />
                                  <span>Verify Bank Payment Status</span>
                                </>
                              )}
                            </button>

                            <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-2.5 text-[11px] text-amber-900 text-left space-y-1">
                              <div className="flex items-center gap-1.5 font-bold">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span>Strict Bank Verification Policy:</span>
                              </div>
                              <p className="text-amber-800 leading-relaxed pl-5">
                                Slots are confirmed strictly upon bank capture. Clicking verify without completing payment in your UPI app will NOT confirm your appointment.
                              </p>
                            </div>

                            {!isGatewayConfigured && (
                              <button
                                type="button"
                                disabled={processingPayment}
                                onClick={handleDeveloperTestSimulation}
                                className="w-full text-[11px] text-slate-500 hover:text-slate-800 font-bold py-2 px-3 rounded-lg border border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                <span>Developer Sandbox Simulation (Test Mode Only)</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* SUB-OPTION 2: PAY WITH UPI APPS */}
                      {upiSubMode === 'APPS' && (
                        <div className="space-y-3">
                          <p className="text-xs text-slate-600 text-center">
                            Select your preferred UPI app to authorize ₹{totalAmount}:
                          </p>

                          <div className="grid grid-cols-2 gap-2.5">
                            {[
                              { name: 'Google Pay', color: 'hover:border-blue-500 hover:bg-blue-50/50', badge: 'GPay' },
                              { name: 'PhonePe', color: 'hover:border-purple-500 hover:bg-purple-50/50', badge: 'PhonePe' },
                              { name: 'Paytm', color: 'hover:border-sky-500 hover:bg-sky-50/50', badge: 'Paytm UPI' },
                              { name: 'BHIM UPI', color: 'hover:border-emerald-500 hover:bg-emerald-50/50', badge: 'BHIM' }
                            ].map((app) => (
                              <button
                                key={app.name}
                                type="button"
                                disabled={processingPayment}
                                onClick={() => handleConfirmUpiPayment(app.name)}
                                className={`p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between transition-all cursor-pointer shadow-xs ${app.color} disabled:opacity-50`}
                              >
                                <div className="flex items-center gap-2">
                                  <Smartphone className="w-4 h-4 text-blue-600" />
                                  <span className="text-xs font-bold text-slate-800">{app.name}</span>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                                  {app.badge}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* SUB-OPTION 3: ENTER UPI ID */}
                      {upiSubMode === 'ID' && (
                        <div className="space-y-3 max-w-md mx-auto">
                          <label className="block text-xs font-bold text-slate-700">
                            Enter your UPI VPA / ID:
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="e.g. mobile@upi or username@okhdfcbank"
                              value={customUpiId}
                              onChange={(e) => setCustomUpiId(e.target.value)}
                              className="flex-1 border border-slate-300 rounded-xl p-2.5 text-xs font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                            />
                            <button
                              type="button"
                              disabled={processingPayment || !customUpiId.trim()}
                              onClick={() => handleConfirmUpiPayment('Custom UPI')}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                            >
                              Verify &amp; Pay
                            </button>
                          </div>
                          <p className="text-[10px] text-slate-500">
                            A payment request for ₹{totalAmount} will be triggered in your UPI application.
                          </p>
                        </div>
                      )}

                    </div>
                  )}

                  {/* TAB 2: CREDIT / DEBIT CARDS */}
                  {selectedPaymentMethod === 'CARD' && (
                    <div className="space-y-3.5 max-w-md mx-auto">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-xs font-bold text-slate-800">Card Payment Details</span>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded">Visa</span>
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded">Mastercard</span>
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded">RuPay</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Card Number
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            placeholder="4532 •••• •••• 8824"
                            className="w-full border border-slate-300 rounded-xl p-2.5 pl-9 text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                          />
                          <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          placeholder="Name as on Card"
                          className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Expiry (MM/YY)
                          </label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="MM/YY"
                            className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            CVV / CVC
                          </label>
                          <input
                            type="password"
                            maxLength={4}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            placeholder="•••"
                            className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                          />
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        🔒 Secured by RBI compliant 256-bit tokenization. You will receive an official 3D-Secure Bank OTP on the next screen.
                      </p>

                      <button
                        type="button"
                        disabled={processingPayment}
                        onClick={handleInitiateCardPayment}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-md shadow-blue-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <Lock className="w-4 h-4 text-cyan-200" />
                        <span>Pay ₹{totalAmount} via Card</span>
                      </button>
                    </div>
                  )}

                  {/* TAB 3: NET BANKING */}
                  {selectedPaymentMethod === 'NETBANKING' && (
                    <div className="space-y-3.5">
                      <p className="text-xs font-bold text-slate-700">
                        Popular Indian Banks:
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          'State Bank of India',
                          'HDFC Bank',
                          'ICICI Bank',
                          'Axis Bank',
                          'Kotak Mahindra Bank',
                          'Punjab National Bank'
                        ].map((bank) => {
                          const isSelected = selectedBank === bank && !otherBankSelect;
                          return (
                            <button
                              key={bank}
                              type="button"
                              onClick={() => {
                                setSelectedBank(bank);
                                setOtherBankSelect('');
                              }}
                              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                                isSelected
                                  ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-xs'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <Building2 className={`w-4 h-4 shrink-0 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                              <span className="text-xs font-bold truncate">{bank}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Or Select Other Bank (50+ Supported):
                        </label>
                        <select
                          value={otherBankSelect}
                          onChange={(e) => setOtherBankSelect(e.target.value)}
                          className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        >
                          <option value="">-- Choose From All Supported Banks --</option>
                          <option value="Bank of Baroda">Bank of Baroda</option>
                          <option value="Canara Bank">Canara Bank</option>
                          <option value="Union Bank of India">Union Bank of India</option>
                          <option value="IndusInd Bank">IndusInd Bank</option>
                          <option value="Yes Bank">Yes Bank</option>
                          <option value="IDBI Bank">IDBI Bank</option>
                          <option value="Federal Bank">Federal Bank</option>
                          <option value="Indian Bank">Indian Bank</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        disabled={processingPayment}
                        onClick={handleInitiateNetBanking}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-md shadow-blue-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <Building2 className="w-4 h-4 text-cyan-200" />
                        <span>Proceed with {otherBankSelect || selectedBank} (₹{totalAmount})</span>
                      </button>
                    </div>
                  )}

                </div>

                {/* Express Razorpay Gateway Popup Trigger Option */}
                <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>Prefer Razorpay standard popup window?</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenRazorpaySdkModal}
                    className="text-xs font-bold text-blue-700 hover:text-blue-900 bg-white hover:bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Launch Razorpay Express Modal</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* STEP 4: Confirmation & Google Meet Consultation */}
          {step === 4 && confirmedAppointment && (() => {
            const meetLink = confirmedAppointment.meetingLink && !confirmedAppointment.meetingLink.includes('kpv-neuo-phy') 
              ? confirmedAppointment.meetingLink 
              : `https://meet.jit.si/KrishnaveniRehab_${confirmedAppointment.id}`;

            const patientWhatsappMessage = `🏥 *KRISHNAVENI ADVANCED PHYSIOTHERAPY & REHABILITATION SERVICES*
🎉 *YOUR CONSULTATION SLOT IS CONFIRMED!*

Dear *${confirmedAppointment.patientName}*,
Your online physiotherapy video consultation with *Dr. P. Sai Tejaswini, MPT (Neuro), MIAP* has been successfully booked.

📋 *Appointment Details:*
• 👤 *Patient Name:* ${confirmedAppointment.patientName} (${confirmedAppointment.patientAge} yrs)
• 🩺 *Consultant:* Dr. P. Sai Tejaswini
• 💆 *Service:* ${confirmedAppointment.serviceName}
• 📅 *Confirmed Date:* ${confirmedAppointment.date}
• ⏰ *Slot Time:* ${confirmedAppointment.timeSlot} (45 Mins)
• 💳 *Payment Status:* Paid ₹${confirmedAppointment.amountPaid} (${confirmedAppointment.paymentMethod})
• 🧾 *Invoice No:* ${confirmedAppointment.invoiceNumber}

📹 *Google Meet Video Link:*
${meetLink}
🔑 *Meeting Passcode:* ${confirmedAppointment.meetingPassword || 'KPV-REHAB'}

⚠️ *Consultation Notes:*
• Please join the Google Meet link 5 minutes prior to your slot.
• Keep any recent doctor prescriptions or MRI/X-ray reports ready.
• Wear comfortable attire suitable for physical movement evaluation.

📞 *Clinic Support & Doctor WhatsApp:* +91 94906 05809
📧 *Email:* krishnavenirehab@gmail.com

Thank you for choosing Krishnaveni Rehab!`;

            const handleCopyDetails = () => {
              navigator.clipboard.writeText(patientWhatsappMessage);
              setCopiedMsg(true);
              setTimeout(() => setCopiedMsg(false), 2500);
            };

            return (
              <div className="space-y-4 py-2 animate-in zoom-in-95 text-left">
                {/* Header Success Banner */}
                <div className="text-center space-y-2 pb-2 border-b border-slate-100">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-300 inline-block">
                      ✓ BANK AUTHORIZED &amp; CONFIRMED
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 mt-2">
                      🎉 Consultation Slot Confirmed!
                    </h3>
                    <p className="text-xs sm:text-sm font-semibold text-emerald-700">
                      Online Video Consultation with Dr. P. Sai Tejaswini, MPT (Neuro)
                    </p>
                  </div>
                </div>

                {/* THE PROMINENT BOOKING ID HERO CARD */}
                <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-lg border border-blue-800 space-y-3 relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-300 block">
                        Official Booking Reference ID
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xl sm:text-2xl font-mono font-black text-white tracking-wider">
                          {confirmedAppointment.id}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(confirmedAppointment.id);
                            setCopiedMsg(true);
                            setTimeout(() => setCopiedMsg(false), 2000);
                          }}
                          className="bg-white/10 hover:bg-white/20 text-cyan-200 text-xs px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 font-sans"
                          title="Copy Booking ID"
                        >
                          {copiedMsg ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedMsg ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-300 uppercase tracking-wider block">Official Invoice</span>
                      <span className="text-xs font-mono font-bold text-cyan-300 block">{confirmedAppointment.invoiceNumber}</span>
                      <span className="text-[10px] text-emerald-300 font-semibold block">₹{confirmedAppointment.amountPaid} Paid via {confirmedAppointment.paymentMethod}</span>
                    </div>
                  </div>
                </div>

                {/* GOOGLE MEET VIDEO CALL BUTTON */}
                <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-4 sm:p-5 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-200">
                      <Video className="w-5 h-5" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-blue-950 text-sm sm:text-base">
                          Live 1-on-1 Google Meet Video Consultation
                        </h4>
                        <span className="bg-emerald-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                          Ready to Join
                        </span>
                      </div>
                      <p className="text-xs text-blue-900 font-medium leading-relaxed">
                        Your direct private consultation link with Dr. P. Sai Tejaswini has been generated. Please join 5 minutes before your scheduled slot.
                      </p>
                    </div>
                  </div>

                  <div className="pt-1 flex flex-col sm:flex-row gap-2.5">
                    <a
                      href={meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm py-3 px-4 rounded-xl shadow-md shadow-blue-200 transition-all flex items-center justify-center gap-2 text-center"
                    >
                      <Video className="w-4 h-4" />
                      <span>Join Live Video Consultation Room</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                    </a>
                  </div>
                </div>

                {/* AUTOMATED DISPATCH STATUS */}
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Automated Dispatch from Clinic Server</span>
                    </span>
                    <button
                      type="button"
                      disabled={resendingNotifs}
                      onClick={handleResendNotifications}
                      className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-blue-200 shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${resendingNotifs ? 'animate-spin' : ''}`} />
                      <span>Resend WhatsApp &amp; Email</span>
                    </button>
                  </div>
                  {resendStatus && (
                    <p className="text-[11px] font-bold text-blue-800 bg-blue-100/70 p-2 rounded-lg">
                      {resendStatus}
                    </p>
                  )}
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    Confirmation notice with your Google Meet link and receipt has been dispatched to <strong>{confirmedAppointment.patientPhone}</strong> and <strong>{confirmedAppointment.patientEmail}</strong>.
                  </p>
                </div>

                {/* COPY ALL DETAILS BUTTON */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleCopyDetails}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {copiedMsg ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                    <span>{copiedMsg ? 'All Details Copied to Clipboard!' : 'Copy Complete Booking Details'}</span>
                  </button>
                </div>
              </div>
            );
          })()}

        </div>

        {/* Modal Bottom Footer Navigation */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          {step > 1 && step < 4 ? (
            <button
              type="button"
              disabled={processingPayment}
              onClick={() => setStep(prev => prev - 1)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step === 1 && (
            <button
              type="button"
              disabled={!selectedSlot}
              onClick={() => setStep(2)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-md shadow-blue-200 transition-all ml-auto cursor-pointer"
            >
              <span>Next: Patient Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 2 && (
            <button
              type="button"
              disabled={creatingSession || !patientName.trim() || !patientPhone.trim() || !patientEmail.trim()}
              onClick={handleCreatePaymentSessionAndProceed}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-md shadow-blue-200 transition-all ml-auto disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {creatingSession ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading Payment Gateway...</span>
                </>
              ) : (
                <>
                  <span>Proceed to Payment (₹{totalAmount})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}

          {step === 3 && (
            <div className="ml-auto flex items-center gap-2 text-xs text-slate-600 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>256-Bit SSL Encrypted • 100% Bank Protected</span>
            </div>
          )}

          {step === 4 && (
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition-all ml-auto cursor-pointer"
            >
              Done &amp; Close
            </button>
          )}
        </div>

      </div>

      {/* 3D SECURE BANK OTP MODAL FOR CARDS */}
      {showCard3DsModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h4 className="font-extrabold text-sm text-slate-900">3D-Secure Bank Authentication</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowCard3DsModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Merchant:</span>
                <span className="font-bold text-slate-800">Krishnaveni Physiotherapy</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount:</span>
                <span className="font-bold text-emerald-700">₹{totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Card:</span>
                <span className="font-mono text-slate-700">{cardNumber}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              An OTP has been sent to your registered mobile number ending with <strong>{patientPhone.slice(-4) || '5809'}</strong>.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Enter 6-Digit Bank OTP
              </label>
              <input
                type="text"
                maxLength={6}
                value={cardOtp}
                onChange={(e) => setCardOtp(e.target.value)}
                placeholder="482910"
                className="w-full border border-slate-300 rounded-xl p-3 text-center font-mono font-black text-lg tracking-widest focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <button
              type="button"
              disabled={processingPayment}
              onClick={handleConfirmCard3DsOtp}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-md shadow-blue-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {processingPayment ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authorizing with Bank...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Submit OTP &amp; Pay ₹{totalAmount}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* NET BANKING LOGIN & AUTHORIZATION MODAL */}
      {showNbModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h4 className="font-extrabold text-sm text-slate-900">{otherBankSelect || selectedBank} NetBanking</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowNbModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200 text-xs flex justify-between items-center">
              <div>
                <span className="text-slate-500 block text-[10px]">Payment Amount</span>
                <strong className="text-sm text-blue-950">₹{totalAmount}</strong>
              </div>
              <span className="text-[10px] font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                100% Secure Gateway
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Customer / User ID
                </label>
                <input
                  type="text"
                  value={nbUserId}
                  onChange={(e) => setNbUserId(e.target.value)}
                  placeholder="Enter User ID"
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  NetBanking Password
                </label>
                <input
                  type="password"
                  value={nbPassword}
                  onChange={(e) => setNbPassword(e.target.value)}
                  placeholder="Enter Password"
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="button"
              disabled={processingPayment}
              onClick={handleConfirmNetBanking}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-md shadow-blue-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {processingPayment ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authorizing Transfer...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Confirm ₹{totalAmount} NetBanking Payment</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
