/**
 * Test script for RiczzIoT Story AI Model
 * Run with: node test-model.js
 */

const StoryAI = require('./ai-model/StoryAI');

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║   Testing RiczzIoT E-Learning Story Maker AI Model      ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

const storyAI = new StoryAI();

console.log('1. Model Information:');
console.log(JSON.stringify(storyAI.getModelInfo(), null, 2));
console.log('\n' + '='.repeat(60) + '\n');

console.log('2. Generating English Adventure Story:');
const englishStory = storyAI.generateStory({
  genre: 'adventure',
  language: 'english',
  difficulty: 'beginner',
  topic: 'Friendship'
});
console.log('Title:', englishStory.title);
console.log('Content:', englishStory.content);
console.log('Metadata:', englishStory.metadata);
console.log('\n' + '='.repeat(60) + '\n');

console.log('3. Generating Tagalog Moral Story:');
const tagalogStory = storyAI.generateStory({
  genre: 'moral',
  language: 'tagalog',
  difficulty: 'intermediate',
  topic: 'Katapatan'
});
console.log('Title:', tagalogStory.title);
console.log('Content:', tagalogStory.content);
console.log('Metadata:', tagalogStory.metadata);
console.log('\n' + '='.repeat(60) + '\n');

console.log('4. Generating Educational Story:');
const educationalStory = storyAI.generateStory({
  genre: 'educational',
  language: 'english',
  difficulty: 'advanced',
  topic: 'Science'
});
console.log('Title:', educationalStory.title);
console.log('Content:', educationalStory.content);
console.log('Metadata:', educationalStory.metadata);
console.log('\n' + '='.repeat(60) + '\n');

console.log('5. Story Analysis:');
const analysis = storyAI.analyzeStory(englishStory.content);
console.log(JSON.stringify(analysis, null, 2));
console.log('\n' + '='.repeat(60) + '\n');

console.log('6. Generating Multiple Variations:');
const variations = storyAI.generateVariations({
  genre: 'adventure',
  language: 'tagalog',
  difficulty: 'beginner'
}, 2);
console.log(`Generated ${variations.length} variations:`);
variations.forEach((story, index) => {
  console.log(`\nVariation ${index + 1}:`);
  console.log('Title:', story.title);
  console.log('Content:', story.content.substring(0, 100) + '...');
});

console.log('\n' + '='.repeat(60));
console.log('✓ All tests completed successfully!');
console.log('='.repeat(60) + '\n');
