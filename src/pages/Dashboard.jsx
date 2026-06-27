import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api/client.js'

const STATUS_COLORS = {
  saved: 'bg-gray-100 text-gray-700',
  applied: 'bg-blue-100 text-blue-700',
  interviewing: 'bg-purple-100 text-purple-700',
  rejected: 'bg-red-100 text-red-700',
  accepted: 'bg-green-100 text-green-700',
}

export default function Dashboard() {
  const { isLoggedIn, loading: authLoading } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoggedIn) return
    api.getDashboard()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [isLoggedIn])

  if (authLoading) return <div className="py-12 text-center text-gray-500">Loading...</div>
  if (!isLoggedIn) return <Navigate to="/login" replace />

  if (loading) return <div className="py-12 text-center text-gray-500">Loading dashboard...</div>
  if (error) return <div className="py-12 text-center text-red-600">{error}</div>

  return (
    <div className="py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Track applications, saved roles, and profile progress</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Profile" value={`${data.profile_completion}%`} hint="Completion score" />
        <StatCard label="Saved" value={data.saved_count} hint="Internships" />
        <StatCard label="Applications" value={data.applications_count} hint="Tracked" />
        <StatCard label="AI Matches" value={data.recent_recommendations_count} hint="Sessions" />
      </div>

      <section className="bg-white rounded-2xl p-5 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Profile completion</h2>
          <Link to="/profile" className="text-sm text-blue-600">Edit profile</Link>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all"
            style={{ width: `${data.profile_completion}%` }}
          />
        </div>
      </section>

      <section className="bg-white rounded-2xl p-5 border border-gray-200">
        <h2 className="font-semibold text-gray-800 mb-4">Saved internships</h2>
        {data.saved_internships.length === 0 ? (
          <p className="text-gray-500 text-sm">No saved internships yet. Browse your <Link to="/recommendations" className="text-blue-600">matches</Link>.</p>
        ) : (
          <div className="space-y-3">
            {data.saved_internships.map((item) => (
              <div key={item.id} className="p-3 rounded-xl bg-gray-50">
                <div className="font-medium text-gray-800">{item.title}</div>
                <div className="text-sm text-gray-600">{item.company} · {item.location}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-white rounded-2xl p-5 border border-gray-200">
        <h2 className="font-semibold text-gray-800 mb-4">Application tracker</h2>
        {data.applications.length === 0 ? (
          <p className="text-gray-500 text-sm">No applications tracked yet.</p>
        ) : (
          <div className="space-y-3">
            {data.applications.map((app) => (
              <div key={app.id} className="p-3 rounded-xl bg-gray-50 flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-gray-800">{app.internship?.title || app.internship_id}</div>
                  <div className="text-sm text-gray-600">{app.internship?.company}</div>
                </div>
                <span className={`px-2 py-1 rounded-lg text-xs font-medium capitalize ${STATUS_COLORS[app.status] || STATUS_COLORS.applied}`}>
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function StatCard({ label, value, hint }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-200">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <div className="text-xs text-gray-400">{hint}</div>
    </div>
  )
}
