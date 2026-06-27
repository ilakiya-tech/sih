import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppContext } from '../App.jsx'

// Supported languages with detailed configuration
const SUPPORTED_LANGUAGES = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    voiceCode: 'en-IN',
    direction: 'ltr',
    region: 'India'
  },
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    voiceCode: 'hi-IN',
    direction: 'ltr',
    region: 'India'
  },
  ta: {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    flag: '🇮🇳',
    voiceCode: 'ta-IN',
    direction: 'ltr',
    region: 'Tamil Nadu'
  },
  te: {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    flag: '🇮🇳',
    voiceCode: 'te-IN',
    direction: 'ltr',
    region: 'Andhra Pradesh'
  },
  bn: {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    flag: '🇮🇳',
    voiceCode: 'bn-IN',
    direction: 'ltr',
    region: 'West Bengal'
  },
  mr: {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    flag: '🇮🇳',
    voiceCode: 'mr-IN',
    direction: 'ltr',
    region: 'Maharashtra'
  },
  gu: {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    flag: '🇮🇳',
    voiceCode: 'gu-IN',
    direction: 'ltr',
    region: 'Gujarat'
  }
}

export default function LanguageToggle({ 
  variant = 'select', // 'select', 'button', 'dropdown'
  showFlag = true,
  showNativeName = true,
  size = 'default', // 'small', 'default', 'large'
  className = ''
}) {
  const { i18n, t } = useTranslation()
  const { userProfile, setUserProfile, isVoiceMode } = useAppContext()
  
  const [isOpen, setIsOpen] = useState(false)
  const [isChanging, setIsChanging] = useState(false)
  const [detectedLanguage, setDetectedLanguage] = useState(null)

  // Auto-detect user's preferred language on first visit
  useEffect(() => {
    const detectLanguage = () => {
      // Check browser language
      const browserLang = navigator.language || navigator.userLanguage
      const langCode = browserLang.split('-')[0]
      
      // Check if supported
      if (SUPPORTED_LANGUAGES[langCode]) {
        setDetectedLanguage(langCode)
        
        // Auto-switch if user hasn't set a preference
        if (!userProfile.preferredLanguage && langCode !== i18n.language) {
          handleLanguageChange(langCode, true)
        }
      }
    }

    detectLanguage()
  }, [])

  // Update user profile when language changes
  useEffect(() => {
    if (userProfile.preferredLanguage !== i18n.language) {
      setUserProfile(prev => ({
        ...prev,
        preferredLanguage: i18n.language
      }))
    }
  }, [i18n.language, setUserProfile])

  const handleLanguageChange = async (langCode, isAutoDetected = false) => {
    setIsChanging(true)
    
    try {
      // Change app language
      await i18n.changeLanguage(langCode)
      
      // Update user profile
      setUserProfile(prev => ({
        ...prev,
        preferredLanguage: langCode
      }))
      
      // Announce change for accessibility
      announceLanguageChange(langCode, isAutoDetected)
      
      // Update document language attribute
      document.documentElement.lang = langCode
      document.documentElement.dir = SUPPORTED_LANGUAGES[langCode]?.direction || 'ltr'
      
      // Close dropdown if open
      setIsOpen(false)
      
    } catch (error) {
      console.error('Language change failed:', error)
    } finally {
      setIsChanging(false)
    }
  }

  const announceLanguageChange = (langCode, isAutoDetected) => {
    const language = SUPPORTED_LANGUAGES[langCode]
    if (!language) return
    
    const announcement = isAutoDetected
      ? t('language.auto_detected', `Language automatically detected: ${language.name}`)
      : t('language.changed_to', `Language changed to ${language.name}`)
    
    // Announce to screen readers
    const announcementEl = document.getElementById('voice-announcements')
    if (announcementEl) {
      announcementEl.textContent = announcement
    }
    
    // Voice announcement if voice mode is active
    if (isVoiceMode && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(announcement)
      utterance.lang = language.voiceCode
      utterance.rate = 0.9
      window.speechSynthesis.speak(utterance)
    }
  }

  const getCurrentLanguage = () => {
    return SUPPORTED_LANGUAGES[i18n.language] || SUPPORTED_LANGUAGES.en
  }

  // Size classes
  const sizeClasses = {
    small: 'text-xs px-2 py-1',
    default: 'text-sm px-3 py-1',
    large: 'text-base px-4 py-2'
  }

  // Render as traditional select dropdown
  if (variant === 'select') {
    return (
      <label className={`inline-flex items-center gap-2 text-slate-700 ${className}`}>
        <span className="sr-only">{t('language.select', 'Select Language')}</span>
        {showFlag && (
          <span className="text-lg" aria-hidden="true">
            {getCurrentLanguage().flag}
          </span>
        )}
        <select
          aria-label={t('language.select', 'Select Language')}
          className={`
            rounded-md border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${sizeClasses[size]}
            ${isChanging ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
            transition-all duration-200
          `}
          value={i18n.language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          disabled={isChanging}
        >
          {Object.values(SUPPORTED_LANGUAGES).map((lang) => (
            <option key={lang.code} value={lang.code}>
              {showFlag ? `${lang.flag} ` : ''}
              {showNativeName ? lang.nativeName : lang.name}
              {lang.region && ` (${lang.region})`}
            </option>
          ))}
        </select>
        
        {detectedLanguage && detectedLanguage !== i18n.language && (
          <button
            onClick={() => handleLanguageChange(detectedLanguage)}
            className="text-xs text-blue-600 hover:text-blue-700 underline"
            title={t('language.switch_to_detected', `Switch to ${SUPPORTED_LANGUAGES[detectedLanguage]?.name}`)}
          >
            {t('language.detected', 'Detected')}
          </button>
        )}
      </label>
    )
  }

  // Render as button toggle
  if (variant === 'button') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white text-slate-700
            hover:bg-slate-50 focus:ring-2 focus:ring-blue-500 transition-all duration-200
            ${sizeClasses[size]}
            ${isChanging ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
          `}
          aria-label={t('language.current', `Current language: ${getCurrentLanguage().name}`)}
          aria-expanded={isOpen}
          disabled={isChanging}
        >
          {showFlag && (
            <span className="text-lg" aria-hidden="true">
              {getCurrentLanguage().flag}
            </span>
          )}
          
          {showNativeName && (
            <span className="font-medium">
              {getCurrentLanguage().nativeName}
            </span>
          )}
          
          {isChanging ? (
            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            
            {/* Menu */}
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-2 max-h-80 overflow-y-auto">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                {t('language.choose', 'Choose Language')}
              </div>
              
              {Object.values(SUPPORTED_LANGUAGES).map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`
                    w-full text-left px-3 py-3 hover:bg-gray-50 transition-colors duration-150
                    flex items-center justify-between group
                    ${lang.code === i18n.language ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl" aria-hidden="true">
                      {lang.flag}
                    </span>
                    <div>
                      <div className="font-medium">
                        {lang.nativeName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {lang.name} • {lang.region}
                      </div>
                    </div>
                  </div>
                  
                  {lang.code === i18n.language && (
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  
                  {lang.code === detectedLanguage && lang.code !== i18n.language && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      {t('language.detected', 'Detected')}
                    </span>
                  )}
                </button>
              ))}
              
              {/* Quick Language Tips */}
              <div className="border-t border-gray-100 mt-2 pt-2 px-3">
                <p className="text-xs text-gray-500 leading-relaxed">
                  {t('language.tip', 'Voice commands and recommendations will use your selected language.')}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  // Default compact version
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span className="text-lg" aria-hidden="true">
        {getCurrentLanguage().flag}
      </span>
      <span className={`font-medium text-slate-700 ${sizeClasses[size]}`}>
        {getCurrentLanguage().code.toUpperCase()}
      </span>
      {isChanging && (
        <svg className="w-3 h-3 animate-spin text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )}
    </div>
  )
}