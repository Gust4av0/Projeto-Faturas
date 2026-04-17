import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import Navbar from './components/Navbar'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // Verifica se já existe uma sessão
    const userToken = localStorage.getItem('userToken')
    if (userToken) {
      setIsLoggedIn(true)
    }
  }, [])

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard/*" element={
          isLoggedIn ? (
            <>
              <Navbar setIsLoggedIn={setIsLoggedIn} />
              <Dashboard />
            </>
          ) : (
            <LandingPage />
          )
        } />
      </Routes>
    </Router>
  )
}

export default App
