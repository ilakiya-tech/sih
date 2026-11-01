import { createContext, useContext, useState } from 'react'
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Landing from './pages/Landing.jsx'
import Profile from './pages/Profile.jsx'
import Recommendations from './pages/Recommendations.jsx'
import Feedback from './pages/Feedback.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import BottomNav from './components/BottomNav.jsx'
import LanguageToggle from './components/LanguageToggle.jsx'
import ChatBot from './components/ChatBot.jsx'
import { useAuth } from './context/AuthContext.jsx'

export const AppContext = createContext(null)
export const useAppContext = () => useContext(AppContext)

export default function App() {
  useLocation()
  useTranslation()
  const { isLoggedIn, logout, user } = useAuth()
  
  // App-wide state
  const [userProfile, setUserProfile] = useState({})
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const [skillGaps, setSkillGaps] = useState({})
  
  // ChatBot State
  const [isChatBotOpen, setIsChatBotOpen] = useState(false)

  const generateResume = async (data) => {
    // Placeholder for resume generator
    console.log('Generating resume for', data)
  }

  const generateRecommendations = async (data) => {
    console.log('Generating recommendations for', data)
  }

  const sendSMSRecommendations = async () => {
    console.log('Sending SMS recommendations')
  }

  const contextValue = {
    userProfile,
    setUserProfile,
    isVoiceMode,
    setIsVoiceMode,
    skillGaps,
    setSkillGaps,
    generateResume,
    generateRecommendations,
    sendSMSRecommendations,
    isOfflineMode: false,
    recommendations: [] // Placeholder until connected to actual data
  }

  return (
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen flex flex-col bg-gray-50 relative font-sans">
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 transition-all duration-300">
          <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-600 text-white grid place-items-center font-bold">
                IP
              </div>
              <span className="font-semibold text-gray-800">InternPath</span>
            </Link>
            <div className="flex items-center gap-2">
              {isLoggedIn ? (
                <>
                  <span className="text-xs text-gray-500 hidden sm:inline">{user?.full_name}</span>
                  <button
                    onClick={logout}
                    className="text-xs px-2 py-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" className="text-sm text-blue-600 font-medium">
                  Sign in
                </Link>
              )}
              <LanguageToggle />
            </div>
          </div>
        </header>

        <main className="flex-1 mx-auto w-full max-w-md px-4 pb-20">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <BottomNav />
        
        {/* Floating ChatBot Button */}
        <button
          onClick={() => setIsChatBotOpen(true)}
          className="fixed bottom-20 right-4 w-14 h-14 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-105 transition-transform z-40"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>

        {/* ChatBot Component */}
        <ChatBot 
          isOpen={isChatBotOpen} 
          onClose={() => setIsChatBotOpen(false)} 
        />
      </div>
    </AppContext.Provider>
  )
}
