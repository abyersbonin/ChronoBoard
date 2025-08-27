// Enhanced Translation Service with comprehensive phrase-based translation
export class EnhancedTranslationService {
  private cache = new Map<string, string>();

  // Comprehensive phrase-based translation dictionary
  private phraseDict: Record<string, string> = {
    // Complete questions and common phrases
    "Qu'est-ce que le Shinrin Yoku?": "What is Shinrin Yoku?",
    "Qu est-ce que le Shinrin Yoku?": "What is Shinrin Yoku?",
    "Qu'est-ce que le": "What is the",
    "Qu est-ce que le": "What is the", 
    "Qu'est-ce que": "What is",
    "Qu est-ce que": "What is",
    "Comment faire": "How to do",
    "Pourquoi est-ce important": "Why is it important",
    "En compagnie d'Anne-Marie Laforest": "With Anne-Marie Laforest",
    "En compagnie d Anne-Marie Laforest": "With Anne-Marie Laforest",
    "En compagnie de": "With",
    "En compagnie d": "With",
    
    // Spa and wellness complete phrases
    "Aqua-forme & thermothérapie": "Aqua fitness & thermotherapy",
    "Aqua-forme & thermothérapie (bilingual)": "Aqua fitness & thermotherapy (bilingual)",
    "Yoga vibratoire en eau chaude": "Vibrational yoga in hot water",
    "Essentrics- Réveil du corps": "Essentrics - Body awakening",
    "Essentrics- Réveil du corps (bilingual)": "Essentrics - Body awakening (bilingual)",
    "Essentrics (Bilingual)": "Essentrics (Bilingual)",
    "Essentrics (bilingual)": "Essentrics (bilingual)",
    "Anxiété et auto-régulation": "Anxiety and self-regulation",
    "Conférence: Si peu pour tant... L'importance des oligo-éléments & des minéraux pour la santé": "Conference: So little for so much... The importance of trace elements & minerals for health",
    "Conférence: Si peu pour tant": "Conference: So little for so much",
    "L'importance des oligo-éléments & des minéraux pour la santé": "The importance of trace elements & minerals for health",
    "L'importance des oligo-éléments": "The importance of trace elements",
    "Les pouvoirs extraordinaires du froid (bilingual)": "The extraordinary powers of cold (bilingual)",
    "Les pouvoirs extraordinaires du froid": "The extraordinary powers of cold",
    "Le pouvoir créateur de nos pensées": "The creative power of our thoughts",
    "Renforcez votre corps et boostez votre système immunitaire avec le mouvement, le chaud et le froid (Bilingual)": "Strengthen your body and boost your immune system with movement, heat and cold (Bilingual)",
    "Renforcez votre corps et boostez": "Strengthen your body and boost",
    "avec le mouvement": "with movement",
    "le chaud et le froid": "heat and cold",
    "Relâchement des tensions profondes avec balles (bilingual)": "Deep tension release with balls (bilingual)",
    "Relâchement des tensions profondes avec balles": "Deep tension release with balls",
    "Relâchement des tensions profondes": "Deep tension release",
    "avec balles": "with balls",
    "Nos 6 piliers mieux-être - Visite guidée": "Our 6 wellness pillars - Guided tour",
    "Nos 6 piliers mieux-être": "Our 6 wellness pillars",
    "Visite guidée": "Guided tour",
    "Les 5 Tibétains pour augmenter votre énergie vitale": "The 5 Tibetans to increase your vital energy",
    "Les 5 Tibétains pour augmenter": "The 5 Tibetans to increase",
    "votre énergie vitale": "your vital energy",
    "L'influence positive des lettres hébraïques sur notre quotidien": "The positive influence of Hebrew letters on our daily life",
    "L'influence positive des lettres": "The positive influence of letters",
    "L'influence de la numérologie sur notre bien-être": "The influence of numerology on our well-being",
    "L'influence de la numérologie": "The influence of numerology",
    "Chimie du Bonheur": "Chemistry of Happiness",
    "Conférence: Connaître et comprendre comment mon corps, mon esprit, sont des alliés pour la vie": "Conference: Know and understand how my body, my mind, are allies for life",
    "Connaître et comprendre": "Know and understand",
    "comment mon corps": "how my body",
    "mon esprit": "my mind",
    "sont des alliés pour la vie": "are allies for life",
    "Étirements dans l'eau (Bilingual)": "Water stretching (Bilingual)",
    "Étirements dans l'eau": "Water stretching",
    "Qi qong en eau chaude (bilingual)": "Qi Qong in hot water (bilingual)",
    "Qi qong en eau chaude": "Qi Qong in hot water",
    "Marche nordique": "Nordic walking",
    "Hatha Yoga (bilingual)": "Hatha Yoga (bilingual)",
    "Hatha Yoga": "Hatha Yoga",
    "Yoga matinal (Bilingual)": "Morning yoga (Bilingual)",
    "Yoga matinal": "Morning yoga",
    "Aqua forme (bilingual)": "Aqua fitness (bilingual)",
    "Aqua forme": "Aqua fitness",
    "Aper'Art": "Art Aperitif",
    
    // Event types and activities
    "Conférence": "Conference",
    "Atelier": "Workshop", 
    "Séance": "Session",
    "Cours": "Class",
    "Formation": "Training",
    "Activité": "Activity",
    "Thérapie": "Therapy",
    "Massage": "Massage",
    "Méditation": "Meditation",
    "Relaxation": "Relaxation",
    "Détente": "Relaxation",
    "Bien-être": "Wellness",
    "Santé": "Health",
    "Corps": "Body",
    "Esprit": "Mind",
    "Âme": "Soul",
    
    // Time and schedule phrases
    "Ce matin": "This morning",
    "Cet après-midi": "This afternoon", 
    "Ce soir": "This evening",
    "Aujourd'hui": "Today",
    "Demain": "Tomorrow",
    "Cette semaine": "This week",
    "La semaine prochaine": "Next week",
    "En cours": "Ongoing",
    "À venir": "Upcoming",
    "Bientôt": "Soon",
    
    // Location phrases
    "Salle lac Stukely": "Lake Stukely Room",
    "Salle": "Room",
    "Pavillon": "Pavilion",
    "Piscine": "Pool",
    "Spa": "Spa",
    "Centre": "Center",
    "Studio": "Studio",
    "Terrasse": "Terrace",
    "Jardin": "Garden",
    "Lac": "Lake",
    "Forêt": "Forest",
    "Nature": "Nature",
    
    // Bilingual indicators
    "(bilingual)": "(bilingual)",
    "(Bilingual)": "(Bilingual)",
    "(français/anglais)": "(French/English)",
    
    // Common spa terms
    "thermothérapie": "thermotherapy",
    "hydrothérapie": "hydrotherapy",
    "aromathérapie": "aromatherapy",
    "balnéothérapie": "balneotherapy",
    "thalassothérapie": "thalassotherapy",
    "chromothérapie": "chromotherapy",
    "luminothérapie": "light therapy",
    "musicothérapie": "music therapy",
    "art-thérapie": "art therapy",
    
    // Health and wellness terms
    "système immunitaire": "immune system",
    "énergie vitale": "vital energy",
    "équilibre": "balance",
    "harmonie": "harmony",
    "sérénité": "serenity",
    "plénitude": "fullness",
    "ressourcement": "renewal",
    "régénération": "regeneration",
    "revitalisation": "revitalization",
    "purification": "purification",
    "détoxification": "detoxification",
    
    // Common UI phrases
    "Description": "Description",
    "Détails": "Details",
    "Plus d'informations": "More information",
    "Voir plus": "See more",
    "Fermer": "Close",
    "Ouvrir": "Open"
  };

  // Enhanced word-by-word fallback for missed phrases
  private wordDict: Record<string, string> = {
    "le": "the", "la": "the", "les": "the", "du": "of the", "de": "of", "des": "of the",
    "et": "and", "ou": "or", "avec": "with", "pour": "for", "dans": "in", "sur": "on",
    "un": "a", "une": "a", "ce": "this", "cette": "this", "ces": "these",
    "son": "his", "sa": "her", "ses": "his/her", "notre": "our", "nos": "our",
    "votre": "your", "vos": "your", "leur": "their", "leurs": "their",
    "qui": "who", "que": "that", "quoi": "what", "où": "where", "quand": "when",
    "comment": "how", "pourquoi": "why", "combien": "how much",
    "très": "very", "plus": "more", "moins": "less", "aussi": "also", "même": "same",
    "grand": "big", "petit": "small", "bon": "good", "mauvais": "bad",
    "nouveau": "new", "ancien": "old", "jeune": "young", "vieux": "old",
    "beau": "beautiful", "joli": "pretty", "important": "important",
    "être": "to be", "avoir": "to have", "faire": "to do", "aller": "to go",
    "venir": "to come", "voir": "to see", "savoir": "to know", "pouvoir": "can",
    "vouloir": "to want", "dire": "to say", "prendre": "to take", "donner": "to give"
  };

  async translateText(text: string, fromLang: string = 'fr', toLang: string = 'en'): Promise<string> {
    if (!text || text.trim() === '' || toLang === 'fr') return text;
    
    // Check cache first
    const cacheKey = `${fromLang}-${toLang}-${text}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Clean HTML tags for translation
    const cleanText = text.replace(/<[^>]*>/g, '').trim();
    if (!cleanText) return text;

    let translated = this.translateWithPhraseDict(cleanText);
    
    // Cache the result
    this.cache.set(cacheKey, translated);
    
    return translated;
  }

  private translateWithPhraseDict(text: string): string {
    // First try exact phrase match (case insensitive)
    for (const [french, english] of Object.entries(this.phraseDict)) {
      if (text.toLowerCase() === french.toLowerCase()) {
        return english;
      }
    }
    
    // Try partial phrase matching for longer texts - sort by length (longest first)
    let result = text;
    const sortedPhrases = Object.entries(this.phraseDict).sort(([a], [b]) => b.length - a.length);
    
    for (const [french, english] of sortedPhrases) {
      if (french.length > 2 && result.toLowerCase().includes(french.toLowerCase())) {
        const regex = new RegExp(french.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        result = result.replace(regex, english);
      }
    }
    
    // If no phrase matches found, try word-by-word translation as fallback
    if (result === text) {
      result = this.translateWordByWord(text);
    }
    
    return result;
  }

  private translateWordByWord(text: string): string {
    // Split into words while preserving punctuation and spacing
    const words = text.split(/(\s+|[.,!?;:()'"«»\-])/);
    
    return words.map(word => {
      if (!word.trim() || /^[.,!?;:()'"«»\-\s]+$/.test(word)) {
        return word; // Return punctuation and spacing as-is
      }
      
      const cleanWord = word.toLowerCase().replace(/[.,!?;:()'"«»\-]/g, '');
      const translation = this.wordDict[cleanWord];
      
      if (translation) {
        // Preserve original capitalization
        if (word[0] === word[0].toUpperCase()) {
          return translation.charAt(0).toUpperCase() + translation.slice(1);
        }
        return translation;
      }
      
      return word; // Return original word if no translation found
    }).join('');
  }

  async translateBatch(texts: string[], fromLang: string = 'fr', toLang: string = 'en'): Promise<string[]> {
    return Promise.all(texts.map(text => this.translateText(text, fromLang, toLang)));
  }

  clearCache() {
    this.cache.clear();
  }
  
  // Force clear cache for testing
  forceClearCache() {
    this.cache.clear();
    console.log('Translation cache cleared');
  }
}

export const enhancedTranslationService = new EnhancedTranslationService();