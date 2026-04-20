import React, { useState, useEffect } from 'react'
import MedicalProfileSummary from '../components/MedicalProfileSummary'
import AccessLogs from '../components/AccessLogs'
import Settings from '../pages/Settings'
import './PatientDashboard.css'

const PatientDashboard = ({ onLogout }) => {
  const [accessCode, setAccessCode] = useState(null)
  const [showAccessModal, setShowAccessModal] = useState(false)
  const [countdown, setCountdown] = useState(15 * 60) // 15 minutes in seconds
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [activeDoctor, setActiveDoctor] = useState(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [newRecord, setNewRecord] = useState(null)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [showBiometric, setShowBiometric] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showProfileSummary, setShowProfileSummary] = useState(false)
  const [showAccessLogs, setShowAccessLogs] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // Sample medical records data
  const [medicalRecords, setMedicalRecords] = useState([
    {
      id: 1,
      date: '2024-12-10',
      timestamp: new Date('2024-12-10').getTime(),
      hospital: 'City General Hospital',
      type: 'lab',
      title: 'Blood Test Results',
      description: 'Complete blood count and lipid profile. All values within normal range.',
      icon: '🔬',
      verified: true,
      ocrText: null,
      imageUrl: null
    },
    {
      id: 2,
      date: '2024-11-28',
      timestamp: new Date('2024-11-28').getTime(),
      hospital: 'Community Health Center',
      type: 'prescription',
      title: 'Prescription - Hypertension',
      description: 'Medication prescribed: Lisinopril 10mg, once daily',
      icon: '💊',
      verified: true,
      ocrText: null,
      imageUrl: null
    },
    {
      id: 3,
      date: '2024-11-15',
      timestamp: new Date('2024-11-15').getTime(),
      hospital: 'City General Hospital',
      type: 'scan',
      title: 'X-Ray - Chest',
      description: 'Chest X-ray performed. No abnormalities detected.',
      icon: '📷',
      verified: true,
      ocrText: null,
      imageUrl: null
    }
  ])

  // Check for active session
  useEffect(() => {
    const checkSession = () => {
      const sessionActive = localStorage.getItem('doctor_session_active') === 'true'
      const doctorName = localStorage.getItem('active_doctor_name') || 'Dr. Smith'
      if (sessionActive) {
        setIsSessionActive(true)
        setActiveDoctor(doctorName)
      }
    }
    checkSession()
    const interval = setInterval(checkSession, 1000)
    return () => clearInterval(interval)
  }, [])

  // Listen for new records (simulated)
  useEffect(() => {
    // Check if doctor saved a new record
    const checkNewRecord = () => {
      const newRecordData = localStorage.getItem('new_patient_record')
      if (newRecordData) {
        const record = JSON.parse(newRecordData)
        addNewRecord(record)
        localStorage.removeItem('new_patient_record')
        
        // Show notification
        showNotification('New medical record added')
        
        // Simulate push notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Alive - New Medical Record', {
            body: 'New medical record added to your timeline',
            icon: '/favicon.ico'
          })
        }
      }
    }
    
    checkNewRecord()
    const interval = setInterval(checkNewRecord, 2000)
    return () => clearInterval(interval)
  }, [])

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Countdown timer
  useEffect(() => {
    if (showAccessModal && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setShowAccessModal(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [showAccessModal, countdown])

  const formatOTP = (code) => {
    // Format as 892-104
    return code.slice(0, 3) + '-' + code.slice(3)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleBiometricAuth = async () => {
    const biometricEnabled = localStorage.getItem('biometric_enabled') === 'true'
    const pinSet = localStorage.getItem('patient_pin') !== null
    
    if (biometricEnabled) {
      // Simulate biometric check
      setShowBiometric(true)
      setTimeout(() => {
        setShowBiometric(false)
        generateAccessCode()
      }, 1000)
    } else if (pinSet) {
      // Use PIN instead
      const pin = prompt('Enter your PIN:')
      const storedPIN = localStorage.getItem('patient_pin') || '1234'
      if (pin === storedPIN) {
        generateAccessCode()
      } else {
        alert('Invalid PIN')
      }
    } else {
      // No security enabled, generate directly
      generateAccessCode()
    }
  }

  const generateAccessCode = () => {
    // Generate a 6-digit OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const patientId = 'PAT-' + Math.floor(1000 + Math.random() * 9000).toString()
    
    // Store in localStorage for demo (in production, this would be on server)
    localStorage.setItem('patient_access_code', code)
    localStorage.setItem('patient_id', patientId)
    localStorage.setItem('access_code_expiry', Date.now() + (15 * 60 * 1000)) // 15 minutes
    
    setAccessCode({ code, patientId })
    setShowAccessModal(true)
    setCountdown(15 * 60)
  }

  const addNewRecord = (record) => {
    const newRecord = {
      ...record,
      id: medicalRecords.length + 1,
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0],
      verified: true
    }
    setMedicalRecords([newRecord, ...medicalRecords])
    setNewRecord(newRecord)
  }

  const showNotification = (message) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
    }, 3000)
  }

  const handleStopSession = () => {
    localStorage.setItem('doctor_session_active', 'false')
    localStorage.removeItem('active_doctor_name')
    setIsSessionActive(false)
    setActiveDoctor(null)
    showNotification('Session stopped')
    
    // Trigger vibration if supported
    if (navigator.vibrate) {
      navigator.vibrate(200)
    }
  }

  // Check if doctor accessed (simulate)
  useEffect(() => {
    const checkDoctorAccess = () => {
      const doctorAccessed = localStorage.getItem('doctor_accessed_patient')
      if (doctorAccessed === 'true' && !isSessionActive) {
        setIsSessionActive(true)
        setActiveDoctor(localStorage.getItem('active_doctor_name') || 'Dr. Smith')
        localStorage.setItem('doctor_session_active', 'true')
        localStorage.removeItem('doctor_accessed_patient')
        
        // Auto-close modal if open
        setShowAccessModal(false)
        
        // Vibrate once
        if (navigator.vibrate) {
          navigator.vibrate(100)
        }
      }
    }
    const interval = setInterval(checkDoctorAccess, 1000)
    return () => clearInterval(interval)
  }, [isSessionActive])

  const formatDate = (dateString, timestamp) => {
    if (timestamp) {
      const now = Date.now()
      const diff = now - timestamp
      const seconds = Math.floor(diff / 1000)
      const minutes = Math.floor(seconds / 60)
      
      if (minutes < 1) return 'Just now'
      if (minutes < 60) return `${minutes}m ago`
      if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`
    }
    
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleRecordClick = (record) => {
    setSelectedRecord(record)
  }

  const closeRecordDetail = () => {
    setSelectedRecord(null)
  }

  return (
    <div className="dashboard-container">
      {/* Toast Notification */}
      {showToast && (
        <div className="toast-notification">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Biometric Modal */}
      {showBiometric && (
        <div className="biometric-modal-overlay">
          <div className="biometric-modal">
            <div className="biometric-icon">🔒</div>
            <p>Authenticating...</p>
          </div>
        </div>
      )}

      {/* Record Detail Modal */}
      {selectedRecord && (
        <div className="record-detail-overlay" onClick={closeRecordDetail}>
          <div className="record-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="record-detail-header">
              <h3>{selectedRecord.title}</h3>
              <button onClick={closeRecordDetail} className="close-btn">×</button>
            </div>
            <div className="record-detail-content">
              <div className="record-ocr-text">
                <h4>Record Details</h4>
                {selectedRecord.ocrText ? (
                  <pre>{selectedRecord.ocrText}</pre>
                ) : (
                  <p>{selectedRecord.description}</p>
                )}
              </div>
              {selectedRecord.imageUrl && (
                <div className="record-image-section">
                  <h4>Scanned Document</h4>
                  <img 
                    src={selectedRecord.imageUrl} 
                    alt="Medical record"
                    className="record-thumbnail"
                    onClick={() => window.open(selectedRecord.imageUrl, '_blank')}
                  />
                  <button 
                    onClick={() => window.open(selectedRecord.imageUrl, '_blank')}
                    className="btn-secondary"
                  >
                    Open Full Image
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Session Active Banner */}
      {isSessionActive && (
        <div className="session-active-banner">
          <div className="session-banner-content">
            <span className="session-indicator">🟢</span>
            <span className="session-text">
              Session Active — {activeDoctor} is viewing your records
            </span>
            <button onClick={handleStopSession} className="btn-stop-session">
              Stop Session
            </button>
          </div>
        </div>
      )}

      {/* Header */}
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
                  <path
                    d="M24 36 C24 36, 12 28, 12 20 C12 14, 17 12, 22 16 C24 13, 28 13, 30 16 C35 12, 40 14, 40 20 C40 28, 24 36, 24 36 Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    opacity="0.3"
                  />
                </svg>
              </div>
              <h1 className="app-name-small">Alive</h1>
            </div>
          </div>
          <div className="header-right">
            <span className="user-role-badge">Patient</span>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="btn-menu"
              aria-label="Menu"
            >
              ☰
            </button>
            <button onClick={onLogout} className="btn-secondary-small">
              Logout
            </button>
          </div>

          {/* Menu Dropdown */}
          {showMenu && (
            <div className="menu-dropdown">
              <button 
                onClick={() => {
                  setShowProfileSummary(true)
                  setShowMenu(false)
                }}
                className="menu-item"
              >
                <span className="menu-icon">📊</span>
                <span>Medical Profile Summary</span>
              </button>
              <button 
                onClick={() => {
                  setShowAccessLogs(true)
                  setShowMenu(false)
                }}
                className="menu-item"
              >
                <span className="menu-icon">📋</span>
                <span>Access Logs</span>
              </button>
              <button 
                onClick={() => {
                  setShowSettings(true)
                  setShowMenu(false)
                }}
                className="menu-item"
              >
                <span className="menu-icon">⚙️</span>
                <span>Settings</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-content">
          {/* Welcome Section */}
          <section className="welcome-section">
            <h2 className="welcome-title">Welcome back</h2>
            <p className="welcome-subtitle">Your medical records at a glance</p>
            <button 
              onClick={handleBiometricAuth} 
              className="btn-primary btn-generate-access"
            >
              🔐 Generate Doctor Access Code
            </button>
          </section>

          {/* Medical History Timeline */}
          <section className="timeline-section">
            <h3 className="section-title">Medical History</h3>
            
            <div className="timeline">
              {medicalRecords.map((record, index) => (
                <div 
                  key={record.id} 
                  className="timeline-entry"
                  onClick={() => handleRecordClick(record)}
                >
                  <div className="timeline-icon-wrapper">
                    <div className="timeline-icon">{record.icon}</div>
                    {index < medicalRecords.length - 1 && (
                      <div className="timeline-line"></div>
                    )}
                  </div>
                  
                  <div className="timeline-content">
                    <div className="timeline-card">
                      <div className="timeline-card-header">
                        <div>
                          <p className="timeline-date">
                            {formatDate(record.date, record.timestamp)}
                          </p>
                          <h4 className="timeline-title">{record.title}</h4>
                          <p className="timeline-hospital">{record.hospital}</p>
                        </div>
                        <div className="timeline-badges">
                          {record.verified && (
                            <span className="timeline-badge timeline-badge-verified">
                              ✓ Verified
                            </span>
                          )}
                          <span className={`timeline-badge timeline-badge-${record.type}`}>
                            {record.type}
                          </span>
                        </div>
                      </div>
                      <p className="timeline-description">{record.description}</p>
                      {record.ocrText && (
                        <p className="timeline-ocr-hint">Tap to view full OCR text and image</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Access Code Modal */}
      {showAccessModal && accessCode && (
        <div className="access-modal-overlay" onClick={() => setShowAccessModal(false)}>
          <div className="access-modal" onClick={(e) => e.stopPropagation()}>
            <div className="access-modal-header">
              <h3>Doctor Access Code</h3>
              <button onClick={() => setShowAccessModal(false)} className="close-btn">×</button>
            </div>
            <div className="access-modal-content">
              <div className="access-code-display-large">
                <p className="access-label">Share this code with your doctor:</p>
                <div className="otp-display-large">
                  {formatOTP(accessCode.code)}
                </div>
                <p className="patient-id-display">Patient ID: {accessCode.patientId}</p>
              </div>
              
              <div className="countdown-timer">
                <div className="timer-circle">
                  <span className="timer-text">{formatTime(countdown)}</span>
                </div>
                <p className="timer-label">Time remaining</p>
              </div>

              <p className="access-instruction">
                Show this code to your doctor. They will enter it to access your medical records.
              </p>

              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`${accessCode.patientId}\n${accessCode.code}`)
                  showNotification('Copied to clipboard!')
                }}
                className="btn-secondary"
              >
                Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Medical Profile Summary */}
      {showProfileSummary && (
        <MedicalProfileSummary
          medicalRecords={medicalRecords}
          onClose={() => setShowProfileSummary(false)}
        />
      )}

      {/* Access Logs */}
      {showAccessLogs && (
        <AccessLogs
          onClose={() => setShowAccessLogs(false)}
        />
      )}

      {/* Settings */}
      {showSettings && (
        <Settings
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Click outside to close menu */}
      {showMenu && (
        <div 
          className="menu-overlay"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  )
}

export default PatientDashboard
