import React, { useState, useEffect } from 'react'
import OCRScanner from '../components/OCRScanner'
import './DoctorDashboard.css'

const DoctorDashboard = ({ onLogout }) => {
  const [showAccessEntry, setShowAccessEntry] = useState(false)
  const [patientId, setPatientId] = useState('')
  const [accessOTP, setAccessOTP] = useState('')
  const [activePatient, setActivePatient] = useState(null)
  const [sessionEndTime, setSessionEndTime] = useState(null)
  const [timeRemaining, setTimeRemaining] = useState(null)
  const [showOCR, setShowOCR] = useState(false)
  const [showPatientTimeline, setShowPatientTimeline] = useState(false)

  // Patient medical records (would come from API in production)
  const patientRecords = {
    'PAT-1234': [
      {
        id: 1,
        date: '2024-12-10',
        hospital: 'City General Hospital',
        type: 'lab',
        title: 'Blood Test Results',
        description: 'Complete blood count and lipid profile. All values within normal range.',
        icon: '🔬'
      },
      {
        id: 2,
        date: '2024-11-28',
        hospital: 'Community Health Center',
        type: 'prescription',
        title: 'Prescription - Hypertension',
        description: 'Medication prescribed: Lisinopril 10mg, once daily',
        icon: '💊'
      },
      {
        id: 3,
        date: '2024-11-15',
        hospital: 'City General Hospital',
        type: 'scan',
        title: 'X-Ray - Chest',
        description: 'Chest X-ray performed. No abnormalities detected.',
        icon: '📷'
      }
    ]
  }

  // Session timeout effect
  useEffect(() => {
    if (sessionEndTime) {
      const interval = setInterval(() => {
        const now = Date.now()
        const remaining = Math.max(0, sessionEndTime - now)
        setTimeRemaining(remaining)

        if (remaining === 0) {
          handleEndSession()
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [sessionEndTime])

  const handleAccessSubmit = (e) => {
    e.preventDefault()
    
    // Validate Patient ID and OTP
    const storedPatientId = localStorage.getItem('patient_id')
    const storedAccessCode = localStorage.getItem('patient_access_code')
    const storedExpiry = localStorage.getItem('access_code_expiry')

    if (!storedPatientId || !storedAccessCode) {
      alert('Invalid access. Patient must generate an access code first.')
      return
    }

    if (Date.now() > parseInt(storedExpiry)) {
      alert('Access code has expired. Please ask patient to generate a new one.')
      return
    }

    if (patientId !== storedPatientId || accessOTP !== storedAccessCode) {
      alert('Invalid Patient ID or Access Code. Please check and try again.')
      return
    }

    // Success - Start session
    const sessionDuration = 15 * 60 * 1000 // 15 minutes
    const endTime = Date.now() + sessionDuration
    setSessionEndTime(endTime)
    setActivePatient({
      id: patientId,
      name: 'Patient Name', // Would come from API
      records: patientRecords[patientId] || []
    })
    setShowAccessEntry(false)
    setShowPatientTimeline(true)
    
    // Store session info
    localStorage.setItem('doctor_session_patient_id', patientId)
    localStorage.setItem('doctor_session_end_time', endTime.toString())
    
    // Trigger patient-side session active
    localStorage.setItem('doctor_accessed_patient', 'true')
    localStorage.setItem('active_doctor_name', 'Dr. Smith') // Would come from auth
    localStorage.setItem('doctor_session_active', 'true')
    
    // Create access log entry
    const accessLog = {
      doctorId: 'DOC-001', // Would come from auth
      doctorName: 'Dr. Smith',
      startTime: Date.now(),
      endTime: null,
      isActive: true,
      sessionId: 'SESS-' + Date.now().toString(),
      recordsViewed: 0,
      recordsAdded: 0
    }
    
    // Store new access log
    localStorage.setItem('new_access_log', JSON.stringify(accessLog))
    
    // Add to access logs list
    const existingLogs = JSON.parse(localStorage.getItem('patient_access_logs') || '[]')
    localStorage.setItem('patient_access_logs', JSON.stringify([accessLog, ...existingLogs]))
  }

  const handleEndSession = () => {
    // Update access log
    const logs = JSON.parse(localStorage.getItem('patient_access_logs') || '[]')
    if (logs.length > 0 && logs[0].isActive) {
      logs[0].endTime = Date.now()
      logs[0].isActive = false
      localStorage.setItem('patient_access_logs', JSON.stringify(logs))
    }
    
    setActivePatient(null)
    setShowPatientTimeline(false)
    setSessionEndTime(null)
    setTimeRemaining(null)
    setPatientId('')
    setAccessOTP('')
    localStorage.removeItem('doctor_session_patient_id')
    localStorage.removeItem('doctor_session_end_time')
    localStorage.setItem('doctor_session_active', 'false')
    localStorage.removeItem('active_doctor_name')
    alert('Session has ended.')
  }

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleOCRComplete = (extractedText, imageFile) => {
    // This will be handled in OCRScanner with confirmation
    console.log('OCR completed for patient:', activePatient?.id)
  }

  // If in active session, show patient timeline
  if (showPatientTimeline && activePatient) {
    return (
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div className="header-content">
            <div className="header-left">
              <button onClick={handleEndSession} className="btn-back">
                ← End Session
              </button>
              <div className="logo-container-small">
                <div className="logo-icon-small">
                  <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
                    <path
                      d="M8 24 L12 20 L16 24 L20 16 L24 24 L28 20 L32 24 L36 20 L40 24"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                </div>
                <h1 className="app-name-small">Alive</h1>
              </div>
            </div>
            <div className="header-right">
              <div className="session-info">
                <span className="session-badge">Active Session</span>
                {timeRemaining !== null && (
                  <span className="session-timer">
                    Time: {formatTime(timeRemaining)}
                  </span>
                )}
              </div>
              <span className="user-role-badge">Doctor</span>
              <button onClick={onLogout} className="btn-secondary-small">
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="dashboard-main">
          <div className="patient-session-view">
            <div className="patient-info-card">
              <h2>Patient: {activePatient.id}</h2>
              <p className="patient-session-note">
                Viewing patient's medical history. Session expires in {timeRemaining ? formatTime(timeRemaining) : '20:00'}
              </p>
            </div>

            <div className="session-actions">
              <button onClick={() => setShowOCR(true)} className="btn-primary btn-large">
                ➕ Add Record → Scan Document
              </button>
            </div>

            {/* Patient Medical Timeline */}
            <section className="timeline-section">
              <h3 className="section-title">Patient Medical History</h3>
              
              {activePatient.records.length > 0 ? (
                <div className="timeline">
                  {activePatient.records.map((record, index) => (
                    <div key={record.id} className="timeline-entry">
                      <div className="timeline-icon-wrapper">
                        <div className="timeline-icon">{record.icon}</div>
                        {index < activePatient.records.length - 1 && (
                          <div className="timeline-line"></div>
                        )}
                      </div>
                      
                      <div className="timeline-content">
                        <div className="timeline-card">
                          <div className="timeline-card-header">
                            <div>
                              <p className="timeline-date">{formatDate(record.date)}</p>
                              <h4 className="timeline-title">{record.title}</h4>
                              <p className="timeline-hospital">{record.hospital}</p>
                            </div>
                            <span className={`timeline-badge timeline-badge-${record.type}`}>
                              {record.type}
                            </span>
                          </div>
                          <p className="timeline-description">{record.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-records">
                  <p>No medical records found for this patient.</p>
                </div>
              )}
            </section>
          </div>
        </main>

        {showOCR && (
          <OCRScanner
            patientId={activePatient.id}
            onScanComplete={handleOCRComplete}
            onClose={() => setShowOCR(false)}
          />
        )}
      </div>
    )
  }

  // Default view - Access Entry
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo-container-small">
              <div className="logo-icon-small">
                <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
                  <path
                    d="M8 24 L12 20 L16 24 L20 16 L24 24 L28 20 L32 24 L36 20 L40 24"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </div>
              <h1 className="app-name-small">Alive</h1>
            </div>
          </div>
          <div className="header-right">
            <span className="user-role-badge">Doctor</span>
            <button onClick={onLogout} className="btn-secondary-small">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-content">
          <section className="welcome-section">
            <h2 className="welcome-title">Doctor Dashboard</h2>
            <p className="welcome-subtitle">Enter patient access code to view medical records</p>
          </section>

          {/* Patient Access Entry Form */}
          <section className="access-entry-section">
            <div className="access-entry-card">
              <h3>Access Patient Records</h3>
              <p className="access-instruction">
                Ask the patient for their Patient ID and Access Code (OTP)
              </p>
              
              <form onSubmit={handleAccessSubmit} className="access-form">
                <div className="form-group">
                  <label htmlFor="patient-id">Patient ID</label>
                  <input
                    id="patient-id"
                    type="text"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value.toUpperCase())}
                    placeholder="e.g., PAT-1234"
                    className="input"
                    required
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="access-otp">Access Code (OTP)</label>
                  <input
                    id="access-otp"
                    type="text"
                    value={accessOTP}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                      setAccessOTP(value)
                    }}
                    placeholder="6-digit code"
                    className="input otp-input"
                    required
                    maxLength="6"
                  />
                </div>

                <button type="submit" className="btn-primary btn-large">
                  Access Patient Records
                </button>
              </form>

              <div className="access-help">
                <p><strong>How it works:</strong></p>
                <ol>
                  <li>Patient opens their app and taps "Generate Access Code"</li>
                  <li>Patient shares Patient ID and 6-digit OTP with you</li>
                  <li>Enter both here to access their medical timeline</li>
                  <li>Session lasts 20 minutes and auto-closes</li>
                </ol>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default DoctorDashboard
