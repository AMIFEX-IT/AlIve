import React, { useState } from 'react'
import './Login.css'

const Login = ({ onLogin }) => {
  const [step, setStep] = useState('role') // 'role', 'phone', or 'otp'
  const [role, setRole] = useState('patient') // 'patient' or 'doctor'
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [generatedOtp, setGeneratedOtp] = useState('')
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(0)

  const generateOTP = () => {
    // Generate a 6-digit OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString()
    setGeneratedOtp(newOtp)
    return newOtp
  }

  const handlePhoneSubmit = (e) => {
    e.preventDefault()
    setError('')
    
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number')
      return
    }

    // Generate and "send" OTP (in production, this would be sent via SMS)
    const otpCode = generateOTP()
    console.log('OTP for', phone, ':', otpCode) // For demo purposes
    
    setStep('otp')
    setCountdown(60) // 60 second countdown
    
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleOtpSubmit = (e) => {
    e.preventDefault()
    setError('')
    
    if (otp === generatedOtp) {
      onLogin(role)
    } else if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit OTP')
    } else {
      setError('Invalid OTP. Please try again.')
    }
  }

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole)
    setStep('phone')
  }

  const handleResendOtp = () => {
    if (countdown > 0) return
    const otpCode = generateOTP()
    console.log('Resent OTP:', otpCode)
    setCountdown(60)
    setOtp('')
    setError('')
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Logo/Brand */}
        <div className="login-header">
          <div className="logo-container">
            <div className="logo-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                {/* Heartbeat/Pulse line */}
                <path
                  d="M8 24 L12 20 L16 24 L20 16 L24 24 L28 20 L32 24 L36 20 L40 24"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                {/* Heart shape */}
                <path
                  d="M24 36 C24 36, 12 28, 12 20 C12 14, 17 12, 22 16 C24 13, 28 13, 30 16 C35 12, 40 14, 40 20 C40 28, 24 36, 24 36 Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  opacity="0.3"
                />
              </svg>
            </div>
            <h1 className="app-name">Alive</h1>
          </div>
          <p className="app-tagline">Your health, your records, your empowerment</p>
        </div>

        {step === 'role' ? (
          <div className="login-form">
            <h2 className="role-selection-title">I am a...</h2>
            <div className="role-selection">
              <button
                type="button"
                onClick={() => handleRoleSelect('patient')}
                className="role-button role-patient"
              >
                <div className="role-icon">👤</div>
                <div className="role-content">
                  <h3>Patient</h3>
                  <p>Access your medical records and history</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect('doctor')}
                className="role-button role-doctor"
              >
                <div className="role-icon">🩺</div>
                <div className="role-content">
                  <h3>Doctor</h3>
                  <p>View patient records and upload documents</p>
                </div>
              </button>
            </div>
          </div>
        ) : step === 'phone' ? (
          <form onSubmit={handlePhoneSubmit} className="login-form">
            <div className="role-badge">
              Logging in as: <strong>{role === 'patient' ? 'Patient' : 'Doctor'}</strong>
              <button
                type="button"
                onClick={() => setStep('role')}
                className="change-role-link"
              >
                Change
              </button>
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                className="input"
                required
                autoFocus
              />
            </div>
            
            {error && <div className="alert alert-error">{error}</div>}
            
            <button type="submit" className="btn btn-primary">
              Send OTP
            </button>
            
            <p className="demo-note">
              For demo: OTP will be logged to console
            </p>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="otp">Enter OTP</label>
              <p className="otp-instruction">
                We sent a 6-digit code to {phone}
              </p>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                  setOtp(value)
                  setError('')
                }}
                placeholder="000000"
                className="input otp-input"
                required
                autoFocus
                maxLength="6"
              />
            </div>
            
            {error && <div className="alert alert-error">{error}</div>}
            
            {/* Demo OTP Display */}
            {generatedOtp && (
              <div className="demo-otp-display">
                <p className="demo-otp-label">🔑 Demo OTP (for testing):</p>
                <div className="demo-otp-code">{generatedOtp}</div>
                <p className="demo-otp-hint">This OTP is shown for demo purposes only</p>
              </div>
            )}
            
            <button type="submit" className="btn btn-primary">
              Verify OTP
            </button>
            
            <div className="otp-resend">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={countdown > 0}
                className="btn-link"
              >
                {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
              </button>
            </div>
            
            <button
              type="button"
              onClick={() => {
                setStep('phone')
                setOtp('')
                setError('')
                setCountdown(0)
              }}
              className="btn-link back-link"
            >
              ← Change phone number
            </button>
            
            <div className="role-badge">
              Logging in as: <strong>{role === 'patient' ? 'Patient' : 'Doctor'}</strong>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default Login

