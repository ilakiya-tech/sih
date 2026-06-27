import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppContext } from '../App.jsx'
import {
  MapPinIcon,
  BuildingOfficeIcon,
  InformationCircleIcon,
  HeartIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  AcademicCapIcon,
  ClockIcon,
  BanknotesIcon,
  ArrowTopRightOnSquareIcon,
  CheckBadgeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import {
  HeartIcon as HeartIconSolid,
  CheckBadgeIcon as CheckBadgeIconSolid
} from '@heroicons/react/24/solid'
import clsx from 'clsx'

// Course data for skill gap recommendations
const SKILL_COURSES = {
  'TypeScript': { title: 'TypeScript Fundamentals', provider: 'NPTEL', duration: '4 weeks', url: 'https://nptel.ac.in/courses/typescript' },
  'Node.js': { title: 'Node.js Backend Development', provider: 'SWAYAM', duration: '6 weeks', url: 'https://swayam.gov.in/nodejs' },
  'Python': { title: 'Programming in Python', provider: 'NPTEL', duration: '8 weeks', url: 'https://nptel.ac.in/courses/python' },
  'React': { title: 'Modern React Development', provider: 'SWAYAM', duration: '5 weeks', url: 'https://swayam.gov.in/react' },
  'Adobe XD': { title: 'UI/UX Design with Adobe XD', provider: 'NPTEL', duration: '3 weeks', url: 'https://nptel.ac.in/courses/adobe-xd' },
  'User Research': { title: 'User Experience Research Methods', provider: 'SWAYAM', duration: '5 weeks', url: 'https://swayam.gov.in/ux-research' },
  'Machine Learning': { title: 'Introduction to Machine Learning', provider: 'NPTEL', duration: '12 weeks', url: 'https://nptel.ac.in/courses/ml' },
  'Data Analysis': { title: 'Data Analytics with Python', provider: 'SWAYAM', duration: '8 weeks', url: 'https://swayam.gov.in/data-analytics' }
}

export default function InternshipCard({ 
  id,
  title, 
  organization, 
  location, 
  matchedSkills = [], 
  missingSkills = [],
  reason,
  skillMatch = 0,
  stipend,
  duration = '3 months',
  applicationUrl,
  description,
  requirements = [],
  deadline,
  type = 'Remote', // Remote, On-site, Hybrid
  company_size = 'Mid-size',
  industry = 'Technology'
}) {
  const { t } = useTranslation()
  const { 
    userProfile, 
    generateResume, 
    isVoiceMode,
    skillGaps 
  } = useAppContext()

  const [isReasonOpen, setIsReasonOpen] = useState(false)
  const [isSkillGapOpen, setIsSkillGapOpen] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isGeneratingResume, setIsGeneratingResume] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [resumeGenerated, setResumeGenerated] = useState(false)

  // Load saved status from localStorage simulation (using state instead)
  useEffect(() => {
    // In real app, this would check localStorage or API
    const savedInternships = JSON.parse(sessionStorage.getItem('savedInternships') || '[]')
    setIsSaved(savedInternships.includes(id))
  }, [id])

  // Calculate skill gap severity
  const skillGapSeverity = missingSkills?.length > 3 ? 'high' : missingSkills?.length > 1 ? 'medium' : 'low'
  const skillGapColor = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-green-100 text-green-800 border-green-200'
  }

  // Voice announcement helper
  const announceToVoice = (message) => {
    if (isVoiceMode && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message)
      utterance.lang = userProfile.preferredLanguage === 'hi' ? 'hi-IN' : 'en-IN'
      utterance.rate = 0.9
      window.speechSynthesis.speak(utterance)
    }
  }

  // Handle save/unsave internship
  const handleSave = () => {
    const savedInternships = JSON.parse(sessionStorage.getItem('savedInternships') || '[]')
    let updatedSaved

    if (isSaved) {
      updatedSaved = savedInternships.filter(savedId => savedId !== id)
      announceToVoice(t('internship.unsaved', 'Internship removed from saved'))
    } else {
      updatedSaved = [...savedInternships, id]
      announceToVoice(t('internship.saved', 'Internship saved for later'))
    }

    sessionStorage.setItem('savedInternships', JSON.stringify(updatedSaved))
    setIsSaved(!isSaved)
  }

  // Handle resume generation
  const handleGenerateResume = async () => {
    setIsGeneratingResume(true)
    try {
      await generateResume({
        ...userProfile,
        targetInternship: {
          title,
          organization,
          skills: matchedSkills
        }
      })
      setResumeGenerated(true)
      announceToVoice(t('resume.generated', 'Resume generated successfully'))
    } catch (error) {
      console.error('Resume generation failed:', error)
      announceToVoice(t('resume.error', 'Resume generation failed'))
    } finally {
      setIsGeneratingResume(false)
    }
  }

  // Handle quick apply
  const handleQuickApply = async () => {
    setIsApplying(true)
    
    // Auto-generate resume if not already generated
    if (!resumeGenerated) {
      await handleGenerateResume()
    }
    
    // Simulate application process
    setTimeout(() => {
      setIsApplying(false)
      announceToVoice(t('application.submitted', 'Application submitted successfully'))
      
      // In real app, would redirect to application URL or show success modal
      if (applicationUrl) {
        window.open(applicationUrl, '_blank')
      }
    }, 2000)
  }

  // Get skill gap courses
  const getSkillGapCourses = () => {
    return missingSkills
      ?.filter(skill => SKILL_COURSES[skill])
      .map(skill => ({ skill, course: SKILL_COURSES[skill] })) || []
  }

  // Match percentage color
  const getMatchColor = (percentage) => {
    if (percentage >= 85) return 'text-green-600 bg-green-50'
    if (percentage >= 70) return 'text-blue-600 bg-blue-50'
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  return (
    <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 hover:shadow-md transition-shadow duration-200">
      {/* Header Section */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-slate-900 truncate">{title}</h3>
            {skillMatch > 0 && (
              <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getMatchColor(skillMatch)}`}>
                {skillMatch}% {t('match', 'match')}
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 mb-2">
            <span className="inline-flex items-center gap-1">
              <BuildingOfficeIcon className="h-4 w-4" aria-hidden="true" />
              {organization}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPinIcon className="h-4 w-4" aria-hidden="true" />
              {location}
            </span>
            {stipend && (
              <span className="inline-flex items-center gap-1 text-green-600">
                <BanknotesIcon className="h-4 w-4" aria-hidden="true" />
                {stipend}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <ClockIcon className="h-4 w-4" aria-hidden="true" />
              {duration}
            </span>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="ml-3 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
          aria-label={isSaved ? t('unsave', 'Unsave internship') : t('save', 'Save internship')}
        >
          {isSaved ? (
            <HeartIconSolid className="h-5 w-5 text-red-500" />
          ) : (
            <HeartIcon className="h-5 w-5 text-gray-400" />
          )}
        </button>
      </div>

      {/* Skills Section */}
      <div className="space-y-3 mb-4">
        {/* Matched Skills */}
        {matchedSkills?.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              {t('matched_skills', 'Matching Skills')}
            </h4>
            <ul className="flex flex-wrap gap-2" aria-label="Matched skills">
              {matchedSkills.map((skill) => (
                <li 
                  key={skill} 
                  className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs text-green-700 ring-1 ring-green-200"
                >
                  <CheckBadgeIconSolid className="h-3 w-3" />
                  {skill}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Skill Gap Badge */}
        {missingSkills?.length > 0 && (
          <div>
            <button
              onClick={() => setIsSkillGapOpen(!isSkillGapOpen)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors duration-200 ${skillGapColor[skillGapSeverity]} hover:opacity-80`}
              aria-expanded={isSkillGapOpen}
            >
              <ExclamationTriangleIcon className="h-4 w-4" />
              <span>
                {t('skill_gap', 'Skill Gap')}: {missingSkills.length} {t('skills_missing', 'skills missing')}
              </span>
              <svg className={`h-4 w-4 transition-transform ${isSkillGapOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Skill Gap Details */}
            {isSkillGapOpen && (
              <div className="mt-3 p-4 bg-gray-50 rounded-lg space-y-3">
                <h5 className="font-medium text-gray-800">
                  {t('missing_skills', 'Missing Skills & Recommended Courses')}
                </h5>
                
                <div className="space-y-2">
                  {missingSkills.map((skill) => {
                    const course = SKILL_COURSES[skill]
                    return (
                      <div key={skill} className="flex items-center justify-between p-2 bg-white rounded border">
                        <div className="flex items-center gap-2">
                          <XMarkIcon className="h-4 w-4 text-red-500" />
                          <span className="font-medium text-gray-700">{skill}</span>
                        </div>
                        
                        {course && (
                          <a
                            href={course.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                          >
                            <AcademicCapIcon className="h-3 w-3" />
                            {course.provider}
                            <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    )
                  })}
                </div>
                
                {getSkillGapCourses().length > 0 && (
                  <p className="text-xs text-gray-600">
                    {t('skill_gap_tip', 'Complete these courses to improve your match percentage!')}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      {description && (
        <div className="mb-4">
          <p className="text-sm text-gray-700 leading-relaxed">
            {showFullDescription ? description : `${description.slice(0, 120)}...`}
          </p>
          {description.length > 120 && (
            <button
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-1"
            >
              {showFullDescription ? t('show_less', 'Show Less') : t('show_more', 'Show More')}
            </button>
          )}
        </div>
      )}

      {/* Why Recommended Section */}
      <div className="mb-4">
        <button
          type="button"
          className={clsx(
            'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm ring-1 transition-all duration-200',
            isReasonOpen
              ? 'bg-blue-600 text-white ring-blue-600'
              : 'bg-white text-blue-700 ring-blue-200 hover:bg-blue-50'
          )}
          onClick={() => setIsReasonOpen(!isReasonOpen)}
          aria-expanded={isReasonOpen}
          aria-controls="why-recommended"
        >
          <InformationCircleIcon className="h-4 w-4" aria-hidden="true" />
          <span>{t('why_recommended', 'Why Recommended?')}</span>
          <svg className={`h-4 w-4 transition-transform ${isReasonOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isReasonOpen && (
          <div id="why-recommended" className="mt-3 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900 leading-relaxed">
              {reason || t('default_reason', 'This internship matches your skills, interests, and career goals based on your profile.')}
            </p>
            
            {/* Match breakdown */}
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2 rounded">
                <span className="font-medium">{t('skill_match', 'Skill Match')}:</span>
                <span className={`ml-1 ${getMatchColor(skillMatch).split(' ')[0]}`}>{skillMatch}%</span>
              </div>
              <div className="bg-white p-2 rounded">
                <span className="font-medium">{t('location_fit', 'Location')}:</span>
                <span className="ml-1 text-green-600">{t('good_fit', 'Good Fit')}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-3 border-t border-gray-100">
        {/* Generate Resume Button */}
        <button
          onClick={handleGenerateResume}
          disabled={isGeneratingResume}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <DocumentTextIcon className="h-4 w-4" />
          {isGeneratingResume ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {t('generating', 'Generating...')}
            </>
          ) : resumeGenerated ? (
            <>
              <CheckBadgeIcon className="h-4 w-4 text-green-600" />
              {t('resume_ready', 'Resume Ready')}
            </>
          ) : (
            t('generate_resume', 'Generate Resume')
          )}
        </button>

        {/* Quick Apply Button */}
        <button
          onClick={handleQuickApply}
          disabled={isApplying}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isApplying ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {t('applying', 'Applying...')}
            </>
          ) : (
            <>
              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
              {t('quick_apply', 'Quick Apply')}
            </>
          )}
        </button>
      </div>

      {/* Application Deadline Warning */}
      {deadline && (
        <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-xs text-orange-800 flex items-center gap-1">
            <ClockIcon className="h-3 w-3" />
            {t('application_deadline', 'Application Deadline')}: {deadline}
          </p>
        </div>
      )}
    </article>
  )
}