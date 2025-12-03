/**
 * Conversation AI - Intelligent response generation
 * Makes VoiceBot more natural and ChatGPT-like
 */

class ConversationAI {
  constructor() {
    this.conversationHistory = []
    this.userProfile = {}
    this.responseVariations = new Map()
    this.context = {}
  }

  // Generate natural, varied responses
  generateNaturalResponse(intent, context = {}) {
    const variations = this.getResponseVariations(intent, context)
    return this.selectBestVariation(variations, context)
  }

  // Get multiple response variations for an intent
  getResponseVariations(intent, context) {
    const { language = 'en', userMood, previousAnswers = [], currentPhase } = context
    
    const responses = {
      greeting: {
        en: [
          "Hello! I'm Dr. AI, your friendly eye care assistant. How are you feeling today?",
          "Hi there! I'm here to help guide you through your vision test. How can I assist you?",
          "Welcome! I'm Quick Optics AI, and I'll be with you every step of the way. How are you doing?",
          "Good to see you! I'm your virtual eye care assistant. Ready to get started?",
          "Hello! I'm excited to help you today. How are you feeling about the test?"
        ],
        sw: [
          "Hujambo! Mimi ni Daktari AI, msaidizi wako wa afya ya macho. Unajisikiaje leo?",
          "Habari! Nipo hapa kukusaidia kupitia mtihani wako wa macho. Ninaweza kukusaidia vipi?",
          "Karibu! Mimi ni Quick Optics AI, na nitakuwa nawe kila hatua. Unajisikiaje?",
          "Vizuri kukuona! Mimi ni msaidizi wako wa afya ya macho. Uko tayari kuanza?",
          "Hujambo! Ninafurahi kukusaidia leo. Unajisikiaje kuhusu mtihani?"
        ]
      },
      
      encouragement: {
        en: [
          "You're doing great! Keep it up.",
          "Excellent work! You're handling this perfectly.",
          "I'm really impressed with how well you're doing. Keep going!",
          "You're doing wonderfully. Just a bit more and we'll be done.",
          "Fantastic! You're making this look easy.",
          "I can see you're really focused. That's exactly what we need!",
          "Wonderful! You're following instructions perfectly."
        ],
        sw: [
          "Unafanya vizuri sana! Endelea hivyo.",
          "Kazi nzuri! Unashughulikia hii kikamilifu.",
          "Nashangazwa na jinsi unavyofanya vizuri. Endelea!",
          "Unafanya kwa ajabu. Kidogo tu na tutamaliza.",
          "Ajabu! Unafanya hii iwe rahisi.",
          "Naona umelenga sana. Hiyo ndiyo tunayohitaji!",
          "Ajabu! Unafuata maelekezo kikamilifu."
        ]
      },
      
      clarification: {
        en: [
          "I want to make sure I understand you correctly. Could you say that again?",
          "I heard you, but I want to be certain I got it right. Mind repeating that?",
          "Let me make sure I caught that. Could you rephrase it for me?",
          "I think I might have missed something. Could you say it one more time?",
          "Just to be clear, could you explain that a bit differently?",
          "I want to get this right. Could you help me understand better?"
        ],
        sw: [
          "Nataka kuhakikisha ninaelewa vizuri. Unaweza kusema tena?",
          "Nimesikia, lakini nataka kuwa na uhakika nimeipata sawa. Unaweza kurudia?",
          "Acha nihakikishe nimeipata. Unaweza kuisema kwa njia nyingine?",
          "Ninafikiri nimekosa kitu. Unaweza kuisema mara moja zaidi?",
          "Ili kuwa wazi, unaweza kueleza hiyo kwa njia tofauti?",
          "Nataka kuipata sawa. Unaweza kunisaidia kuelewa zaidi?"
        ]
      },
      
      progressUpdate: {
        en: [
          "Great progress! We're making excellent headway.",
          "You're doing really well. We're moving along nicely.",
          "I can see we're making good progress. Keep it up!",
          "Excellent! We're right on track.",
          "Wonderful! Everything is going smoothly.",
          "Perfect! You're following along beautifully.",
          "I'm really pleased with how this is going. Great job!"
        ],
        sw: [
          "Maendeleo mazuri! Tunafanya vizuri sana.",
          "Unafanya vizuri sana. Tunaendelea vizuri.",
          "Naona tunafanya maendeleo mazuri. Endelea!",
          "Ajabu! Tuko kwenye njia sahihi.",
          "Ajabu! Kila kitu kinaendelea vizuri.",
          "Kamili! Unafuata vizuri sana.",
          "Ninafurahi sana na jinsi hii inavyoendelea. Kazi nzuri!"
        ]
      },
      
      phaseTransition: {
        en: [
          "Perfect! We're moving to the next phase now.",
          "Excellent work! Let's move forward to the next step.",
          "Great job! Now we're transitioning to the next level.",
          "Wonderful! Time to move on to the next phase.",
          "You're doing fantastic! Let's proceed to the next stage.",
          "Perfect timing! We're ready for the next step."
        ],
        sw: [
          "Kamili! Sasa tunaendelea kwa hatua ijayo.",
          "Kazi nzuri! Tuendelee kwa hatua ijayo.",
          "Kazi kubwa! Sasa tunaendelea kwa kiwango kijacho.",
          "Ajabu! Ni wakati wa kuendelea kwa hatua ijayo.",
          "Unafanya kwa ajabu! Tuendelee kwa hatua ijayo.",
          "Wakati kamili! Tuko tayari kwa hatua ijayo."
        ]
      },
      
      empathetic: {
        en: [
          "I completely understand how you're feeling. That's totally normal, and I want you to know you're doing great.",
          "I hear you, and I want you to know that's perfectly okay. Many people feel the same way.",
          "I can sense you might be a bit nervous, and that's completely understandable. But I want you to know this is really simple and safe.",
          "It's okay to feel that way. Many people do, and I'm here to help make this as comfortable as possible for you.",
          "I appreciate you sharing that with me. Let's work through this together - I'll be with you every step.",
          "Your feelings are valid, and I'm here to support you every step of the way. We'll take this at your pace.",
          "I totally get it. Eye tests can feel a bit overwhelming, but I promise this is going to be much easier than you think.",
          "That's a completely normal feeling. I'm here to make sure you're comfortable and informed throughout the whole process."
        ],
        sw: [
          "Naelewa kabisa jinsi unavyojisikia. Hiyo ni ya kawaida kabisa, na nataka ujue unafanya vizuri sana.",
          "Nakusikia, na nataka ujue hiyo ni sawa kabisa. Watu wengi hujisikia hivyo.",
          "Naweza kuhisi unaweza kuwa na wasiwasi kidogo, na hiyo ni ya kueleweka kabisa. Lakini nataka ujue hii ni rahisi na salama.",
          "Ni sawa kujisikia hivyo. Watu wengi hufanya hivyo, na nipo hapa kufanya hii iwe rahisi iwezekanavyo kwako.",
          "Nashukuru kwa kushiriki hiyo nami. Tufanye kazi pamoja - nitakuwa nawe kila hatua.",
          "Hisi zako ni halali, na nipo hapa kukusaidia kila hatua. Tutachukua hii kwa kasi yako.",
          "Naelewa kabisa. Mtihani wa macho unaweza kuonekana kuwa wa kutatanisha, lakini naahidi hii itakuwa rahisi zaidi kuliko unavyofikiri.",
          "Hiyo ni hisia ya kawaida kabisa. Nipo hapa kuhakikisha uko raha na una taarifa wakati wote wa mchakato."
        ]
      },
      
      encouragement: {
        en: [
          "You're doing great! Keep it up - you're handling this perfectly.",
          "Excellent work! I'm really impressed with how well you're doing.",
          "I'm really impressed with how well you're doing. Keep going - you've got this!",
          "You're doing wonderfully. Just a bit more and we'll be done - you're almost there!",
          "Fantastic! You're making this look easy. Keep up the great work!",
          "I can see you're really focused. That's exactly what we need - you're doing perfectly!",
          "Wonderful! You're following instructions beautifully. This is going great!",
          "You're doing an amazing job! I can tell you're really paying attention, and that makes all the difference."
        ],
        sw: [
          "Unafanya vizuri sana! Endelea hivyo - unashughulikia hii kikamilifu.",
          "Kazi nzuri! Nashangazwa na jinsi unavyofanya vizuri.",
          "Nashangazwa sana na jinsi unavyofanya vizuri. Endelea - unaweza!",
          "Unafanya kwa ajabu. Kidogo tu na tutamaliza - uko karibu!",
          "Ajabu! Unafanya hii iwe rahisi. Endelea kazi nzuri!",
          "Naona umelenga sana. Hiyo ndiyo tunayohitaji - unafanya kikamilifu!",
          "Ajabu! Unafuata maelekezo vizuri sana. Hii inaendelea vizuri!",
          "Unafanya kazi ya ajabu! Naona unazingatia sana, na hiyo inafanya tofauti kubwa."
        ]
      }
    }
    
    return responses[intent]?.[language] || responses[intent]?.en || ["I understand."]
  }

  // Select best variation based on context and avoid repetition
  selectBestVariation(variations, context) {
    if (!variations || variations.length === 0) return "I understand."
    
    // Get recent responses to avoid repetition
    const recentResponses = this.conversationHistory
      .slice(-5)
      .map(msg => msg.response)
      .filter(Boolean)
    
    // Filter out recently used variations
    const availableVariations = variations.filter(v => 
      !recentResponses.some(recent => recent.includes(v.substring(0, 20)))
    )
    
    // Use available variations or fall back to all variations
    const pool = availableVariations.length > 0 ? availableVariations : variations
    
    // Select randomly but intelligently
    return pool[Math.floor(Math.random() * pool.length)]
  }

  // Add conversation context
  addToHistory(speaker, message, metadata = {}) {
    this.conversationHistory.push({
      speaker,
      message,
      timestamp: Date.now(),
      metadata,
      response: null
    })
    
    // Keep only last 20 messages for context
    if (this.conversationHistory.length > 20) {
      this.conversationHistory.shift()
    }
  }

  // Get conversation context for intelligent responses
  getContext() {
    const recent = this.conversationHistory.slice(-5)
    return {
      recentMessages: recent,
      userMood: this.detectUserMood(),
      topics: this.extractTopics(),
      preferences: this.userProfile
    }
  }

  // Detect user mood from conversation
  detectUserMood() {
    const recent = this.conversationHistory.slice(-5)
    const text = recent.map(m => m.message).join(' ').toLowerCase()
    
    if (text.match(/\b(nervous|worried|scared|anxious|fear|hofu|wasiwasi|ogopa)\b/)) {
      return 'nervous'
    }
    if (text.match(/\b(happy|excited|great|good|furaha|furahi|nzuri)\b/)) {
      return 'positive'
    }
    if (text.match(/\b(confused|don't understand|don't know|sielewi|taabu)\b/)) {
      return 'confused'
    }
    if (text.match(/\b(thank|thanks|asante|shukrani)\b/)) {
      return 'grateful'
    }
    
    return 'neutral'
  }

  // Extract topics from conversation
  extractTopics() {
    const topics = new Set()
    const recent = this.conversationHistory.slice(-10)
    
    recent.forEach(msg => {
      const text = msg.message.toLowerCase()
      if (text.includes('eye') || text.includes('jicho')) topics.add('eyes')
      if (text.includes('glasses') || text.includes('miwani')) topics.add('glasses')
      if (text.includes('pain') || text.includes('maumivu')) topics.add('symptoms')
      if (text.includes('test') || text.includes('mtihani')) topics.add('test')
    })
    
    return Array.from(topics)
  }

  // Generate intelligent follow-up based on context
  generateFollowUp(previousAnswer, questionKey, context) {
    const { language = 'en', userMood } = context
    
    // Analyze answer for follow-up opportunities
    const answer = previousAnswer.toLowerCase()
    const hasBlurry = answer.includes('blurry') || answer.includes('fifia') || answer.includes('unclear')
    const hasPain = answer.includes('pain') || answer.includes('maumivu') || answer.includes('hurt') || answer.includes('sore')
    const hasDry = answer.includes('dry') || answer.includes('kavu') || answer.includes('itchy')
    const hasHeadache = answer.includes('headache') || answer.includes('kichwa')
    const hasStrain = answer.includes('strain') || answer.includes('tired') || answer.includes('uchovu')
    
    if (questionKey === 'symptoms') {
      if (hasBlurry) {
        const followUps = language === 'sw' ? [
          "Unaweza kuniambia zaidi kuhusu hiyo? Kwa mfano, lini huanza au ni kiasi gani?",
          "Ninafahamu. Je, hii hufanyika kila wakati au mara kwa mara tu?",
          "Nashukuru kwa kushiriki hiyo. Je, unaona hii wakati unasoma au wakati unatazama umbali?"
        ] : [
          "I understand. Could you tell me more about that? For example, when does it start or how often does it happen?",
          "I see. Does this happen all the time or just occasionally?",
          "Thank you for sharing that. Do you notice this when reading or when looking at things far away?"
        ]
        return this.selectBestVariation(followUps, context)
      }
      if (hasPain || hasDry || hasHeadache || hasStrain) {
        const followUps = language === 'sw' ? [
          "Naelewa. Je, hii inaathiri shughuli zako za kila siku?",
          "Nashukuru kwa kushiriki hiyo. Je, umewahi kuona daktari kuhusu hili?",
          "Ninafahamu. Tutachunguza hii kwa kina zaidi wakati wa uchunguzi."
        ] : [
          "I understand. Does this affect your daily activities?",
          "Thank you for sharing that. Have you seen a doctor about this?",
          "I see. We'll investigate this more thoroughly during the examination."
        ]
        return this.selectBestVariation(followUps, context)
      }
    }
    
    if (questionKey === 'correctiveLenses' && (answer.includes('yes') || answer.includes('ndiyo'))) {
      const followUps = language === 'sw' ? [
        "Vizuri. Je, unavaa miwani yako kila wakati au mara kwa mara tu?",
        "Asante. Je, unavaa miwani yako wakati wote au tu wakati unahitaji?",
        "Naelewa. Je, miwani yako yako tayari au unahitaji kuzibadilisha?"
      ] : [
        "Good. Do you wear your glasses all the time or just occasionally?",
        "Thank you. Do you wear your glasses constantly or only when you need them?",
        "I understand. Are your glasses current or do you need to update your prescription?"
      ]
      return this.selectBestVariation(followUps, context)
    }
    
    if (questionKey === 'history' && (answer.includes('yes') || answer.includes('ndiyo') || answer.length > 15)) {
      const followUps = language === 'sw' ? [
        "Nashukuru kwa kushiriki hiyo. Je, hii ni hali ya muda au ya kudumu?",
        "Naelewa. Je, unachukua dawa yoyote kwa hili?",
        "Ninafahamu. Tutazingatia hiyo wakati wa tathmini yetu."
      ] : [
        "Thank you for sharing that. Is this a temporary or ongoing condition?",
        "I understand. Are you taking any medication for this?",
        "I see. We'll take that into account during our assessment."
      ]
      return this.selectBestVariation(followUps, context)
    }
    
    return null
  }

  // Generate natural confirmation based on answer with context awareness
  generateConfirmation(answer, questionKey, context) {
    const { language = 'en', userMood, previousAnswers = [] } = context
    const understanding = this.understandAnswer(answer)
    
    // More empathetic responses if user seems nervous
    const isNervous = userMood === 'nervous'
    
    if (understanding.isYes) {
      const confirmations = language === 'sw' ? [
        "Sawa, nimeelewa. Asante kwa kushiriki hiyo.",
        "Vizuri, nimeipata. Hiyo ni taarifa muhimu.",
        "Asante, nimekumbuka hiyo. Nashukuru kwa uaminifu wako.",
        "Nashukuru kwa taarifa hiyo. Inanisaidia sana.",
        "Nimeiandika hiyo. Asante kwa kushiriki.",
        isNervous ? "Naelewa kabisa. Nashukuru kwa kushiriki hiyo nami - inanisaidia kukupa tathmini bora." : "Naelewa. Hiyo ni taarifa muhimu."
      ] : [
        "Got it, thanks for sharing that.",
        "Perfect, I understand. That's helpful information.",
        "Thank you, I've noted that. I appreciate your honesty.",
        "I've got that. Thanks for the information.",
        "I've written that down. Thank you for sharing.",
        isNervous ? "I completely understand. Thank you for sharing that with me - it helps me give you a better assessment." : "Understood. That's important information."
      ]
      return this.selectBestVariation(confirmations, context)
    }
    
    if (understanding.isNo) {
      const confirmations = language === 'sw' ? [
        "Sawa, nimeelewa. Hiyo ni taarifa nzuri.",
        "Vizuri, hiyo ni taarifa muhimu. Nashukuru.",
        "Asante kwa kuambia hiyo. Nimekumbuka.",
        "Naelewa. Hiyo ni habari nzuri kusikia.",
        isNervous ? "Sawa, nimeelewa. Hiyo ni habari nzuri - hakuna haja ya wasiwasi." : "Nimekumbuka hiyo. Asante."
      ] : [
        "Understood, thank you. That's good to know.",
        "That's helpful information. Thanks for letting me know.",
        "I've got that. Thank you.",
        "I understand. That's good information to have.",
        isNervous ? "Got it. That's good to hear - nothing to worry about." : "I've noted that. Thank you."
      ]
      return this.selectBestVariation(confirmations, context)
    }
    
    // For detailed answers
    if (understanding.hasDetails) {
      const confirmations = language === 'sw' ? [
        "Asante sana kwa taarifa hiyo ya kina. Nimeiandika yote.",
        "Nashukuru kwa maelezo yako ya kina. Hii inanisaidia sana.",
        "Nimekumbuka kila kitu ulichosema. Asante kwa kushiriki hiyo.",
        "Naelewa vizuri. Taarifa hiyo ya kina ni muhimu sana."
      ] : [
        "Thank you so much for that detailed information. I've noted everything down.",
        "I appreciate your thorough explanation. This is really helpful.",
        "I've got all of that. Thank you for sharing so much detail.",
        "I understand completely. That detailed information is very valuable."
      ]
      return this.selectBestVariation(confirmations, context)
    }
    
    // Generic confirmation
    const confirmations = language === 'sw' ? [
      "Asante kwa taarifa hiyo. Nimeiandika.",
      "Naelewa. Nashukuru.",
      "Nimekumbuka hiyo. Asante.",
      "Sawa, nimeipata. Asante."
    ] : [
      "Thank you for that information. I've noted it.",
      "I understand. Thank you.",
      "I've got that. Thanks.",
      "Got it. Thank you."
    ]
    return this.selectBestVariation(confirmations, context)
  }

  // Enhanced answer understanding
  understandAnswer(answer) {
    const lower = answer.toLowerCase().trim()
    
    const yesPatterns = [
      'yes', 'yeah', 'yep', 'yup', 'sure', 'correct', 'right', 'okay', 'ok',
      'definitely', 'absolutely', 'of course', 'certainly',
      'i do', 'i am', 'i have', 'i wear', 'i use',
      'ndiyo', 'ndio', 'sawa', 'haya', 'kweli', 'hakika',
      'nina', 'navaa', 'natumia'
    ]
    
    const noPatterns = [
      'no', 'nope', 'nah', 'not', "don't", "doesn't", "didn't",
      'never', 'none', 'nothing',
      'hapana', 'la', 'siyo', 'sina', 'sivai', 'situmii'
    ]
    
    return {
      isYes: yesPatterns.some(p => lower.includes(p)),
      isNo: noPatterns.some(p => lower.includes(p)),
      hasDetails: lower.length > 10 || lower.split(/\s+/).length > 3,
      rawAnswer: answer
    }
  }
}

export default new ConversationAI()

