# AI Chatbot Template - Quick Start Guide

## What's Included

```
ai-chatbot-template/
├── app/                      # Next.js app directory
│   ├── page.js             # Landing page
│   ├── chat/page.js        # Chat interface
│   ├── layout.js           # Root layout
│   └── globals.css         # Global styles
├── api/
│   └── chat.js             # Chat API routes
├── lib/
│   ├── db.js               # PostgreSQL setup
│   └── redis.js            # Redis setup & rate limiting
├── server.js               # Express server
├── next.config.js          # Next.js config
├── tailwind.config.js      # Tailwind CSS config
├── package.json            # Dependencies
├── railway.json            # Railway template config
├── .env.example            # Environment variables template
└── README.md               # Full documentation
```

## 3-Step Setup

### Step 1: Install & Configure
```bash
npm install
cp .env.example .env.local
# Edit .env.local and add OPENAI_API_KEY
```

### Step 2: Start Local Services
```bash
# Terminal 1 - PostgreSQL
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:15

# Terminal 2 - Redis
docker run -d -p 6379:6379 redis:latest

# Terminal 3 - Dev server
npm run dev
```

### Step 3: Test
- Open http://localhost:3000
- Click "Start Chat"
- Send a message → Chatbot responds with streaming

## What to Customize

### 1. System Prompt
**File:** `api/chat.js`
```javascript
const SYSTEM_PROMPT = `You are a helpful customer support assistant...`;
```

### 2. Colors & Branding
**File:** `app/page.js` and `app/chat/page.js`
- Change colors in Tailwind classes
- Update logo/favicon

### 3. Rate Limits
**File:** `lib/redis.js`
```javascript
const limit = 10;    // 10 messages
const window = 60;   // per 60 seconds
```

### 4. Database
**File:** `lib/db.js`
- Add custom tables
- Add analytics tracking

## Deployment to Railway

### Quick Deploy (Recommended)
1. Push to GitHub (public repo)
2. Go to https://railway.app
3. New Project → GitHub Repo
4. Railway auto-detects and deploys
5. Add `OPENAI_API_KEY` environment variable
6. Done! ✅

### Manual Steps
```bash
npm install -g @railway/cli
railway init
railway up
```

## Key Files to Understand

| File | Purpose |
|------|---------|
| `server.js` | Express server, connects Next.js + API |
| `api/chat.js` | Chat endpoint, calls OpenAI, stores messages |
| `lib/db.js` | PostgreSQL connection & table setup |
| `lib/redis.js` | Redis cache & rate limiting |
| `app/chat/page.js` | React chat UI component |

## How It Works

1. **User sends message** → Chat UI (app/chat/page.js)
2. **API call** → `/api/chat/message` (api/chat.js)
3. **Rate limit check** → Redis (lib/redis.js)
4. **Store user message** → PostgreSQL (lib/db.js)
5. **Call OpenAI** → Stream response back
6. **Store assistant message** → PostgreSQL
7. **Display in UI** → Real-time streaming effect

## Common Issues

**"Cannot find module 'openai'"**
```bash
npm install
```

**"Database connection failed"**
- Is PostgreSQL running? Check `docker ps`
- Is PGPASSWORD correct in .env.local?

**"OpenAI API Error"**
- Check OPENAI_API_KEY is valid
- Check you have API credits (platform.openai.com)

**"Rate limit exceeded"**
- That's working! Test with a different session
- Adjust limits in lib/redis.js

## Next Steps

✅ Get it running locally  
✅ Deploy to Railway  
✅ Add custom system prompt  
✅ Customize colors  
✅ Publish to Railway Templates Marketplace  
✅ Start earning revenue!

## Resources

- OpenAI Docs: https://platform.openai.com/docs
- Railway Docs: https://docs.railway.app
- Next.js Docs: https://nextjs.org/docs
- Tailwind CSS: https://tailwindcss.com/docs

---

**Questions?** Check README.md or GitHub Issues.
