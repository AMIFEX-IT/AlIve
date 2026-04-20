import React from 'react'
import './MedicalProfileSummary.css'

const MedicalProfileSummary = ({ medicalRecords, onClose }) => {
  // Calculate statistics from medical records
  const totalRecords = medicalRecords.length
  const recordsByType = medicalRecords.reduce((acc, record) => {
    acc[record.type] = (acc[record.type] || 0) + 1
    return acc
  }, {})

  const hospitals = [...new Set(medicalRecords.map(r => r.hospital))]
  const recentVisit = medicalRecords.length > 0 
    ? medicalRecords[0].date 
    : null

  const verifiedRecords = medicalRecords.filter(r => r.verified).length

  return (
    <div className="profile-summary-overlay" onClick={onClose}>
      <div className="profile-summary-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-summary-header">
          <h2>Medical Profile Summary</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="profile-summary-content">
          {/* Overview Stats */}
          <section className="summary-section">
            <h3>Overview</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{totalRecords}</div>
                <div className="stat-label">Total Records</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{verifiedRecords}</div>
                <div className="stat-label">Verified Records</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{hospitals.length}</div>
                <div className="stat-label">Healthcare Providers</div>
              </div>
              {recentVisit && (
                <div className="stat-card">
                  <div className="stat-value">
                    {new Date(recentVisit).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="stat-label">Last Visit</div>
                </div>
              )}
            </div>
          </section>

          {/* Records by Type */}
          <section className="summary-section">
            <h3>Records by Type</h3>
            <div className="records-type-list">
              {Object.entries(recordsByType).map(([type, count]) => (
                <div key={type} className="type-item">
                  <span className="type-name">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                  <span className="type-count">{count}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Healthcare Providers */}
          <section className="summary-section">
            <h3>Healthcare Providers</h3>
            <div className="providers-list">
              {hospitals.map((hospital, index) => (
                <div key={index} className="provider-item">
                  <span className="provider-icon">🏥</span>
                  <span className="provider-name">{hospital}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Activity */}
          <section className="summary-section">
            <h3>Recent Activity</h3>
            <div className="recent-activity">
              {medicalRecords.slice(0, 5).map((record) => (
                <div key={record.id} className="activity-item">
                  <span className="activity-icon">{record.icon}</span>
                  <div className="activity-content">
                    <div className="activity-title">{record.title}</div>
                    <div className="activity-date">
                      {new Date(record.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                  {record.verified && (
                    <span className="activity-verified">✓</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default MedicalProfileSummary

