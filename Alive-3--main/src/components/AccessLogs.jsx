import React, { useState, useEffect } from 'react'
import './AccessLogs.css'

const AccessLogs = ({ onClose }) => {
  const [accessLogs, setAccessLogs] = useState([])

  useEffect(() => {
    // Load access logs from localStorage
    const logs = JSON.parse(localStorage.getItem('patient_access_logs') || '[]')
    setAccessLogs(logs)

    // Check if there's a new access (when doctor accesses)
    const checkNewAccess = () => {
      const newAccess = localStorage.getItem('new_access_log')
      if (newAccess) {
        const log = JSON.parse(newAccess)
        const updatedLogs = [log, ...logs]
        setAccessLogs(updatedLogs)
        localStorage.setItem('patient_access_logs', JSON.stringify(updatedLogs))
        localStorage.removeItem('new_access_log')
      }
    }

    checkNewAccess()
    const interval = setInterval(checkNewAccess, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDuration = (startTime, endTime) => {
    if (!endTime) return 'Active'
    const duration = (endTime - startTime) / 1000 / 60 // in minutes
    if (duration < 1) return '< 1 min'
    if (duration < 60) return `${Math.floor(duration)} min`
    return `${Math.floor(duration / 60)}h ${Math.floor(duration % 60)}m`
  }

  return (
    <div className="access-logs-overlay" onClick={onClose}>
      <div className="access-logs-modal" onClick={(e) => e.stopPropagation()}>
        <div className="access-logs-header">
          <h2>Access Logs</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="access-logs-content">
          {accessLogs.length > 0 ? (
            <div className="logs-list">
              {accessLogs.map((log, index) => (
                <div key={index} className="log-item">
                  <div className="log-header">
                    <div className="log-doctor-info">
                      <div className="log-doctor-avatar">
                        {log.doctorName.charAt(0)}
                      </div>
                      <div className="log-doctor-details">
                        <div className="log-doctor-name">{log.doctorName}</div>
                        <div className="log-doctor-id">ID: {log.doctorId}</div>
                      </div>
                    </div>
                    <div className="log-status">
                      {log.isActive ? (
                        <span className="status-badge status-active">Active</span>
                      ) : (
                        <span className="status-badge status-ended">Ended</span>
                      )}
                    </div>
                  </div>

                  <div className="log-details">
                    <div className="log-detail-row">
                      <span className="log-label">Accessed:</span>
                      <span className="log-value">{formatDate(log.startTime)}</span>
                    </div>
                    {log.endTime && (
                      <div className="log-detail-row">
                        <span className="log-label">Ended:</span>
                        <span className="log-value">{formatDate(log.endTime)}</span>
                      </div>
                    )}
                    <div className="log-detail-row">
                      <span className="log-label">Duration:</span>
                      <span className="log-value">
                        {getDuration(log.startTime, log.endTime)}
                      </span>
                    </div>
                    {log.recordsViewed > 0 && (
                      <div className="log-detail-row">
                        <span className="log-label">Records Viewed:</span>
                        <span className="log-value">{log.recordsViewed}</span>
                      </div>
                    )}
                    {log.recordsAdded > 0 && (
                      <div className="log-detail-row">
                        <span className="log-label">Records Added:</span>
                        <span className="log-value">{log.recordsAdded}</span>
                      </div>
                    )}
                  </div>

                  <div className="log-timestamp">
                    Session ID: {log.sessionId.slice(0, 8)}...
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-logs">
              <div className="no-logs-icon">📋</div>
              <p>No access logs yet</p>
              <p className="no-logs-hint">
                When doctors access your records, their activity will be logged here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AccessLogs

