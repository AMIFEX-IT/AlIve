import React, { useState } from 'react'
import './Settings.css'

const Settings = ({ onClose }) => {
  const [currentPIN, setCurrentPIN] = useState('')
  const [newPIN, setNewPIN] = useState('')
  const [confirmPIN, setConfirmPIN] = useState('')
  const [biometricEnabled, setBiometricEnabled] = useState(
    localStorage.getItem('biometric_enabled') === 'true'
  )
  const [showPINForm, setShowPINForm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleToggleBiometric = async () => {
    // Simulate biometric check
    if (!biometricEnabled) {
      // Request to enable biometric
      try {
        // In production, this would use Web Authentication API or similar
        const enabled = window.confirm('Enable biometric authentication? (Face ID/Fingerprint)')
        if (enabled) {
          setBiometricEnabled(true)
          localStorage.setItem('biometric_enabled', 'true')
          setSuccess('Biometric authentication enabled')
          setTimeout(() => setSuccess(''), 3000)
        }
      } catch (err) {
        setError('Failed to enable biometric. Please try again.')
        setTimeout(() => setError(''), 3000)
      }
    } else {
      // Disable biometric
      setBiometricEnabled(false)
      localStorage.setItem('biometric_enabled', 'false')
      setSuccess('Biometric authentication disabled')
      setTimeout(() => setSuccess(''), 3000)
    }
  }

  const handleUpdatePIN = (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validate PIN
    if (currentPIN.length < 4 || currentPIN.length > 6) {
      setError('PIN must be 4-6 digits')
      return
    }

    if (newPIN.length < 4 || newPIN.length > 6) {
      setError('New PIN must be 4-6 digits')
      return
    }

    if (newPIN !== confirmPIN) {
      setError('New PIN and confirmation do not match')
      return
    }

    // Check current PIN (in production, this would verify against stored PIN)
    const storedPIN = localStorage.getItem('patient_pin') || '1234' // Default for demo
    if (currentPIN !== storedPIN) {
      setError('Current PIN is incorrect')
      return
    }

    // Update PIN
    localStorage.setItem('patient_pin', newPIN)
    setSuccess('PIN updated successfully')
    setCurrentPIN('')
    setNewPIN('')
    setConfirmPIN('')
    setShowPINForm(false)
    
    setTimeout(() => {
      setSuccess('')
    }, 3000)
  }

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="settings-content">
          {/* Biometric Settings */}
          <section className="settings-section">
            <div className="settings-item">
              <div className="settings-item-content">
                <div className="settings-item-header">
                  <h3>Biometric Authentication</h3>
                  <p className="settings-item-description">
                    Use Face ID or Fingerprint to secure your access codes
                  </p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={biometricEnabled}
                    onChange={handleToggleBiometric}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </section>

          {/* PIN Settings */}
          <section className="settings-section">
            <div className="settings-item">
              <div className="settings-item-content">
                <div className="settings-item-header">
                  <h3>PIN Code</h3>
                  <p className="settings-item-description">
                    Update your PIN for additional security
                  </p>
                </div>
                <button
                  onClick={() => setShowPINForm(!showPINForm)}
                  className="btn-secondary"
                >
                  {showPINForm ? 'Cancel' : 'Update PIN'}
                </button>
              </div>

              {showPINForm && (
                <form onSubmit={handleUpdatePIN} className="pin-form">
                  <div className="form-group">
                    <label htmlFor="current-pin">Current PIN</label>
                    <input
                      id="current-pin"
                      type="password"
                      value={currentPIN}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                        setCurrentPIN(value)
                        setError('')
                      }}
                      placeholder="Enter current PIN"
                      className="input pin-input"
                      required
                      maxLength="6"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="new-pin">New PIN (4-6 digits)</label>
                    <input
                      id="new-pin"
                      type="password"
                      value={newPIN}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                        setNewPIN(value)
                        setError('')
                      }}
                      placeholder="Enter new PIN"
                      className="input pin-input"
                      required
                      maxLength="6"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirm-pin">Confirm New PIN</label>
                    <input
                      id="confirm-pin"
                      type="password"
                      value={confirmPIN}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                        setConfirmPIN(value)
                        setError('')
                      }}
                      placeholder="Confirm new PIN"
                      className="input pin-input"
                      required
                      maxLength="6"
                    />
                  </div>

                  {error && <div className="alert alert-error">{error}</div>}
                  {success && <div className="alert alert-success">{success}</div>}

                  <button type="submit" className="btn-primary">
                    Update PIN
                  </button>
                </form>
              )}
            </div>
          </section>

          {/* Security Info */}
          <section className="settings-section">
            <div className="security-info">
              <h3>Security Information</h3>
              <ul className="security-list">
                <li>Access codes expire after 15 minutes</li>
                <li>You can stop any active session at any time</li>
                <li>All doctor access is logged for your review</li>
                <li>Your medical records are encrypted and secure</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Settings

