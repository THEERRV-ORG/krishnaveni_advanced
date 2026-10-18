import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  BarChart3, 
  Calendar, 
  Users, 
  DollarSign, 
  Settings, 
  X, 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Video, 
  Download, 
  LogOut, 
  RefreshCw,
  FileText,
  Sparkles,
  Building,
  Activity,
  Share2,
  Send,
  MessageCircle,
  MessageSquare,
  Lock,
  Key,
  Eye,
  EyeOff,
  Mail,
  Stethoscope,
  Camera,
  UploadCloud,
  Copy,
  ExternalLink,
  Zap,
  Check,
  HelpCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Smartphone,
  AlertCircle
} from 'lucide-react';
import { Appointment, Service, AdminStats, PaymentRecord, Testimonial, GalleryItem, FAQItem, Doctor } from '../types';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
  onRefreshServices: () => void;
  doctor?: Doctor;
  onDoctorUpdated?: (doctor: Doctor) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  services,
  onRefreshServices,
  doctor,
  onDoctorUpdated
}) => {
  // Stored Admin Credentials (persist in localStorage)
  const [savedEmail, setSavedEmail] = useState(() => {
    return localStorage.getItem('kpv_admin_email') || 'krishnavenirehab@gmail.com';
  });
  const [savedPassword, setSavedPassword] = useState(() => {
    return localStorage.getItem('kpv_admin_password') || 'admin123';
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [inputEmail, setInputEmail] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Inside Security Tab Form State
  const [newEmail, setNewEmail] = useState(savedEmail);
  const [newPassword, setNewPassword] = useState(savedPassword);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'doctor' | 'slots' | 'patients' | 'financials' | 'services' | 'security' | 'gateway'>('overview');

  // Doctor Profile & Photo State
  const [docName, setDocName] = useState(doctor?.name || 'Dr. P. Sai Tejaswini');
  const [docQualification, setDocQualification] = useState(doctor?.qualification || 'MPT (Neurology), BPT, MIAP');
  const [docTitle, setDocTitle] = useState(doctor?.title || 'Chief Physiotherapist & Rehabilitation Specialist');
  const [docSpecialization, setDocSpecialization] = useState(doctor?.specialization || 'Comprehensive Physiotherapy Care');
  const [docBio, setDocBio] = useState(doctor?.bio || '');
  const [docFee, setDocFee] = useState(doctor?.consultationFee || 1);
  const [docAvatarUrl, setDocAvatarUrl] = useState(doctor?.avatarUrl || '/api/doctor-photo');
  const [docMeetingLink, setDocMeetingLink] = useState(doctor?.meetingLink || '');
  const [docSaving, setDocSaving] = useState(false);
  const [docSuccessMsg, setDocSuccessMsg] = useState('');
  const [docPhotoUploading, setDocPhotoUploading] = useState(false);
  const [docPhotoError, setDocPhotoError] = useState<string | null>(null);
  const adminDoctorFileInputRef = React.useRef<HTMLInputElement>(null);

  // Synchronize with prop when doctor changes
  useEffect(() => {
    if (doctor) {
      setDocName(doctor.name || 'Dr. P. Sai Tejaswini');
      setDocQualification(doctor.qualification || 'MPT (Neurology), BPT, MIAP');
      setDocTitle(doctor.title || 'Chief Physiotherapist & Rehabilitation Specialist');
      setDocSpecialization(doctor.specialization || 'Comprehensive Physiotherapy Care');
      setDocBio(doctor.bio || '');
      setDocFee(doctor.consultationFee || 1);
      setDocAvatarUrl(doctor.avatarUrl || '/api/doctor-photo');
      if (doctor.meetingLink) {
        setDocMeetingLink(doctor.meetingLink);
      }
    }
  }, [doctor]);

  // Load backend meeting link when opened
  useEffect(() => {
    if (isOpen) {
      fetch('/api/admin/meeting-link')
        .then(r => r.json())
        .then(data => {
          if (data.meetingLink && !data.meetingLink.includes('kpv-neuo-phy')) {
            setDocMeetingLink(data.meetingLink);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const handleAdminDoctorPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDocPhotoUploading(true);
    setDocPhotoError(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        const res = await fetch('/api/admin/upload-doctor-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64Data, filename: file.name })
        });
        if (!res.ok) throw new Error('Failed to upload image');
        const data = await res.json();
        setDocAvatarUrl(data.avatarUrl);
        if (data.doctor && onDoctorUpdated) {
          onDoctorUpdated(data.doctor);
        }
        setDocSuccessMsg('Doctor photo updated successfully!');
        setTimeout(() => setDocSuccessMsg(''), 4500);
      } catch (err: any) {
        setDocPhotoError(err.message || 'Upload failed');
      } finally {
        setDocPhotoUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveDoctorProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setDocSaving(true);
    try {
      const updatedDoc: Partial<Doctor> = {
        name: docName,
        qualification: docQualification,
        title: docTitle,
        specialization: docSpecialization,
        bio: docBio,
        consultationFee: Number(docFee),
        avatarUrl: docAvatarUrl,
        meetingLink: docMeetingLink
      };
      const res = await fetch('/api/clinic-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          doctor: updatedDoc,
          clinic: { 
            teleConsultationLink: docMeetingLink,
            googleMeetLink: docMeetingLink 
          }
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.doctor && onDoctorUpdated) {
          onDoctorUpdated(data.doctor);
        }
        setDocSuccessMsg('Doctor profile saved successfully!');
        setTimeout(() => setDocSuccessMsg(''), 4500);
      }
    } catch (err) {
      console.error('Error saving doctor profile:', err);
    } finally {
      setDocSaving(false);
    }
  };

  // Razorpay & UPI Payment Gateway State
  const [razorpayKeyIdInput, setRazorpayKeyIdInput] = useState('');
  const [razorpayKeySecretInput, setRazorpayKeySecretInput] = useState('');
  const [upiIdInput, setUpiIdInput] = useState('9490605809@axl');
  const [gatewayIsConfigured, setGatewayIsConfigured] = useState(false);
  const [gatewaySaveMsg, setGatewaySaveMsg] = useState('');
  const [savingGateway, setSavingGateway] = useState(false);
  const [showKeySecret, setShowKeySecret] = useState(false);

  // Official Meta WhatsApp Cloud API State
  const [fast2smsKeyInput, setFast2smsKeyInput] = useState('');
  const [whatsappTokenInput, setWhatsappTokenInput] = useState('');
  const [whatsappPhoneIdInput, setWhatsappPhoneIdInput] = useState('');
  const [whatsappBusinessAccountIdInput, setWhatsappBusinessAccountIdInput] = useState('');
  const [whatsappTemplateNameInput, setWhatsappTemplateNameInput] = useState('');
  const [whatsappVerifyTokenInput, setWhatsappVerifyTokenInput] = useState('krishnaveni_webhook_secret');
  const [webhookCallbackUrl, setWebhookCallbackUrl] = useState('');
  const [showWhatsappToken, setShowWhatsappToken] = useState(false);
  const [twilioSidInput, setTwilioSidInput] = useState('');
  const [twilioTokenInput, setTwilioTokenInput] = useState('');
  const [twilioNumberInput, setTwilioNumberInput] = useState('');
  const [whatsappWebhookUrlInput, setWhatsappWebhookUrlInput] = useState('');
  const [isWhatsappConfigured, setIsWhatsappConfigured] = useState(false);
  const [isWhatsappCloudConfigured, setIsWhatsappCloudConfigured] = useState(false);
  const [whatsappSaveMsg, setWhatsappSaveMsg] = useState('');
  const [savingWhatsapp, setSavingWhatsapp] = useState(false);

  // Live Test WhatsApp State
  const [testWhatsappPhone, setTestWhatsappPhone] = useState('9490605809');
  const [sendingTestWhatsapp, setSendingTestWhatsapp] = useState(false);
  const [testWhatsappResult, setTestWhatsappResult] = useState<{
    success: boolean;
    message?: string;
    messageId?: string;
    method?: string;
    recipient?: string;
    error?: string;
    advice?: string;
  } | null>(null);

  // UI helpers
  const [showMetaSetupGuide, setShowMetaSetupGuide] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [resendingAptId, setResendingAptId] = useState<string | null>(null);
  const [resendStatusMsg, setResendStatusMsg] = useState<{ aptId: string; text: string; isSuccess: boolean } | null>(null);

  // Clinic Gmail SMTP State (Two-Step Verification App Password)
  const [smtpUserInput, setSmtpUserInput] = useState('krishnavenirehab@gmail.com');
  const [smtpPassInput, setSmtpPassInput] = useState('hhwg weug xovn tsxj');
  const [testEmailInput, setTestEmailInput] = useState('kbharathkumar654@gmail.com');
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const [savingEmailConfig, setSavingEmailConfig] = useState(false);
  const [emailSaveMsg, setEmailSaveMsg] = useState('');

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Edit Meeting Link Modal State
  const [editingApt, setEditingApt] = useState<Appointment | null>(null);
  const [meetLinkInput, setMeetLinkInput] = useState('');
  const [meetPassInput, setMeetPassInput] = useState('');

  // Service Edit Form State
  const [editingService, setEditingService] = useState<Service | null>(null);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      inputEmail.trim().toLowerCase() === savedEmail.toLowerCase() &&
      inputPassword === savedPassword
    ) {
      setIsAdminLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Invalid email or password. Please check your credentials and try again.');
    }
  };

  const handleSaveNewCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newPassword) return;

    const trimmedEmail = newEmail.trim();
    localStorage.setItem('kpv_admin_email', trimmedEmail);
    localStorage.setItem('kpv_admin_password', newPassword);

    setSavedEmail(trimmedEmail);
    setSavedPassword(newPassword);
    setSaveSuccessMsg('Admin login credentials updated successfully! Use your new details for future logins.');
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  useEffect(() => {
    if (isAdminLoggedIn && isOpen) {
      fetchAdminData();
    }
  }, [isAdminLoggedIn, isOpen, activeTab]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, aptsRes, payRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/appointments'),
        fetch('/api/payments/history')
      ]);

      const statsData = await statsRes.json();
      const aptsData = await aptsRes.json();
      const payData = await payRes.json();

      setStats(statsData);
      setAppointments(aptsData || []);
      setPayments(payData || []);

      // Fetch Gateway Config
      try {
        const gwRes = await fetch('/api/payments/gateway-config');
        if (gwRes.ok) {
          const gwData = await gwRes.json();
          setGatewayIsConfigured(Boolean(gwData.isConfigured));
          setIsWhatsappConfigured(Boolean(gwData.isWhatsappConfigured));
          setIsWhatsappCloudConfigured(Boolean(gwData.whatsappCloudConfigured));
          if (gwData.clinicVpa) setUpiIdInput(gwData.clinicVpa);
          if (gwData.keyId) setRazorpayKeyIdInput(gwData.keyId);
          if (gwData.whatsappPhoneId) setWhatsappPhoneIdInput(gwData.whatsappPhoneId);
          if (gwData.whatsappBusinessAccountId) setWhatsappBusinessAccountIdInput(gwData.whatsappBusinessAccountId);
          if (gwData.whatsappTemplateName) setWhatsappTemplateNameInput(gwData.whatsappTemplateName);
          if (gwData.whatsappWebhookVerifyToken) setWhatsappVerifyTokenInput(gwData.whatsappWebhookVerifyToken);
          if (gwData.fast2smsKey) setFast2smsKeyInput(gwData.fast2smsKey);
          if (gwData.whatsappWebhookUrl) setWhatsappWebhookUrlInput(gwData.whatsappWebhookUrl);
          if (gwData.webhookUrl) {
            setWebhookCallbackUrl(gwData.webhookUrl);
          } else {
            setWebhookCallbackUrl(`${window.location.origin}/api/whatsapp/webhook`);
          }
        }
      } catch (e) {}
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleSaveWhatsappGateway = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingWhatsapp(true);
    setWhatsappSaveMsg('');
    try {
      const payload: Record<string, string> = {
        whatsappPhoneId: whatsappPhoneIdInput.trim(),
        whatsappBusinessAccountId: whatsappBusinessAccountIdInput.trim(),
        whatsappTemplateName: whatsappTemplateNameInput.trim(),
        whatsappWebhookVerifyToken: whatsappVerifyTokenInput.trim(),
        fast2smsKey: fast2smsKeyInput.trim(),
        twilioSid: twilioSidInput.trim(),
        twilioNumber: twilioNumberInput.trim(),
        whatsappWebhookUrl: whatsappWebhookUrlInput.trim()
      };
      if (whatsappTokenInput.trim()) payload.whatsappToken = whatsappTokenInput.trim();
      if (twilioTokenInput.trim()) payload.twilioToken = twilioTokenInput.trim();

      const res = await fetch('/api/admin/gateway-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setIsWhatsappConfigured(Boolean(data.isWhatsappConfigured));
        setIsWhatsappCloudConfigured(Boolean(data.whatsappCloudConfigured));
        setWhatsappSaveMsg('✓ Official Meta WhatsApp Cloud API settings saved successfully! Background auto-dispatch is enabled.');
      } else {
        setWhatsappSaveMsg(`Error: ${data.error || 'Failed to update WhatsApp settings'}`);
      }
    } catch (err) {
      setWhatsappSaveMsg('Error contacting server.');
    } finally {
      setSavingWhatsapp(false);
    }
  };

  const handleSendTestWhatsapp = async () => {
    if (!testWhatsappPhone.trim()) {
      setTestWhatsappResult({
        success: false,
        error: 'Please enter a target 10-digit mobile number to test delivery.'
      });
      return;
    }
    setSendingTestWhatsapp(true);
    setTestWhatsappResult(null);

    try {
      const res = await fetch('/api/admin/test-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: testWhatsappPhone.trim(),
          whatsappToken: whatsappTokenInput.trim(),
          whatsappPhoneId: whatsappPhoneIdInput.trim(),
          whatsappTemplateName: whatsappTemplateNameInput.trim()
        })
      });
      const data = await res.json();
      setTestWhatsappResult(data);
    } catch (err: any) {
      setTestWhatsappResult({
        success: false,
        error: err.message || 'Network error communicating with Meta WhatsApp test endpoint'
      });
    } finally {
      setSendingTestWhatsapp(false);
    }
  };

  const handleResendAppointmentWhatsapp = async (aptId: string) => {
    setResendingAptId(aptId);
    setResendStatusMsg(null);
    try {
      const res = await fetch(`/api/appointments/${aptId}/resend-notifications`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok && (data.whatsapp?.sent || data.success)) {
        setResendStatusMsg({
          aptId,
          text: `✓ Dispatched to patient via ${data.whatsapp?.method || 'Meta WhatsApp'}!`,
          isSuccess: true
        });
        fetchAdminData();
      } else {
        setResendStatusMsg({
          aptId,
          text: data.whatsapp?.metaError || data.whatsapp?.reason || 'Failed to dispatch WhatsApp',
          isSuccess: false
        });
      }
    } catch (e: any) {
      setResendStatusMsg({
        aptId,
        text: 'Network error resending WhatsApp',
        isSuccess: false
      });
    } finally {
      setResendingAptId(null);
      setTimeout(() => setResendStatusMsg(null), 5000);
    }
  };

  const handleSaveGateway = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingGateway(true);
    setGatewaySaveMsg('');
    try {
      const res = await fetch('/api/admin/gateway-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpayKeyId: razorpayKeyIdInput.trim(),
          razorpayKeySecret: razorpayKeySecretInput.trim(),
          upiId: upiIdInput.trim()
        })
      });
      const data = await res.json();
      if (res.ok) {
        setGatewayIsConfigured(Boolean(data.isConfigured));
        setGatewaySaveMsg('✓ Clinic UPI ID & Gateway settings saved successfully! Payments will reflect your updated UPI ID.');
      } else {
        setGatewaySaveMsg(`Error: ${data.error || 'Failed to update credentials'}`);
      }
    } catch (e: any) {
      setGatewaySaveMsg(`Failed: ${e.message}`);
    } finally {
      setSavingGateway(false);
    }
  };

  const handleSaveEmailConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEmailConfig(true);
    setEmailSaveMsg('');
    try {
      const res = await fetch('/api/admin/notification-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smtpHost: 'smtp.gmail.com',
          smtpPort: 465,
          smtpUser: smtpUserInput.trim(),
          smtpPass: smtpPassInput.replace(/\s+/g, ''),
          smtpFrom: `"Krishnaveni Advanced Physiotherapy" <${smtpUserInput.trim()}>`
        })
      });
      const data = await res.json();
      if (res.ok) {
        setEmailSaveMsg('✓ Clinic Gmail App Password saved successfully! Automated emails are active.');
      } else {
        setEmailSaveMsg(`Error: ${data.error || 'Failed to save settings'}`);
      }
    } catch (err) {
      setEmailSaveMsg('Failed to contact server.');
    } finally {
      setSavingEmailConfig(false);
    }
  };

  const handleSendTestEmail = async () => {
    setSendingTestEmail(true);
    setTestEmailResult(null);
    try {
      const res = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmailInput.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestEmailResult({ success: true, message: `✓ Email successfully delivered to ${testEmailInput}!` });
      } else {
        setTestEmailResult({ success: false, message: `Error: ${data.error || 'Failed to send test email'}` });
      }
    } catch (err: any) {
      setTestEmailResult({ success: false, message: `Failed: ${err.message}` });
    } finally {
      setSendingTestEmail(false);
    }
  };

  const handleUpdateStatus = async (aptId: string, status: string) => {
    try {
      const res = await fetch(`/api/appointments/${aptId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveMeetingLink = async () => {
    if (!editingApt) return;
    try {
      const res = await fetch(`/api/appointments/${editingApt.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingLink: meetLinkInput,
          meetingPassword: meetPassInput
        })
      });
      if (res.ok) {
        setEditingApt(null);
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const filteredAppointments = (appointments || []).filter(a => {
    if (!a) return false;
    const term = (searchTerm || '').trim().toLowerCase();
    const id = (a.id || '').toLowerCase();
    const patientName = (a.patientName || '').toLowerCase();
    const patientPhone = (a.patientPhone || '').toString();
    const serviceName = (a.serviceName || '').toLowerCase();
    const status = a.status || 'Confirmed';

    const matchesSearch = 
      !term ||
      id.includes(term) ||
      patientName.includes(term) ||
      patientPhone.includes(term) ||
      serviceName.includes(term);
    
    const matchesStatus = statusFilter === 'All' || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="bg-white max-w-6xl w-full rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-auto relative">
        
        {/* Header */}
        <div className="bg-slate-950 text-white p-6 sm:px-8 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">Admin Control Dashboard</h2>
              <p className="text-xs text-amber-400">Dr. P. Sai Tejaswini, MPT (Neuro), MIAP • Krishnaveni Rehab</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Check */}
        {!isAdminLoggedIn ? (
          <div className="p-8 max-w-md mx-auto space-y-6 text-center">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-slate-900">Admin Portal Login</h3>
              <p className="text-xs text-slate-500 mt-1">Manage Clinic Appointments, Video Links, Slots & Revenue Reports</p>
            </div>

            {loginError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-bold text-left flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Admin Email</label>
                <input
                  type="email"
                  required
                  placeholder="Enter admin email"
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter admin password"
                    value={inputPassword}
                    onChange={(e) => setInputPassword(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-3 pr-10 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-sm py-3 rounded-xl shadow transition-all flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Access Admin Dashboard</span>
              </button>
            </form>
          </div>
        ) : (
          /* Admin Main Interface */
          <div>
            {/* Navigation Tabs Bar */}
            <div className="bg-slate-900 text-slate-300 px-6 py-3 border-b border-slate-800 flex items-center justify-between text-xs font-bold overflow-x-auto">
              <div className="flex items-center gap-1">
                {[
                  { id: 'overview', label: 'Overview Stats', icon: BarChart3 },
                  { id: 'appointments', label: 'Appointments', icon: Calendar },
                  { id: 'doctor', label: 'Doctor Profile & Photo', icon: Stethoscope },
                  { id: 'financials', label: 'Revenue & Razorpay', icon: DollarSign },
                  { id: 'gateway', label: 'Payment & WhatsApp Gateways', icon: ShieldCheck },
                  { id: 'services', label: 'Services & Fees', icon: Settings },
                  { id: 'security', label: 'Account & Password', icon: Lock },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isSel = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSel ? 'bg-amber-500 text-slate-950 font-extrabold shadow' : 'hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                      {tab.id === 'appointments' && appointments.length > 0 && (
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          isSel ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {appointments.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3">
                <a
                  href="/api/reports/export?type=appointments"
                  download
                  className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </a>
                <button
                  onClick={() => setIsAdminLoggedIn(false)}
                  className="text-rose-400 hover:text-rose-300 font-bold"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="p-6 sm:p-8 max-h-[72vh] overflow-y-auto space-y-6">
              
              {/* TAB 1: OVERVIEW STATS */}
              {activeTab === 'overview' && stats && (
                <div className="space-y-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                      <p className="text-xs font-bold text-slate-500 uppercase">Today's Appointments</p>
                      <p className="text-3xl font-black text-blue-700 mt-1">{stats.todayAppointmentsCount}</p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                      <p className="text-xs font-bold text-slate-500 uppercase">Total Revenue (INR)</p>
                      <p className="text-3xl font-black text-emerald-600 mt-1">₹{stats.totalRevenueINR}</p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                      <p className="text-xs font-bold text-slate-500 uppercase">Pending Consultations</p>
                      <p className="text-3xl font-black text-amber-600 mt-1">{stats.pendingConsultationsCount}</p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                      <p className="text-xs font-bold text-slate-500 uppercase">Total Unique Patients</p>
                      <p className="text-3xl font-black text-cyan-700 mt-1">{stats.totalPatientsCount}</p>
                    </div>
                  </div>

                  {/* Audit Logs */}
                  <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-3">
                    <h3 className="text-sm font-bold text-amber-400">Recent Clinic System Activity Logs</h3>
                    <div className="space-y-2 text-xs">
                      {stats.recentActivity.map((log) => (
                        <div key={log.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-cyan-300">{log.action}:</span>{' '}
                            <span className="text-slate-300">{log.details}</span>
                          </div>
                          <span className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: APPOINTMENT MANAGEMENT */}
              {activeTab === 'appointments' && (
                <div className="space-y-4">
                  {/* Top Bar: Live Counter, Refresh & Filters */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <div className="relative flex-1 min-w-[220px]">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="Search patient name, phone, or APT ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-600">Status:</span>
                      {['All', 'Confirmed', 'Completed', 'Cancelled'].map((st) => (
                        <button
                          key={st}
                          onClick={() => setStatusFilter(st)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            statusFilter === st ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 border hover:bg-slate-100'
                          }`}
                        >
                          {st}
                        </button>
                      ))}

                      <button
                        type="button"
                        onClick={fetchAdminData}
                        disabled={loading}
                        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
                        title="Reload Appointments from Server"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Loading Indicator */}
                  {loading && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-blue-700 animate-pulse">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Loading latest appointments from clinic database...</span>
                    </div>
                  )}

                  {/* Empty State */}
                  {!loading && filteredAppointments.length === 0 ? (
                    <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mx-auto">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">No Appointments Found</h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        {searchTerm || statusFilter !== 'All'
                          ? `No appointments match "${searchTerm || statusFilter}". Try clearing your search.`
                          : "No patient appointments have been booked yet."}
                      </p>
                      {(searchTerm || statusFilter !== 'All') && (
                        <button
                          onClick={() => { setSearchTerm(''); setStatusFilter('All'); }}
                          className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                        >
                          Clear Search & Filters
                        </button>
                      )}
                    </div>
                  ) : (
                    /* Table */
                    <div className="border border-slate-200 rounded-2xl overflow-x-auto bg-white shadow-xs">
                      <table className="w-full text-left text-xs text-slate-700">
                        <thead className="bg-slate-100 font-bold text-slate-900 uppercase">
                          <tr>
                            <th className="p-3">APT ID</th>
                            <th className="p-3">Patient Details</th>
                            <th className="p-3">Service & Mode</th>
                            <th className="p-3">Date & Slot</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {filteredAppointments.map((apt) => (
                            <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                              <td className="p-3 font-bold text-blue-700 font-mono">{apt.id}</td>
                              <td className="p-3">
                                <p className="font-bold text-slate-900">{apt.patientName || 'Patient'} ({apt.patientAge || 30}y)</p>
                                <p className="text-[10px] text-slate-500">{apt.patientPhone || '—'} | {apt.patientEmail || '—'}</p>
                              </td>
                              <td className="p-3">
                                <p className="font-semibold">{apt.serviceName || 'Online Video Consultation'}</p>
                                <span className="text-[10px] text-cyan-700 font-bold bg-cyan-50 px-1.5 py-0.5 rounded">
                                  {apt.consultationType || 'Online Consultation'}
                                </span>
                              </td>
                              <td className="p-3">
                                <p className="font-bold">{apt.date || '—'}</p>
                                <p className="text-[10px] text-slate-500">{apt.timeSlot || '—'}</p>
                              </td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-full font-extrabold text-[10px] ${
                                  apt.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' :
                                  apt.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                                  'bg-rose-100 text-rose-800'
                                }`}>
                                  {apt.status || 'Confirmed'}
                                </span>
                              </td>
                              <td className="p-3 text-right space-x-1 whitespace-nowrap">
                                {/* Direct Meta WhatsApp API Automated Dispatch */}
                                <button
                                  onClick={() => handleResendAppointmentWhatsapp(apt.id)}
                                  disabled={resendingAptId === apt.id}
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                                    (apt as any).whatsappDeliveryStatus === 'DELIVERED' || (apt as any).whatsappDispatched
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                                  }`}
                                  title="Dispatch consultation confirmation & Google Meet link directly via Meta WhatsApp Cloud API"
                                >
                                  <Zap className={`w-3 h-3 text-emerald-600 ${resendingAptId === apt.id ? 'animate-spin' : ''}`} />
                                  <span>
                                    {resendingAptId === apt.id 
                                      ? 'Pushing...' 
                                      : (apt as any).whatsappDeliveryStatus || 'Auto Push'}
                                  </span>
                                </button>

                                {(() => {
                                  const cleanPhone = (apt.patientPhone || '').replace(/\D/g, '');
                                  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                                  const waMsg = `🏥 *KRISHNAVENI ADVANCED PHYSIOTHERAPY & REHABILITATION SERVICES*
Appointment Confirmation Details:

📌 *Appointment ID:* ${apt.id}
👤 *Patient:* ${apt.patientName || 'Patient'} (${apt.patientAge || 30} yrs)
🩺 *Specialist Doctor:* Dr. P. Sai Tejaswini, MPT (Neuro), MIAP
💆 *Service:* ${apt.serviceName || 'Online Video Consultation'}
💻 *Consultation Mode:* 100% Online Google Meet Video Consultation
📅 *Date & Slot:* ${apt.date || 'Scheduled'} (${apt.timeSlot || 'Slot'})

📹 *Video Consultation Link:* ${(apt.meetingLink && !apt.meetingLink.includes('kpv-neuo-phy')) ? apt.meetingLink : `https://meet.jit.si/KrishnaveniRehab_${apt.id}`}
🔑 *Passcode:* ${apt.meetingPassword || 'KPV-REHAB'}

💳 *Amount Paid:* ₹${apt.amountPaid || 500}
📧 *Support Email:* krishnavenirehab@gmail.com`;
                                  const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(waMsg)}`;

                                  return (
                                    <a
                                      href={waUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-block p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg"
                                      title="Open Manual WhatsApp Web Chat"
                                    >
                                      <MessageCircle className="w-4 h-4" />
                                    </a>
                                  );
                                })()}

                                {(apt.consultationType === 'Online Consultation' || !apt.consultationType) && (
                                  <button
                                    onClick={() => {
                                      setEditingApt(apt);
                                      setMeetLinkInput(apt.meetingLink || '');
                                      setMeetPassInput(apt.meetingPassword || '');
                                    }}
                                    className="p-1.5 text-blue-700 hover:bg-blue-100 rounded-lg cursor-pointer"
                                    title="Edit Video Link"
                                  >
                                    <Video className="w-4 h-4" />
                                  </button>
                                )}
                                
                                {apt.status === 'Confirmed' && (
                                  <button
                                    onClick={() => handleUpdateStatus(apt.id, 'Completed')}
                                    className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg cursor-pointer"
                                    title="Mark Completed"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                  </button>
                                )}

                                {apt.status !== 'Cancelled' && (
                                  <button
                                    onClick={() => handleUpdateStatus(apt.id, 'Cancelled')}
                                    className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg cursor-pointer"
                                    title="Cancel Appointment"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                </div>
              )}

              {/* TAB: DOCTOR PROFILE & PHOTO */}
              {activeTab === 'doctor' && (
                <div className="space-y-6 text-left max-w-4xl mx-auto">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Dr. P. Sai Tejaswini — Specialist Profile & Photo</h3>
                      <p className="text-xs text-slate-500">Update clinic specialist details, display portrait, and bio shown across the website.</p>
                    </div>
                    {docSuccessMsg && (
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        {docSuccessMsg}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    {/* Left Column: Photo Preview & Upload */}
                    <div className="md:col-span-5 space-y-4">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                        Current Specialist Photo
                      </label>
                      
                      <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-950 aspect-[3/4] max-w-sm mx-auto shadow-inner">
                        <img
                          src={docAvatarUrl || '/api/doctor-photo'}
                          alt={docName}
                          className="w-full h-full object-cover object-top"
                          referrerPolicy="no-referrer"
                        />
                        {docPhotoUploading && (
                          <div className="absolute inset-0 bg-slate-900/70 flex flex-col items-center justify-center text-white gap-2">
                            <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
                            <span className="text-xs font-bold">Uploading & saving photo...</span>
                          </div>
                        )}
                      </div>

                      <input
                        ref={adminDoctorFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAdminDoctorPhotoUpload}
                        className="hidden"
                      />

                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => adminDoctorFileInputRef.current?.click()}
                          disabled={docPhotoUploading}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Upload New Photo (JPEG, PNG)</span>
                        </button>
                        
                        <div className="pt-1">
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">
                            Or Direct Image URL
                          </label>
                          <input
                            type="url"
                            value={docAvatarUrl}
                            onChange={(e) => setDocAvatarUrl(e.target.value)}
                            placeholder="https://example.com/doctor-photo.jpg"
                            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1 pt-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Quick Curated Presets:</span>
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              type="button"
                              onClick={() => setDocAvatarUrl('https://images.unsplash.com/photo-1594824813624-912f7a0ce733?auto=format&fit=crop&q=80&w=800')}
                              className="text-[10px] font-semibold bg-slate-100 hover:bg-blue-50 hover:text-blue-700 py-1 px-2 rounded border border-slate-200 truncate cursor-pointer text-left"
                            >
                              White Coat & Stethoscope
                            </button>
                            <button
                              type="button"
                              onClick={() => setDocAvatarUrl('https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=800')}
                              className="text-[10px] font-semibold bg-slate-100 hover:bg-blue-50 hover:text-blue-700 py-1 px-2 rounded border border-slate-200 truncate cursor-pointer text-left"
                            >
                              Consultation Suite
                            </button>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-500 text-center pt-1">
                          Select Dr. Sai Tejaswini's photo (e.g. WhatsApp Image). Recommended: 3:4 portrait ratio.
                        </p>
                      </div>

                      {docPhotoError && (
                        <p className="text-xs font-semibold text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                          {docPhotoError}
                        </p>
                      )}
                    </div>

                    {/* Right Column: Doctor Details Form */}
                    <form onSubmit={handleSaveDoctorProfile} className="md:col-span-7 space-y-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                          Doctor Full Name
                        </label>
                        <input
                          type="text"
                          value={docName}
                          onChange={(e) => setDocName(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                            Qualifications
                          </label>
                          <input
                            type="text"
                            value={docQualification}
                            onChange={(e) => setDocQualification(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                            Consultation Fee (₹)
                          </label>
                          <input
                            type="number"
                            value={docFee}
                            onChange={(e) => setDocFee(Number(e.target.value))}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                          Clinical Title
                        </label>
                        <input
                          type="text"
                          value={docTitle}
                          onChange={(e) => setDocTitle(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                          Specialization Focus
                        </label>
                        <input
                          type="text"
                          value={docSpecialization}
                          onChange={(e) => setDocSpecialization(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                          Specialist Biography
                        </label>
                        <textarea
                          rows={4}
                          value={docBio}
                          onChange={(e) => setDocBio(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Doctor Google Meet & Live Consultation Room Link */}
                      <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <label className="text-xs font-extrabold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                            <Video className="w-4 h-4 text-blue-600" />
                            <span>Doctor Google Meet / Video Consultation Room Link</span>
                          </label>
                          <a
                            href="https://meet.google.com/new"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-bold text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-1"
                          >
                            <span>Create Room on Google Meet</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={docMeetingLink}
                            onChange={(e) => setDocMeetingLink(e.target.value)}
                            placeholder="e.g. https://meet.google.com/abc-defg-hij or https://meet.jit.si/..."
                            className="flex-1 px-4 py-2.5 bg-white border border-blue-200 rounded-xl text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          {docMeetingLink && (
                            <a
                              href={docMeetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 transition-colors shadow-xs"
                            >
                              <span>Test Link</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <p className="text-[11px] text-blue-900/80 leading-relaxed">
                          💡 <strong>How it works:</strong> Create a meeting link once in Google Calendar or at <strong>meet.google.com</strong>, paste it here, and save. This real link will be automatically dispatched in all booking confirmation emails, WhatsApp notices, and patient portals.
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={docSaving}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold text-sm py-3 rounded-xl shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {docSaving ? <RefreshCw className="w-4 h-4 animate-spin text-amber-400" /> : <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                        <span>{docSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 3: REVENUE & RAZORPAY */}
              {activeTab === 'financials' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Razorpay Transaction Ledger</h3>
                  
                  <div className="border border-slate-200 rounded-2xl overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-100 font-bold text-slate-900 uppercase">
                        <tr>
                          <th className="p-3">Payment ID / Ref</th>
                          <th className="p-3">Method</th>
                          <th className="p-3">Patient</th>
                          <th className="p-3">Service</th>
                          <th className="p-3">Net</th>
                          <th className="p-3">GST (18%)</th>
                          <th className="p-3">Total Paid</th>
                          <th className="p-3">Gateway Order</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {payments.map((p) => (
                          <tr key={p.id}>
                            <td className="p-3 font-bold text-emerald-700 font-mono text-[11px]">{p.razorpayPaymentId}</td>
                            <td className="p-3 text-[11px] text-slate-600 font-medium">{p.paymentMethod || 'Razorpay UPI'}</td>
                            <td className="p-3 font-semibold">{p.patientName}</td>
                            <td className="p-3">{p.serviceName}</td>
                            <td className="p-3">₹{p.amount}</td>
                            <td className="p-3">₹{p.gstAmount}</td>
                            <td className="p-3 font-bold text-slate-900">₹{p.totalAmount}</td>
                            <td className="p-3 font-mono text-[10px]">{p.razorpayOrderId}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: SERVICES MANAGEMENT */}
              {activeTab === 'services' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Manage Treatment Pricing & Durations</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {services.map((srv) => (
                      <div key={srv.id} className="bg-slate-50 border p-4 rounded-2xl flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{srv.title}</p>
                          <p className="text-xs text-slate-500">{srv.durationMinutes} mins • {srv.category}</p>
                        </div>
                        <span className="font-extrabold text-blue-700 text-base">₹{srv.feeINR}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: ACCOUNT & SECURITY MANAGEMENT */}
              {activeTab === 'security' && (
                <div className="max-w-xl mx-auto space-y-6 py-2 text-left">
                  <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-4 border border-slate-800 shadow-xl">
                    <div className="flex items-center gap-3 text-amber-400">
                      <Lock className="w-6 h-6" />
                      <div>
                        <h3 className="text-lg font-bold">Configure Master Admin Credentials</h3>
                        <p className="text-xs text-slate-400">Update the master email and password for the Admin Control Portal</p>
                      </div>
                    </div>

                    {saveSuccessMsg && (
                      <div className="p-3.5 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                        <span>{saveSuccessMsg}</span>
                      </div>
                    )}

                    <form onSubmit={handleSaveNewCredentials} className="space-y-4 pt-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">New Admin Email Address</label>
                        <input
                          type="email"
                          required
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">New Admin Password</label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 pr-10 text-xs text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs py-3 rounded-xl shadow transition-all flex items-center justify-center gap-2"
                      >
                        <Key className="w-4 h-4" />
                        <span>Save & Update Admin Credentials</span>
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 6: RAZORPAY MERCHANT PAYMENT GATEWAY (RED BUS / SWIGGY ZERO-TAP CONFIG) */}
              {activeTab === 'gateway' && (
                <div className="max-w-2xl mx-auto space-y-6 py-2 text-left">
                  <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-5 border border-slate-800 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-cyan-400">
                        <ShieldCheck className="w-6 h-6" />
                        <div>
                          <h3 className="text-lg font-bold text-white">Razorpay Merchant Gateway Settings</h3>
                          <p className="text-xs text-slate-400">Enables RedBus & Swiggy-style automatic payment detection with zero manual taps</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        gatewayIsConfigured
                          ? 'bg-emerald-950 border-emerald-500 text-emerald-400'
                          : 'bg-amber-950 border-amber-500 text-amber-400'
                      }`}>
                        {gatewayIsConfigured ? '● Gateway Active' : '○ Sandbox Test Mode'}
                      </span>
                    </div>

                    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 space-y-2">
                      <p className="font-bold text-white flex items-center gap-1.5">
                        <span className="text-cyan-400">ℹ️</span> How Zero-Tap Redirection Works:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px] leading-relaxed">
                        <li><strong>Direct Clinic UPI (9490605809@axl):</strong> Patients scan with any UPI app (GPay, PhonePe, Paytm). The UI uses real-time radar detection without confusing manual confirm buttons.</li>
                        <li><strong>Cryptographic Webhook (/api/webhooks/payment):</strong> Validates Razorpay HMAC signatures, processes order updates, and automatically confirms bookings with <strong>0 extra clicks</strong>.</li>
                      </ul>
                    </div>

                    {gatewaySaveMsg && (
                      <div className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 border ${
                        gatewaySaveMsg.startsWith('✓')
                          ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                          : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
                      }`}>
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                        <span>{gatewaySaveMsg}</span>
                      </div>
                    )}

                    <form onSubmit={handleSaveGateway} className="space-y-4 pt-1">
                      <div className="bg-slate-950 p-4 rounded-xl border border-cyan-500/30 space-y-2">
                        <label className="block text-xs font-bold text-cyan-300 flex items-center justify-between">
                          <span>Clinic Primary UPI ID (for Dynamic QR Code Payments)</span>
                          <span className="text-[10px] text-emerald-400 font-normal">Active in Checkout</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={upiIdInput}
                          onChange={(e) => setUpiIdInput(e.target.value)}
                          placeholder="e.g. 9490605809@axl or clinic@upi"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white font-mono font-bold focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        />
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          This UPI ID is encoded into the prominent Dynamic QR Code displayed to patients on Step 3 of booking. Patients can scan it with GPay, PhonePe, Paytm, or BHIM.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          Razorpay Key ID <span className="text-slate-500 font-normal">(starts with rzp_live_ or rzp_test_)</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={razorpayKeyIdInput}
                          onChange={(e) => setRazorpayKeyIdInput(e.target.value)}
                          placeholder="e.g. rzp_live_xxxxxxxxxxxx or rzp_test_xxxxxxxxxxxx"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          Razorpay Key Secret <span className="text-slate-500 font-normal">(kept securely on clinic server)</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showKeySecret ? 'text' : 'password'}
                            value={razorpayKeySecretInput}
                            onChange={(e) => setRazorpayKeySecretInput(e.target.value)}
                            placeholder="Enter your Razorpay Key Secret"
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 pr-10 text-xs text-white font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowKeySecret(!showKeySecret)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                          >
                            {showKeySecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="bg-blue-950/40 border border-blue-800/40 rounded-xl p-3 text-[11px] text-blue-200">
                        <strong>Where to find these keys?</strong> Log in to your <a href="https://dashboard.razorpay.com/#/access/api-keys" target="_blank" rel="noopener noreferrer" className="underline text-cyan-300 font-bold">Razorpay Dashboard → Settings → API Keys</a> and generate or copy your Key ID and Key Secret.
                      </div>

                      <button
                        type="submit"
                        disabled={savingGateway}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-extrabold text-xs py-3 rounded-xl shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>{savingGateway ? 'Saving Gateway Keys...' : 'Save & Activate Razorpay Merchant Gateway'}</span>
                      </button>
                    </form>
                  </div>

                  {/* AUTOMATED CLINIC GMAIL NOTIFICATION ENGINE (TWO-STEP APP PASSWORD) */}
                  <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-5 border border-slate-800 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-cyan-400">
                        <Mail className="w-6 h-6" />
                        <div>
                          <h3 className="text-lg font-bold text-white">Clinic Gmail Automated Delivery</h3>
                          <p className="text-xs text-slate-400">Delivers booking confirmation, tax invoice & Google Meet link directly to patient inbox</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold border bg-emerald-950 border-emerald-500 text-emerald-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>● Google SMTP Active</span>
                      </span>
                    </div>

                    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 space-y-2">
                      <p className="font-bold text-white flex items-center gap-1.5">
                        <span className="text-emerald-400">✓</span> Two-Step Verification Connected:
                      </p>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        App Name: <strong className="text-white">krishnavenirehab</strong> • Sending From: <strong className="text-cyan-300">{smtpUserInput}</strong>.
                        Google provides 500 free transactional emails every day with zero cost.
                      </p>
                    </div>

                    {emailSaveMsg && (
                      <div className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 border ${
                        emailSaveMsg.startsWith('✓')
                          ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                          : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
                      }`}>
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                        <span>{emailSaveMsg}</span>
                      </div>
                    )}

                    <form onSubmit={handleSaveEmailConfig} className="space-y-4 pt-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Clinic Sender Gmail</label>
                          <input
                            type="email"
                            required
                            value={smtpUserInput}
                            onChange={(e) => setSmtpUserInput(e.target.value)}
                            placeholder="krishnavenirehab@gmail.com"
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Google App Password (16 Letters)</label>
                          <input
                            type="text"
                            required
                            value={smtpPassInput}
                            onChange={(e) => setSmtpPassInput(e.target.value)}
                            placeholder="hhwg weug xovn tsxj"
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={savingEmailConfig}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2.5 rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>{savingEmailConfig ? 'Updating Credentials...' : 'Save Gmail Credentials'}</span>
                      </button>
                    </form>

                    {/* Instant Verification Test Email Box */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-cyan-400">⚡ Instant Email Delivery Test</span>
                        <span className="text-[10px] text-slate-500">Live Verification</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Send a real verification email right now to confirm delivery:
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          value={testEmailInput}
                          onChange={(e) => setTestEmailInput(e.target.value)}
                          placeholder="your.email@gmail.com"
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleSendTestEmail}
                          disabled={sendingTestEmail || !testEmailInput}
                          className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-extrabold text-xs px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{sendingTestEmail ? 'Sending...' : 'Send Test Email'}</span>
                        </button>
                      </div>

                      {testEmailResult && (
                        <div className={`p-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border ${
                          testEmailResult.success
                            ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                            : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
                        }`}>
                          {testEmailResult.success ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          )}
                          <span>{testEmailResult.message}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* OFFICIAL META WHATSAPP BUSINESS CLOUD API SUITE */}
                  <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-6 border border-slate-800 shadow-xl">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                          <MessageSquare className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-white">Meta WhatsApp Business Cloud API</h3>
                            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                              Official Meta Engine
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">Automated background delivery of appointment passes, invoices, & Google Meet links</p>
                        </div>
                      </div>
                      <span className={`self-start sm:self-auto px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                        isWhatsappCloudConfigured
                          ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-xs'
                          : isWhatsappConfigured
                          ? 'bg-blue-950 border-blue-500 text-blue-300'
                          : 'bg-amber-950 border-amber-500 text-amber-300'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${isWhatsappCloudConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                        {isWhatsappCloudConfigured 
                          ? 'Meta Cloud API Live' 
                          : isWhatsappConfigured 
                          ? 'Alternative Gateway Active' 
                          : 'Awaiting Meta Credentials'}
                      </span>
                    </div>

                    {/* Free Tier & Pricing Benefits Banner */}
                    <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4 text-xs text-slate-200 space-y-3">
                      <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <span>Why Meta WhatsApp Cloud API is the Best Choice for Krishnaveni Rehab</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                        <div className="bg-slate-900/90 border border-emerald-500/20 p-3 rounded-lg space-y-1">
                          <p className="font-extrabold text-emerald-400 text-xs flex items-center gap-1">
                            <span>🎁</span> 1,000 Free Chats / Month
                          </p>
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            Meta provides <strong>1,000 free service conversations</strong> every single month. For 100–200 patients, WhatsApp is <strong>100% completely free</strong>.
                          </p>
                        </div>
                        <div className="bg-slate-900/90 border border-emerald-500/20 p-3 rounded-lg space-y-1">
                          <p className="font-extrabold text-emerald-400 text-xs flex items-center gap-1">
                            <span>💰</span> ~12 to 15 Paise in India
                          </p>
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            Beyond the free tier, utility messages in India cost just <strong>~12 to 15 paise</strong> per message — 10x cheaper than commercial SMS gateways.
                          </p>
                        </div>
                        <div className="bg-slate-900/90 border border-emerald-500/20 p-3 rounded-lg space-y-1">
                          <p className="font-extrabold text-emerald-400 text-xs flex items-center gap-1">
                            <span>⚡</span> 0-Click Automated Push
                          </p>
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            Dispatches from the server the exact instant Razorpay or UPI payment is verified. No manual typing or clicking required.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Collapsible Meta Setup Guide */}
                    <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
                      <button
                        type="button"
                        onClick={() => setShowMetaSetupGuide(!showMetaSetupGuide)}
                        className="w-full px-4 py-3 text-left flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-900 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2 text-cyan-400">
                          <HelpCircle className="w-4 h-4" />
                          <span>📘 Step-by-Step Guide: How to Get Free Meta WhatsApp Cloud API Credentials</span>
                        </div>
                        {showMetaSetupGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      {showMetaSetupGuide && (
                        <div className="p-4 border-t border-slate-800 space-y-3 text-xs text-slate-300 bg-slate-950">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1.5">
                              <span className="font-bold text-emerald-400">Step 1: Open Meta Developer Portal</span>
                              <p className="text-slate-400">
                                Visit <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" className="text-cyan-400 underline inline-flex items-center gap-0.5">developers.facebook.com <ExternalLink className="w-2.5 h-2.5" /></a> and log in with your Facebook account. Click <strong>My Apps</strong> &gt; <strong>Create App</strong>.
                              </p>
                            </div>
                            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1.5">
                              <span className="font-bold text-emerald-400">Step 2: Choose Business App Type</span>
                              <p className="text-slate-400">
                                Select <strong>Other</strong> &gt; <strong>Business</strong> as the app type. Enter your clinic app name (e.g. <em>Krishnaveni Rehab WhatsApp</em>) and submit.
                              </p>
                            </div>
                            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1.5">
                              <span className="font-bold text-emerald-400">Step 3: Add WhatsApp Product</span>
                              <p className="text-slate-400">
                                On the app dashboard, scroll down to <strong>WhatsApp</strong> and click <strong>Set Up</strong>. Then navigate to <strong>WhatsApp &gt; API Setup</strong> on the left menu.
                              </p>
                            </div>
                            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1.5">
                              <span className="font-bold text-emerald-400">Step 4: Copy Phone ID & Access Token</span>
                              <p className="text-slate-400">
                                Copy the <strong>Phone Number ID</strong> and <strong>Access Token</strong>. Paste both below, input your mobile number, and tap <em>Dispatch Live Test WhatsApp</em>!
                              </p>
                            </div>
                          </div>
                          <div className="p-2.5 bg-cyan-950/40 border border-cyan-500/30 rounded-lg text-[11px] text-cyan-300">
                            💡 <strong>Tip for 24/7 Production:</strong> In Meta Business Manager &gt; <em>Users &gt; System Users</em>, create an Admin System User and generate a permanent non-expiring token with the <code className="text-white bg-slate-900 px-1 py-0.5 rounded">whatsapp_business_messaging</code> permission.
                          </div>
                        </div>
                      )}
                    </div>

                    {whatsappSaveMsg && (
                      <div className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 border ${
                        whatsappSaveMsg.startsWith('✓')
                          ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                          : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
                      }`}>
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                        <span>{whatsappSaveMsg}</span>
                      </div>
                    )}

                    {/* Meta WhatsApp Cloud API Configuration Form */}
                    <form onSubmit={handleSaveWhatsappGateway} className="space-y-4">
                      <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Key className="w-3.5 h-3.5" /> Meta WhatsApp Cloud API Credentials
                          </span>
                          <a 
                            href="https://developers.facebook.com/apps" 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-[11px] text-cyan-400 hover:text-cyan-300 underline flex items-center gap-1"
                          >
                            Meta Developer Portal <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Phone Number ID */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[11px] font-bold text-slate-300">
                                WhatsApp Phone Number ID <span className="text-rose-400">*</span>
                              </label>
                              <span className="text-[10px] text-slate-500">From WhatsApp &gt; API Setup</span>
                            </div>
                            <input
                              type="text"
                              value={whatsappPhoneIdInput}
                              onChange={(e) => setWhatsappPhoneIdInput(e.target.value)}
                              placeholder="e.g. 106548972301452"
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                              required
                            />
                          </div>

                          {/* WhatsApp Business Account ID */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[11px] font-bold text-slate-300">
                                WhatsApp Business Account ID (WABA ID)
                              </label>
                              <span className="text-[10px] text-slate-500">Optional</span>
                            </div>
                            <input
                              type="text"
                              value={whatsappBusinessAccountIdInput}
                              onChange={(e) => setWhatsappBusinessAccountIdInput(e.target.value)}
                              placeholder="e.g. 109876543210987"
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            />
                          </div>

                          {/* WhatsApp Permanent System User Token */}
                          <div className="sm:col-span-2">
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[11px] font-bold text-slate-300">
                                WhatsApp Cloud API Access Token <span className="text-rose-400">*</span>
                              </label>
                              <button
                                type="button"
                                onClick={() => setShowWhatsappToken(!showWhatsappToken)}
                                className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                              >
                                {showWhatsappToken ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                <span>{showWhatsappToken ? 'Hide Token' : 'Show Token'}</span>
                              </button>
                            </div>
                            <div className="relative">
                              <input
                                type={showWhatsappToken ? 'text' : 'password'}
                                value={whatsappTokenInput}
                                onChange={(e) => setWhatsappTokenInput(e.target.value)}
                                placeholder="EAAG... (Temporary test token or Permanent System User token)"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 pr-20 text-xs text-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    const clipText = await navigator.clipboard.readText();
                                    if (clipText) setWhatsappTokenInput(clipText.trim());
                                  } catch (e) {}
                                }}
                                className="absolute right-2 top-2 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded cursor-pointer"
                                title="Paste from clipboard"
                              >
                                Paste
                              </button>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1">
                              For continuous 24/7 background delivery, paste a permanent System User Token generated under Meta Business Settings.
                            </p>
                          </div>

                          {/* Approved Template Name (Optional) */}
                          <div className="sm:col-span-2">
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[11px] font-bold text-slate-300">
                                Approved WhatsApp Template Name
                              </label>
                              <span className="text-[10px] text-emerald-400 font-medium">Leave blank for rich direct message</span>
                            </div>
                            <input
                              type="text"
                              value={whatsappTemplateNameInput}
                              onChange={(e) => setWhatsappTemplateNameInput(e.target.value)}
                              placeholder="e.g. appointment_confirmation (optional)"
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            />
                            <p className="text-[10px] text-slate-500 mt-1">
                              If you created an approved Meta template in WhatsApp Message Templates, enter its name here. If left blank, the server sends a dynamic rich message with interactive Google Meet video links.
                            </p>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={savingWhatsapp}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-3 rounded-xl shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{savingWhatsapp ? 'Saving Credentials...' : 'Save Meta WhatsApp Cloud API Settings'}</span>
                        </button>
                      </div>
                    </form>

                    {/* Interactive Live Test WhatsApp Dispatcher */}
                    <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5" /> Live Test WhatsApp Dispatch
                        </span>
                        <span className="text-[10px] text-slate-400">Verifies Meta Cloud API connectivity</span>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-2.5 text-slate-500 text-xs font-mono font-bold">+91</span>
                          <input
                            type="tel"
                            value={testWhatsappPhone}
                            onChange={(e) => setTestWhatsappPhone(e.target.value)}
                            placeholder="9490605809"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-12 pr-3 text-xs text-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleSendTestWhatsapp}
                          disabled={sendingTestWhatsapp}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
                        >
                          <Zap className={`w-3.5 h-3.5 ${sendingTestWhatsapp ? 'animate-spin' : ''}`} />
                          <span>{sendingTestWhatsapp ? 'Dispatching over Meta API...' : '🚀 Send Test WhatsApp'}</span>
                        </button>
                      </div>

                      {/* Test Result Display */}
                      {testWhatsappResult && (
                        <div className={`p-4 rounded-xl text-xs space-y-2 border ${
                          testWhatsappResult.success
                            ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                            : 'bg-rose-950/80 border-rose-500/50 text-rose-200'
                        }`}>
                          <div className="flex items-center gap-2 font-bold text-sm">
                            {testWhatsappResult.success ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                            )}
                            <span>{testWhatsappResult.success ? 'Message Successfully Dispatched!' : 'Meta Cloud API Error'}</span>
                          </div>

                          {testWhatsappResult.success ? (
                            <div className="space-y-1 text-[11px] text-emerald-300">
                              <p>{testWhatsappResult.message}</p>
                              {testWhatsappResult.messageId && (
                                <p className="font-mono text-[10px] text-emerald-400/90 bg-emerald-900/40 px-2 py-1 rounded">
                                  Meta Message ID: {testWhatsappResult.messageId}
                                </p>
                              )}
                              <p className="text-slate-300 pt-1">
                                Check WhatsApp on your mobile phone. The patient booking pass with Google Meet link has been delivered!
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-1.5 text-[11px] text-rose-300">
                              <p className="font-mono">{testWhatsappResult.error}</p>
                              {testWhatsappResult.advice && (
                                <div className="bg-rose-900/40 p-2.5 rounded-lg border border-rose-500/30 text-rose-200">
                                  <strong>How to fix:</strong> {testWhatsappResult.advice}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Meta Webhook Verification Section */}
                    <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-cyan-400" /> Meta Webhook Configuration (For Live Delivery Receipts)
                        </span>
                        <span className="text-[10px] text-slate-500">Sent, Delivered, Read Statuses</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        To receive live delivery receipts (Sent, Delivered, Read) back from Meta, paste these into your Meta App Dashboard under <em>WhatsApp &gt; Configuration &gt; Webhook</em>:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-bold uppercase">Callback URL</label>
                          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-lg p-2">
                            <span className="font-mono text-[11px] text-white truncate flex-1 select-all">
                              {webhookCallbackUrl || `${window.location.origin}/api/whatsapp/webhook`}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(webhookCallbackUrl || `${window.location.origin}/api/whatsapp/webhook`, 'webhookUrl')}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[10px] font-bold text-cyan-400 flex items-center gap-1 cursor-pointer shrink-0"
                            >
                              {copiedField === 'webhookUrl' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedField === 'webhookUrl' ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-bold uppercase">Verify Token</label>
                          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-lg p-2">
                            <span className="font-mono text-[11px] text-white truncate flex-1 select-all">
                              {whatsappVerifyTokenInput}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(whatsappVerifyTokenInput, 'verifyToken')}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[10px] font-bold text-cyan-400 flex items-center gap-1 cursor-pointer shrink-0"
                            >
                              {copiedField === 'verifyToken' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedField === 'verifyToken' ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Secondary Fallback Options (Fast2SMS / Custom Webhook / Twilio) */}
                    <div className="border-t border-slate-800 pt-4">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                        Alternative Fallback Channels (Optional)
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-300">Fast2SMS Indian SMS Key</span>
                            <a href="https://www.fast2sms.com" target="_blank" rel="noreferrer" className="text-[10px] text-cyan-400 underline">fast2sms.com</a>
                          </div>
                          <input
                            type="text"
                            value={fast2smsKeyInput}
                            onChange={(e) => setFast2smsKeyInput(e.target.value)}
                            placeholder="Enter Fast2SMS API Key"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono focus:outline-none"
                          />
                        </div>

                        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                          <span className="text-xs font-bold text-slate-300">Custom Webhook (Make / Zapier / n8n)</span>
                          <input
                            type="url"
                            value={whatsappWebhookUrlInput}
                            onChange={(e) => setWhatsappWebhookUrlInput(e.target.value)}
                            placeholder="https://hook.eu1.make.com/... or https://hooks.zapier.com/..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>

      {/* Edit Video Link Modal */}
      {editingApt && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Assign / Edit Video Consultation Link</h3>
            <p className="text-xs text-slate-500">For Appointment: {editingApt.id} ({editingApt.patientName})</p>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Google Meet / Zoom URL</label>
              <input
                type="text"
                value={meetLinkInput}
                onChange={(e) => setMeetLinkInput(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Passcode</label>
              <input
                type="text"
                value={meetPassInput}
                onChange={(e) => setMeetPassInput(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingApt(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMeetingLink}
                className="bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                Save & Update Link
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
