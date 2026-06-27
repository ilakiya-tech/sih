import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  DocumentTextIcon,
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  UserIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  StarIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'

export default function ResumeBuilder() {
  const navigate = useNavigate()
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [step, setStep] = useState(1) // 1: Template selection, 2: Form filling, 3: Preview
  const [formData, setFormData] = useState({
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: ''
    },
    objective: '',
    education: [
      { degree: '', institution: '', year: '', grade: '' }
    ],
    experience: [
      { title: '', company: '', duration: '', description: '' }
    ],
    skills: [''],
    projects: [
      { name: '', description: '', technologies: '', link: '' }
    ],
    achievements: ['']
  })

  // Resume templates with proper static classes
  const templates = [
    {
      id: 1,
      name: 'Professional',
      description: 'Clean and modern design perfect for tech roles',
      color: 'blue',
      preview: 'Modern layout with blue accents',
      bgClass: 'bg-blue-50',
      borderClass: 'border-blue-200',
      textClass: 'text-blue-600',
      badgeClass: 'bg-blue-100 text-blue-800'
    },
    {
      id: 2,
      name: 'Creative',
      description: 'Stand out with this creative design',
      color: 'green',
      preview: 'Creative layout with green highlights',
      bgClass: 'bg-green-50',
      borderClass: 'border-green-200',
      textClass: 'text-green-600',
      badgeClass: 'bg-green-100 text-green-800'
    },
    {
      id: 3,
      name: 'Minimal',
      description: 'Simple and elegant for any industry',
      color: 'gray',
      preview: 'Clean minimal design',
      bgClass: 'bg-gray-50',
      borderClass: 'border-gray-200',
      textClass: 'text-gray-600',
      badgeClass: 'bg-gray-100 text-gray-800'
    }
  ]

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template)
    setStep(2)
  }

  const handleInputChange = (section, index, field, value) => {
    // Prevent any form submission or navigation
    event?.preventDefault?.()
    
    setFormData(prev => ({
      ...prev,
      [section]: section === 'personalInfo' || section === 'objective' 
        ? (section === 'objective' ? value : { ...prev[section], [field]: value })
        : prev[section].map((item, i) => 
            i === index ? (typeof item === 'string' ? value : { ...item, [field]: value }) : item
          )
    }))
  }

  const addArrayItem = (section) => {
    const newItem = section === 'education' 
      ? { degree: '', institution: '', year: '', grade: '' }
      : section === 'experience'
      ? { title: '', company: '', duration: '', description: '' }
      : section === 'projects'
      ? { name: '', description: '', technologies: '', link: '' }
      : ''

    setFormData(prev => ({
      ...prev,
      [section]: [...prev[section], newItem]
    }))
  }

  const removeArrayItem = (section, index) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }))
  }

  const generatePDF = () => {
    // This is a simplified PDF generation - in a real app you'd use jsPDF or similar
    const resumeContent = `
      RESUME
      
      ${formData.personalInfo.name}
      ${formData.personalInfo.email} | ${formData.personalInfo.phone}
      ${formData.personalInfo.location}
      
      OBJECTIVE
      ${formData.objective}
      
      EDUCATION
      ${formData.education.map(edu => `${edu.degree} - ${edu.institution} (${edu.year})`).join('\n')}
      
      EXPERIENCE
      ${formData.experience.map(exp => `${exp.title} at ${exp.company} (${exp.duration})\n${exp.description}`).join('\n\n')}
      
      SKILLS
      ${formData.skills.filter(skill => skill.trim()).join(', ')}
      
      PROJECTS
      ${formData.projects.map(proj => `${proj.name}: ${proj.description}`).join('\n')}
    `
    
    const blob = new Blob([resumeContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${formData.personalInfo.name || 'Resume'}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link 
              to="/"
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Choose a Template</h1>
          </div>

          {/* Template Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-gray-200 hover:border-blue-300 p-6"
              >
                <div className={`w-full h-48 ${template.bgClass} rounded-lg mb-4 flex items-center justify-center border-2 ${template.borderClass}`}>
                  <DocumentTextIcon className={`w-16 h-16 ${template.textClass}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{template.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                <div className={`${template.badgeClass} px-3 py-1 rounded-full text-xs font-medium inline-block`}>
                  {template.preview}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setStep(1)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Fill Your Details</h1>
            </div>
            <button
              onClick={() => setStep(3)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Preview Resume
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form */}
            <div className="space-y-6">
              {/* Personal Info */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-2 mb-4">
                  <UserIcon className="w-5 h-5 text-blue-600" />
                  <h2 className="text-xl font-semibold">Personal Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.personalInfo.name}
                    onChange={(e) => handleInputChange('personalInfo', null, 'name', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.personalInfo.email}
                    onChange={(e) => handleInputChange('personalInfo', null, 'email', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={formData.personalInfo.phone}
                    onChange={(e) => handleInputChange('personalInfo', null, 'phone', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    value={formData.personalInfo.location}
                    onChange={(e) => handleInputChange('personalInfo', null, 'location', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Objective */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Career Objective</h2>
                <textarea
                  placeholder="Write a brief career objective..."
                  value={formData.objective}
                  onChange={(e) => handleInputChange('objective', null, null, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24 resize-none"
                />
              </div>

              {/* Education */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <AcademicCapIcon className="w-5 h-5 text-blue-600" />
                    <h2 className="text-xl font-semibold">Education</h2>
                  </div>
                  <button
                    onClick={() => addArrayItem('education')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    + Add Education
                  </button>
                </div>
                {formData.education.map((edu, index) => (
                  <div key={index} className="grid grid-cols-2 gap-3 mb-3">
                    <input
                      type="text"
                      placeholder="Degree"
                      value={edu.degree}
                      onChange={(e) => handleInputChange('education', index, 'degree', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Institution"
                      value={edu.institution}
                      onChange={(e) => handleInputChange('education', index, 'institution', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Year"
                      value={edu.year}
                      onChange={(e) => handleInputChange('education', index, 'year', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Grade/CGPA"
                      value={edu.grade}
                      onChange={(e) => handleInputChange('education', index, 'grade', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                ))}
              </div>

              {/* Skills */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <StarIcon className="w-5 h-5 text-blue-600" />
                    <h2 className="text-xl font-semibold">Skills</h2>
                  </div>
                  <button
                    onClick={() => addArrayItem('skills')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    + Add Skill
                  </button>
                </div>
                {formData.skills.map((skill, index) => (
                  <input
                    key={index}
                    type="text"
                    placeholder="Enter a skill"
                    value={skill}
                    onChange={(e) => handleInputChange('skills', index, null, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-2"
                  />
                ))}
              </div>
            </div>

            {/* Live Preview */}
            <div className="bg-white rounded-xl shadow-md p-6 h-fit sticky top-8">
              <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
              <div className="bg-gray-50 rounded-lg p-4 text-sm">
                <div className="text-center border-b pb-2 mb-3">
                  <h4 className="text-lg font-bold">{formData.personalInfo.name || 'Your Name'}</h4>
                  <p className="text-gray-600">
                    {formData.personalInfo.email} • {formData.personalInfo.phone}
                  </p>
                  <p className="text-gray-600">{formData.personalInfo.location}</p>
                </div>
                
                {formData.objective && (
                  <div className="mb-3">
                    <h5 className="font-semibold text-blue-600 mb-1">OBJECTIVE</h5>
                    <p className="text-gray-700 text-xs">{formData.objective}</p>
                  </div>
                )}

                <div className="mb-3">
                  <h5 className="font-semibold text-blue-600 mb-1">EDUCATION</h5>
                  {formData.education.map((edu, index) => (
                    <div key={index} className="text-xs mb-1">
                      <div className="font-medium">{edu.degree} - {edu.institution}</div>
                      <div className="text-gray-600">{edu.year} • {edu.grade}</div>
                    </div>
                  ))}
                </div>

                <div>
                  <h5 className="font-semibold text-blue-600 mb-1">SKILLS</h5>
                  <p className="text-xs text-gray-700">
                    {formData.skills.filter(skill => skill.trim()).join(', ') || 'Add your skills...'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (step === 3) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setStep(2)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Your Resume</h1>
            </div>
            <button
              onClick={generatePDF}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              Download Resume
            </button>
          </div>

          {/* Resume Preview */}
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-3xl mx-auto">
            <div className="text-center border-b-2 border-gray-200 pb-6 mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{formData.personalInfo.name}</h2>
              <div className="flex justify-center items-center gap-4 text-gray-600">
                <span className="flex items-center gap-1">
                  <EnvelopeIcon className="w-4 h-4" />
                  {formData.personalInfo.email}
                </span>
                <span className="flex items-center gap-1">
                  <PhoneIcon className="w-4 h-4" />
                  {formData.personalInfo.phone}
                </span>
                <span className="flex items-center gap-1">
                  <MapPinIcon className="w-4 h-4" />
                  {formData.personalInfo.location}
                </span>
              </div>
            </div>

            {formData.objective && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-blue-600 mb-2">CAREER OBJECTIVE</h3>
                <p className="text-gray-700">{formData.objective}</p>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-bold text-blue-600 mb-3">EDUCATION</h3>
              {formData.education.map((edu, index) => (
                <div key={index} className="mb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                      <p className="text-gray-600">{edu.institution}</p>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <div>{edu.year}</div>
                      {edu.grade && <div>{edu.grade}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-bold text-blue-600 mb-2">SKILLS</h3>
              <div className="flex flex-wrap gap-2">
                {formData.skills.filter(skill => skill.trim()).map((skill, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}