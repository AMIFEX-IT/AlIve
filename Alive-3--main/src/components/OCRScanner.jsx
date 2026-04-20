import React, { useState, useRef } from 'react'
import './OCRScanner.css'

const OCRScanner = ({ patientId, onScanComplete, onClose }) => {
  const [step, setStep] = useState('upload') // 'upload', 'preview', 'confirm'
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [extractedText, setExtractedText] = useState('')
  const [confirmedText, setConfirmedText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [showCamera, setShowCamera] = useState(false)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera on mobile
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setShowCamera(true)
      }
    } catch (err) {
      console.error('Camera error:', err)
      setError('Unable to access camera. Please use file upload instead.')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setShowCamera(false)
  }

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(videoRef.current, 0, 0)
      
      canvas.toBlob((blob) => {
        const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' })
        handleImageSelected(file)
        stopCamera()
      }, 'image/jpeg', 0.9)
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageSelected(file)
    }
  }

  const handleImageSelected = (file) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    setError('')
    setImage(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result)
      setStep('preview')
    }
    reader.readAsDataURL(file)
  }

  const handleScan = async () => {
    if (!image) {
      setError('Please select an image first')
      return
    }

    setLoading(true)
    setError('')
    setExtractedText('')

    try {
      // Simulate OCR processing (in production, this would call a real OCR API)
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
      
      // Mock extracted text - simulate lab result like "Malaria ++, Widal Positive"
      const mockTexts = [
        `LABORATORY REPORT

Patient ID: ${patientId}
Date: ${new Date().toLocaleDateString()}

FINDINGS:
- Malaria ++ (Positive)
- Widal Test: Positive
- Complete Blood Count: Normal
- Urine Analysis: Clear

Physician: Dr. [Your Name]
Report Date: ${new Date().toLocaleDateString()}`,
        `BLOOD TEST RESULTS

Patient: ${patientId}
Test Date: ${new Date().toLocaleDateString()}

RESULTS:
- Hemoglobin: 14.5 g/dL (Normal)
- White Blood Cells: 7,200/μL (Normal)
- Platelets: 250,000/μL (Normal)
- Malaria Parasite: Detected
- Widal Test: Positive for Typhoid

Status: Positive for Malaria and Typhoid`,
        `DIAGNOSTIC REPORT

Patient ID: ${patientId}
Exam Date: ${new Date().toLocaleDateString()}

DIAGNOSIS:
- Malaria: Positive (+++)
- Widal Test: Positive
- Other findings within normal limits

Recommendations:
- Anti-malarial treatment indicated
- Follow-up in 7 days`
      ]
      
      const mockText = mockTexts[Math.floor(Math.random() * mockTexts.length)]
      setExtractedText(mockText)
      setStep('confirm')
      
    } catch (err) {
      setError('Failed to process image. Please try again.')
      console.error('OCR Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmText = () => {
    setConfirmedText(extractedText)
    handleSaveRecord()
  }

  const handleEditText = () => {
    setStep('confirm')
  }

  const handleSaveRecord = async () => {
    setSaving(true)
    try {
      // Simulate saving to patient's permanent cloud profile
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Extract title from OCR text (first line or default)
      const textLines = (confirmedText || extractedText).split('\n').filter(line => line.trim())
      const title = textLines[0] || 'Scanned Medical Record'
      const description = textLines.slice(1, 3).join(' ') || 'Medical record scanned via OCR'
      
      // Save record for patient to receive
      const recordData = {
        title: title,
        description: description,
        hospital: 'Current Hospital', // Would come from doctor's profile
        type: 'lab', // Could be determined from OCR
        icon: '🔬',
        ocrText: confirmedText || extractedText,
        imageUrl: preview,
        verified: true
      }
      
      // Store for patient dashboard to pick up
      localStorage.setItem('new_patient_record', JSON.stringify(recordData))
      
      // Update access log with records added
      const logs = JSON.parse(localStorage.getItem('patient_access_logs') || '[]')
      if (logs.length > 0 && logs[0].isActive) {
        logs[0].recordsAdded = (logs[0].recordsAdded || 0) + 1
        localStorage.setItem('patient_access_logs', JSON.stringify(logs))
      }
      
      // In production, this would call an API:
      // await fetch(`/api/patients/${patientId}/records`, {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     text: confirmedText || extractedText,
      //     image: preview,
      //     timestamp: new Date().toISOString()
      //   })
      // })
      
      console.log('Saved to patient profile:', patientId)
      console.log('Record:', confirmedText || extractedText)
      
      if (onScanComplete) {
        onScanComplete(confirmedText || extractedText, image)
      }
      
      alert('✅ Record saved successfully to patient profile!')
      handleClose()
    } catch (err) {
      setError('Failed to save record. Please try again.')
      console.error('Save Error:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleClear = () => {
    setImage(null)
    setPreview(null)
    setExtractedText('')
    setConfirmedText('')
    setError('')
    setStep('upload')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    stopCamera()
  }

  const handleClose = () => {
    stopCamera()
    handleClear()
    onClose()
  }

  return (
    <div className="ocr-scanner-overlay">
      <div className="ocr-scanner-modal">
        <div className="ocr-scanner-header">
          <h2>Scan Document (OCR)</h2>
          <button onClick={handleClose} className="close-button">×</button>
        </div>

        <div className="ocr-scanner-content">
          {step === 'upload' && (
            <div className="ocr-upload-section">
              <div className="upload-options">
                <button
                  type="button"
                  onClick={startCamera}
                  className="btn-primary btn-camera"
                >
                  📷 Open Camera
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="ocr-file-input"
                  id="ocr-file-input"
                />
                <label htmlFor="ocr-file-input" className="btn-secondary btn-upload">
                  📄 Choose File
                </label>
              </div>

              {showCamera && (
                <div className="camera-view">
                  <video ref={videoRef} autoPlay playsInline className="camera-video" />
                  <div className="camera-controls">
                    <button onClick={capturePhoto} className="btn-primary btn-capture">
                      📸 Capture
                    </button>
                    <button onClick={stopCamera} className="btn-secondary">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 'preview' && preview && (
            <div className="ocr-preview-section">
              <div className="ocr-image-preview">
                <img src={preview} alt="Document preview" />
                <button onClick={handleClear} className="btn-clear">
                  Change Image
                </button>
              </div>

              <div className="ocr-actions">
                <button
                  onClick={handleScan}
                  disabled={loading}
                  className="btn-primary btn-scan"
                >
                  {loading ? '🔍 Processing...' : '🔍 Extract Text (OCR)'}
                </button>
              </div>

              {error && <div className="alert alert-error">{error}</div>}

              {loading && (
                <div className="ocr-loading">
                  <div className="spinner"></div>
                  <p>Processing document with OCR...</p>
                </div>
              )}
            </div>
          )}

          {step === 'confirm' && extractedText && (
            <div className="ocr-confirm-section">
              <h3>Confirm Extracted Text</h3>
              <p className="confirm-instruction">
                Review the extracted text below. Edit if needed, then confirm to save to patient profile.
              </p>

              <div className="extracted-text-editor">
                <textarea
                  value={confirmedText || extractedText}
                  onChange={(e) => setConfirmedText(e.target.value)}
                  className="text-editor"
                  rows="12"
                  placeholder="Extracted text will appear here..."
                />
              </div>

              <div className="confirm-actions">
                <button
                  onClick={handleConfirmText}
                  disabled={saving}
                  className="btn-primary btn-confirm"
                >
                  {saving ? '💾 Saving...' : '✅ Confirm & Save to Patient Profile'}
                </button>
                <button
                  onClick={() => setStep('preview')}
                  className="btn-secondary"
                  disabled={saving}
                >
                  ← Rescan Image
                </button>
              </div>

              {error && <div className="alert alert-error">{error}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OCRScanner
