# GGUF Model Setup Guide for RiczzIoT E-Learning Story Maker

**Owner: RiczzIoT**

This guide will help you set up and use .gguf AI models with the RiczzIoT E-Learning Story Maker for enhanced, AI-powered story generation.

## 📋 Table of Contents

1. [What is GGUF?](#what-is-gguf)
2. [Prerequisites](#prerequisites)
3. [Installation Steps](#installation-steps)
4. [Downloading Models](#downloading-models)
5. [Configuration](#configuration)
6. [Usage](#usage)
7. [Troubleshooting](#troubleshooting)
8. [Performance Tips](#performance-tips)

---

## 🤔 What is GGUF?

GGUF (GPT-Generated Unified Format) is a file format for storing large language models that can run locally on your computer. Benefits include:

- **Privacy**: All processing happens on your machine
- **No Internet Required**: Works completely offline
- **No API Costs**: Free to use after downloading
- **Customizable**: Full control over generation parameters

---

## 📦 Prerequisites

### System Requirements

**Minimum (for small models like TinyLlama):**
- 4GB RAM
- 2GB free disk space
- Modern CPU (2015 or newer)

**Recommended (for larger models like Mistral 7B):**
- 16GB RAM
- 10GB free disk space
- Modern CPU with AVX2 support
- Optional: NVIDIA GPU with CUDA support

### Software Requirements

1. **Node.js** (v14 or higher) - Already installed ✓
2. **CMake** (for building node-llama-cpp)
3. **C++ Compiler**:
   - **Linux**: GCC or Clang
   - **macOS**: Xcode Command Line Tools
   - **Windows**: Visual Studio Build Tools

---

## 🚀 Installation Steps

### Step 1: Install Build Tools

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install build-essential cmake
```

#### macOS
```bash
xcode-select --install
brew install cmake
```

#### Windows
1. Download and install [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/)
2. Select "Desktop development with C++" workload
3. Download and install [CMake](https://cmake.org/download/)

### Step 2: Install node-llama-cpp

```bash
npm install node-llama-cpp
```

**Note**: This may take 5-15 minutes as it compiles native bindings.

If you encounter errors, try:
```bash
npm install node-llama-cpp --build-from-source
```

### Step 3: Create Models Directory

```bash
mkdir models
```

---

## 📥 Downloading Models

### Recommended Models for Story Generation

#### 1. TinyLlama 1.1B (Best for beginners)

**Size**: 637MB  
**RAM**: 2GB minimum  
**Quality**: Good for basic stories

```bash
# Download from HuggingFace
cd models
wget https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf
```

Or download manually:
1. Visit: https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF
2. Download: `tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf`
3. Place in `models/` directory

#### 2. Phi-2 (Balanced option)

**Size**: 1.6GB  
**RAM**: 4GB minimum  
**Quality**: Excellent for creative writing

```bash
cd models
wget https://huggingface.co/TheBloke/phi-2-GGUF/resolve/main/phi-2.Q4_K_M.gguf
```

Or download manually:
1. Visit: https://huggingface.co/TheBloke/phi-2-GGUF
2. Download: `phi-2.Q4_K_M.gguf`
3. Place in `models/` directory

#### 3. Mistral 7B Instruct (Best quality)

**Size**: 4.1GB  
**RAM**: 8GB minimum  
**Quality**: Excellent for creative and bilingual stories

```bash
cd models
wget https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF/resolve/main/mistral-7b-instruct-v0.2.Q4_K_M.gguf
```

Or download manually:
1. Visit: https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF
2. Download: `mistral-7b-instruct-v0.2.Q4_K_M.gguf`
3. Place in `models/` directory

### Using wget Alternative (if wget not available)

**Linux/macOS**:
```bash
curl -L -o models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf \
  https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf
```

**Windows PowerShell**:
```powershell
Invoke-WebRequest -Uri "https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf" -OutFile "models\tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf"
```

---

## ⚙️ Configuration

### Step 1: Edit model-config.json

Open `model-config.json` and update the GGUF section:

```json
{
  "gguf": {
    "enabled": true,
    "modelPath": "./models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf",
    "contextSize": 2048,
    "temperature": 0.7,
    "maxTokens": 512,
    "topP": 0.9,
    "topK": 40,
    "repeatPenalty": 1.1,
    "gpuLayers": 0
  }
}
```

### Configuration Parameters Explained

- **enabled**: Set to `true` to use GGUF model
- **modelPath**: Path to your .gguf file
- **contextSize**: Context window size (2048-4096 recommended)
- **temperature**: Creativity level (0.7-0.9 for stories)
- **maxTokens**: Maximum length of generated text
- **topP**: Nucleus sampling parameter
- **topK**: Top-K sampling parameter
- **repeatPenalty**: Prevents repetition (1.1-1.3 recommended)
- **gpuLayers**: Number of layers to offload to GPU (0 for CPU-only)

### Step 2: Verify Configuration

```bash
node -e "console.log(require('./model-config.json'))"
```

---

## 🎯 Usage

### Starting the Server

```bash
npm start
```

The server will automatically:
1. Try to load the GGUF model
2. Fall back to rule-based generation if GGUF fails
3. Display the status in the console

### Using the Web Interface

1. Open http://localhost:3000
2. Select your preferred language and genre
3. Click "Generate Story"
4. The system will use GGUF if available, or rule-based generation as fallback

### Using the API

#### Check Model Status

```bash
curl http://localhost:3000/api/model/status
```

#### Generate Story with GGUF

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "genre": "adventure",
    "language": "english",
    "difficulty": "beginner",
    "topic": "Friendship",
    "engine": "gguf"
  }'
```

#### Force Rule-Based Generation

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "genre": "adventure",
    "language": "english",
    "difficulty": "beginner",
    "engine": "rule-based"
  }'
```

---

## 🔧 Troubleshooting

### Issue: "node-llama-cpp not installed"

**Solution**:
```bash
npm install node-llama-cpp
```

If that fails:
```bash
npm install node-llama-cpp --build-from-source
```

### Issue: "Model file not found"

**Solution**:
1. Verify the file exists: `ls -la models/`
2. Check the path in `model-config.json`
3. Ensure the filename matches exactly (case-sensitive)

### Issue: "Out of memory" or crashes

**Solution**:
1. Use a smaller model (TinyLlama instead of Mistral)
2. Reduce `contextSize` in config (try 1024 or 512)
3. Close other applications to free RAM
4. Consider upgrading system RAM

### Issue: Slow generation

**Solution**:
1. Use a smaller model
2. Reduce `maxTokens` in config
3. Enable GPU acceleration if you have an NVIDIA GPU:
   ```json
   "gpuLayers": 32
   ```
4. Ensure your CPU supports AVX2 instructions

### Issue: Poor quality stories

**Solution**:
1. Try a larger model (Phi-2 or Mistral)
2. Adjust temperature (0.7-0.9 for creative writing)
3. Increase `maxTokens` for longer stories
4. Use more specific topics in your requests

### Issue: Build errors on Windows

**Solution**:
1. Install Visual Studio Build Tools with C++ workload
2. Install CMake and add to PATH
3. Restart terminal/IDE
4. Try: `npm install node-llama-cpp --msvs_version=2022`

---

## ⚡ Performance Tips

### For Better Speed

1. **Use quantized models**: Q4_K_M models are 4x smaller and faster
2. **Reduce context size**: Lower `contextSize` to 1024 or 512
3. **Enable GPU**: If you have NVIDIA GPU, set `gpuLayers` to 32+
4. **Use SSD**: Store models on SSD for faster loading
5. **Close background apps**: Free up RAM and CPU

### For Better Quality

1. **Use larger models**: Mistral 7B > Phi-2 > TinyLlama
2. **Increase temperature**: 0.8-0.9 for more creative stories
3. **Increase max tokens**: 512-1024 for longer, detailed stories
4. **Adjust repeat penalty**: 1.1-1.2 to reduce repetition
5. **Provide specific topics**: More specific prompts = better results

### Memory Usage Estimates

| Model | File Size | RAM Usage | Speed (CPU) |
|-------|-----------|-----------|-------------|
| TinyLlama 1.1B | 637MB | ~2GB | Fast |
| Phi-2 | 1.6GB | ~4GB | Medium |
| Mistral 7B | 4.1GB | ~8GB | Slow |
| LLaMA 2 7B | 3.8GB | ~8GB | Slow |

---

## 🎓 Advanced Configuration

### GPU Acceleration (NVIDIA only)

1. Install CUDA Toolkit
2. Update config:
```json
{
  "gguf": {
    "gpuLayers": 32,
    ...
  }
}
```

### Custom Model Parameters

For educational content (more focused):
```json
{
  "temperature": 0.5,
  "topP": 0.85,
  "topK": 30
}
```

For creative stories (more diverse):
```json
{
  "temperature": 0.9,
  "topP": 0.95,
  "topK": 50
}
```

---

## 📚 Additional Resources

- **HuggingFace Models**: https://huggingface.co/models?library=gguf
- **node-llama-cpp Docs**: https://github.com/withcatai/node-llama-cpp
- **GGUF Format**: https://github.com/ggerganov/llama.cpp

---

## 🆘 Getting Help

If you encounter issues:

1. Check the console output for error messages
2. Verify your configuration in `model-config.json`
3. Test with the smallest model first (TinyLlama)
4. Check system requirements match your hardware
5. Review the troubleshooting section above

---

## 📝 Quick Start Checklist

- [ ] Install build tools (CMake, C++ compiler)
- [ ] Install node-llama-cpp: `npm install node-llama-cpp`
- [ ] Create models directory: `mkdir models`
- [ ] Download a .gguf model file
- [ ] Update `model-config.json` with model path
- [ ] Set `enabled: true` in config
- [ ] Start server: `npm start`
- [ ] Test generation at http://localhost:3000

---

**Created by RiczzIoT**  
**Version 2.0.0**

For questions or issues, please refer to the main README.md or check the API documentation.
