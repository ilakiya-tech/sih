import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppContext } from '../App.jsx'

export default function VoiceButton({ 
  label, 
  onClick, 
  onTranscript,
  mode = 'toggle', // 'toggle', 'push-to-talk', or 'continuous'
  className = '',
  size = 'default' // 'small', 'default', 'large'
}) {
  const { t } = useTranslation()
  const { 
    isVoiceMode, 
    setIsVoiceMode, 
    userProfile,
    isOfflineMode 
  } = useAppContext()

  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [confidence, setConfidence] = useState(0)
  const [error, setError] = useState(null)
  const [volume, setVolume] = useState(0)
  
  const recognitionRef = useRef(null)
  const synthRef = useRef(null)
  const volumeRef = useRef(0)
  const animationRef = useRef(null)

  // Initialize speech recognition and synthesis
  useEffect(() => {
    // Check for speech recognition support
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true)
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      
      // Configure recognition
      recognition.continuous = mode === 'continuous'
      recognition.interimResults = true
      recognition.maxAlternatives = 3
      
      // Set language based on user preference
      const language = userProfile.preferredLanguage === 'hi' ? 'hi-IN' : 'en-IN'
      recognition.lang = language
      
      // Recognition event handlers
      recognition.onstart = () => {
        setIsListening(true)
        setError(null)
        setTranscript('')
        startVolumeAnimation()
        announceToScreen(t('voice.listening', 'Listening...'))
      }
      
      recognition.onresult = (event) => {
        let finalTranscript = ''
        let interimTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          if (result.isFinal) {
            finalTranscript += result[0].transcript
            setConfidence(result[0].confidence)
          } else {
            interimTranscript += result[0].transcript
          }
        }
        
        const fullTranscript = finalTranscript || interimTranscript
        setTranscript(fullTranscript)
        
        // Call parent callback with transcript
        if (onTranscript && fullTranscript) {
          onTranscript(fullTranscript, result?.isFinal || false)
        }
        
        // Auto-stop for single commands
        if (finalTranscript && mode !== 'continuous') {
          setTimeout(() => stopListening(), 500)
        }
      }
      
      recognition.onerror = (event) => {
        setError(event.error)
        setIsListening(false)
        stopVolumeAnimation()
        
        let errorMessage = t('voice.error.generic', 'Voice recognition error')
        switch (event.error) {
          case 'no-speech':
            errorMessage = t('voice.error.no_speech', 'No speech detected. Please try again.')
            break
          case 'audio-capture':
            errorMessage = t('voice.error.no_microphone', 'No microphone found. Please check your settings.')
            break
          case 'not-allowed':
            errorMessage = t('voice.error.permission_denied', 'Microphone access denied. Please allow microphone access.')
            break
          case 'network':
            errorMessage = t('voice.error.network', 'Network error. Please check your connection.')
            break
        }
        announceToScreen(errorMessage)
      }
      
      recognition.onend = () => {
        setIsListening(false)
        stopVolumeAnimation()
        
        // Auto-restart for continuous mode
        if (isVoiceMode && mode === 'continuous') {
          setTimeout(() => {
            if (isVoiceMode) {
              recognition.start()
            }
          }, 100)
        }
      }
      
      recognitionRef.current = recognition
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
      stopVolumeAnimation()
    }
  }, [userProfile.preferredLanguage, isVoiceMode, mode, onTranscript])

  // Volume animation for visual feedback
  const startVolumeAnimation = () => {
    const animate = () => {
      // Simulate volume levels (in real app, use Web Audio API)
      volumeRef.current = Math.random() * 100
      setVolume(volumeRef.current)
      animationRef.current = requestAnimationFrame(animate)
    }
    animate()
  }

  const stopVolumeAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    setVolume(0)
  }

  // Announce to screen readers
  const announceToScreen = (message) => {
    const announcement = document.getElementById('voice-announcements')
    if (announcement) {
      announcement.textContent = message
    }
  }

  // Speech synthesis for text-to-speech
  const speak = (text, options = {}) => {
    if (synthRef.current && !isOfflineMode) {
      // Cancel any ongoing speech
      synthRef.current.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = userProfile.preferredLanguage === 'hi' ? 'hi-IN' : 'en-IN'
      utterance.rate = options.rate || 0.9
      utterance.pitch = options.pitch || 1
      utterance.volume = options.volume || 1
      
      utterance.onstart = () => announceToScreen(t('voice.speaking', 'Speaking...'))
      utterance.onend = () => announceToScreen(t('voice.finished_speaking', 'Finished speaking'))
      utterance.onerror = () => announceToScreen(t('voice.speak_error', 'Error speaking text'))
      
      synthRef.current.speak(utterance)
    }
  }

  // Start listening
  const startListening = () => {
    if (!isSupported) {
      setError(t('voice.not_supported', 'Voice recognition not supported in this browser'))
      return
    }

    if (!recognitionRef.current) return

    try {
      recognitionRef.current.start()
    } catch (error) {
      if (error.name === 'InvalidStateError') {
        // Already running, stop and restart
        recognitionRef.current.stop()
        setTimeout(() => recognitionRef.current.start(), 100)
      }
    }
  }

  // Stop listening
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }

  // Toggle voice mode
  const toggleVoiceMode = () => {
    const newVoiceMode = !isVoiceMode
    setIsVoiceMode(newVoiceMode)
    
    if (newVoiceMode) {
      startListening()
      speak(t('voice.activated', 'Voice mode activated. You can now speak to me.'))
    } else {
      stopListening()
      speak(t('voice.deactivated', 'Voice mode deactivated.'))
    }
  }

  // Handle button click
  const handleClick = () => {
    if (onClick) {
      onClick()
      return
    }

    if (mode === 'toggle') {
      toggleVoiceMode()
    } else if (mode === 'push-to-talk') {
      if (isListening) {
        stopListening()
      } else {
        startListening()
      }
    }
  }

  // Button size classes
  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    default: 'px-3 py-1 text-sm',
    large: 'px-4 py-2 text-base'
  }

  const iconSizes = {
    small: 'h-3 w-3',
    default: 'h-4 w-4', 
    large: 'h-5 w-5'
  }

  // Error display
  if (error && error !== 'no-speech') {
    return (
      <div className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 bg-red-50 rounded-full">
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{t('voice.error', 'Voice Error')}</span>
      </div>
    )
  }

  // Offline indicator
  if (isOfflineMode && mode !== 'push-to-talk') {
    return (
      <div className="flex items-center gap-1 px-2 py-1 text-xs text-orange-600 bg-orange-50 rounded-full">
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-12.728 12.728m0 0L5.636 18.364m12.728-12.728L18.364 5.636" />
        </svg>
        <span>{t('voice.offline', 'Voice Offline')}</span>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        type="button"
        className={`
          inline-flex items-center gap-1 rounded-full border transition-all duration-200
          ${sizeClasses[size]}
          ${isListening
            ? 'border-red-300 bg-red-50 text-red-700 shadow-lg animate-pulse'
            : isVoiceMode 
              ? 'border-green-300 bg-green-50 text-green-700'
              : 'border-slate-200 text-slate-700 hover:bg-slate-50'
          }
          ${!isSupported ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
          focus-visible:ring-2 focus-visible:ring-blue-500
          ${className}
        `}
        aria-label={label || (isListening 
          ? t('voice.stop_listening', 'Stop listening') 
          : t('voice.start_listening', 'Start voice input')
        )}
        onClick={handleClick}
        disabled={!isSupported}
        title={
          !isSupported 
            ? t('voice.not_supported', 'Voice recognition not supported')
            : isListening
              ? t('voice.listening_tooltip', 'Listening... Click to stop')
              : t('voice.click_to_talk', 'Click to start voice input')
        }
      >
        {/* Microphone Icon with Animation */}
        <div className="relative">
          <svg 
            className={`${iconSizes[size]} transition-transform ${
              isListening ? 'scale-110' : ''
            }`}
            fill={isListening ? 'currentColor' : 'none'} 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={isListening ? 0 : 2} 
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" 
            />
          </svg>
          
          {/* Volume indicator */}
          {isListening && (
            <div className="absolute -top-1 -right-1">
              <div className={`w-2 h-2 bg-red-500 rounded-full animate-ping`}></div>
            </div>
          )}
        </div>

        {/* Status Text */}
        {size !== 'small' && (
          <span className="sr-only sm:not-sr-only">
            {isListening 
              ? t('voice.listening', 'Listening') 
              : isVoiceMode 
                ? t('voice.active', 'Active')
                : t('voice.inactive', 'Voice')
            }
          </span>
        )}
      </button>

      {/* Volume Visualization */}
      {isListening && volume > 0 && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="flex items-end justify-center space-x-0.5 h-6">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-1 bg-red-400 rounded-sm transition-all duration-100 ${
                  volume > (i * 20) ? `h-${Math.min(6, Math.floor(volume / 20) + 1)}` : 'h-1'
                }`}
                style={{
                  height: volume > (i * 20) ? `${Math.min(24, (volume / 20) * 4 + 4)}px` : '4px'
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Transcript Preview */}
      {transcript && size === 'large' && (
        <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-white border rounded-lg shadow-lg text-xs text-gray-600 z-10">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-green-600">●</span>
            <span>{t('voice.transcript', 'Transcript')}</span>
            {confidence > 0 && (
              <span className="text-gray-400">
                ({Math.round(confidence * 100)}% {t('voice.confident', 'confident')})
              </span>
            )}
          </div>
          <p className="italic">{transcript}</p>
        </div>
      )}
    </div>
  )
}

// Export speak function for use in other components
VoiceButton.speak = (text, options = {}) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = options.lang || 'en-IN'
    utterance.rate = options.rate || 0.9
    utterance.pitch = options.pitch || 1
    utterance.volume = options.volume || 1
    window.speechSynthesis.speak(utterance)
  }
}