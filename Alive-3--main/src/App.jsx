import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import PatientDashboard from './pages/PatientDashboard'
import DoctorDashboard from './pages/DoctorDashboard'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(
    localStorage.getItem('alive_authenticated') === 'true'
  )
  const [userRole, setUserRole] = React.useState(
    localStorage.getItem('alive_user_role') || 'patient'
  )

  const handleLogin = (role = 'patient') => {
    setIsAuthenticated(true)
    setUserRole(role)
    localStorage.setItem('alive_authenticated', 'true')
    localStorage.setItem('alive_user_role', role)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUserRole('patient')
    localStorage.removeItem('alive_authenticated')
    localStorage.removeItem('alive_user_role')
  }

  const getDashboardPath = () => {
    if (userRole === 'doctor') {
      return '/doctor/dashboard'
    }
    return '/patient/dashboard'
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? (
              <Navigate to={getDashboardPath()} replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          } 
        />
        <Route 
          path="/patient/dashboard" 
          element={
            isAuthenticated && userRole === 'patient' ? (
              <PatientDashboard onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/doctor/dashboard" 
          element={
            isAuthenticated && userRole === 'doctor' ? (
              <DoctorDashboard onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        {/* Legacy route redirect */}
        <Route 
          path="/dashboard" 
          element={
            <Navigate to={getDashboardPath()} replace />
          } 
        />
        <Route 
          path="/" 
          element={
            <Navigate to={isAuthenticated ? getDashboardPath() : "/login"} replace />
          } 
        />
      </Routes>
    </Router>
  )
}

export default App

