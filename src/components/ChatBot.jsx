import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppContext } from '../App.jsx'

const ChatBot = ({ isOpen, onClose }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const {
    userProfile,
    recommendations,
    skillGaps,
    isVoiceMode,
    setIsVoiceMode,
    generateRecommendations,
    generateResume,
    sendSMSRecommendations,
    isOfflineMode
  } = useAppContext()

  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [currentStep, setCurrentStep] = useState('welcome')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Speech Recognition Setup
  const [recognition, setRecognition] = useState(null)
  const [speechSynthesis, setSpeechSynthesis] = useState(null)

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognitionInstance = new SpeechRecognition()
      recognitionInstance.continuous = false
      recognitionInstance.interimResults = false
      recognitionInstance.lang = userProfile.preferredLanguage === 'hi' ? 'hi-IN' : 'en-IN'
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setInputMessage(transcript)
        setIsListening(false)
      }
      
      recognitionInstance.onerror = () => {
        setIsListening(false)
      }
      
      setRecognition(recognitionInstance)
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis)
    }

    // Welcome message when chatbot opens
    if (isOpen && messages.length === 0) {
      addBotMessage(getWelcomeMessage())
    }
  }, [isOpen, userProfile.preferredLanguage])

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const getHelpGuidelinesText = () => (
    "Welcome to InternPath Assistant!\n\n" +
    "I am your personal chatbot, here to guide you through internship search, profile setup, resume generation, and more.\n\n" +
    "How to use: Type your question or command in the chat box below. You can ask for help at any time by typing \"help\".\n\n" +
    "Example commands:\n" +
    "👤 Profile: How do I complete my profile?\n" +
    "🎯 Internships: Show me internship recommendations\n" +
    "📄 Resume: Generate my resume\n" +
    "🔊 Voice: Enable voice mode\n" +
    "📱 SMS: Setup SMS alerts\n" +
    "🧭 Navigation: Go to profile page\n" +
    "❓ General Help: What can you do?\n\n" +
    "Tip: You can also use the microphone button to speak your commands!"
  );

  // Replace getWelcomeMessage to use the above text
  const getWelcomeMessage = () => {
    return getHelpGuidelinesText();
  }

  const addBotMessage = (message, options = {}) => {
    setIsTyping(true)
    setTimeout(() => {
      const botMessage = {
        id: Date.now(),
        text: message,
        sender: 'bot',
        timestamp: new Date(),
        ...options
      }
      setMessages(prev => [...prev, botMessage])
      setIsTyping(false)
      
      // Text-to-speech for bot messages if voice mode is on
      if (isVoiceMode && speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(message)
        utterance.lang = userProfile.preferredLanguage === 'hi' ? 'hi-IN' : 'en-IN'
        utterance.rate = 0.9
        speechSynthesis.speak(utterance)
      }
    }, 500 + Math.random() * 1000) // Realistic typing delay
  }

  const addUserMessage = (message) => {
    const userMessage = {
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
  }

  // Add a function to generate guidelines/help commands
  const getHelpGuidelines = () => {
    return (
      <div style={{ fontSize: '1rem', color: '#374151' }}>
        <strong style={{ fontSize: '1.1rem', color: '#06b6d4' }}>👋 Welcome to InternPath Assistant!</strong>
        <p style={{ margin: '10px 0 0 0' }}>
          I am your smart chatbot, designed to help you find internships, improve your profile, generate resumes, and much more.
        </p>
        <p style={{ margin: '10px 0 0 0' }}>
          <b>How to use me:</b>
        </p>
        <ol style={{ margin: '8px 0 0 18px', padding: 0 }}>
          <li>Type your question or command in the chat box below.</li>
          <li>Use the microphone button to speak your query (if voice mode is enabled).</li>
          <li>Click on suggested actions for quick navigation.</li>
          <li>Type <span style={{ color: '#06b6d4' }}>"help"</span> anytime to see these instructions again.</li>
        </ol>
        <p style={{ margin: '12px 0 0 0' }}>
          <b>What can I do for you?</b>
        </p>
        <ul style={{ margin: '8px 0 0 16px', padding: 0 }}>
          <li>👤 <b>Profile:</b> <span style={{ color: '#6366f1' }}>"How do I complete my profile?"</span></li>
          <li>🎯 <b>Internships:</b> <span style={{ color: '#6366f1' }}>"Show me internship recommendations"</span></li>
          <li>📄 <b>Resume:</b> <span style={{ color: '#6366f1' }}>"Generate my resume"</span></li>
          <li>🔊 <b>Voice:</b> <span style={{ color: '#6366f1' }}>"Enable voice mode"</span></li>
          <li>📱 <b>SMS:</b> <span style={{ color: '#6366f1' }}>"Setup SMS alerts"</span></li>
          <li>🧭 <b>Navigation:</b> <span style={{ color: '#6366f1' }}>"Go to profile page"</span></li>
          <li>❓ <b>General Help:</b> <span style={{ color: '#6366f1' }}>"What can you do?"</span></li>
        </ul>
        <p style={{ margin: '14px 0 0 0', fontStyle: 'italic', color: '#06b6d4' }}>
          Tip: You can ask me anything related to internships, your profile, or application process. I'm here to make your journey easier!
        </p>
        <p style={{ margin: '8px 0 0 0', fontSize: '0.95rem', color: '#6366f1' }}>
          Need more help? Just type <b>help</b> or click on any suggested button.
        </p>
      </div>
    );
  };

  const processUserMessage = async (message) => {
    addUserMessage(message)
    setInputMessage('')
    
    const lowerMessage = message.toLowerCase()
    
    // Intent recognition
    if (lowerMessage.includes('profile') || lowerMessage.includes('complete profile') || lowerMessage.includes('fill profile')) {
      handleProfileHelp()
    } else if (lowerMessage.includes('recommendation') || lowerMessage.includes('internship') || lowerMessage.includes('match')) {
      handleRecommendationHelp()
    } else if (lowerMessage.includes('skill') && lowerMessage.includes('gap')) {
      handleSkillGapHelp()
    } else if (lowerMessage.includes('resume') || lowerMessage.includes('cv')) {
      handleResumeHelp()
    } else if (lowerMessage.includes('sms') || lowerMessage.includes('offline')) {
      handleSMSHelp()
    } else if (lowerMessage.includes('voice') || lowerMessage.includes('speak')) {
      handleVoiceHelp()
    } else if (lowerMessage.includes('navigate') || lowerMessage.includes('go to') || lowerMessage.includes('page')) {
      handleNavigationHelp(lowerMessage)
    } else if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
      handleGeneralHelp()
    } else if (lowerMessage.includes('apply') || lowerMessage.includes('application')) {
      handleApplicationHelp()
    } else {
      // Show guidelines/help commands for unknown queries
      setIsTyping(true)
      setTimeout(() => {
        const botMessage = {
          id: Date.now(),
          text: '',
          sender: 'bot',
          timestamp: new Date(),
          customContent: getHelpGuidelines()
        }
        setMessages(prev => [...prev, botMessage])
        setIsTyping(false)
      }, 600)
    }
  }

  const handleProfileHelp = () => {
    if (!userProfile.name || userProfile.skills.length === 0) {
      addBotMessage(
        t('chatbot.profile_incomplete', 'I see your profile is incomplete. Let me help you fill it out!'),
        {
          actions: [
            { text: t('chatbot.go_to_profile', 'Go to Profile'), action: () => navigate('/profile') },
            { text: t('chatbot.profile_tips', 'Profile Tips'), action: () => showProfileTips() }
          ]
        }
      )
    } else {
      addBotMessage(
        t('chatbot.profile_complete', 'Your profile looks good! Would you like to update anything or get recommendations?'),
        {
          actions: [
            { text: t('chatbot.update_profile', 'Update Profile'), action: () => navigate('/profile') },
            { text: t('chatbot.get_recommendations', 'Get Recommendations'), action: () => navigate('/recommendations') }
          ]
        }
      )
    }
  }

  const handleRecommendationHelp = () => {
    if (recommendations.length === 0) {
      addBotMessage(
        t('chatbot.no_recommendations', 'You don\'t have recommendations yet. Let me help you generate some!'),
        {
          actions: [
            { text: t('chatbot.complete_profile_first', 'Complete Profile'), action: () => navigate('/profile') },
            { text: t('chatbot.generate_now', 'Generate Now'), action: async () => {
              await generateRecommendations(userProfile)
              navigate('/recommendations')
            }}
          ]
        }
      )
    } else {
      addBotMessage(
        t('chatbot.recommendations_available', `You have ${recommendations.length} recommendations! I can explain matches, skill gaps, or help with applications.`),
        {
          actions: [
            { text: t('chatbot.view_recommendations', 'View Recommendations'), action: () => navigate('/recommendations') },
            { text: t('chatbot.explain_matches', 'Explain My Matches'), action: () => explainRecommendations() }
          ]
        }
      )
    }
  }

  const handleSkillGapHelp = () => {
    const totalGaps = Object.values(skillGaps).flat().length
    if (totalGaps > 0) {
      addBotMessage(
        t('chatbot.skill_gaps_found', `I found ${totalGaps} skill gaps. I can recommend courses to help you improve!`),
        {
          actions: [
            { text: t('chatbot.show_courses', 'Show Courses'), action: () => showSkillCourses() },
            { text: t('chatbot.view_gaps', 'View in Recommendations'), action: () => navigate('/recommendations') }
          ]
        }
      )
    } else {
      addBotMessage(t('chatbot.no_skill_gaps', 'Great! You don\'t have any major skill gaps for your current recommendations.'))
    }
  }

  const handleResumeHelp = () => {
    addBotMessage(
      t('chatbot.resume_help', 'I can generate a professional resume for you automatically! This makes applying much easier.'),
      {
        actions: [
          { text: t('chatbot.generate_resume', 'Generate Resume'), action: async () => {
            try {
              await generateResume(userProfile)
              addBotMessage(t('chatbot.resume_generated', 'Resume generated successfully! Check your downloads.'))
            } catch (error) {
              addBotMessage(t('chatbot.resume_error', 'Sorry, there was an error generating your resume. Please try again.'))
            }
          }},
          { text: t('chatbot.resume_tips', 'Resume Tips'), action: () => showResumeTips() }
        ]
      }
    )
  }

  const handleSMSHelp = () => {
    if (isOfflineMode) {
      addBotMessage(
        t('chatbot.sms_offline', 'Since you\'re offline, I can send your top recommendations via SMS!'),
        {
          actions: [
            { text: t('chatbot.setup_sms', 'Setup SMS'), action: () => showSMSSetup() },
            { text: t('chatbot.sms_info', 'How SMS Works'), action: () => showSMSInfo() }
          ]
        }
      )
    } else {
      addBotMessage(t('chatbot.sms_online', 'SMS recommendations are available for offline access. Would you like to set it up for later?'))
    }
  }

  const handleVoiceHelp = () => {
    if (isVoiceMode) {
      addBotMessage(
        t('chatbot.voice_active', 'Voice mode is currently active! You can speak to me in your preferred language.'),
        {
          actions: [
            { text: t('chatbot.disable_voice', 'Disable Voice'), action: () => setIsVoiceMode(false) },
            { text: t('chatbot.voice_tips', 'Voice Tips'), action: () => showVoiceTips() }
          ]
        }
      )
    } else {
      addBotMessage(
        t('chatbot.voice_inactive', 'Voice mode is not active. I can help you enable it!'),
        {
          actions: [
            { text: t('chatbot.enable_voice', 'Enable Voice'), action: () => setIsVoiceMode(true) },
            { text: t('chatbot.voice_features', 'Voice Features'), action: () => showVoiceFeatures() }
          ]
        }
      )
    }
  }

  const handleNavigationHelp = (message) => {
    let destination = ''
    if (message.includes('profile')) destination = '/profile'
    else if (message.includes('recommendation')) destination = '/recommendations'
    else if (message.includes('feedback')) destination = '/feedback'
    else if (message.includes('home') || message.includes('start')) destination = '/'
    
    if (destination) {
      addBotMessage(
        t('chatbot.navigation_help', `Taking you to ${destination === '/' ? 'home' : destination.slice(1)}!`),
        {
          actions: [
            { text: t('chatbot.go_now', 'Go Now'), action: () => navigate(destination) }
          ]
        }
      )
    } else {
      showNavigationOptions()
    }
  }

  const handleApplicationHelp = () => {
    addBotMessage(
      t('chatbot.application_help', 'I can help you with applications! I can generate your resume and explain the process.'),
      {
        actions: [
          { text: t('chatbot.application_process', 'Application Process'), action: () => showApplicationProcess() },
          { text: t('chatbot.generate_resume', 'Generate Resume'), action: async () => {
            await generateResume(userProfile)
          }}
        ]
      }
    )
  }

  const handleGeneralHelp = () => {
    addBotMessage(
      t('chatbot.general_help', 'Here are the main things I can help you with:'),
      {
        actions: [
          { text: '👤 Profile Help', action: () => handleProfileHelp() },
          { text: '🎯 Find Internships', action: () => handleRecommendationHelp() },
          { text: '📄 Resume Generation', action: () => handleResumeHelp() },
          { text: '🔊 Voice Features', action: () => handleVoiceHelp() },
          { text: '📱 SMS Setup', action: () => handleSMSHelp() },
          { text: '🧭 Navigation', action: () => showNavigationOptions() }
        ]
      }
    )
  }

  const handleDefaultResponse = (message) => {
    const responses = [
      t('chatbot.default_1', 'I\'m here to help with your internship search! Try asking about profiles, recommendations, or navigation.'),
      t('chatbot.default_2', 'Not sure what you meant, but I can help with internships, resumes, and more!'),
      t('chatbot.default_3', 'Let me know what you need help with - profiles, recommendations, or voice features!')
    ]
    addBotMessage(responses[Math.floor(Math.random() * responses.length)])
  }

  // Helper functions for complex actions
  const showNavigationOptions = () => {
    addBotMessage(
      t('chatbot.navigation_options', 'Where would you like to go?'),
      {
        actions: [
          { text: '🏠 Home', action: () => navigate('/') },
          { text: '👤 Profile', action: () => navigate('/profile') },
          { text: '🎯 Recommendations', action: () => navigate('/recommendations') },
          { text: '💬 Feedback', action: () => navigate('/feedback') }
        ]
      }
    )
  }

  const explainRecommendations = () => {
    if (recommendations.length > 0) {
      const explanations = recommendations.map(rec => 
        `${rec.title}: ${rec.explanation || 'Good match based on your profile'}`
      ).join('\n\n')
      addBotMessage(`Here's why these internships match you:\n\n${explanations}`)
    }
  }

  const showSkillCourses = () => {
    const allMissingSkills = Object.values(skillGaps).flat()
    const courseRecommendations = allMissingSkills
      .filter(skill => SKILL_COURSES[skill])
      .map(skill => `• ${skill}: ${SKILL_COURSES[skill].title} (${SKILL_COURSES[skill].provider})`)
      .join('\n')
    
    if (courseRecommendations) {
      addBotMessage(`Here are courses to improve your skills:\n\n${courseRecommendations}`)
    } else {
      addBotMessage('No specific courses found, but you can check NPTEL and SWAYAM for relevant skills.')
    }
  }

  // Voice input handling
  const handleVoiceInput = () => {
    if (recognition && !isListening) {
      setIsListening(true)
      recognition.start()
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (inputMessage.trim()) {
      processUserMessage(inputMessage.trim())
    }
  }

  const handleActionClick = (action) => {
    action.action()
  }

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #6EE7B7 0%, #3B82F6 100%)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          height: '80vh',
          borderRadius: '28px',
          background: 'rgba(255,255,255,0.85)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          border: '1px solid rgba(255,255,255,0.18)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(90deg, #6366f1 0%, #06b6d4 100%)',
            color: '#fff',
            boxShadow: '0 4px 16px rgba(59,130,246,0.20)',
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid #06b6d4'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #06b6d4 0%, #6366f1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(59,130,246,0.15)',
              }}
            >
              {/* Robot SVG Icon */}
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="7" width="16" height="10" rx="5" fill="#fff" />
                <rect x="8" y="11" width="2" height="2" rx="1" fill="#6366f1" />
                <rect x="14" y="11" width="2" height="2" rx="1" fill="#06b6d4" />
                <rect x="10" y="15" width="4" height="1.5" rx="0.75" fill="#6366f1" />
                <rect x="11" y="3" width="2" height="4" rx="1" fill="#06b6d4" />
              </svg>
            </div>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '1.3rem', textShadow: '0 1px 4px #6366f1' }}>
                {t('chatbot.title', 'InternPath Assistant')}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#e0f2fe', textShadow: '0 1px 4px #06b6d4' }}>
                {isTyping ? t('chatbot.typing', 'Typing...') : t('chatbot.online', 'Online')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              color: '#fff',
              background: 'transparent',
              border: 'none',
              padding: '10px',
              borderRadius: '50%',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.background = '#6366f1'}
            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '28px',
            background: 'linear-gradient(135deg, #e0f2fe 0%, #f3f4f6 100%)',
            backdropFilter: 'blur(2px)',
          }}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                display: 'flex',
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  maxWidth: '80%',
                  padding: '16px',
                  borderRadius: '20px',
                  boxShadow: '0 4px 16px rgba(59,130,246,0.12)',
                  background: message.sender === 'user'
                    ? 'linear-gradient(90deg, #6366f1 0%, #06b6d4 100%)'
                    : 'linear-gradient(90deg, #f3f4f6 0%, #e0f2fe 100%)',
                  color: message.sender === 'user' ? '#fff' : '#374151',
                  fontSize: '1.05rem',
                  fontWeight: 500,
                }}
              >
                {/* Render customContent for guidelines/help, else normal text */}
                {message.customContent ? message.customContent : <p>{message.text}</p>}
                {message.actions && (
                  <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {message.actions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => handleActionClick(action)}
                        style={{
                          padding: '10px',
                          borderRadius: '12px',
                          fontSize: '0.95rem',
                          background: 'linear-gradient(90deg, #06b6d4 0%, #6366f1 100%)',
                          color: '#fff',
                          border: 'none',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(59,130,246,0.10)',
                          transition: 'background 0.2s',
                        }}
                        onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #6366f1 0%, #06b6d4 100%)'}
                        onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #06b6d4 0%, #6366f1 100%)'}
                      >
                        {action.text}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div
                style={{
                  padding: '16px',
                  borderRadius: '20px',
                  background: 'linear-gradient(90deg, #f3f4f6 0%, #e0f2fe 100%)',
                  boxShadow: '0 4px 16px rgba(59,130,246,0.10)',
                  display: 'flex',
                  gap: '6px',
                }}
              >
                <div style={{
                  width: '10px',
                  height: '10px',
                  background: '#6366f1',
                  borderRadius: '50%',
                  animation: 'bounce 1s infinite',
                }} />
                <div style={{
                  width: '10px',
                  height: '10px',
                  background: '#06b6d4',
                  borderRadius: '50%',
                  animation: 'bounce 1s infinite',
                  animationDelay: '0.1s',
                }} />
                <div style={{
                  width: '10px',
                  height: '10px',
                  background: '#6366f1',
                  borderRadius: '50%',
                  animation: 'bounce 1s infinite',
                  animationDelay: '0.2s',
                }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div
          style={{
            padding: '24px',
            background: 'rgba(243,244,246,0.95)',
            borderTop: '2px solid #06b6d4',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <form onSubmit={handleSubmit} style={{ display: 'flex', width: '100%', gap: '16px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={t('chatbot.input_placeholder', 'Ask me anything...')}
                style={{
                  width: '100%',
                  padding: '16px 52px 16px 16px',
                  border: '2px solid #06b6d4',
                  borderRadius: '16px',
                  background: 'rgba(255,255,255,0.95)',
                  boxShadow: '0 2px 8px rgba(59,130,246,0.10)',
                  fontSize: '1.05rem',
                  outline: 'none',
                }}
              />
              {recognition && (
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  style={{
                    position: 'absolute',
                    right: '42px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    padding: '8px',
                    borderRadius: '50%',
                    background: isListening ? '#ef4444' : 'rgba(59,130,246,0.08)',
                    color: isListening ? '#fff' : '#6366f1',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                >
                  {/* Microphone SVG */}
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19v2m0 0h-4m4 0h4m-4-2a7 7 0 01-7-7V9a7 7 0 0114 0v3a7 7 0 01-7 7z" />
                  </svg>
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              style={{
                padding: '14px',
                borderRadius: '16px',
                background: 'linear-gradient(90deg, #6366f1 0%, #06b6d4 100%)',
                color: '#fff',
                border: 'none',
                boxShadow: '0 2px 8px rgba(59,130,246,0.10)',
                cursor: inputMessage.trim() ? 'pointer' : 'not-allowed',
                transition: 'background 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Send SVG */}
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ChatBot