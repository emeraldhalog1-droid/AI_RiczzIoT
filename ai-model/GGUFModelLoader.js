/**
 * RiczzIoT GGUF Model Loader
 * Loads and manages .gguf AI models for local inference
 * Author: RiczzIoT
 * 
 * This module provides integration with .gguf format models (LLaMA, Mistral, etc.)
 * for enhanced AI-powered story generation.
 */

const fs = require('fs');
const path = require('path');

class GGUFModelLoader {
  constructor(config = {}) {
    this.owner = "RiczzIoT";
    this.modelPath = config.modelPath || null;
    this.modelType = config.modelType || 'auto';
    this.contextSize = config.contextSize || 2048;
    this.temperature = config.temperature || 0.7;
    this.maxTokens = config.maxTokens || 512;
    this.topP = config.topP || 0.9;
    this.topK = config.topK || 40;
    this.repeatPenalty = config.repeatPenalty || 1.1;
    
    this.model = null;
    this.context = null;
    this.isLoaded = false;
    this.loadError = null;
    
    // Model library reference (will be loaded dynamically)
    this.llamaCpp = null;
  }

  /**
   * Initialize and load the GGUF model
   */
  async initialize() {
    try {
      console.log('🔄 Initializing GGUF Model Loader...');
      
      // Check if model path is provided
      if (!this.modelPath) {
        throw new Error('No model path provided. Please configure a .gguf model path.');
      }

      // Check if model file exists
      if (!fs.existsSync(this.modelPath)) {
        throw new Error(`Model file not found at: ${this.modelPath}`);
      }

      // Try to load node-llama-cpp library
      try {
        this.llamaCpp = require('node-llama-cpp');
        console.log('✓ node-llama-cpp library loaded');
      } catch (error) {
        throw new Error(
          'node-llama-cpp not installed. Install with: npm install node-llama-cpp\n' +
          'Note: This requires CMake and a C++ compiler. See GGUF_SETUP.md for details.'
        );
      }

      // Load the model
      console.log(`📦 Loading model from: ${this.modelPath}`);
      console.log(`   Context size: ${this.contextSize}`);
      console.log(`   Temperature: ${this.temperature}`);
      
      const { LlamaModel, LlamaContext, LlamaChatSession } = this.llamaCpp;
      
      // Load model
      this.model = new LlamaModel({
        modelPath: this.modelPath,
        gpuLayers: 0 // Set to 0 for CPU-only, increase for GPU acceleration
      });

      // Create context
      this.context = new LlamaContext({
        model: this.model,
        contextSize: this.contextSize
      });

      // Create chat session
      this.session = new LlamaChatSession({
        context: this.context
      });

      this.isLoaded = true;
      console.log('✓ GGUF model loaded successfully!');
      
      return {
        success: true,
        message: 'Model loaded successfully',
        modelPath: this.modelPath
      };

    } catch (error) {
      this.loadError = error.message;
      this.isLoaded = false;
      console.error('✗ Failed to load GGUF model:', error.message);
      
      return {
        success: false,
        error: error.message,
        fallbackAvailable: true
      };
    }
  }

  /**
   * Generate text using the loaded GGUF model
   */
  async generate(prompt, options = {}) {
    if (!this.isLoaded) {
      throw new Error('Model not loaded. Please initialize the model first or use rule-based generation.');
    }

    try {
      const temperature = options.temperature || this.temperature;
      const maxTokens = options.maxTokens || this.maxTokens;
      const topP = options.topP || this.topP;
      const topK = options.topK || this.topK;

      console.log('🤖 Generating with GGUF model...');
      
      const response = await this.session.prompt(prompt, {
        temperature,
        maxTokens,
        topP,
        topK,
        repeatPenalty: this.repeatPenalty
      });

      return {
        success: true,
        text: response,
        model: 'gguf',
        modelPath: this.modelPath
      };

    } catch (error) {
      console.error('Error during generation:', error);
      throw new Error(`Generation failed: ${error.message}`);
    }
  }

  /**
   * Generate text with streaming support
   */
  async *generateStream(prompt, options = {}) {
    if (!this.isLoaded) {
      throw new Error('Model not loaded. Please initialize the model first.');
    }

    try {
      const temperature = options.temperature || this.temperature;
      const maxTokens = options.maxTokens || this.maxTokens;

      for await (const token of this.session.promptWithMeta(prompt, {
        temperature,
        maxTokens,
        topP: this.topP,
        topK: this.topK
      })) {
        yield token.token;
      }

    } catch (error) {
      console.error('Error during streaming generation:', error);
      throw error;
    }
  }

  /**
   * Get model information
   */
  getModelInfo() {
    return {
      owner: this.owner,
      isLoaded: this.isLoaded,
      modelPath: this.modelPath,
      modelType: this.modelType,
      loadError: this.loadError,
      configuration: {
        contextSize: this.contextSize,
        temperature: this.temperature,
        maxTokens: this.maxTokens,
        topP: this.topP,
        topK: this.topK,
        repeatPenalty: this.repeatPenalty
      },
      capabilities: [
        'GGUF model loading (.gguf format)',
        'Local inference (no internet required)',
        'Customizable generation parameters',
        'Streaming support',
        'CPU and GPU acceleration support'
      ]
    };
  }

  /**
   * Check if model is ready for inference
   */
  isReady() {
    return this.isLoaded && this.model !== null && this.context !== null;
  }

  /**
   * Unload the model and free memory
   */
  async unload() {
    try {
      if (this.session) {
        this.session = null;
      }
      if (this.context) {
        this.context = null;
      }
      if (this.model) {
        this.model = null;
      }
      
      this.isLoaded = false;
      console.log('✓ Model unloaded successfully');
      
      return { success: true, message: 'Model unloaded' };
    } catch (error) {
      console.error('Error unloading model:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Reload the model with new configuration
   */
  async reload(newConfig = {}) {
    await this.unload();
    
    // Update configuration
    if (newConfig.modelPath) this.modelPath = newConfig.modelPath;
    if (newConfig.contextSize) this.contextSize = newConfig.contextSize;
    if (newConfig.temperature) this.temperature = newConfig.temperature;
    if (newConfig.maxTokens) this.maxTokens = newConfig.maxTokens;
    
    return await this.initialize();
  }

  /**
   * Estimate model memory requirements
   */
  estimateMemoryUsage() {
    if (!this.modelPath || !fs.existsSync(this.modelPath)) {
      return { error: 'Model file not found' };
    }

    const stats = fs.statSync(this.modelPath);
    const fileSizeMB = stats.size / (1024 * 1024);
    
    // Rough estimation: model size + context memory
    const contextMemoryMB = (this.contextSize * 4) / (1024 * 1024); // 4 bytes per token
    const estimatedTotalMB = fileSizeMB + contextMemoryMB + 100; // +100MB overhead

    return {
      modelFileSizeMB: Math.round(fileSizeMB),
      contextMemoryMB: Math.round(contextMemoryMB),
      estimatedTotalMB: Math.round(estimatedTotalMB),
      recommendation: estimatedTotalMB < 4096 ? 'Should run on most systems' : 'May require high-end system'
    };
  }

  /**
   * Validate model file
   */
  static validateModelFile(modelPath) {
    try {
      if (!fs.existsSync(modelPath)) {
        return { valid: false, error: 'File does not exist' };
      }

      const stats = fs.statSync(modelPath);
      if (!stats.isFile()) {
        return { valid: false, error: 'Path is not a file' };
      }

      const ext = path.extname(modelPath).toLowerCase();
      if (ext !== '.gguf') {
        return { 
          valid: false, 
          error: 'File must have .gguf extension',
          suggestion: 'Please use a GGUF format model file'
        };
      }

      const sizeMB = stats.size / (1024 * 1024);
      if (sizeMB < 10) {
        return { 
          valid: false, 
          error: 'File seems too small to be a valid model',
          sizeMB: Math.round(sizeMB)
        };
      }

      return { 
        valid: true, 
        sizeMB: Math.round(sizeMB),
        path: modelPath
      };

    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  /**
   * Get recommended models for story generation
   */
  static getRecommendedModels() {
    return [
      {
        name: 'TinyLlama 1.1B',
        size: '637MB',
        description: 'Lightweight model, good for basic story generation',
        url: 'https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF',
        recommended: true,
        requirements: 'Low (2GB RAM)'
      },
      {
        name: 'Mistral 7B Instruct',
        size: '4.1GB',
        description: 'High-quality model, excellent for creative writing',
        url: 'https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF',
        recommended: true,
        requirements: 'Medium (8GB RAM)'
      },
      {
        name: 'LLaMA 2 7B',
        size: '3.8GB',
        description: 'Versatile model with good story generation capabilities',
        url: 'https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF',
        recommended: true,
        requirements: 'Medium (8GB RAM)'
      },
      {
        name: 'Phi-2',
        size: '1.6GB',
        description: 'Compact but powerful, good balance of size and quality',
        url: 'https://huggingface.co/TheBloke/phi-2-GGUF',
        recommended: true,
        requirements: 'Low (4GB RAM)'
      }
    ];
  }
}

module.exports = GGUFModelLoader;
