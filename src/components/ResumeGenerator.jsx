import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppContext } from '../App.jsx'
import {
  DocumentTextIcon,
  DownloadIcon,
  EyeIcon,
  ShareIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  PencilIcon,
  PrinterIcon,
  ClockIcon,
  StarIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  LinkIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import {
  CheckCircleIcon as CheckCircleIconSolid,
  DocumentTextIcon as DocumentTextIconSolid
} from '@heroicons/react/24/solid'

// Resume templates
const RESUME_TEMPLATES = {
  professional: {
    id: 'professional',
    name: 'Professional',
    description: 'Clean, corporate-friendly design',
    primaryColor: '#2563eb',
    secondaryColor: '#64748b',
    fontFamily: 'Inter, sans-serif',
    layout: 'two-column'
  },
  modern: {
    id: 'modern',
    name: 'Modern',
    description: 'Contemporary design with accent colors',
    primaryColor: '#7c3aed',
    secondaryColor: '#a855f7',
    fontFamily: 'Poppins, sans-serif',
    layout: 'single-column'
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple, typography-focused layout',
    primaryColor: '#374151',
    secondaryColor: '#6b7280',
    fontFamily: 'system-ui, sans-serif',
    layout: 'minimal'
  },
  creative: {
    id: 'creative',
    name: 'Creative',
    description: 'Bold design for creative roles',
    primaryColor: '#dc2626',
    secondaryColor: '#f59e0b',
    fontFamily: 'Montserrat, sans-serif',
    layout: 'creative'
  }
}

export default function ResumeGenerator({
  targetInternship = null,
  isOpen = false,
  onClose,
  onGenerated,
  autoGenerate = false,
  className = ''
}) {
  const { t } = useTranslation()
  const { userProfile, isVoiceMode } = useAppContext()
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedResume, setGeneratedResume] = useState(null)
  const [selectedTemplate, setSelectedTemplate] = useState('professional')
  const [customizations, setCustomizations] = useState({
    includeSummary: true,
    includeProjects: true,
    includeSkills: true,
    includeEducation: true,
    includeExperience: true,
    skillsToHighlight: [],
    customSummary: '',
    showProfilePicture: false
  })
  const [previewMode, setPreviewMode] = useState(false)
  const [resumeData, setResumeData] = useState(null)
  const [generationStep, setGenerationStep] = useState('')
  const [isDownloading, setIsDownloading] = useState(false)
  
  const resumeRef = useRef(null)
  const previewRef = useRef(null)

  // Auto-generate resume when component mounts with autoGenerate flag
  useEffect(() => {
    if (autoGenerate && !generatedResume) {
      handleGenerateResume()
    }
  }, [autoGenerate])

  // Prepare resume data based on user profile and target internship
  const prepareResumeData = () => {
    const data = {
      // Personal Information
      personalInfo: {
        name: userProfile.name || t('resume.default_name', 'Your Name'),
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        location: userProfile.location || '',
        linkedin: userProfile.linkedin || '',
        portfolio: userProfile.portfolio || '',
        github: userProfile.github || ''
      },
      
      // Professional Summary (AI-enhanced based on target internship)
      summary: customizations.customSummary || generateSmartSummary(),
      
      // Skills (prioritized based on target internship)
      skills: prioritizeSkills(),
      
      // Education
      education: formatEducation(),
      
      // Experience
      experience: formatExperience(),
      
      // Projects (filtered/enhanced for target role)
      projects: formatProjects(),
      
      // Achievements
      achievements: userProfile.achievements || [],
      
      // Certifications
      certifications: userProfile.certifications || [],
      
      // Languages
      languages: userProfile.languages || [
        { name: userProfile.preferredLanguage === 'hi' ? 'Hindi' : 'English', level: 'Native' }
      ]
    }
    
    return data
  }

  // Generate AI-enhanced summary based on target internship
  const generateSmartSummary = () => {
    if (!targetInternship) {
      return `Motivated ${userProfile.education || 'student'} with strong skills in ${userProfile.skills?.slice(0, 3)?.join(', ')} seeking internship opportunities to apply knowledge and gain practical experience in a dynamic environment.`
    }
    
    const matchingSkills = userProfile.skills?.filter(skill => 
      targetInternship.requiredSkills?.includes(skill)
    ) || []
    
    return `Enthusiastic ${userProfile.education || 'student'} with expertise in ${matchingSkills.slice(0, 3).join(', ')}. Passionate about ${targetInternship.title?.toLowerCase()} and eager to contribute to ${targetInternship.company} through innovative solutions and continuous learning.`
  }

  // Prioritize skills based on target internship
  const prioritizeSkills = () => {
    if (!userProfile.skills) return []
    
    if (!targetInternship) return userProfile.skills
    
    const requiredSkills = targetInternship.requiredSkills || []
    const matchingSkills = userProfile.skills.filter(skill => requiredSkills.includes(skill))
    const otherSkills = userProfile.skills.filter(skill => !requiredSkills.includes(skill))
    
    return [...matchingSkills, ...otherSkills]
  }

  // Format education information
  const formatEducation = () => {
    if (!userProfile.education) return []
    
    return [{
      degree: userProfile.education,
      institution: userProfile.institution || t('resume.your_institution', 'Your Institution'),
      year: userProfile.graduationYear || new Date().getFullYear(),
      gpa: userProfile.gpa || '',
      relevantCourses: userProfile.relevantCourses || []
    }]
  }

  // Format experience information
  const formatExperience = () => {
    if (!userProfile.experience || userProfile.experience === 'Fresher') {
      return [{
        title: t('resume.academic_projects', 'Academic Projects & Coursework'),
        company: userProfile.institution || t('resume.academic_institution', 'Educational Institution'),
        duration: `${new Date().getFullYear() - 2} - ${new Date().getFullYear()}`,
        description: [
          t('resume.academic_desc1', 'Completed coursework in relevant subjects with hands-on projects'),
          t('resume.academic_desc2', 'Developed problem-solving skills through academic assignments'),
          t('resume.academic_desc3', 'Participated in group projects and presentations')
        ]
      }]
    }
    
    return userProfile.experience
  }

  // Format projects for resume
  const formatProjects = () => {
    return userProfile.projects || [{
      name: t('resume.sample_project', 'Sample Project'),
      description: t('resume.sample_project_desc', 'Description of a relevant project showcasing your skills'),
      technologies: userProfile.skills?.slice(0, 3) || ['Technology 1', 'Technology 2'],
      link: ''
    }]
  }

  // Generate resume
  const handleGenerateResume = async () => {
    setIsGenerating(true)
    setGenerationStep(t('resume.preparing', 'Preparing resume data...'))
    
    try {
      // Step 1: Prepare data
      await new Promise(resolve => setTimeout(resolve, 800))
      const data = prepareResumeData()
      setResumeData(data)
      
      setGenerationStep(t('resume.applying_template', 'Applying template...'))
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setGenerationStep(t('resume.optimizing', 'Optimizing for target role...'))
      await new Promise(resolve => setTimeout(resolve, 600))
      
      setGenerationStep(t('resume.finalizing', 'Finalizing resume...'))
      await new Promise(resolve => setTimeout(resolve, 400))
      
      const resume = {
        id: Date.now(),
        data,
        template: selectedTemplate,
        createdAt: new Date(),
        targetInternship: targetInternship?.title || t('resume.general', 'General'),
        downloadUrl: '#' // In real app, this would be the PDF URL
      }
      
      setGeneratedResume(resume)
      
      // Voice announcement
      if (isVoiceMode) {
        speakMessage(t('resume.generated_success', 'Resume generated successfully!'))
      }
      
      if (onGenerated) {
        onGenerated(resume)
      }
      
    } catch (error) {
      console.error('Resume generation failed:', error)
      if (isVoiceMode) {
        speakMessage(t('resume.generation_failed', 'Resume generation failed. Please try again.'))
      }
    } finally {
      setIsGenerating(false)
      setGenerationStep('')
    }
  }

  // Download resume as PDF
  const handleDownload = async () => {
    setIsDownloading(true)
    
    try {
      // In a real app, this would generate and download a PDF
      // Using html2pdf, jsPDF, or a backend service
      
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Create a mock download
      const element = document.createElement('a')
      const file = new Blob(['Mock PDF Content'], { type: 'application/pdf' })
      element.href = URL.createObjectURL(file)
      element.download = `${resumeData?.personalInfo?.name || 'Resume'}_${targetInternship?.company || 'General'}.pdf`
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
      
      if (isVoiceMode) {
        speakMessage(t('resume.downloaded', 'Resume downloaded successfully'))
      }
      
    } catch (error) {
      console.error('Download failed:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  const speakMessage = (message) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message)
      utterance.lang = userProfile.preferredLanguage === 'hi' ? 'hi-IN' : 'en-IN'
      window.speechSynthesis.speak(utterance)
    }
  }

  // Render resume preview
  const renderResumePreview = () => {
    if (!resumeData) return null
    
    const template = RESUME_TEMPLATES[selectedTemplate]
    
    return (
      <div 
        ref={previewRef}
        className="bg-white shadow-lg rounded-lg overflow-hidden max-w-2xl mx-auto"
        style={{ 
          fontFamily: template.fontFamily,
          color: template.primaryColor 
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{resumeData.personalInfo.name}</h1>
              <p className="text-blue-100 mt-1">{targetInternship?.title || t('resume.seeking_internship', 'Seeking Internship Opportunities')}</p>
            </div>
            {customizations.showProfilePicture && (
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                <UserIcon className="h-8 w-8" />
              </div>
            )}
          </div>
          
          {/* Contact Info */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-blue-100">
            {resumeData.personalInfo.email && (
              <div className="flex items-center gap-1">
                <EnvelopeIcon className="h-4 w-4" />
                {resumeData.personalInfo.email}
              </div>
            )}
            {resumeData.personalInfo.phone && (
              <div className="flex items-center gap-1">
                <PhoneIcon className="h-4 w-4" />
                {resumeData.personalInfo.phone}
              </div>
            )}
            {resumeData.personalInfo.location && (
              <div className="flex items-center gap-1">
                <MapPinIcon className="h-4 w-4" />
                {resumeData.personalInfo.location}
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar for Generation */}
        {isGenerating && (
          <div className="absolute bottom-0 left-0 right-0 bg-blue-600 bg-opacity-10 p-3">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="bg-white rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-blue-600 h-2 transition-all duration-1000 ease-out"
                      style={{ 
                        width: generationStep.includes('Preparing') ? '25%' : 
                               generationStep.includes('Applying') ? '50%' : 
                               generationStep.includes('Optimizing') ? '75%' : 
                               generationStep.includes('Finalizing') ? '90%' : '100%'
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm text-blue-600 font-medium min-w-0">
                  {generationStep}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Export utility functions for use in other components
export const generateQuickResume = async (userProfile, targetInternship = null) => {
  const generator = new ResumeGenerator({
    targetInternship,
    autoGenerate: true
  })
  
  return generator.handleGenerateResume()
}

export const downloadResume = async (resumeData, filename = 'resume.pdf') => {
  // In real implementation, would use libraries like:
  // - jsPDF for client-side PDF generation
  // - html2pdf for HTML to PDF conversion
  // - Backend service for high-quality PDF generation
  
  const mockPDFGeneration = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const element = document.createElement('a')
        const file = new Blob([JSON.stringify(resumeData, null, 2)], { type: 'application/json' })
        element.href = URL.createObjectURL(file)
        element.download = filename
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
        resolve(true)
      }, 1500)
    })
  }
  
  return mockPDFGeneration()
}  
        <div className="p-6 space-y-6">
          {/* Summary */}
          {customizations.includeSummary && (
            <section>
              <h2 className="text-lg font-semibold text-gray-800 border-b-2 border-blue-200 pb-2 mb-3">
                {t('resume.professional_summary', 'Professional Summary')}
              </h2>
              <p className="text-gray-700 leading-relaxed">{resumeData.summary}</p>
            </section>
          )}
          
          {/* Skills */}
          {customizations.includeSkills && (
            <section>
              <h2 className="text-lg font-semibold text-gray-800 border-b-2 border-blue-200 pb-2 mb-3">
                {t('resume.technical_skills', 'Technical Skills')}
              </h2>
              <div className="flex flex-wrap gap-2">
                {resumeData.skills.slice(0, 12).map((skill, index) => (
                  <span 
                    key={skill}
                    className={`px-3 py-1 rounded-full text-sm ${
                      index < 3 ? 'bg-blue-100 text-blue-800 font-medium' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}
          
          {/* Education */}
          {customizations.includeEducation && (
            <section>
              <h2 className="text-lg font-semibold text-gray-800 border-b-2 border-blue-200 pb-2 mb-3">
                {t('resume.education', 'Education')}
              </h2>
              {resumeData.education.map((edu, index) => (
                <div key={index} className="mb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-800">{edu.degree}</h3>
                      <p className="text-gray-600">{edu.institution}</p>
                    </div>
                    <span className="text-gray-500 text-sm">{edu.year}</span>
                  </div>
                  {edu.gpa && (
                    <p className="text-sm text-gray-600 mt-1">GPA: {edu.gpa}</p>
                  )}
                </div>
              ))}
            </section>
          )}
          
          {/* Experience */}
          {customizations.includeExperience && (
            <section>
              <h2 className="text-lg font-semibold text-gray-800 border-b-2 border-blue-200 pb-2 mb-3">
                {t('resume.experience', 'Experience')}
              </h2>
              {resumeData.experience.map((exp, index) => (
                <div key={index} className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-gray-800">{exp.title}</h3>
                      <p className="text-gray-600">{exp.company}</p>
                    </div>
                    <span className="text-gray-500 text-sm">{exp.duration}</span>
                  </div>
                  {exp.description && Array.isArray(exp.description) && (
                    <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                      {exp.description.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </section>
          )}
          
          {/* Projects */}
          {customizations.includeProjects && (
            <section>
              <h2 className="text-lg font-semibold text-gray-800 border-b-2 border-blue-200 pb-2 mb-3">
                {t('resume.projects', 'Projects')}
              </h2>
              {resumeData.projects.map((project, index) => (
                <div key={index} className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-800">{project.name}</h3>
                    {project.link && (
                      <a href={project.link} className="text-blue-600 text-sm flex items-center gap-1">
                        <LinkIcon className="h-3 w-3" />
                        {t('resume.view_project', 'View')}
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{project.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {project.technologies.map((tech) => (
                      <span key={tech} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          )}
        </div>
      </div>
    )
  }

  if (!isOpen && !autoGenerate) return null

  return (
    <div className={`${isOpen ? 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4' : ''} ${className}`}>
      <div className={`bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden ${isOpen ? '' : 'border'}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <DocumentTextIconSolid className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {t('resume.generator_title', 'AI Resume Generator')}
                </h2>
                <p className="text-blue-100 text-sm">
                  {targetInternship 
                    ? t('resume.tailored_for', `Tailored for ${targetInternship.title}`)
                    : t('resume.general_purpose', 'General purpose resume')
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {generatedResume && (
                <div className="flex items-center gap-1 bg-green-500 bg-opacity-20 px-3 py-1 rounded-full">
                  <CheckCircleIconSolid className="h-4 w-4 text-green-300" />
                  <span className="text-sm">{t('resume.generated', 'Generated')}</span>
                </div>
              )}
              
              {isOpen && (
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row h-full">
          {/* Controls Panel */}
          <div className="w-full lg:w-1/3 p-6 border-r border-gray-200 space-y-6">
            {/* Template Selection */}
            <div>
              <h3 className="font-medium text-gray-800 mb-3">
                {t('resume.choose_template', 'Choose Template')}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(RESUME_TEMPLATES).map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`p-3 text-left rounded-lg border-2 transition-colors ${
                      selectedTemplate === template.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-sm">{template.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{template.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Customization Options */}
            <div>
              <h3 className="font-medium text-gray-800 mb-3">
                {t('resume.customize', 'Customize')}
              </h3>
              <div className="space-y-2">
                {[
                  { key: 'includeSummary', label: t('resume.include_summary', 'Include Summary') },
                  { key: 'includeSkills', label: t('resume.include_skills', 'Include Skills') },
                  { key: 'includeEducation', label: t('resume.include_education', 'Include Education') },
                  { key: 'includeExperience', label: t('resume.include_experience', 'Include Experience') },
                  { key: 'includeProjects', label: t('resume.include_projects', 'Include Projects') }
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={customizations[key]}
                      onChange={(e) => setCustomizations(prev => ({
                        ...prev,
                        [key]: e.target.checked
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {!generatedResume ? (
                <button
                  onClick={handleGenerateResume}
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isGenerating ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      {generationStep || t('resume.generating', 'Generating...')}
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="h-4 w-4" />
                      {t('resume.generate', 'Generate Resume')}
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {isDownloading ? (
                      <>
                        <svg className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {t('resume.downloading', 'Downloading...')}
                      </>
                    ) : (
                      <>
                        <DownloadIcon className="h-4 w-4" />
                        {t('resume.download_pdf', 'Download PDF')}
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setGeneratedResume(null)}
                    className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    <PencilIcon className="h-4 w-4" />
                    {t('resume.regenerate', 'Generate New')}
                  </button>
                </div>
              )}
            </div>

            {/* Status */}
            {generatedResume && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800 text-sm">
                  <CheckCircleIcon className="h-4 w-4" />
                  <span>{t('resume.ready_to_apply', 'Resume ready for applications!')}</span>
                </div>
                <div className="text-xs text-green-600 mt-1">
                  {t('resume.created_at', 'Created')}: {generatedResume.createdAt?.toLocaleTimeString()}
                </div>
              </div>
            )}
          </div>

          {/* Preview Panel */}
          <div className="flex-1 p-6 bg-gray-50 overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-medium text-gray-800">
                {t('resume.preview', 'Resume Preview')}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 rounded text-sm hover:bg-gray-50"
                >
                  <EyeIcon className="h-4 w-4" />
                  {previewMode ? t('resume.edit_mode', 'Edit') : t('resume.preview_mode', 'Preview')}
                </button>
              </div>
            </div>

            {isGenerating ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <svg className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <p className="text-gray-600 text-sm">{generationStep}</p>
                </div>
              </div>
            ) : generatedResume && resumeData ? (
              renderResumePreview()
            ) : (
              <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center">
                  <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-sm mb-2">
                    {t('resume.no_preview', 'Resume preview will appear here')}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {t('resume.click_generate', 'Click "Generate Resume" to create your personalized resume')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>