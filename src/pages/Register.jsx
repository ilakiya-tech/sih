import { Link, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export default function Register() {
  const { register, isLoggedIn } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isLoggedIn) return <Navigate to="/dashboard" replace />

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(fullName, email, password)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center py-8">
      <form onSubmit={handleSubmit} className="w-full bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Create your account</h1>
        <p className="text-gray-600 mb-6">Join InternPath for semantic AI recommendations</p>

        {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>}

        <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full mb-4 p-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none"
          required
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none"
          required
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          className="w-full mb-6 p-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-medium">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  )
}
