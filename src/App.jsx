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
import { useAuth } from './context/AuthContext.jsx'

export default function App() {
  useLocation()
  useTranslation()
  const { isLoggedIn, logout, user } = useAuth()

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
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

      <main className="flex-1 mx-auto w-full max-w-md px-4">
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
    </div>
  )
}
