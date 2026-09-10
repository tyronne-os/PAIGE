# HuggingFace GPU Setup for PAIGE

## Your Free HF GPU

HuggingFace provides **free GPU allocation** to all Pro members. You can use this to power PAIGE.

## Setup Steps

### 1. Get Your HF Token

Visit: https://huggingface.co/settings/tokens

- Click "New token"
- Select: **Read access** (for model downloads) + **Write access** (for inference)
- Name: "PAIGE-GPU"
- Copy the token

### 2. Add Token to PAIGE

Option A: Environment variable (temporary)
```bash
export HF_TOKEN="hf_YOUR_TOKEN_HERE"
```

Option B: Permanent (add to ~/.bashrc or ~/.zshrc)
```bash
echo 'export HF_TOKEN="hf_YOUR_TOKEN_HERE"' >> ~/.bashrc
source ~/.bashrc
```

### 3. Test GPU Integration

```bash
cd /home/hunt/Downloads/PAIGE
source venv/bin/activate
export HF_TOKEN="hf_YOUR_TOKEN_HERE"

python3 hf-gpu-integration.py status
python3 hf-gpu-integration.py auth
python3 hf-gpu-integration.py models
```

### 4. Setup Inference Model

Choose a model from the list:
```bash
python3 hf-gpu-integration.py setup mistralai/Mistral-7B-Instruct-v0.1
```

### 5. Test Inference

```bash
python3 hf-gpu-integration.py test "What is the capital of France?"
```

## What Models Can You Use?

Free tier best options:
- **Mistral-7B** (fast, good quality)
- **Llama-2-7B** (official Meta model)
- **Qwen-1.5-7B** (multilingual)
- **Nous-Hermes-2** (creative tasks)

Larger models (13B+) may hit rate limits on free tier.

## Integration with PAIGE

Once configured, PAIGE will:
1. Send requests to HF Inference API
2. Route through your free GPU
3. Return results to CRANE
4. Fall back to local compute if needed

## HF API Limits (Free Tier)

- **Inference API**: 100K requests/month (approximate)
- **Model serving**: Automatic scaling
- **Fine-tuning**: Available (limited)
- **Spaces**: Limited compute hours

## Monitoring Usage

Check at: https://huggingface.co/settings/billing/overview

## Integration in PAIGE Launcher

The launcher will automatically:
```bash
export HF_TOKEN="<from config>"
python3 hf-gpu-integration.py init
```

Then PAIGE can use HF GPU for:
- LLM inference
- Embeddings
- Model serving
- Fine-tuning

## Troubleshooting

**Token invalid error**: Regenerate token at https://huggingface.co/settings/tokens

**Rate limited**: You've hit free tier limit. Check usage or wait for reset.

**Connection refused**: HF API down (check https://status.huggingface.co)

**Inference timeout**: Model too large for free tier, try smaller model.

## Next Steps

1. Get your real HF token from https://huggingface.co/settings/tokens
2. Update PAIGE: `export HF_TOKEN="hf_YOUR_TOKEN"`
3. Run: `python3 hf-gpu-integration.py status`
4. Integrate into PAIGE launcher
