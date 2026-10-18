import React, { useState, useEffect } from 'react';
import { 
  User, 
  Calendar, 
  Video, 
  Clock, 
  FileText, 
  Download, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  LogOut, 
  RefreshCw,
  Search,
  Building,
  Upload,
  Share2,
  Send,
  ExternalLink,
  Check,
  MessageSquare
} from 'lucide-react';
import { Appointment } from '../types';

interface PatientDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onBookNew: () => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  isOpen,
  onClose,
  onBookNew
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [identifierInput, setIdentifierInput] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [lookupError, setLookupError] = useState('');
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'appointments' | 'reports' | 'profile'>('appointments');
  const [selectedMeetingApt, setSelectedMeetingApt] = useState<Appointment | null>(null);

  // Profile info derived from real appointments
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [saveMsg, setSaveMsg] = useState('');

  // Reset when opened fresh
  useEffect(() => {
    if (isOpen) {
      setLookupError('');
    }
  }, [isOpen]);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = identifierInput.trim();
    if (!cleanInput) return;
    
    setLoading(true);
    setLookupError('');
    try {
      const isBookingId = /^APT-/i.test(cleanInput);
      const isPhone = /^\+?[\d\s-]{8,}$/.test(cleanInput);
      let queryParam = '';
      if (isBookingId) {
        queryParam = `search=${encodeURIComponent(cleanInput)}`;
      } else if (isPhone) {
        queryParam = `role=patient&phone=${encodeURIComponent(cleanInput.replace(/\D/g, '').slice(-10))}`;
      } else {
        queryParam = `role=patient&email=${encodeURIComponent(cleanInput.toLowerCase())}`;
      }

      const res = await fetch(`/api/appointments?${queryParam}`);
      const data = await res.json();
      
      if (Array.isArray(data) && data.length > 0) {
        setAppointments(data);
        setPatientEmail(cleanInput);
        setPatientName(data[0]?.patientName || 'Patient');
        setPatientPhone(data[0]?.patientPhone || cleanInput);
        setIsLoggedIn(true);
      } else {
        setLookupError('No appointments found for this mobile number or email. Please check the contact number entered during booking.');
      }
    } catch (err) {
      console.error('Failed to fetch patient appointments', err);
      setLookupError('Unable to connect to clinic server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    if (!patientEmail) return;
    setLoading(true);
    try {
      const cleanInput = patientEmail.trim();
      const isBookingId = /^APT-/i.test(cleanInput);
      const isPhone = /^\+?[\d\s-]{8,}$/.test(cleanInput);
      let queryParam = '';
      if (isBookingId) {
        queryParam = `search=${encodeURIComponent(cleanInput)}`;
      } else if (isPhone) {
        queryParam = `role=patient&phone=${encodeURIComponent(cleanInput.replace(/\D/g, '').slice(-10))}`;
      } else {
        queryParam = `role=patient&email=${encodeURIComponent(cleanInput.toLowerCase())}`;
      }
      const res = await fetch(`/api/appointments?${queryParam}`);
      const data = await res.json();
      setAppointments(data || []);
    } catch (err) {
      console.error('Failed to fetch patient appointments', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAppointments([]);
    setIdentifierInput('');
    setPatientEmail('');
    setLookupError('');
  };

  const handleCancelAppointment = async (aptId: string) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const res = await fetch(`/api/appointments/${aptId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Cancelled',
          cancellationReason: 'Cancelled by patient from portal'
        })
      });
      if (res.ok) {
        fetchAppointments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const filteredAppointments = filterStatus === 'All'
    ? appointments
    : appointments.filter(a => a.status === filterStatus);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="bg-white max-w-4xl w-full rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-auto relative">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 sm:px-8 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Patient Portal</h2>
              <p className="text-xs text-cyan-400">Krishnaveni Advanced Physiotherapy & Rehabilitation Services</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Screen if not logged in */}
        {!isLoggedIn ? (
          <div className="p-6 sm:p-8 max-w-md mx-auto space-y-6 text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center mx-auto shadow-xs border border-blue-100">
              <Search className="w-8 h-8 text-blue-600" />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-slate-900">Track My Appointment</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Enter the mobile number, email, or Booking ID you provided while booking to view your consultation link and tax invoices.
              </p>
            </div>

            {lookupError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-start gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span>{lookupError}</span>
              </div>
            )}

            <form onSubmit={handleLookup} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number, Email, or Booking ID
                </label>
                <input
                  type="text"
                  required
                  value={identifierInput}
                  onChange={(e) => setIdentifierInput(e.target.value)}
                  placeholder="e.g. 9490605809, name@email.com, or APT-2026-..."
                  className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !identifierInput.trim()}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm py-3.5 rounded-xl shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>{loading ? 'Searching Records...' : 'View My Consultations & Invoices'}</span>
              </button>
            </form>

            <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 space-y-2">
              <p className="text-[11px] text-slate-500">
                🔒 <strong>Password-Free:</strong> Your booking details and official tax invoices are verified directly via your registered contact number.
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onBookNew();
                  }}
                  className="text-blue-600 hover:underline font-bold text-xs"
                >
                  Need a new consultation? Book here →
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Dashboard Main Content */
          <div>
            {/* Top Navigation Tabs */}
            <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('appointments')}
                  className={`px-4 py-2 rounded-xl transition-all ${
                    activeTab === 'appointments' ? 'bg-white text-blue-700 shadow-sm' : 'hover:bg-slate-200'
                  }`}
                >
                  My Appointments ({appointments.length})
                </button>
                <button
                  onClick={() => setActiveTab('reports')}
                  className={`px-4 py-2 rounded-xl transition-all ${
                    activeTab === 'reports' ? 'bg-white text-blue-700 shadow-sm' : 'hover:bg-slate-200'
                  }`}
                >
                  Medical Reports
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 hidden sm:inline">{patientEmail}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-slate-600 hover:text-rose-600 font-bold cursor-pointer"
                  title="Close record lookup"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Exit Lookup</span>
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              
              {/* TAB 1: Appointments */}
              {activeTab === 'appointments' && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-600">Filter Status:</span>
                      {['All', 'Confirmed', 'Completed', 'Cancelled'].map((st) => (
                        <button
                          key={st}
                          onClick={() => setFilterStatus(st)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                            filterStatus === st ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        onClose();
                        onBookNew();
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow"
                    >
                      + Book New Consultation
                    </button>
                  </div>

                  {loading ? (
                    <div className="py-12 text-center text-slate-500">Loading appointments...</div>
                  ) : filteredAppointments.length === 0 ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center space-y-3">
                      <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
                      <p className="text-sm font-bold text-slate-700">No appointments found</p>
                      <button
                        onClick={() => {
                          onClose();
                          onBookNew();
                        }}
                        className="bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl"
                      >
                        Book Your First Appointment
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredAppointments.map((apt) => (
                        <div
                          key={apt.id}
                          className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 hover:shadow-md transition-shadow"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                            <div>
                              <span className="text-xs font-extrabold text-blue-700">{apt.id}</span>
                              <h4 className="text-base font-bold text-slate-900 mt-0.5">{apt.serviceName}</h4>
                              <p className="text-xs text-slate-500">Doctor: Dr. P. Sai Tejaswini, MPT (Neuro), MIAP</p>
                            </div>

                            <div className="text-right">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                                apt.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' :
                                apt.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                                'bg-rose-100 text-rose-800'
                              }`}>
                                {apt.status}
                              </span>
                              <p className="text-xs font-bold text-slate-700 mt-1">₹{apt.amountPaid} (Paid)</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600">
                            <div>
                              <span className="font-semibold text-slate-500">Date & Slot:</span>
                              <p className="font-bold text-slate-800">{apt.date} ({apt.timeSlot})</p>
                            </div>

                            <div>
                              <span className="font-semibold text-slate-500">Consultation Type:</span>
                              <p className="font-bold text-slate-800">{apt.consultationType}</p>
                            </div>

                            <div>
                              <span className="font-semibold text-slate-500">Invoice Number:</span>
                              <p className="font-bold text-slate-800">{apt.invoiceNumber}</p>
                            </div>
                          </div>

                          {/* Google Meet Link & WhatsApp Share Block */}
                          {apt.meetingLink && apt.status === 'Confirmed' && (
                            <div className="bg-slate-900 text-white rounded-xl p-3 text-xs space-y-2">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                                  <Video className="w-4 h-4" />
                                  <span>Google Meet Tele-Consultation:</span>
                                </div>
                                {apt.meetingPassword && (
                                  <span className="text-[10px] text-amber-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                                    Passcode: {apt.meetingPassword}
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800">
                                <a
                                  href={apt.meetingLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-cyan-300 hover:text-cyan-200 underline font-semibold break-all text-[11px]"
                                >
                                  {apt.meetingLink}
                                </a>
                                <a
                                  href={apt.meetingLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-extrabold text-[10px] px-2.5 py-1 rounded-md shrink-0 flex items-center gap-1"
                                >
                                  <span>Join Meet</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            </div>
                          )}

                          {/* Quick Actions & Video Link */}
                          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200">
                            <div className="flex items-center gap-2">
                              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-300 flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>WhatsApp Sent by Clinic (+91 94906 05809)</span>
                              </span>

                              <a
                                href={`https://wa.me/919490605809?text=${encodeURIComponent(`Hi Dr. Sai Tejaswini, I am writing regarding my consultation ${apt.id} on ${apt.date} at ${apt.timeSlot}.`)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-white hover:bg-slate-100 text-emerald-700 border border-emerald-300 text-xs font-bold px-3 py-1 rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
                              >
                                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                                <span>💬 Chat with Clinic</span>
                              </a>
                            </div>

                            <div className="flex items-center gap-2 ml-auto">
                              {apt.status === 'Confirmed' && (
                                <button
                                  onClick={() => handleCancelAppointment(apt.id)}
                                  className="text-xs text-rose-600 hover:text-rose-800 font-bold px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50"
                                >
                                  Cancel
                                </button>
                              )}
                              <a
                                href={`/api/reports/export?type=appointments`}
                                download
                                className="text-xs text-slate-700 hover:text-blue-700 font-semibold px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 flex items-center gap-1"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download Invoice</span>
                              </a>
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Medical Reports */}
              {activeTab === 'reports' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Your Uploaded Scans & Doctor Prescriptions</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {appointments.flatMap(a => a.medicalReports || []).length === 0 ? (
                      <div className="col-span-2 py-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border">
                        No medical reports uploaded yet.
                      </div>
                    ) : (
                      appointments.flatMap(a => a.medicalReports || []).map((rep, idx) => (
                        <div key={idx} className="bg-slate-50 p-4 rounded-xl border flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="text-xs font-bold text-slate-800">{rep.name}</p>
                              <p className="text-[10px] text-slate-500">Uploaded {rep.uploadedAt}</p>
                            </div>
                          </div>
                          <a href={rep.url} download className="p-2 text-blue-700 hover:bg-blue-100 rounded-lg">
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: Profile */}
              {activeTab === 'profile' && (
                <div className="max-w-md space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Manage Patient Account Profile</h3>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl p-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
                    <input
                      type="text"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl p-2.5 text-sm"
                    />
                  </div>

                  <button
                    onClick={() => setSaveMsg('Profile updated successfully.')}
                    className="bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl"
                  >
                    Save Changes
                  </button>

                  {saveMsg && <p className="text-xs text-emerald-600 font-bold">{saveMsg}</p>}
                </div>
              )}

            </div>
          </div>
        )}

      </div>

      {/* Online Consultation Modal Link Popup */}
      {selectedMeetingApt && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white max-w-lg w-full rounded-3xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
                <Video className="w-5 h-5" />
                <span>Google Meet Consultation Room</span>
              </h3>
              <button onClick={() => setSelectedMeetingApt(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Session with Dr. P. Sai Tejaswini, MPT (Neuro), MIAP. Please ensure your camera and microphone are operational.
            </p>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-2">
              <p className="text-slate-400">Meeting Link:</p>
              <a
                href={selectedMeetingApt.meetingLink}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 font-bold underline text-sm break-all block"
              >
                {selectedMeetingApt.meetingLink}
              </a>
              <p className="text-amber-400 font-bold">Passcode: {selectedMeetingApt.meetingPassword}</p>
            </div>

            <div className="flex justify-end">
              <a
                href={selectedMeetingApt.meetingLink}
                target="_blank"
                rel="noreferrer"
                className="bg-cyan-400 text-slate-950 font-bold text-xs px-6 py-2.5 rounded-xl"
              >
                Open Google Meet Room Now
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
