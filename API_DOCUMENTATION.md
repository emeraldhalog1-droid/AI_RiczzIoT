# RiczzIoT E-Learning Story Maker API Documentation

**Owner:** RiczzIoT  
**Version:** 1.0.0  
**Languages:** English & Tagalog

## Overview

This API provides AI-powered story generation for e-learning purposes with bilingual support (English and Tagalog). The AI model uses rule-based natural language generation with customizable templates, vocabulary banks, and grammar rules.

## Base URL

```
http://localhost:3000
```

## API Endpoints

### 1. Get Model Information

Get information about the AI model, including supported languages, genres, and capabilities.

**Endpoint:** `GET /api/info`

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "RiczzIoT E-Learning Story Maker AI",
    "owner": "RiczzIoT",
    "version": "1.0.0",
    "supportedLanguages": ["english", "tagalog"],
    "supportedGenres": ["adventure", "educational", "moral"],
    "capabilities": [
      "Bilingual story generation (English & Tagalog)",
      "Multiple genre support",
      "Difficulty level adaptation",
      "Custom element integration",
      "Story analysis",
      "Multiple variations generation"
    ]
  }
}
```

---

### 2. Generate Story

Generate a single story based on specified parameters.

**Endpoint:** `POST /api/generate`

**Request Body:**
```json
{
  "genre": "adventure",
  "language": "english",
  "difficulty": "beginner",
  "topic": "Friendship",
  "customElements": {
    "character": "Alex",
    "location": "a magical forest"
  }
}
```

**Parameters:**
- `genre` (string, optional): Story genre. Options: `adventure`, `educational`, `moral`. Default: `adventure`
- `language` (string, optional): Story language. Options: `english`, `tagalog`. Default: `english`
- `difficulty` (string, optional): Difficulty level. Options: `beginner`, `intermediate`, `advanced`. Default: `beginner`
- `topic` (string, optional): Story topic or theme. Default: `null`
- `customElements` (object, optional): Custom story elements to override random selection

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "The Adventure of Friendship",
    "content": "Once upon a time, Alex lived in a magical forest...",
    "language": "english",
    "genre": "adventure",
    "difficulty": "beginner",
    "metadata": {
      "wordCount": 85,
      "readingTime": 1,
      "generatedBy": "RiczzIoT",
      "timestamp": "2025-11-04T10:30:00.000Z"
    }
  }
}
```

---

### 3. Generate Story Variations

Generate multiple variations of a story with the same parameters.

**Endpoint:** `POST /api/generate-variations`

**Request Body:**
```json
{
  "genre": "moral",
  "language": "tagalog",
  "difficulty": "intermediate",
  "topic": "Katapatan",
  "count": 3
}
```

**Parameters:**
- Same as `/api/generate` endpoint
- `count` (number, optional): Number of variations to generate. Default: `3`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "title": "Ang Aral ng Katapatan",
      "content": "Sa isang payapang nayon...",
      "language": "tagalog",
      "genre": "moral",
      "difficulty": "intermediate",
      "metadata": { ... }
    },
    {
      "title": "Ang Aral ng Katapatan",
      "content": "Sa isang tahimik na bukid...",
      "language": "tagalog",
      "genre": "moral",
      "difficulty": "intermediate",
      "metadata": { ... }
    }
  ]
}
```

---

### 4. Analyze Story

Analyze a story text to get complexity metrics.

**Endpoint:** `POST /api/analyze`

**Request Body:**
```json
{
  "text": "Once upon a time, there was a brave knight who lived in a castle..."
}
```

**Parameters:**
- `text` (string, required): The story text to analyze

**Response:**
```json
{
  "success": true,
  "data": {
    "wordCount": 85,
    "sentenceCount": 5,
    "averageWordsPerSentence": "17.00",
    "estimatedReadingTime": 1,
    "complexity": "intermediate"
  }
}
```

---

### 5. Get Vocabulary

Get the vocabulary bank for a specific language.

**Endpoint:** `GET /api/vocabulary/:language`

**Parameters:**
- `language` (string, required): Language code (`english` or `tagalog`)

**Example:** `GET /api/vocabulary/english`

**Response:**
```json
{
  "success": true,
  "data": {
    "characters": ["Alex", "Maria", "Ben", "Sofia", ...],
    "locations": ["a peaceful village", "a magical forest", ...],
    "objects": ["a mysterious book", "a golden key", ...],
    "traits": ["kind", "brave", "honest", ...],
    "actions": ["help others", "tell the truth", ...],
    "morals": ["honesty is the best policy", ...]
  }
}
```

---

### 6. Get Templates

Get available story templates and their supported languages.

**Endpoint:** `GET /api/templates`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "genre": "adventure",
      "languages": ["english", "tagalog"]
    },
    {
      "genre": "educational",
      "languages": ["english", "tagalog"]
    },
    {
      "genre": "moral",
      "languages": ["english", "tagalog"]
    }
  ]
}
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

---

## Story Genres

### Adventure (Pakikipagsapalaran)
Stories focused on journeys, challenges, and exciting experiences.

**Structure:**
- Introduction
- Challenge
- Journey
- Climax
- Resolution

### Educational (Pang-edukasyon)
Stories designed to teach specific topics or concepts.

**Structure:**
- Topic Introduction
- Explanation
- Example
- Practice
- Summary

### Moral (Kuwentong May Aral)
Stories that teach life lessons and values.

**Structure:**
- Setting
- Characters
- Problem
- Solution
- Lesson

---

## Difficulty Levels

### Beginner (Simula)
- Simple vocabulary
- Short sentences
- Basic story structure
- Continuous text format

### Intermediate (Katamtaman)
- Moderate vocabulary
- Varied sentence length
- More complex narratives
- Paragraph breaks

### Advanced (Mahirap)
- Rich vocabulary
- Complex sentences
- Sophisticated storytelling
- Multiple paragraphs

---

## Custom Elements

You can override random story elements by providing custom values:

```json
{
  "customElements": {
    "character": "Your Character Name",
    "location": "Your Location",
    "object": "Your Object",
    "trait": "Your Trait",
    "action": "Your Action",
    "moral": "Your Moral Lesson"
  }
}
```

---

## Usage Examples

### JavaScript (Fetch API)

```javascript
// Generate a story
const response = await fetch('http://localhost:3000/api/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    genre: 'adventure',
    language: 'english',
    difficulty: 'beginner',
    topic: 'Friendship'
  })
});

const result = await response.json();
console.log(result.data.content);
```

### cURL

```bash
# Generate a story
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "genre": "moral",
    "language": "tagalog",
    "difficulty": "intermediate",
    "topic": "Katapatan"
  }'

# Get model info
curl http://localhost:3000/api/info

# Get vocabulary
curl http://localhost:3000/api/vocabulary/english
```

### Python (requests)

```python
import requests

# Generate a story
response = requests.post('http://localhost:3000/api/generate', json={
    'genre': 'educational',
    'language': 'english',
    'difficulty': 'advanced',
    'topic': 'Science'
})

story = response.json()
print(story['data']['content'])
```

---

## AI Model Architecture

### Components

1. **Story Templates**: Pre-defined narrative structures for each genre
2. **Vocabulary Bank**: Collections of words and phrases in both languages
3. **Grammar Rules**: Sentence construction patterns and transitions
4. **Story Generator**: Core algorithm that combines templates with vocabulary
5. **Analyzer**: Text analysis for complexity and readability metrics

### Features

- **Rule-based Generation**: Uses linguistic rules and templates
- **Bilingual Support**: Native support for English and Tagalog
- **Customizable**: Accepts custom elements and topics
- **Adaptive**: Adjusts complexity based on difficulty level
- **Analytical**: Provides metrics on generated stories

---

## License

MIT License - Created by RiczzIoT

---

## Support

For issues, questions, or contributions, please contact RiczzIoT.
