# AbroadShield AI v2 - Setup & Deployment Guide

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Node.js 18+ and Bun (or npm)
- SQLite (included with Node)
- Git

### 1. Clone & Install

```bash
git clone https://github.com/Richard-777-G/abroadshield-ai.git
cd abroadshield-ai
git checkout feat/agent-system-v2

# Install dependencies
bun install
# or
npm install
```

### 2. Setup Environment Variables

```bash
# Copy example file
cp .env.example .env.local

# Edit with your values
nano .env.local
```

**Minimal setup** (to get running immediately):
```env
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="your-random-secret-key-min-32-chars-generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
```

**Generate NEXTAUTH_SECRET**:
```bash
openssl rand -base64 32
```

### 3. Initialize Database

```bash
# Generate Prisma client
bun db:generate
# or
npx prisma generate

# Push schema to database
bun db:push
# or
npx prisma db push
```

### 4. Setup LLM (Choose One)

#### Option A: Ollama (Recommended for Beta)

```bash
# 1. Install Ollama from https://ollama.ai

# 2. Download a model
ollama pull mistral  # Fast, good quality (~2GB)
# or
ollama pull neural-chat  # Better for conversations

# 3. Start Ollama service
ollama serve
# Runs on http://localhost:11434 (default)

# 4. Add to .env.local
OLLAMA_ENDPOINT="http://localhost:11434"
OLLAMA_MODEL="mistral"
```

#### Option B: OpenAI (Production)

```bash
# 1. Get API key from https://platform.openai.com/api-keys

# 2. Add to .env.local
OPENAI_API_KEY="sk-..."
OPENAI_MODEL="gpt-3.5-turbo"
```

### 5. Run Development Server

```bash
bun dev
# or
npm run dev
```

Open http://localhost:3000 → You should see the login page

---

## 🔐 First Time Setup

### Create a Test Account

1. Go to http://localhost:3000
2. Click "Sign up here"
3. Enter:
   - Name: `Test Student`
   - Email: `test@example.com`
   - Password: `testpass123` (min 8 chars)
4. Click "Create Account"
5. You'll be auto-signed in and redirected to dashboard

### Configure Agent Goals

Once logged in:

1. Click the **"Goals"** tab
2. Enable **"Agent should hunt for jobs"**
3. Fill in:
   - **Target Sectors**: `fintech, AI, technology`
   - **Target Roles**: `Software Engineer, Product Manager`
   - **Target Locations**: `London, Manchester`
4. Click **"Save Goals"**
5. Go back to **"Drafts"** tab
6. Click **"Run Agent Now"** button

### What Happens Next

The agent will:
1. Search job boards (LinkedIn, Lever, Indeed, AngelList)
2. Generate tailored CVs and cover letters
3. Stage them as drafts for your approval
4. Wait for you to approve/edit/decline each one

---

## 📊 Understanding the Dashboard

### Tabs

#### 1. **Drafts** (Default)
- View all pending agent actions
- Approve, edit, or decline each draft
- See preview of generated content
- Track status: `Drafted → Approved → Executing → Completed`

#### 2. **Goals**
- Configure what the agent should do
- Set job search preferences
- Enable/disable networking
- Change journey phase (pre-departure, arrival, studying, job_success)

#### 3. **Stats**
- Approval rate, success rate
- Total jobs applied
- Activity breakdown
- Performance metrics

#### 4. **Settings**
- Notification preferences
- Agent behavior (run frequency, max drafts per run)

---

## 🔧 Development Tips

### View Database

```bash
# Open Prisma Studio (GUI for database)
bun db:studio
# or
npx prisma studio
# Opens http://localhost:5555
```

Here you can:
- View all users, tasks, jobs, contacts
- Edit data directly
- Test relationships

### Check Logs

Agent logs are printed to console:
```
🤖 Agent Orchestrator: Starting loop for user user_123
📋 User phase: job_success
🔍 Job Worker: Starting hunt for user user_123
📚 Found 15 matching jobs
✅ Drafted job application: Software Engineer @ Stripe
...
```

### Test API Endpoints

```bash
# Get drafts
curl http://localhost:3000/api/agent/drafts \
  -H "Authorization: Bearer YOUR_SESSION"

# Get agent memory
curl http://localhost:3000/api/agent/memory \
  -H "Authorization: Bearer YOUR_SESSION"

# Run agent manually
curl -X POST http://localhost:3000/api/agent/run \
  -H "Authorization: Bearer YOUR_SESSION"
```

---

## 🚀 Deployment (Production)

### Deploy to Vercel (Recommended)

```bash
# 1. Push to GitHub
git add .
git commit -m "feat: agent system v2"
git push origin feat/agent-system-v2

# 2. Go to https://vercel.com/new
# 3. Import repository
# 4. Set environment variables in dashboard:
DATABASE_URL="your-postgresql-url"
NEXTAUTH_SECRET="generate-new-one"
NEXTAUTH_URL="https://yourdomain.vercel.app"
OPENAI_API_KEY="sk-..."

# 5. Deploy
```

### Deploy to Railway/Render/Heroku

Similar process:
1. Connect Git repo
2. Set environment variables
3. Set build command: `bun install && bun db:push`
4. Set start command: `bun start`
5. Deploy

### Production Checklist

- [ ] Switch from SQLite to PostgreSQL
- [ ] Use OpenAI or Claude (Ollama won't work on serverless)
- [ ] Set `NEXTAUTH_URL` to production domain
- [ ] Generate new `NEXTAUTH_SECRET` with `openssl rand -base64 32`
- [ ] Enable CORS for job board APIs
- [ ] Setup email notifications (SendGrid, Mailgun)
- [ ] Add monitoring (Sentry, LogRocket)
- [ ] Setup CDN for static assets

---

## 🐛 Troubleshooting

### "Cannot find module @/lib/prisma"

```bash
bun db:generate
npm run build
```

### "Ollama connection refused"

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If not, start it:
ollama serve

# Or download a model:
ollama pull mistral
```

### "NextAuth session not persisting"

- Check `NEXTAUTH_SECRET` is set (min 32 chars)
- Check `NEXTAUTH_URL` matches your domain
- Clear browser cookies
- Check database connection

### Database locked (SQLite)

```bash
# Reset database
rm prisma/dev.db
bun db:push
```

---

## 📚 Next Steps

### For Beta Testing (7 Students)

1. **Week 1**: Setup on local machine
2. **Week 2**: Invite 7 beta testers
3. **Week 3**: Collect feedback
4. **Week 4**: Iterate based on feedback

### Feature Roadmap

- [ ] **Week 1-2**: Job hunting & networking (CURRENT)
- [ ] **Week 3-4**: Housing worker + integration
- [ ] **Week 5-6**: Visa tracking + banking
- [ ] **Week 7-8**: Real LinkedIn/Indeed APIs
- [ ] **Week 9-10**: Mobile app (React Native)
- [ ] **Week 11-12**: Analytics dashboard

### Integration Checklist

**Job Boards**:
- [ ] LinkedIn API (needs enterprise)
- [ ] Lever API (free, widely available)
- [ ] Indeed API (RapidAPI)
- [ ] AngelList API (public)

**Networking**:
- [ ] Alumni network scraping
- [ ] Company HR finder
- [ ] LinkedIn 2nd-degree connections

**Housing**:
- [ ] SpareRoom API
- [ ] Rightmove scraping
- [ ] OpenRent API

---

## 💬 Support

- **Issues**: Create issue on GitHub
- **Questions**: Start a discussion
- **Feature requests**: Email support@abroadshield.ai

---

## 📝 Architecture Notes

### How the Agent Works

```
┌─────────────────────────┐
│   Student Logs In       │
│   Sets Goals            │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  Agent Orchestrator     │ (runs every 6 hours or on-demand)
│  - Reads goals          │
│  - Checks phase         │
│  - Activates workers    │
└────────────┬────────────┘
             │
        ┌────┼────┐
        ▼    ▼    ▼
    ┌──────────────────────┐
    │  Job   │ Network │   │
    │ Worker │ Worker  │...
    └──────────────────────┘
        │    │    │
        ▼    ▼    ▼
    ┌──────────────────────┐
    │  Generate Drafts     │
    │  with LLM            │
    │  (CV, Cover, Msg)    │
    └─────────┬────────────┘
              │
              ▼
    ┌──────────────────────┐
    │  Student Reviews     │
    │  & Approves Drafts   │
    └─────────┬────────────┘
              │
              ▼
    ┌──────────────────────┐
    │  Execute Actions     │
    │  Send/Apply/Contact  │
    │  Track Results       │
    └──────────────────────┘
```

### Database Schema

**Core Tables**:
- `User` - Student profiles
- `AgentMemory` - What the agent knows about the student
- `AgentTask` - Pending drafts & completed actions

**Job System**:
- `JobListing` - Available jobs (cached)
- `AppliedJob` - Application history

**Networking**:
- `NetworkTarget` - People to contact (cache)
- `NetworkContact` - Contact history & engagement

**Housing**:
- `HousingListing` - Available properties
- `HousingInquiry` - Inquiries sent & responses

---

## 🎯 Success Metrics

Track these KPIs:

1. **Agent Activity**
   - Drafts generated per week
   - Approval rate (% of drafts approved)
   - Execution rate (% of approved actually sent)

2. **Student Outcomes**
   - Jobs applied per student
   - Networking connections made
   - Housing inquiries sent
   - Response rates

3. **Platform Health**
   - API response times
   - Error rates
   - LLM generation time
   - Database query performance

---

**Ready to build the future of student opportunity discovery!** 🚀
