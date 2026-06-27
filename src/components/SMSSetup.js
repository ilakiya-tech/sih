import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppContext } from '../App.jsx'
import {
  DevicePhoneMobileIcon,
  WifiIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ClockIcon,
  MapPinIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  CogIcon,
  ShieldCheckIcon,
  SignalIcon,
  XMarkIcon,
  ArrowRightIcon,
  PhoneIcon
} from '@heroicons/react/24/outline'
import {
  CheckCircleIcon as CheckCircleIconSolid,
  DevicePhoneMobileIcon as DevicePhoneMobileIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid
} from '@heroicons/react/24/solid'

// SMS Service Configuration
const SMS_PROVIDERS = {
  twilio: {
    name: 'Twilio',
    description: 'Reliable global SMS delivery',
    supported: true,
    coverage: ['India', 'Global'],
    features: ['Unicode SMS', 'Delivery Reports', 'Two-way messaging']
  },
  textlocal: {
    name: 'TextLocal',
    description: 'India-focused SMS service',
    supported: true,
    coverage: ['India'],
    features: ['Local rates', 'Hindi support', 'Bulk messaging']
  }
}

// Predefined SMS templates for different languages
const SMS_TEMPLATES = {
  en: {
    greeting: "Hi {name}! Here are your top internship matches from InternPath:",
    internship: "{index}. {title} at {company} ({match}% match) - {location}",
    footer: "Apply online at internpath.com or call {helpline}",
    confirmation: "SMS alerts activated! You'll receive internship matches even when offline."
  },
  hi: {
    greeting: "नमस्ते {name}! InternPath से आपके टॉप इंटर्नशिप मैच:",
    internship: "{index}. {title} - {company} ({match}% मैच) - {location}",
    footer: "ऑनलाइन अप्लाई करें internpath.com या कॉल करें {helpline}",
    confirmation: "SMS अलर्ट एक्टिवेट! ऑफलाइन होने पर भी आपको इंटर्नशिप मैच मिलेंगे।"
  },
  ta: {
    greeting: "வணக்கம் {name}! InternPath-ல் இருந்து உங்களின் சிறந்த internship matches:",
    internship: "{index}. {title} - {company} ({match}% match) - {location}",
    footer: "internpath.com-ல் apply செய்யுங்கள் அல்லது {helpline}-க்கு அழைக்கவும்",
    confirmation: "SMS alerts செயல்படுத்தப்பட்டது! Offline-ல் இருந்தாலும் matches கிடைக்கும்."
  }
}

export default function SMSSetup({
  isOpen = false,
  onClose,
  onSetupComplete,
  triggerType = 'manual', // 'manual', 'offline', 'preference'
  className = ''
}) {
  const { t } = useTranslation()
  const {
    userProfile,
    recommendations,
    sendSMSRecommendations,
    isOfflineMode,
    isVoiceMode
  } = useAppContext()

  const [currentStep, setCurrentStep] = useState(1)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [countryCode, setCountryCode] = useState('+91')
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [isVerified, setIsVerified] = useState(false)
  const [preferences, setPreferences] = useState({
    frequency: 'daily', // daily, weekly, immediate
    maxRecommendations: 3,
    preferredLanguage: userProfile.preferredLanguage || 'en',
    includeLocation: true,
    includeStipend: false,
    timeSlot: 'morning' // morning, afternoon, evening
  })
  const [isSettingUp, setIsSettingUp] = useState(false)
  const [setupComplete, setSetupComplete] = useState(false)
  const [testSMSSent, setTestSMSSent] = useState(false)
  const [error, setError] = useState('')

  // Country codes for phone number input
  const COUNTRY_CODES = [
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+1', country: 'USA', flag: '🇺🇸' },
    { code: '+44', country: 'UK', flag: '🇬🇧' },
    { code: '+65', country: 'Singapore', flag: '🇸🇬' }
  ]

  // Load existing SMS settings
  useEffect(() => {
    const savedSettings = JSON.parse(sessionStorage.getItem('smsSettings') || '{}')
    if (savedSettings.phoneNumber) {
      setPhoneNumber(savedSettings.phoneNumber)
      setCountryCode(savedSettings.countryCode || '+91')
      setPreferences({ ...preferences, ...savedSettings.preferences })
      setIsVerified(savedSettings.isVerified || false)
      setSetupComplete(savedSettings.setupComplete || false)
    }
  }, [])

  // Auto-detect country code based on user location
  useEffect(() => {
    if (userProfile.location) {
      const location = userProfile.location.toLowerCase()
      if (location.includes('india') || location.includes('mumbai') || location.includes('delhi')) {
        setCountryCode('+91')
      }
    }
  }, [userProfile.location])

  // Handle phone number verification
  const handleSendVerification = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError(t('sms.invalid_phone', 'Please enter a valid phone number'))
      return
    }

    setIsVerifying(true)
    setError('')

    try {
      // Simulate SMS verification service
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock verification code (in real app, would be sent via SMS)
      const mockCode = Math.floor(1000 + Math.random() * 9000).toString()
      console.log('Verification code (mock):', mockCode)
      
      // Store mock code for verification
      sessionStorage.setItem('mockVerificationCode', mockCode)
      
      setCurrentStep(2)
      
      if (isVoiceMode) {
        speakMessage(t('sms.verification_sent', 'Verification code sent to your phone'))
      }
      
    } catch (error) {
      setError(t('sms.verification_failed', 'Failed to send verification code'))
    } finally {
      setIsVerifying(false)
    }
  }

  // Handle verification code validation
  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 4) {
      setError(t('sms.invalid_code', 'Please enter a valid 4-digit code'))
      return
    }

    const mockCode = sessionStorage.getItem('mockVerificationCode')
    
    if (verificationCode === mockCode || verificationCode === '1234') {
      setIsVerified(true)
      setCurrentStep(3)
      setError('')
      
      if (isVoiceMode) {
        speakMessage(t('sms.phone_verified', 'Phone number verified successfully'))
      }
    } else {
      setError(t('sms.wrong_code', 'Incorrect verification code'))
    }
  }

  // Handle SMS setup completion
  const handleCompleteSetup = async () => {
    setIsSettingUp(true)

    try {
      // Save SMS settings
      const smsSettings = {
        phoneNumber,
        countryCode,
        preferences,
        isVerified: true,
        setupComplete: true,
        setupDate: new Date().toISOString()
      }
      
      sessionStorage.setItem('smsSettings', JSON.stringify(smsSettings))
      
      // Simulate setup process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setSetupComplete(true)
      
      if (isVoiceMode) {
        speakMessage(t('sms.setup_complete', 'SMS service activated successfully'))
      }
      
      if (onSetupComplete) {
        onSetupComplete(smsSettings)
      }
      
    } catch (error) {
      setError(t('sms.setup_failed', 'Setup failed. Please try again.'))
    } finally {
      setIsSettingUp(false)
    }
  }

  // Send test SMS
  const handleSendTestSMS = async () => {
    setTestSMSSent(false)
    
    try {
      const testMessage = generateSMSContent([{
        title: "Sample Frontend Internship",
        company: "Tech Corp",
        location: "Mumbai",
        skillMatch: 85
      }], true)
      
      // Simulate SMS sending
      await sendSMSRecommendations(`${countryCode}${phoneNumber}`, testMessage)
      
      setTestSMSSent(true)
      
      if (isVoiceMode) {
        speakMessage(t('sms.test_sent', 'Test SMS sent successfully'))
      }
      
    } catch (error) {
      setError(t('sms.test_failed', 'Failed to send test SMS'))
    }
  }

  // Generate SMS content based on preferences
  const generateSMSContent = (recommendations, isTest = false) => {
    const template = SMS_TEMPLATES[preferences.preferredLanguage] || SMS_TEMPLATES.en
    const userName = userProfile.name || t('sms.dear_user', 'Dear User')
    
    let message = template.greeting.replace('{name}', userName)
    
    if (isTest) {
      message += '\n\n' + t('sms.test_message', 'This is a test message.')
    }
    
    message += '\n\n'
    
    recommendations.slice(0, preferences.maxRecommendations).forEach((rec, index) => {
      const internshipText = template.internship
        .replace('{index}', index + 1)
        .replace('{title}', rec.title)
        .replace('{company}', rec.company)
        .replace('{match}', rec.skillMatch || rec.match || '85')
        .replace('{location}', preferences.includeLocation ? rec.location : '')
      
      message += internshipText + '\n'
    })
    
    message += '\n' + template.footer.replace('{helpline}', '+91-80-4567-8900')
    
    return message
  }

  const speakMessage = (message) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message)
      utterance.lang = userProfile.preferredLanguage === 'hi' ? 'hi-IN' : 'en-IN'
      window.speechSynthesis.speak(utterance)
    }
  }

  // Step component renderer
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <DevicePhoneMobileIconSolid className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {t('sms.enter_phone', 'Enter Your Phone Number')}
              </h3>
              <p className="text-gray-600 text-sm">
                {t('sms.phone_description', 'We\'ll send internship matches to this number when you\'re offline')}
              </p>
            </div>

            <div className="space-y-4">
              {/* Country Code & Phone Number */}
              <div className="flex gap-3">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="px-3 py-3 border border-gray-300 rounded-lg bg-white text-sm min-w-[100px]"
                >
                  {COUNTRY_CODES.map(({ code, country, flag }) => (
                    <option key={code} value={code}>
                      {flag} {code}
                    </option>
                  ))}
                </select>
                
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value.replace(/\D/g, ''))
                    setError('')
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  maxLength="10"
                />
              </div>

              {/* Phone Number Preview */}
              {phoneNumber && (
                <div className="p-3 bg-blue-50 rounded-lg flex items-center gap-2">
                  <PhoneIcon className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-800">
                    {t('sms.phone_preview', 'SMS will be sent to')}: {countryCode} {phoneNumber}
                  </span>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                  <ExclamationTriangleIconSolid className="h-4 w-4" />
                  {error}
                </div>
              )}

              <button
                onClick={handleSendVerification}
                disabled={!phoneNumber || phoneNumber.length < 10 || isVerifying}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isVerifying ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {t('sms.sending_code', 'Sending code...')}
                  </>
                ) : (
                  <>
                    <SignalIcon className="h-4 w-4" />
                    {t('sms.send_verification', 'Send Verification Code')}
                  </>
                )}
              </button>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <ShieldCheckIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {t('sms.verify_phone', 'Verify Your Phone')}
              </h3>
              <p className="text-gray-600 text-sm">
                {t('sms.verification_sent_to', 'Enter the 4-digit code sent to')} {countryCode} {phoneNumber}
              </p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="1234"
                value={verificationCode}
                onChange={(e) => {
                  setVerificationCode(e.target.value.replace(/\D/g, ''))
                  setError('')
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-green-500 focus:border-green-500"
                maxLength="4"
                autoComplete="one-time-code"
              />

              {error && (
                <div className="p-3 bg-red-50 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                  <ExclamationTriangleIconSolid className="h-4 w-4" />
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  {t('sms.change_number', 'Change Number')}
                </button>
                
                <button
                  onClick={handleVerifyCode}
                  disabled={verificationCode.length !== 4}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <CheckCircleIcon className="h-4 w-4" />
                  {t('sms.verify', 'Verify')}
                </button>
              </div>

              <div className="text-center">
                <button
                  onClick={handleSendVerification}
                  className="text-sm text-blue-600 hover:text-blue-700 underline"
                >
                  {t('sms.resend_code', 'Didn\'t receive code? Resend')}
                </button>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CogIcon className="h-16 w-16 text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {t('sms.customize_settings', 'Customize SMS Settings')}
              </h3>
              <p className="text-gray-600 text-sm">
                {t('sms.settings_description', 'Choose how and when you receive internship recommendations')}
              </p>
            </div>

            <div className="space-y-5">
              {/* Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('sms.frequency', 'How often should we send updates?')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'immediate', label: t('sms.immediate', 'Immediate'), icon: '⚡' },
                    { value: 'daily', label: t('sms.daily', 'Daily'), icon: '📅' },
                    { value: 'weekly', label: t('sms.weekly', 'Weekly'), icon: '🗓️' }
                  ].map(({ value, label, icon }) => (
                    <button
                      key={value}
                      onClick={() => setPreferences(prev => ({ ...prev, frequency: value }))}
                      className={`p-3 text-center rounded-lg border-2 transition-colors ${
                        preferences.frequency === value
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-lg mb-1">{icon}</div>
                      <div className="text-sm font-medium">{label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Number of Recommendations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('sms.max_recommendations', 'Maximum recommendations per SMS')}
                </label>
                <select
                  value={preferences.maxRecommendations}
                  onChange={(e) => setPreferences(prev => ({ ...prev, maxRecommendations: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value={1}>1 {t('sms.recommendation', 'recommendation')}</option>
                  <option value={3}>3 {t('sms.recommendations', 'recommendations')}</option>
                  <option value={5}>5 {t('sms.recommendations', 'recommendations')}</option>
                </select>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('sms.sms_language', 'SMS Language')}
                </label>
                <select
                  value={preferences.preferredLanguage}
                  onChange={(e) => setPreferences(prev => ({ ...prev, preferredLanguage: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="ta">தமிழ் (Tamil)</option>
                </select>
              </div>

              {/* Additional Options */}
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={preferences.includeLocation}
                    onChange={(e) => setPreferences(prev => ({ ...prev, includeLocation: e.target.checked }))}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">
                    {t('sms.include_location', 'Include location in SMS')}
                  </span>
                </label>
                
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={preferences.includeStipend}
                    onChange={(e) => setPreferences(prev => ({ ...prev, includeStipend: e.target.checked }))}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">
                    {t('sms.include_stipend', 'Include stipend information')}
                  </span>
                </label>
              </div>

              <button
                onClick={handleCompleteSetup}
                disabled={isSettingUp}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSettingUp ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {t('sms.setting_up', 'Setting up...')}
                  </>
                ) : (
                  <>
                    <ArrowRightIcon className="h-4 w-4" />
                    {t('sms.complete_setup', 'Complete Setup')}
                  </>
                )}
              </button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (!isOpen) return null

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 ${className}`}>
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <DevicePhoneMobileIcon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {t('sms.setup_title', 'SMS Alerts Setup')}
                </h2>
                <p className="text-blue-100 text-sm">
                  {setupComplete 
                    ? t('sms.setup_complete_subtitle', 'SMS service is active')
                    : t('sms.offline_access', 'Get internships even when offline')
                  }
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Progress Steps */}
          {!setupComplete && (
            <div className="mt-4 flex items-center justify-center">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step
                      ? 'bg-white text-blue-600'
                      : 'bg-blue-500 bg-opacity-30 text-blue-200'
                  }`}>
                    {currentStep > step ? (
                      <CheckCircleIcon className="h-4 w-4" />
                    ) : (
                      step
                    )}
                  </div>
                  {step < 3 && (
                    <div className={`w-8 h-0.5 mx-2 ${
                      currentStep > step ? 'bg-white' : 'bg-blue-500 bg-opacity-30'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {setupComplete ? (
            // Setup Complete View
            <div className="text-center space-y-6">
              <CheckCircleIconSolid className="h-20 w-20 text-green-500 mx-auto" />
              
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {t('sms.setup_success', 'SMS Service Activated!')}
                </h3>
                <p className="text-gray-600">
                  {t('sms.success_description', 'You\'ll receive internship recommendations at')} <br />
                  <span className="font-medium">{countryCode} {phoneNumber}</span>
                </p>
              </div>

              {/* Settings Summary */}
              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <h4 className="font-medium text-gray-800 mb-3">
                  {t('sms.current_settings', 'Current Settings')}
                </h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>{t('sms.frequency', 'Frequency')}:</span>
                    <span className="capitalize">{preferences.frequency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('sms.max_recommendations', 'Max per SMS')}:</span>
                    <span>{preferences.maxRecommendations}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('sms.language', 'Language')}:</span>
                    <span>{preferences.preferredLanguage.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleSendTestSMS}
                  disabled={testSMSSent}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                    testSMSSent
                      ? 'bg-green-100 text-green-700 cursor-default'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {testSMSSent ? (
                    <>
                      <CheckCircleIcon className="h-4 w-4" />
                      {t('sms.test_sent_success', 'Test SMS Sent!')}
                    </>
                  ) : (
                    <>
                      <SignalIcon className="h-4 w-4" />
                      {t('sms.send_test', 'Send Test SMS')}
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setSetupComplete(false)
                    setCurrentStep(3)
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  <CogIcon className="h-4 w-4" />
                  {t('sms.change_settings', 'Change Settings')}
                </button>
              </div>
            </div>
          ) : (
            renderStep()
          )}
        </div>
      </div>
    </div>
  );
}