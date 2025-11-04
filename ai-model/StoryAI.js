/**
 * RiczzIoT E-Learning Story Maker AI Model
 * Bilingual Story Generation (English & Tagalog)
 * Author: RiczzIoT
 */

class StoryAI {
  constructor() {
    this.owner = "RiczzIoT";
    this.version = "1.0.0";
    this.supportedLanguages = ["english", "tagalog"];
    this.storyTemplates = this.initializeTemplates();
    this.vocabularyBank = this.initializeVocabulary();
    this.grammarRules = this.initializeGrammarRules();
  }

  /**
   * Initialize story templates for different genres and difficulty levels
   */
  initializeTemplates() {
    return {
      adventure: {
        english: {
          structure: ["introduction", "challenge", "journey", "climax", "resolution"],
          patterns: [
            "Once upon a time, {character} lived in {location}.",
            "{character} discovered {object} that would change everything.",
            "The journey to {destination} was filled with {obstacles}.",
            "Finally, {character} faced {challenge} with courage.",
            "In the end, {character} learned that {moral}."
          ]
        },
        tagalog: {
          structure: ["panimula", "hamon", "paglalakbay", "kasukdulan", "resolusyon"],
          patterns: [
            "Noong unang panahon, si {character} ay nakatira sa {location}.",
            "Natuklasan ni {character} ang {object} na magbabago ng lahat.",
            "Ang paglalakbay patungo sa {destination} ay puno ng {obstacles}.",
            "Sa wakas, hinarap ni {character} ang {challenge} nang may tapang.",
            "Sa huli, natutunan ni {character} na {moral}."
          ]
        }
      },
      educational: {
        english: {
          structure: ["topic_intro", "explanation", "example", "practice", "summary"],
          patterns: [
            "Today we will learn about {topic}.",
            "{topic} is important because {reason}.",
            "For example, {example}.",
            "Let's practice: {exercise}.",
            "Remember, {summary}."
          ]
        },
        tagalog: {
          structure: ["panimula_ng_paksa", "paliwanag", "halimbawa", "pagsasanay", "buod"],
          patterns: [
            "Ngayong araw ay matututunan natin ang tungkol sa {topic}.",
            "Ang {topic} ay mahalaga dahil {reason}.",
            "Halimbawa, {example}.",
            "Magsanay tayo: {exercise}.",
            "Tandaan, {summary}."
          ]
        }
      },
      moral: {
        english: {
          structure: ["setting", "characters", "problem", "solution", "lesson"],
          patterns: [
            "In {location}, there lived {character}.",
            "{character} was known for being {trait}.",
            "One day, {problem} happened.",
            "{character} decided to {action}.",
            "This teaches us that {moral}."
          ]
        },
        tagalog: {
          structure: ["tagpuan", "tauhan", "suliranin", "solusyon", "aral"],
          patterns: [
            "Sa {location}, may naninirahan na si {character}.",
            "Si {character} ay kilala sa pagiging {trait}.",
            "Isang araw, {problem} ang nangyari.",
            "Nagpasya si {character} na {action}.",
            "Ito ay nagtuturo sa atin na {moral}."
          ]
        }
      }
    };
  }

  /**
   * Initialize vocabulary bank for story elements
   */
  initializeVocabulary() {
    return {
      english: {
        characters: ["Alex", "Maria", "Ben", "Sofia", "Leo", "Emma", "a brave knight", "a wise owl", "a curious child"],
        locations: ["a peaceful village", "a magical forest", "a bustling city", "a quiet farm", "the mountains"],
        objects: ["a mysterious book", "a golden key", "a magic wand", "a treasure map", "a special gift"],
        traits: ["kind", "brave", "honest", "hardworking", "generous", "patient", "wise"],
        actions: ["help others", "tell the truth", "work hard", "share with friends", "never give up"],
        morals: [
          "honesty is the best policy",
          "hard work pays off",
          "kindness matters",
          "teamwork makes dreams work",
          "never judge a book by its cover"
        ]
      },
      tagalog: {
        characters: ["Alex", "Maria", "Ben", "Sofia", "Leo", "Emma", "isang matapang na kabalyero", "isang matalinong kuwago", "isang mausisang bata"],
        locations: ["isang payapang nayon", "isang mahiwagang gubat", "isang masigasig na lungsod", "isang tahimik na bukid", "ang mga bundok"],
        objects: ["isang misteryosong libro", "isang gintong susi", "isang mahiwagang tungkod", "isang mapa ng kayamanan", "isang espesyal na regalo"],
        traits: ["mabait", "matapang", "tapat", "masipag", "mapagbigay", "matiyaga", "matalino"],
        actions: ["tumulong sa iba", "magsabi ng totoo", "magsikap", "magbahagi sa mga kaibigan", "huwag sumuko"],
        morals: [
          "ang katapatan ay pinakamahusay na patakaran",
          "ang sipag ay may gantimpala",
          "mahalaga ang kabaitan",
          "ang pagtutulungan ay nagdudulot ng tagumpay",
          "huwag husgahan ang isang bagay sa panlabas na anyo"
        ]
      }
    };
  }

  /**
   * Initialize grammar rules for sentence construction
   */
  initializeGrammarRules() {
    return {
      english: {
        sentenceStructures: [
          "{subject} {verb} {object}",
          "{subject} {verb} {adverb}",
          "{adjective} {subject} {verb} {object}",
          "When {condition}, {subject} {verb} {object}"
        ],
        transitions: ["Then", "Next", "After that", "Suddenly", "Meanwhile", "Finally"],
        connectors: ["and", "but", "so", "because", "although", "while"]
      },
      tagalog: {
        sentenceStructures: [
          "{subject} ay {verb} ng {object}",
          "{verb} si {subject} ng {adverb}",
          "Ang {adjective} na {subject} ay {verb} ng {object}",
          "Kapag {condition}, {verb} si {subject} ng {object}"
        ],
        transitions: ["Pagkatapos", "Susunod", "Pagkatapos noon", "Biglang", "Samantala", "Sa wakas"],
        connectors: ["at", "ngunit", "kaya", "dahil", "bagaman", "habang"]
      }
    };
  }

  /**
   * Generate a story based on parameters
   */
  generateStory(params) {
    const {
      genre = "adventure",
      language = "english",
      difficulty = "beginner",
      topic = null,
      customElements = {}
    } = params;

    if (!this.supportedLanguages.includes(language.toLowerCase())) {
      throw new Error(`Language ${language} is not supported. Supported languages: ${this.supportedLanguages.join(", ")}`);
    }

    const lang = language.toLowerCase();
    const template = this.storyTemplates[genre]?.[lang];

    if (!template) {
      throw new Error(`Genre ${genre} is not available for ${language}`);
    }

    const story = this.constructStory(template, lang, difficulty, topic, customElements);
    
    return {
      title: this.generateTitle(genre, lang, topic),
      content: story,
      language: language,
      genre: genre,
      difficulty: difficulty,
      metadata: {
        wordCount: story.split(" ").length,
        readingTime: Math.ceil(story.split(" ").length / 200),
        generatedBy: this.owner,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Construct story from template
   */
  constructStory(template, language, difficulty, topic, customElements) {
    const vocab = this.vocabularyBank[language];
    const grammar = this.grammarRules[language];
    
    let story = [];
    const elements = this.selectStoryElements(vocab, customElements);

    template.patterns.forEach((pattern, index) => {
      let sentence = pattern;
      
      Object.keys(elements).forEach(key => {
        const placeholder = `{${key}}`;
        if (sentence.includes(placeholder)) {
          sentence = sentence.replace(placeholder, elements[key]);
        }
      });

      if (topic && sentence.includes("{topic}")) {
        sentence = sentence.replace("{topic}", topic);
      }

      if (index > 0 && Math.random() > 0.5) {
        const transition = grammar.transitions[Math.floor(Math.random() * grammar.transitions.length)];
        sentence = `${transition}, ${sentence.charAt(0).toLowerCase()}${sentence.slice(1)}`;
      }

      story.push(sentence);
    });

    return this.formatStory(story, difficulty);
  }

  /**
   * Select random story elements from vocabulary
   */
  selectStoryElements(vocab, customElements = {}) {
    const elements = {};
    
    Object.keys(vocab).forEach(category => {
      if (customElements[category]) {
        elements[category] = customElements[category];
      } else if (Array.isArray(vocab[category]) && vocab[category].length > 0) {
        elements[category] = vocab[category][Math.floor(Math.random() * vocab[category].length)];
      }
    });

    return elements;
  }

  /**
   * Generate story title
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
   * Format story based on difficulty level
   */
  formatStory(sentences, difficulty) {
    switch (difficulty) {
      case "beginner":
        return sentences.join(" ");
      
      case "intermediate":
        const paragraphs = [];
        for (let i = 0; i < sentences.length; i += 2) {
          paragraphs.push(sentences.slice(i, i + 2).join(" "));
        }
        return paragraphs.join("\n\n");
      
      case "advanced":
        return sentences.map((s, i) => {
          if (i % 3 === 0 && i > 0) return "\n\n" + s;
          return s;
        }).join(" ");
      
      default:
        return sentences.join(" ");
    }
  }

  /**
   * Analyze story complexity
   */
  analyzeStory(storyText) {
    const words = storyText.split(/\s+/);
    const sentences = storyText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    return {
      wordCount: words.length,
      sentenceCount: sentences.length,
      averageWordsPerSentence: (words.length / sentences.length).toFixed(2),
      estimatedReadingTime: Math.ceil(words.length / 200),
      complexity: this.calculateComplexity(words, sentences)
    };
  }

  /**
   * Calculate story complexity score
   */
  calculateComplexity(words, sentences) {
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    const avgSentenceLength = words.length / sentences.length;
    
    const score = (avgWordLength * 0.4) + (avgSentenceLength * 0.6);
    
    if (score < 8) return "beginner";
    if (score < 15) return "intermediate";
    return "advanced";
  }

  /**
   * Generate multiple story variations
   */
  generateVariations(params, count = 3) {
    const variations = [];
    
    for (let i = 0; i < count; i++) {
      variations.push(this.generateStory(params));
    }
    
    return variations;
  }

  /**
   * Get model information
   */
  getModelInfo() {
    return {
      name: "RiczzIoT E-Learning Story Maker AI",
      owner: this.owner,
      version: this.version,
      supportedLanguages: this.supportedLanguages,
      supportedGenres: Object.keys(this.storyTemplates),
      capabilities: [
        "Bilingual story generation (English & Tagalog)",
        "Multiple genre support",
        "Difficulty level adaptation",
        "Custom element integration",
        "Story analysis",
        "Multiple variations generation"
      ]
    };
  }
}

module.exports = StoryAI;
