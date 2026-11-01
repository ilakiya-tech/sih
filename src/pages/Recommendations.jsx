import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api/client.js'
import SkeletonCard from '../components/SkeletonCard.jsx'

export default function Recommendations() {
  const { isLoggedIn, loading: authLoading } = useAuth()
  const [saved, setSaved] = useState(new Set())
  const [savingIds, setSavingIds] = useState(new Set())
  const [applyingIds, setApplyingIds] = useState(new Set())
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isLoggedIn) return
    Promise.all([
      api.getRecommendations(10),
      api.getDashboard()
    ])
      .then(([recData, dashData]) => {
        setData(recData)
        const savedIds = dashData.saved_internships.map(i => i.internship_id || i.id)
        setSaved(new Set(savedIds))
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [isLoggedIn])

  async function toggleSave(internship) {
    setSavingIds((prev) => new Set(prev).add(internship.id))
    try {
      if (saved.has(internship.id)) {
        await api.unsaveInternship(internship.id)
        setSaved((prev) => {
          const next = new Set(prev)
          next.delete(internship.id)
          return next
        })
      } else {
        await api.saveInternship(internship.id)
        setSaved((prev) => new Set(prev).add(internship.id))
      }
    } catch (err) {
      alert(err.message || 'Failed to toggle save')
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev)
        next.delete(internship.id)
        return next
      })
    }
  }

  async function trackApplication(internship) {
    setApplyingIds((prev) => new Set(prev).add(internship.id))
    try {
      await api.createApplication({ internship_id: internship.id, status: 'applied', notes: '' })
      alert('Application tracked on your dashboard!')
    } catch (err) {
      alert(err.message || 'Failed to track application')
    } finally {
      setApplyingIds((prev) => {
        const next = new Set(prev)
        next.delete(internship.id)
        return next
      })
    }
  }

  if (authLoading) return <div className="py-12 text-center text-gray-500">Loading...</div>
  if (!isLoggedIn) return <Navigate to="/login" replace />

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 pb-24 space-y-4">
        <div className="text-center mb-6">
          <div className="h-8 bg-slate-200 rounded w-48 mx-auto mb-2 animate-pulse"></div>
          <div className="h-4 bg-slate-200 rounded w-64 mx-auto animate-pulse"></div>
        </div>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Link to="/profile" className="text-blue-600 font-medium">Complete your profile</Link>
      </div>
    )
  }

  const { recommendations, skill_gap: skillGap } = data

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-24">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Your AI Matches</h1>
        <p className="text-gray-600">Semantic recommendations powered by ChromaDB + MiniLM</p>
      </div>

      {skillGap && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 mb-6">
          <h2 className="font-semibold text-gray-800 mb-2">Skill gap analysis</h2>
          <p className="text-sm text-gray-600 mb-3">
            Overall skill match: <span className="font-semibold text-blue-600">{skillGap.match_percentage}%</span>
          </p>
          {skillGap.missing_skills?.length > 0 && (
            <div className="mb-3">
              <div className="text-sm text-gray-500 mb-2">Skills to improve:</div>
              <div className="flex flex-wrap gap-2">
                {skillGap.missing_skills.slice(0, 8).map((skill) => (
                  <span key={skill} className="bg-orange-100 text-orange-800 px-2 py-1 rounded-lg text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          {skillGap.roadmap?.length > 0 && (
            <div className="mb-3">
              <div className="text-sm font-medium text-gray-700 mb-2">Personalized roadmap</div>
              <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                {skillGap.roadmap.slice(0, 5).map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </div>
          )}
          {skillGap.course_suggestions?.length > 0 && (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Recommended courses</div>
              <div className="space-y-2">
                {skillGap.course_suggestions.slice(0, 4).map((course, index) => (
                  <a
                    key={index}
                    href={course.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    <div className="text-xs text-blue-600 font-medium">{course.platform} · {course.skill}</div>
                    <div className="text-sm text-gray-800">{course.title}</div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        {recommendations.map((internship) => (
          <div key={internship.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{internship.title}</h3>
                <p className="text-gray-600 text-sm">{internship.company}</p>
                <p className="text-xs text-gray-400 mt-1">{internship.domain}</p>
              </div>
              <div className="text-right">
                <div className="bg-green-100 text-green-800 px-2 py-1 rounded-lg text-sm font-medium">
                  {internship.match_percentage}% match
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                <span>📍 {internship.location}</span>
                <span>💰 {internship.stipend}</span>
                <span>⏱ {internship.duration}</span>
              </div>

              {internship.ai_explanation && (
                <div className="p-3 rounded-xl bg-purple-50 text-sm text-purple-900">
                  <span className="font-medium">Why this match: </span>
                  {internship.ai_explanation}
                </div>
              )}

              <div>
                <div className="text-sm text-gray-500 mb-2">Matching skills:</div>
                <div className="flex flex-wrap gap-2">
                  {(internship.matched_skills || []).map((skill) => (
                    <span key={skill} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-lg text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {(internship.missing_skills || []).length > 0 && (
                <div>
                  <div className="text-sm text-gray-500 mb-2">Gap skills:</div>
                  <div className="flex flex-wrap gap-2">
                    {internship.missing_skills.map((skill) => (
                      <span key={skill} className="bg-orange-100 text-orange-800 px-2 py-1 rounded-lg text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-3">
                <button
                  onClick={() => toggleSave(internship)}
                  disabled={savingIds.has(internship.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    saved.has(internship.id)
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {savingIds.has(internship.id) ? 'Saving...' : saved.has(internship.id) ? 'Saved' : 'Save'}
                </button>
                <button
                  onClick={() => trackApplication(internship)}
                  disabled={applyingIds.has(internship.id)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {applyingIds.has(internship.id) ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Applying...
                    </>
                  ) : (
                    'Apply & Track'
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
