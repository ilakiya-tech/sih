import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  SparklesIcon, 
  GlobeAltIcon,
  UserGroupIcon,
  CheckBadgeIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

export default function Landing() {
  const { t } = useTranslation()

  const trustHighlights = [
    { icon: SparklesIcon, text: 'AI-Powered', color: 'text-blue-600' },
    { icon: GlobeAltIcon, text: 'Multi-Language', color: 'text-green-600' },
    { icon: UserGroupIcon, text: 'For Everyone', color: 'text-purple-600' },
    { icon: CheckBadgeIcon, text: 'Transparent', color: 'text-orange-600' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center p-6">
      {/* Hero Section - Clean & Minimal */}
      <div className="text-center max-w-sm mx-auto">
        {/* Logo/Brand */}
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl transform hover:scale-105 transition-all duration-300">
          <SparklesIcon className="w-10 h-10 text-white" />
        </div>

        {/* Clean Title */}
        <h1 className="text-4xl font-bold text-slate-800 mb-3">
          Intern<span className="text-blue-600">Path</span>
        </h1>
        
        {/* Simple Subtitle */}
        <p className="text-lg text-slate-600 mb-4 leading-relaxed">
          Semantic AI internship matching with ChromaDB, Gemini, and skill roadmaps
        </p>
        <p className="text-sm text-slate-500 mb-8">520+ internships · sentence-transformers · JWT auth</p>

        <Link
          to="/register"
          className="group w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3 text-lg"
        >
          <SparklesIcon className="w-6 h-6" />
          <span>Get Started Free</span>
          <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
        <Link to="/login" className="block mt-3 text-sm text-blue-600 font-medium">
          Already have an account? Sign in
        </Link>

        {/* Trust Indicators - Icons + Minimal Text */}
        <div className="mt-12 pt-8 border-t border-slate-200">
          <p className="text-sm text-slate-500 mb-6">Trusted by thousands of students</p>
          <div className="grid grid-cols-2 gap-4">
            {trustHighlights.map((item, index) => {
              const Icon = item.icon
              return (
                <div 
                  key={index}
                  className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <Icon className={`w-8 h-8 ${item.color}`} />
                  <span className="text-sm font-medium text-slate-700">{item.text}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Stats - Simple & Trustworthy */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">10k+</div>
              <div className="text-xs text-slate-500">Students</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">500+</div>
              <div className="text-xs text-slate-500">Companies</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">95%</div>
              <div className="text-xs text-slate-500">Success</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Minimal */}
      <div className="mt-12 text-center">
        <p className="text-xs text-slate-400">
          Inclusive • Fast • Transparent
        </p>
      </div>
    </div>
  )
}