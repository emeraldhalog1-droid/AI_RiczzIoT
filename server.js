/**
 * RiczzIoT E-Learning Story Maker Server
 * Local server for AI-powered story generation
 * Author: RiczzIoT
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const StoryAI = require('./ai-model/StoryAI');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const storyAI = new StoryAI();

console.log(`
╔═══════════════════════════════════════════════════════════╗
║   RiczzIoT E-Learning Story Maker AI Server              ║
║   Bilingual Story Generation (English & Tagalog)         ║
║   Owner: RiczzIoT                                         ║
╚═══════════════════════════════════════════════════════════╝
`);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/info', (req, res) => {
  try {
    const info = storyAI.getModelInfo();
    res.json({
      success: true,
      data: info
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/generate', (req, res) => {
  try {
    const {
      genre = 'adventure',
      language = 'english',
      difficulty = 'beginner',
      topic = null,
      customElements = {}
    } = req.body;

    const story = storyAI.generateStory({
      genre,
      language,
      difficulty,
      topic,
      customElements
    });

    res.json({
      success: true,
      data: story
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/generate-variations', (req, res) => {
  try {
    const {
      genre = 'adventure',
      language = 'english',
      difficulty = 'beginner',
      topic = null,
      customElements = {},
      count = 3
    } = req.body;

    const variations = storyAI.generateVariations({
      genre,
      language,
      difficulty,
      topic,
      customElements
    }, count);

    res.json({
      success: true,
      data: variations
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/analyze', (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required for analysis'
      });
    }

    const analysis = storyAI.analyzeStory(text);

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/vocabulary/:language', (req, res) => {
  try {
    const { language } = req.params;
    const vocab = storyAI.vocabularyBank[language.toLowerCase()];

    if (!vocab) {
      return res.status(404).json({
        success: false,
        error: `Vocabulary for ${language} not found`
      });
    }

    res.json({
      success: true,
      data: vocab
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/templates', (req, res) => {
  try {
    const templates = Object.keys(storyAI.storyTemplates).map(genre => ({
      genre,
      languages: Object.keys(storyAI.storyTemplates[genre])
    }));

    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`✓ Server is running on http://localhost:${PORT}`);
  console.log(`✓ AI Model: ${storyAI.getModelInfo().name}`);
  console.log(`✓ Supported Languages: ${storyAI.supportedLanguages.join(', ')}`);
  console.log(`\nAPI Endpoints:`);
  console.log(`  GET  /api/info - Get model information`);
  console.log(`  POST /api/generate - Generate a story`);
  console.log(`  POST /api/generate-variations - Generate multiple story variations`);
  console.log(`  POST /api/analyze - Analyze story text`);
  console.log(`  GET  /api/vocabulary/:language - Get vocabulary for a language`);
  console.log(`  GET  /api/templates - Get available templates`);
  console.log(`\n✓ Ready to generate stories!\n`);
});

module.exports = app;
