# Ollama Local LLM Setup Guide

## 🎯 Why Use Ollama?

Using Ollama for local LLM inference provides **significant cost savings**:

- **$0 cost** for unlimited LLM calls (vs $3-75 per 1M tokens for cloud APIs)
- **Privacy**: All data stays on your local machine
- **Speed**: Low latency with GPU acceleration
- **Perfect for**: Test data generation, development, and high-volume operations

## 🌐 Online Ollama Alternative (Groq)

**Don't have local Ollama set up?** No problem! The system automatically falls back to **Groq** (free online Ollama-compatible service) when local Ollama is not available.

### Quick Setup (30 seconds):

1. **Get a free Groq API key**: https://console.groq.com/
2. **Set environment variable**:
   ```bash
   export GROQ_API_KEY=your_groq_api_key_here
   ```
3. **That's it!** The system will automatically use Groq when local Ollama isn't available.

**Benefits of Groq**:
- ✅ **FREE tier** with generous limits
- ✅ **Very fast** (uses LPUs - Language Processing Units)
- ✅ **No local setup** required
- ✅ **Supports Llama models** (same models as Ollama)
- ✅ **Automatic fallback** - works seamlessly when local Ollama isn't running

The system tries providers in this order:
1. Cloud providers (Claude, etc.) - best quality
2. Local Ollama - free, private
3. **Online Ollama (Groq)** - free, no setup needed ← **NEW!**

### Cost Comparison

| Operation | Cloud API Cost | Ollama Cost |
|-----------|---------------|-------------|
| Generate 100 test claims | $5-20 | **$0** |
| Run 1000 validations | $50-200 | **$0** |
| Development testing (unlimited) | $100-500/month | **$0** |

**⚠️ WARNING**: Generating test data with cloud APIs (Claude Opus) can cost **$10-100+** for large datasets. Always use Ollama for bulk operations!

---

## 📦 Installation

### Ubuntu/Linux (with NVIDIA GPU)

1. **Install Ollama**:
   ```bash
   curl -fsSL https://ollama.ai/install.sh | sh
   ```

2. **Verify NVIDIA drivers** (if you have an NVIDIA GPU):
   ```bash
   nvidia-smi  # Should show your GPU
   ```

3. **Start Ollama service**:
   ```bash
   ollama serve
   # Or run as background service:
   sudo systemctl start ollama
   sudo systemctl enable ollama  # Auto-start on boot
   ```

4. **Pull recommended model**:
   ```bash
   # Recommended: Llama 3.2 (good balance of quality and speed)
   ollama pull llama3.2

   # Alternative options:
   ollama pull llama3.2:1b      # Faster, lower VRAM (1GB)
   ollama pull mistral          # Good for reasoning tasks
   ollama pull codellama        # If you need code generation
   ```

### macOS

```bash
# Download and install from https://ollama.ai
# Or use Homebrew:
brew install ollama

# Pull model:
ollama pull llama3.2
```

### Windows

1. Download installer from https://ollama.ai
2. Run installer and follow prompts
3. Open PowerShell and run:
   ```powershell
   ollama pull llama3.2
   ```

---

## ⚙️ Configuration

### 1. Update `.env` file

Copy the example and add Ollama configuration:

```bash
cd backend
cp .env.example .env
```

Edit `.env` and ensure these variables are set:

```bash
# Ollama Configuration (Local)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:latest

# Online Ollama Alternative (Groq) - FREE, no local setup needed!
GROQ_API_KEY=gsk_xxx  # Get free key at https://console.groq.com/
GROQ_MODEL=llama-3.2-90b-text-preview  # Optional: specify model

# Keep your cloud API keys for fallback
ANTHROPIC_API_KEY=sk-ant-xxx  # Fallback for critical operations
```

**Note**: The system will automatically try:
1. Cloud providers (Claude) - if API key configured
2. Local Ollama - if running locally
3. **Groq (online Ollama)** - if `GROQ_API_KEY` is set ← **FREE fallback!**

### 2. Verify Ollama is running

```bash
# Check if Ollama is accessible
curl http://localhost:11434/api/tags

# Should return JSON with available models
```

### 3. Test Ollama with a simple query

```bash
ollama run llama3.2
# Type a test prompt and verify it responds
# Press Ctrl+D to exit
```

---

## 🚀 How It Works

### Automatic Provider Selection

The system now automatically prioritizes LLM providers:

1. **Ollama (Priority 0)** - FREE local inference
   - ✅ Always tried first if available
   - ✅ Zero cost, unlimited usage
   - ✅ Perfect for test data and development

2. **OpenAI/Claude (Priority 1)** - Cloud fallback
   - Only used if Ollama unavailable
   - Cost warnings displayed before expensive operations
   - Claude Opus reserved for critical compliance tasks

### Cost Warnings

The system will warn you before expensive operations:

```
⚠️  COST WARNING: Using anthropic/claude-opus-4-20250514
   Estimated cost: ~$0.0450 (based on ~10000 tokens)
   $15 per 1M tokens (input), $75 per 1M tokens (output)
   ⚠️  EXPENSIVE: Claude Opus costs $15-75 per 1M tokens. Confirm before use.
```

### Usage in Code

All agents now automatically use the unified client:

```typescript
import { callUnifiedLLMWithJSON } from '../shared/unified-llm-client.js';

// Automatically tries Ollama first, then falls back to cloud
const { data, raw } = await callUnifiedLLMWithJSON<ResponseType>({
  systemPrompt: SYSTEM_PROMPT,
  userPrompt,
  temperature: 0.1,
  maxTokens: 1500,
  agentType: 'flight-time-calculator'  // Will try Ollama first
});

console.log(`Provider used: ${raw.provider}`);  // "ollama" or "anthropic"
console.log(`Cost: ${raw.estimatedCost}`);      // "$0.00 (local)" or "~$0.0450"
```

---

## 🧪 Testing

### Test Ollama is working

```bash
# From project root
cd backend

# Run a test validation
npm run test:agents
```

Expected output:
```
💰 Using FREE local Ollama: llama3.2:latest
☁️  Processing claim validation...
✅ Validation complete (provider: ollama, cost: $0.00)
```

### Force cloud provider for testing

You can skip Ollama and test cloud fallback:

```typescript
const { data, raw } = await callUnifiedLLMWithJSON<ResponseType>({
  systemPrompt: SYSTEM_PROMPT,
  userPrompt,
  agentType: 'flight-time-calculator',
  skipOllama: true  // Force cloud provider
});
```

---

## 📊 Recommended Models

### For General Purpose (Recommended)

| Model | Size | VRAM | Use Case |
|-------|------|------|----------|
| `llama3.2:latest` | ~5GB | 8GB+ | ⭐ Best balance of quality and speed |
| `mistral:latest` | ~4GB | 6GB+ | Good reasoning, fast responses |
| `llama3.1:8b` | ~4.7GB | 8GB+ | Higher quality for complex tasks |

### For Lower VRAM / Faster Speed

| Model | Size | VRAM | Use Case |
|-------|------|------|----------|
| `llama3.2:1b` | ~1GB | 2GB+ | Lightweight, very fast |
| `phi:latest` | ~2GB | 4GB+ | Microsoft's efficient model |

### Test Data Generation (High Volume)

For generating lots of test data, prioritize **speed over quality**:

```bash
ollama pull llama3.2:1b  # Fastest, lowest VRAM
```

Then in `.env`:
```bash
OLLAMA_MODEL=llama3.2:1b
```

---

## 🔧 Troubleshooting

### Ollama not available

**Symptom**: Logs show "Ollama not available, falling back to cloud provider..."

**Solutions**:
1. Check if Ollama is running:
   ```bash
   curl http://localhost:11434/api/tags
   ```

2. Start Ollama service:
   ```bash
   ollama serve
   # Or: sudo systemctl start ollama
   ```

3. Check if model is pulled:
   ```bash
   ollama list
   # Pull if missing:
   ollama pull llama3.2
   ```

### Out of memory errors

**Symptom**: Ollama crashes or returns errors during inference

**Solutions**:
1. Use a smaller model:
   ```bash
   ollama pull llama3.2:1b
   ```

2. Close other GPU-intensive applications

3. Check available VRAM:
   ```bash
   nvidia-smi
   ```

### Slow responses

**Solutions**:
1. Ensure Ollama is using GPU (not CPU):
   ```bash
   ollama run llama3.2 --verbose
   # Should show "Using GPU"
   ```

2. Switch to a smaller/faster model:
   ```bash
   ollama pull llama3.2:1b
   ```

3. Increase GPU memory allocation (if using Docker):
   ```bash
   docker run --gpus all ...
   ```

---

## 📈 Monitoring Costs

The system automatically logs which provider was used:

```
💰 Using FREE local Ollama: llama3.2:latest
✅ Flight time validation complete
   Provider: ollama
   Cost: $0.00 (local)
   Tokens: 1247 input, 583 output
```

vs

```
⚠️  COST WARNING: Using anthropic/claude-opus-4-20250514
☁️  Using cloud provider: anthropic/claude-opus-4-20250514
✅ Compliance check complete
   Provider: anthropic
   Cost: ~$0.0215
   Tokens: 892 input, 421 output
```

---

## 🎓 Best Practices

### 1. **Always Use Ollama for Test Data**

```typescript
// ✅ Good: Use local Ollama for test data generation
import { warnTestDataGeneration } from '../shared/unified-llm-client.js';

warnTestDataGeneration(100);  // Warns if not using Ollama
const testData = await generateTestDataWithLLM({
  agentType: 'test-data-generator'  // Configured to use Ollama only
});
```

### 2. **Use Cloud Only for Production Critical Tasks**

```typescript
// ⚠️  For critical compliance (use Claude Opus)
const result = await callUnifiedLLMWithJSON({
  agentType: 'compliance-validator',  // Will try Ollama first, then Opus
  // Ollama attempted first, but Opus used if higher accuracy needed
});
```

### 3. **Monitor Your Costs**

Check your logs regularly for unexpected cloud usage:

```bash
# Search for cloud provider usage
grep "☁️  Using cloud provider" backend/logs/*.log

# Count Ollama vs cloud usage
grep "💰 Using FREE local Ollama" backend/logs/*.log | wc -l
grep "☁️  Using cloud provider" backend/logs/*.log | wc -l
```

---

## 💡 Tips for Maximum Savings

1. **Start Ollama on boot** to ensure it's always available:
   ```bash
   sudo systemctl enable ollama
   ```

2. **Use smaller models for test data** - quality doesn't need to be perfect

3. **Run bulk operations locally first** - only use cloud for production

4. **Monitor the logs** - ensure Ollama is being used as expected

5. **Pre-pull models** before running large operations:
   ```bash
   ollama pull llama3.2
   ```

---

## 📚 Additional Resources

- **Ollama Documentation**: https://github.com/ollama/ollama
- **Model Library**: https://ollama.ai/library
- **Discord Community**: https://discord.gg/ollama
- **GPU Setup Guide**: https://github.com/ollama/ollama/blob/main/docs/gpu.md

---

## 🆘 Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Review Ollama logs: `ollama logs`
3. Check system compatibility: https://github.com/ollama/ollama#supported-platforms
4. Open an issue on the project repo with logs and error messages

**Remember**: Ollama is 100% free and saves you significant money on API costs. Take the time to set it up properly! 🚀
