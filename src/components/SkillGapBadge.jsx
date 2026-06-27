import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppContext } from '../App.jsx'
import {
  ExclamationTriangleIcon,
  AcademicCapIcon,
  ClockIcon,
  ArrowTopRightOnSquareIcon,
  XMarkIcon,
  CheckBadgeIcon,
  LightBulbIcon,
  TrophyIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { CheckBadgeIcon as CheckBadgeIconSolid } from '@heroicons/react/24/solid'

// Comprehensive course database
const SKILL_COURSES = {
  // Programming Languages
  'JavaScript': {
    title: 'Complete JavaScript Programming',
    provider: 'NPTEL',
    duration: '8 weeks',
    difficulty: 'Beginner',
    rating: 4.8,
    url: 'https://nptel.ac.in/courses/javascript',
    description: 'Master JavaScript fundamentals and advanced concepts',
    topics: ['ES6+', 'DOM Manipulation', 'Async Programming']
  },
  'Python': {
    title: 'Programming in Python',
    provider: 'SWAYAM',
    duration: '12 weeks',
    difficulty: 'Beginner',
    rating: 4.9,
    url: 'https://swayam.gov.in/python',
    description: 'Learn Python from basics to advanced applications',
    topics: ['Data Structures', 'OOP', 'Libraries']
  },
  'TypeScript': {
    title: 'TypeScript Fundamentals',
    provider: 'NPTEL',
    duration: '6 weeks',
    difficulty: 'Intermediate',
    rating: 4.6,
    url: 'https://nptel.ac.in/courses/typescript',
    description: 'Add type safety to JavaScript applications',
    topics: ['Type System', 'Interfaces', 'Generics']
  },
  'Java': {
    title: 'Object-Oriented Programming with Java',
    provider: 'SWAYAM',
    duration: '10 weeks',
    difficulty: 'Beginner',
    rating: 4.7,
    url: 'https://swayam.gov.in/java',
    description: 'Learn Java programming and OOP concepts',
    topics: ['Classes', 'Inheritance', 'Collections']
  },

  // Frontend Technologies
  'React': {
    title: 'Modern React Development',
    provider: 'NPTEL',
    duration: '8 weeks',
    difficulty: 'Intermediate',
    rating: 4.8,
    url: 'https://nptel.ac.in/courses/react',
    description: 'Build dynamic web applications with React',
    topics: ['Components', 'Hooks', 'State Management']
  },
  'Vue.js': {
    title: 'Vue.js Complete Guide',
    provider: 'SWAYAM',
    duration: '6 weeks',
    difficulty: 'Intermediate',
    rating: 4.5,
    url: 'https://swayam.gov.in/vuejs',
    description: 'Progressive framework for building UIs',
    topics: ['Directives', 'Components', 'Vuex']
  },
  'CSS': {
    title: 'Advanced CSS and Responsive Design',
    provider: 'NPTEL',
    duration: '4 weeks',
    difficulty: 'Beginner',
    rating: 4.6,
    url: 'https://nptel.ac.in/courses/css',
    description: 'Master CSS layouts and responsive design',
    topics: ['Flexbox', 'Grid', 'Animations']
  },

  // Backend Technologies
  'Node.js': {
    title: 'Node.js Backend Development',
    provider: 'SWAYAM',
    duration: '10 weeks',
    difficulty: 'Intermediate',
    rating: 4.7,
    url: 'https://swayam.gov.in/nodejs',
    description: 'Build scalable server-side applications',
    topics: ['Express.js', 'APIs', 'Database Integration']
  },
  'MongoDB': {
    title: 'NoSQL Database with MongoDB',
    provider: 'NPTEL',
    duration: '6 weeks',
    difficulty: 'Beginner',
    rating: 4.4,
    url: 'https://nptel.ac.in/courses/mongodb',
    description: 'Learn document-based database design',
    topics: ['CRUD Operations', 'Aggregation', 'Indexing']
  },

  // Design Skills
  'Figma': {
    title: 'UI/UX Design with Figma',
    provider: 'SWAYAM',
    duration: '5 weeks',
    difficulty: 'Beginner',
    rating: 4.8,
    url: 'https://swayam.gov.in/figma',
    description: 'Design beautiful and functional interfaces',
    topics: ['Prototyping', 'Components', 'Design Systems']
  },
  'Adobe XD': {
    title: 'Adobe XD for UI Design',
    provider: 'NPTEL',
    duration: '4 weeks',
    difficulty: 'Beginner',
    rating: 4.3,
    url: 'https://nptel.ac.in/courses/adobe-xd',
    description: 'Create wireframes and interactive prototypes',
    topics: ['Wireframing', 'Prototyping', 'Collaboration']
  },
  'User Research': {
    title: 'UX Research Methods',
    provider: 'SWAYAM',
    duration: '8 weeks',
    difficulty: 'Intermediate',
    rating: 4.7,
    url: 'https://swayam.gov.in/ux-research',
    description: 'Learn to conduct effective user research',
    topics: ['Interviews', 'Surveys', 'Usability Testing']
  },

  // Data Science
  'Machine Learning': {
    title: 'Introduction to Machine Learning',
    provider: 'NPTEL',
    duration: '12 weeks',
    difficulty: 'Advanced',
    rating: 4.9,
    url: 'https://nptel.ac.in/courses/ml',
    description: 'Learn ML algorithms and applications',
    topics: ['Supervised Learning', 'Neural Networks', 'Deep Learning']
  },
  'Data Analysis': {
    title: 'Data Analytics with Python',
    provider: 'SWAYAM',
    duration: '10 weeks',
    difficulty: 'Intermediate',
    rating: 4.6,
    url: 'https://swayam.gov.in/data-analytics',
    description: 'Analyze and visualize data effectively',
    topics: ['Pandas', 'NumPy', 'Visualization']
  },

  // Soft Skills
  'Communication': {
    title: 'Effective Communication Skills',
    provider: 'SWAYAM',
    duration: '4 weeks',
    difficulty: 'Beginner',
    rating: 4.5,
    url: 'https://swayam.gov.in/communication',
    description: 'Improve verbal and written communication',
    topics: ['Presentation Skills', 'Writing', 'Interpersonal Skills']
  },
  'Leadership': {
    title: 'Leadership and Team Management',
    provider: 'NPTEL',
    duration: '6 weeks',
    difficulty: 'Intermediate',
    rating: 4.4,
    url: 'https://nptel.ac.in/courses/leadership',
    description: 'Develop leadership and management skills',
    topics: ['Team Building', 'Decision Making', 'Conflict Resolution']
  }
}

export default function SkillGapBadge({ 
  missingSkills = [], 
  internshipTitle = '',
  variant = 'default', // 'default', 'compact', 'detailed'
  showCourses = true,
  onSkillImprove,
  className = ''
}) {
  const { t } = useTranslation()
  const { userProfile, isVoiceMode } = useAppContext()
  
  const [isExpanded, setIsExpanded] = useState(false)
  const [enrolledCourses, setEnrolledCourses] = useState(new Set())
  const [completedSkills, setCompletedSkills] = useState(new Set())
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Load enrolled courses from storage
  useEffect(() => {
    const enrolled = JSON.parse(sessionStorage.getItem('enrolledCourses') || '[]')
    setEnrolledCourses(new Set(enrolled))
    
    const completed = JSON.parse(sessionStorage.getItem('completedSkills') || '[]')
    setCompletedSkills(new Set(completed))
  }, [])

  // Calculate severity based on missing skills count and importance
  const getSeverity = () => {
    if (missingSkills.length === 0) return 'none'
    if (missingSkills.length > 5) return 'high'
    if (missingSkills.length > 2) return 'medium'
    return 'low'
  }

  const severity = getSeverity()

  // Severity configurations
  const severityConfig = {
    none: {
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: CheckBadgeIcon,
      iconColor: 'text-green-600',
      message: t('skill_gap.none', 'Perfect match! No skill gaps found.')
    },
    low: {
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: LightBulbIcon,
      iconColor: 'text-blue-600',
      message: t('skill_gap.low', 'Minor skill gaps - easy to bridge!')
    },
    medium: {
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: ExclamationTriangleIcon,
      iconColor: 'text-yellow-600',
      message: t('skill_gap.medium', 'Some skill development needed.')
    },
    high: {
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: ExclamationTriangleIcon,
      iconColor: 'text-red-600',
      message: t('skill_gap.high', 'Significant skill gaps - but achievable!')
    }
  }

  // Categorize skills
  const skillCategories = {
    'programming': ['JavaScript', 'Python', 'TypeScript', 'Java', 'C++'],
    'frontend': ['React', 'Vue.js', 'CSS', 'HTML', 'Angular'],
    'backend': ['Node.js', 'MongoDB', 'SQL', 'Express.js', 'Django'],
    'design': ['Figma', 'Adobe XD', 'Photoshop', 'User Research', 'Prototyping'],
    'data': ['Machine Learning', 'Data Analysis', 'Python', 'R', 'Statistics'],
    'soft': ['Communication', 'Leadership', 'Teamwork', 'Problem Solving']
  }

  const categorizeSkill = (skill) => {
    for (const [category, skills] of Object.entries(skillCategories)) {
      if (skills.includes(skill)) return category
    }
    return 'other'
  }

  // Get available courses for missing skills
  const getAvailableCourses = () => {
    return missingSkills
      .filter(skill => SKILL_COURSES[skill])
      .map(skill => ({
        skill,
        course: SKILL_COURSES[skill],
        category: categorizeSkill(skill),
        isEnrolled: enrolledCourses.has(skill),
        isCompleted: completedSkills.has(skill)
      }))
  }

  // Enroll in course
  const handleEnrollCourse = (skillName) => {
    const newEnrolled = new Set(enrolledCourses)
    newEnrolled.add(skillName)
    setEnrolledCourses(newEnrolled)
    sessionStorage.setItem('enrolledCourses', JSON.stringify([...newEnrolled]))
    
    // Voice announcement
    if (isVoiceMode) {
      const message = t('course.enrolled', `Enrolled in ${skillName} course`)
      speakMessage(message)
    }
    
    if (onSkillImprove) {
      onSkillImprove(skillName, 'enrolled')
    }
  }

  // Mark skill as completed
  const handleCompleteSkill = (skillName) => {
    const newCompleted = new Set(completedSkills)
    newCompleted.add(skillName)
    setCompletedSkills(newCompleted)
    sessionStorage.setItem('completedSkills', JSON.stringify([...newCompleted]))
    
    if (onSkillImprove) {
      onSkillImprove(skillName, 'completed')
    }
  }

  const speakMessage = (message) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message)
      utterance.lang = userProfile.preferredLanguage === 'hi' ? 'hi-IN' : 'en-IN'
      window.speechSynthesis.speak(utterance)
    }
  }

  // Filter courses by category
  const filteredCourses = getAvailableCourses().filter(item => 
    selectedCategory === 'all' || item.category === selectedCategory
  )

  // Get unique categories from missing skills
  const availableCategories = [...new Set(getAvailableCourses().map(item => item.category))]

  if (severity === 'none') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${severityConfig.none.color} ${className}`}>
        <CheckBadgeIconSolid className="h-4 w-4" />
        <span className="text-sm font-medium">
          {t('skill_gap.perfect_match', 'Perfect Skill Match!')}
        </span>
      </div>
    )
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${severityConfig[severity].color} hover:opacity-80 transition-opacity ${className}`}
      >
        <severityConfig[severity].icon className="h-4 w-4" />
        <span className="text-sm font-medium">
          {missingSkills.length} {t('skills_missing', 'skills to learn')}
        </span>
      </button>
    )
  }

  return (
    <div className={`rounded-xl border ${severityConfig[severity].color} ${className}`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:opacity-80 transition-opacity"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          <severityConfig[severity].icon className={`h-5 w-5 ${severityConfig[severity].iconColor}`} />
          <div className="text-left">
            <h3 className="font-semibold text-sm">
              {t('skill_gap.title', 'Skill Gap Analysis')}
            </h3>
            <p className="text-xs opacity-75">
              {missingSkills.length} {t('skills_to_improve', 'skills to improve')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {getAvailableCourses().length > 0 && (
            <div className="bg-white bg-opacity-50 rounded-full px-2 py-1">
              <span className="text-xs font-medium">
                {getAvailableCourses().length} {t('courses_available', 'courses')}
              </span>
            </div>
          )}
          <svg 
            className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Message */}
          <p className="text-sm opacity-75">
            {severityConfig[severity].message}
          </p>

          {/* Missing Skills List */}
          <div>
            <h4 className="font-medium text-sm mb-2">
              {t('missing_skills', 'Missing Skills')}
            </h4>
            <div className="flex flex-wrap gap-2">
              {missingSkills.map((skill) => (
                <div key={skill} className="inline-flex items-center gap-1 px-2 py-1 bg-white bg-opacity-50 rounded-full text-xs">
                  <XMarkIcon className="h-3 w-3 text-red-500" />
                  {skill}
                  {completedSkills.has(skill) && (
                    <CheckBadgeIconSolid className="h-3 w-3 text-green-500" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Course Recommendations */}
          {showCourses && getAvailableCourses().length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">
                  {t('recommended_courses', 'Recommended Courses')}
                </h4>
                
                {/* Category Filter */}
                {availableCategories.length > 1 && (
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="text-xs bg-white bg-opacity-50 border-0 rounded px-2 py-1"
                  >
                    <option value="all">{t('all_categories', 'All')}</option>
                    {availableCategories.map(category => (
                      <option key={category} value={category}>
                        {t(`category.${category}`, category)}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {filteredCourses.map(({ skill, course, isEnrolled, isCompleted }) => (
                  <div key={skill} className="bg-white bg-opacity-30 rounded-lg p-3 space-y-2">
                    {/* Course Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium text-sm">{course.title}</h5>
                        <p className="text-xs opacity-75">{course.description}</p>
                        
                        <div className="flex items-center gap-3 mt-2 text-xs">
                          <span className="inline-flex items-center gap-1">
                            <AcademicCapIcon className="h-3 w-3" />
                            {course.provider}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <ClockIcon className="h-3 w-3" />
                            {course.duration}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <StarIcon className="h-3 w-3" />
                            {course.rating}
                          </span>
                        </div>
                      </div>
                      
                      <div className="ml-3 flex flex-col gap-1">
                        {isCompleted ? (
                          <div className="flex items-center gap-1 px-2 py-1 bg-green-500 bg-opacity-20 rounded-full">
                            <TrophyIcon className="h-3 w-3 text-green-600" />
                            <span className="text-xs text-green-700">{t('completed', 'Completed')}</span>
                          </div>
                        ) : isEnrolled ? (
                          <button
                            onClick={() => handleCompleteSkill(skill)}
                            className="flex items-center gap-1 px-2 py-1 bg-blue-500 bg-opacity-20 rounded-full text-xs text-blue-700 hover:bg-opacity-30"
                          >
                            <CheckBadgeIcon className="h-3 w-3" />
                            {t('mark_complete', 'Mark Complete')}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEnrollCourse(skill)}
                            className="flex items-center gap-1 px-2 py-1 bg-green-500 bg-opacity-20 rounded-full text-xs text-green-700 hover:bg-opacity-30"
                          >
                            <AcademicCapIcon className="h-3 w-3" />
                            {t('enroll_now', 'Enroll')}
                          </button>
                        )}
                        
                        <a
                          href={course.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2 py-1 bg-white bg-opacity-30 rounded-full text-xs hover:bg-opacity-50"
                        >
                          {t('view_course', 'View')}
                          <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                        </a>
                      </div>
                    </div>

                    {/* Course Topics */}
                    {course.topics && (
                      <div className="flex flex-wrap gap-1">
                        {course.topics.map((topic, index) => (
                          <span key={index} className="px-2 py-0.5 bg-white bg-opacity-40 rounded text-xs">
                            {topic}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress Summary */}
          {enrolledCourses.size > 0 && (
            <div className="pt-3 border-t border-white border-opacity-30">
              <div className="flex items-center justify-between text-xs">
                <span>{t('learning_progress', 'Learning Progress')}:</span>
                <span className="font-semibold">
                  {completedSkills.size}/{enrolledCourses.size} {t('courses_completed', 'courses completed')}
                </span>
              </div>
              <div className="mt-1 bg-white bg-opacity-30 rounded-full h-2">
                <div 
                  className="bg-green-500 rounded-full h-2 transition-all duration-300"
                  style={{ width: `${enrolledCourses.size > 0 ? (completedSkills.size / enrolledCourses.size) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}