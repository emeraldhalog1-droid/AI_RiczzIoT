/**
 * RiczzIoT Hybrid Story AI Engine
 * Combines GGUF model inference with rule-based generation
 * Author: RiczzIoT
 * 
 * This module intelligently routes between GGUF model generation and
 * rule-based generation, providing the best of both worlds.
 */

const StoryAI = require('./StoryAI');
const GGUFModelLoader = require('./GGUFModelLoader');

class HybridStoryAI {
  constructor(config = {}) {
    this.owner = "RiczzIoT";
    this.version = "2.0.0";
    
    // Initialize both engines
    this.ruleBasedAI = new StoryAI();
    this.ggufLoader = new GGUFModelLoader(config.gguf || {});
    
    // Configuration
    this.preferredEngine = config.preferredEngine || 'auto'; // 'auto', 'gguf', 'rule-based'
    this.fallbackEnabled = config.fallbackEnabled !== false;
    
    // Prompt templates for GGUF models
    this.promptTemplates = this.initializePromptTemplates();
    
    // Status
    this.ggufAvailable = false;
    this.initializationAttempted = false;
  }

  /**
   * Initialize the hybrid AI system
   */
  async initialize() {
    console.log('🚀 Initializing Hybrid Story AI Engine...');
    console.log(`   Owner: ${this.owner}`);
    console.log(`   Version: ${this.version}`);
    
    this.initializationAttempted = true;
    
    // Try to initialize GGUF model
    const ggufResult = await this.ggufLoader.initialize();
    this.ggufAvailable = ggufResult.success;
    
    if (this.ggufAvailable) {
      console.log('✓ Hybrid AI initialized with GGUF model support');
    } else {
      console.log('⚠ GGUF model not available, using rule-based generation');
      console.log(`  Reason: ${ggufResult.error}`);
    }
    
    return {
      success: true,
      ggufAvailable: this.ggufAvailable,
      ruleBasedAvailable: true,
      message: this.ggufAvailable 
        ? 'Hybrid AI ready with GGUF and rule-based engines'
        : 'Running in rule-based mode only'
    };
  }

  /**
   * Initialize prompt templates for different story types
   */
  initializePromptTemplates() {
    return {
      english: {
        adventure: (params) => `You are a creative storyteller for e-learning. Write an engaging adventure story suitable for ${params.difficulty} level readers.

Topic: ${params.topic || 'A thrilling adventure'}
Requirements:
- Write in clear, ${params.difficulty} level English
- Include a beginning, challenge, journey, climax, and resolution
- Make it educational and age-appropriate
- Length: approximately 150-200 words
- Include a positive message or lesson

Write the story now:`,

        educational: (params) => `You are an educational content creator. Write a clear and engaging educational story for ${params.difficulty} level learners.

Topic: ${params.topic || 'An interesting subject'}
Requirements:
- Explain the topic in a story format
- Use ${params.difficulty} level vocabulary
- Include examples and practical applications
- Make it interesting and memorable
- Length: approximately 150-200 words

Write the educational story now:`,

        moral: (params) => `You are a storyteller who teaches life lessons. Write a moral story for ${params.difficulty} level readers.

Theme: ${params.topic || 'An important life lesson'}
Requirements:
- Tell a story with characters facing a moral dilemma
- Use ${params.difficulty} level language
- Include a clear moral lesson at the end
- Make it relatable and meaningful
- Length: approximately 150-200 words

Write the moral story now:`
      },
      
      tagalog: {
        adventure: (params) => `Ikaw ay isang malikhaing manunulat ng kuwento para sa pag-aaral. Sumulat ng isang kawili-wiling kuwentong pakikipagsapalaran na angkop para sa ${params.difficulty} level na mga mambabasa.

Paksa: ${params.topic || 'Isang nakakaakit na pakikipagsapalaran'}
Mga Kinakailangan:
- Sumulat sa malinaw na Tagalog, ${params.difficulty} level
- Isama ang simula, hamon, paglalakbay, kasukdulan, at resolusyon
- Gawing pang-edukasyon at angkop sa edad
- Haba: humigit-kumulang 150-200 salita
- Isama ang positibong mensahe o aral

Sumulat ng kuwento ngayon:`,

        educational: (params) => `Ikaw ay isang lumikha ng pang-edukasyong nilalaman. Sumulat ng malinaw at kawili-wiling pang-edukasyong kuwento para sa ${params.difficulty} level na mga mag-aaral.

Paksa: ${params.topic || 'Isang kawili-wiling paksa'}
Mga Kinakailangan:
- Ipaliwanag ang paksa sa pamamagitan ng kuwento
- Gumamit ng ${params.difficulty} level na bokabularyo
- Isama ang mga halimbawa at praktikal na aplikasyon
- Gawing kawili-wili at hindi malilimutan
- Haba: humigit-kumulang 150-200 salita

Sumulat ng pang-edukasyong kuwento ngayon:`,

        moral: (params) => `Ikaw ay isang manunulat ng kuwento na nagtuturo ng mga aral sa buhay. Sumulat ng kuwentong may aral para sa ${params.difficulty} level na mga mambabasa.

Tema: ${params.topic || 'Isang mahalagang aral sa buhay'}
Mga Kinakailangan:
- Magkuwento tungkol sa mga tauhan na humaharap sa moral na pagpapasya
- Gumamit ng ${params.difficulty} level na wika
- Isama ang malinaw na aral sa dulo
- Gawing relatable at makabuluhan
- Haba: humigit-kumulang 150-200 salita

Sumulat ng kuwentong may aral ngayon:`
      }
    };
  }

  /**
   * Generate a story using the hybrid system
   */
  async generateStory(params) {
    const {
      genre = 'adventure',
      language = 'english',
      difficulty = 'beginner',
      topic = null,
      customElements = {},
      engine = this.preferredEngine
    } = params;

    // Determine which engine to use
    const selectedEngine = this.selectEngine(engine);
    
    console.log(`📝 Generating story using ${selectedEngine} engine...`);
    console.log(`   Genre: ${genre}, Language: ${language}, Difficulty: ${difficulty}`);

    try {
      if (selectedEngine === 'gguf' && this.ggufAvailable) {
        return await this.generateWithGGUF(params);
      } else {
        return this.generateWithRuleBased(params);
      }
    } catch (error) {
      console.error(`Error with ${selectedEngine} engine:`, error.message);
      
      // Fallback to rule-based if GGUF fails
      if (selectedEngine === 'gguf' && this.fallbackEnabled) {
        console.log('⚠ Falling back to rule-based generation...');
        return this.generateWithRuleBased(params);
      }
      
      throw error;
    }
  }

  /**
   * Select the appropriate engine based on configuration and availability
   */
  selectEngine(requestedEngine) {
    if (requestedEngine === 'rule-based') {
      return 'rule-based';
    }
    
    if (requestedEngine === 'gguf') {
      if (this.ggufAvailable) {
        return 'gguf';
      } else if (this.fallbackEnabled) {
        console.log('⚠ GGUF requested but not available, using rule-based');
        return 'rule-based';
      } else {
        throw new Error('GGUF engine requested but not available');
      }
    }
    
    // Auto mode: prefer GGUF if available
    return this.ggufAvailable ? 'gguf' : 'rule-based';
  }

  /**
   * Generate story using GGUF model
   */
  async generateWithGGUF(params) {
    const {
      genre = 'adventure',
      language = 'english',
      difficulty = 'beginner',
      topic = null
    } = params;

    // Build prompt
    const lang = language.toLowerCase();
    const promptTemplate = this.promptTemplates[lang]?.[genre];
    
    if (!promptTemplate) {
      throw new Error(`No prompt template for ${genre} in ${language}`);
    }

    const prompt = promptTemplate({ topic, difficulty, genre });
    
    // Generate with GGUF model
    const result = await this.ggufLoader.generate(prompt, {
      temperature: 0.8, // Higher temperature for more creative stories
      maxTokens: 512
    });

    // Parse and format the response
    const content = this.cleanGeneratedText(result.text);
    const title = this.generateTitle(genre, lang, topic);

    return {
      title,
      content,
      language,
      genre,
      difficulty,
      engine: 'gguf',
      metadata: {
        wordCount: content.split(' ').length,
        readingTime: Math.ceil(content.split(' ').length / 200),
        generatedBy: this.owner,
        timestamp: new Date().toISOString(),
        modelPath: this.ggufLoader.modelPath
      }
    };
  }

  /**
   * Generate story using rule-based system
   */
  generateWithRuleBased(params) {
    const story = this.ruleBasedAI.generateStory(params);
    story.engine = 'rule-based';
    return story;
  }

  /**
   * Clean and format generated text from GGUF model
   */
  cleanGeneratedText(text) {
    // Remove common artifacts from model output
    let cleaned = text.trim();
    
    // Remove instruction echoes
    cleaned = cleaned.replace(/^(Write the story now:|Sumulat ng kuwento ngayon:)/i, '');
    
    // Remove excessive newlines
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    
    // Trim again
    cleaned = cleaned.trim();
    
    return cleaned;
  }

  /**
   * Generate appropriate title
   */
  generateTitle(genre, language, topic) {
    const titles = {
      english: {
        adventure: topic ? `The Adventure of ${topic}` : "An Amazing Adventure",
        educational: topic ? `Learning About ${topic}` : "A Learning Journey",
        moral: topic ? `The Lesson of ${topic}` : "A Story with a Lesson"
      },
      tagalog: {
        adventure: topic ? `Ang Pakikipagsapalaran ng ${topic}` : "Isang Kahanga-hangang Pakikipagsapalaran",
        educational: topic ? `Pag-aaral Tungkol sa ${topic}` : "Isang Paglalakbay sa Pag-aaral",
        moral: topic ? `Ang Aral ng ${topic}` : "Isang Kuwento na may Aral"
      }
    };

    return titles[language]?.[genre] || "Untitled Story";
  }

  /**
   * Generate multiple story variations
   */
  async generateVariations(params, count = 3) {
    const variations = [];
    
    for (let i = 0; i < count; i++) {
      const story = await this.generateStory(params);
      variations.push(story);
    }
    
    return variations;
  }

  /**
   * Analyze story (delegates to rule-based AI)
   */
  analyzeStory(text) {
    return this.ruleBasedAI.analyzeStory(text);
  }

  /**
   * Get comprehensive system information
   */
  getSystemInfo() {
    return {
      name: "RiczzIoT Hybrid E-Learning Story Maker AI",
      owner: this.owner,
      version: this.version,
      engines: {
        gguf: {
          available: this.ggufAvailable,
          info: this.ggufLoader.getModelInfo()
        },
        ruleBased: {
          available: true,
          info: this.ruleBasedAI.getModelInfo()
        }
      },
      configuration: {
        preferredEngine: this.preferredEngine,
        fallbackEnabled: this.fallbackEnabled
      },
      supportedLanguages: this.ruleBasedAI.supportedLanguages,
      supportedGenres: Object.keys(this.ruleBasedAI.storyTemplates),
      capabilities: [
        'Hybrid AI generation (GGUF + Rule-based)',
        'Bilingual support (English & Tagalog)',
        'Multiple genre support',
        'Difficulty level adaptation',
        'Automatic fallback mechanism',
        'Custom element integration',
        'Story analysis',
        'Local inference (privacy-focused)'
      ]
    };
  }

  /**
   * Get model status
   */
  getStatus() {
    return {
      initialized: this.initializationAttempted,
      ggufAvailable: this.ggufAvailable,
      ruleBasedAvailable: true,
      currentEngine: this.selectEngine(this.preferredEngine),
      ggufModel: this.ggufAvailable ? {
        loaded: this.ggufLoader.isLoaded,
        path: this.ggufLoader.modelPath
      } : null
    };
  }

  /**
   * Switch engine preference
   */
  setPreferredEngine(engine) {
    if (!['auto', 'gguf', 'rule-based'].includes(engine)) {
      throw new Error('Invalid engine. Must be: auto, gguf, or rule-based');
    }
    
    this.preferredEngine = engine;
    console.log(`✓ Preferred engine set to: ${engine}`);
    
    return {
      success: true,
      preferredEngine: this.preferredEngine,
      currentEngine: this.selectEngine(engine)
    };
  }

  /**
   * Get vocabulary (delegates to rule-based AI)
   */
  get vocabularyBank() {
    return this.ruleBasedAI.vocabularyBank;
  }

  /**
   * Get story templates (delegates to rule-based AI)
   */
  get storyTemplates() {
    return this.ruleBasedAI.storyTemplates;
  }

  /**
   * Get supported languages
   */
  get supportedLanguages() {
    return this.ruleBasedAI.supportedLanguages;
  }
}

module.exports = HybridStoryAI;
