# KD Motion Control V1

Transform static images into dynamic videos by transferring motion from reference videos. Powered by **Kling AI 2.6/3.0** motion control models.

![KD Motion Control](https://img.shields.io/badge/Kling_AI-2.6-ff4757?style=flat-square) ![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square) ![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square)

## Features

- **Motion Transfer** - Upload a character image + reference video, AI transfers the motion onto the character
- **Multiple AI Models** - Kling 2.6 Standard/Pro, Kling 3.0 Standard/Pro
- **Output Orientation** - Match video, 16:9, 9:16, 1:1
- **CFG Scale** - Control guidance strength (0-1)
- **Motion Prompt** - Optional text to guide the motion style
- **Generation History** - View and download all generated videos
- **Cloudinary Upload** - Efficient media upload via Cloudinary CDN
- **Multi-Provider** - Support for fal.ai and direct Kling API

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌────────────────┐
│   Frontend   │────▶│  Cloudinary  │     │  Kling AI API  │
│  (Next.js)   │     │   (Upload)   │     │  (fal.ai /     │
│              │     └─────────────┘     │   aimlapi)     │
│              │────────────────────────▶│                │
└─────────────┘                          └────────────────┘
       │                                         │
       │◀────────────── Poll Status ─────────────│
       │◀────────── Get Video URL ───────────────│
```

### Flow:
1. User uploads Character Image + Reference Video
2. Files uploaded to Cloudinary → get CDN URLs
3. Submit generation task to Kling AI (via fal.ai or direct)
4. Poll for completion
5. Download/view generated video

## Getting Started

### Prerequisites

- Node.js 18+ 
- Cloudinary account (free tier works)
- API key from [fal.ai](https://fal.ai) or [aimlapi.com](https://aimlapi.com)

### Setup

```bash
cd videotrans-app

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your Cloudinary credentials
# (API keys can be set via the Settings UI in the app)

# Run development server
npm run dev
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Or connect your GitHub repo to [Vercel](https://vercel.com) for auto-deploy.

## Configuration

### Cloudinary Setup

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. Go to Settings → Upload → Add upload preset
3. Set preset to **Unsigned**
4. Name it (e.g., `kd_motion_upload`)
5. Enter your Cloud Name and Preset in the app Settings

### API Provider Setup

#### Option A: fal.ai (Recommended)
1. Create account at [fal.ai](https://fal.ai)
2. Generate API key in Dashboard → Keys
3. Enter key in app Settings
4. Select "fal.ai" as provider

#### Option B: Kling Direct (via aimlapi.com)
1. Create account at [aimlapi.com](https://aimlapi.com)
2. Get API key
3. Enter in app Settings
4. Select "Kling Direct API" as provider

## API Reference

### POST /api/generate

Submit a motion control generation task.

```json
{
  "imageUrl": "https://res.cloudinary.com/.../image.jpg",
  "videoUrl": "https://res.cloudinary.com/.../video.mp4",
  "model": "kling-2.6-standard",
  "orientation": "match-video",
  "cfgScale": 0.5,
  "motionPrompt": "graceful dancing motion",
  "apiKey": "your-api-key",
  "apiProvider": "fal"
}
```

Response:
```json
{
  "taskId": "abc123",
  "status": "processing",
  "provider": "fal"
}
```

### GET /api/generate?taskId=xxx&apiKey=xxx&apiProvider=fal

Check generation status.

Response (completed):
```json
{
  "status": "completed",
  "videoUrl": "https://cdn.../generated-video.mp4"
}
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Media Upload**: Cloudinary (unsigned upload)
- **AI Model**: Kling AI 2.6/3.0 Motion Control
- **API Providers**: fal.ai, aimlapi.com
- **Deployment**: Vercel

## Cost Estimates

| Model | Provider | Cost per Second |
|-------|----------|----------------|
| Kling 2.6 Standard | fal.ai | ~$0.035/s |
| Kling 2.6 Pro | fal.ai | ~$0.07/s |
| Kling 3.0 Standard | evolink | ~$0.113/s |
| Kling 3.0 Pro | evolink | ~$0.15/s |

Typical 10-second video: $0.35 - $1.50

## License

MIT
