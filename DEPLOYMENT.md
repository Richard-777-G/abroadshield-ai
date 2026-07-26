# Deployment Configuration

## Environment Setup

### .env.local (Development)

```bash
# Database
DATABASE_URL="file:./prisma/dev.db"

# Auth
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# OAuth (Optional, for local testing)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_ID=""
GITHUB_SECRET=""

# LLM (Choose one)
OLLAMA_ENDPOINT="http://localhost:11434"
OLLAMA_MODEL="mistral"
# OR
# OPENAI_API_KEY="sk-..."
```

### Production (.env.production)

```bash
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/db"

# Auth
NEXTAUTH_SECRET="generate-new-secret"
NEXTAUTH_URL="https://yourdomain.com"

# OAuth
GOOGLE_CLIENT_ID="from Google Cloud Console"
GOOGLE_CLIENT_SECRET="from Google Cloud Console"
GITHUB_ID="from GitHub Settings"
GITHUB_SECRET="from GitHub Settings"

# LLM (Production = OpenAI/Claude)
OPENAI_API_KEY="sk-..."
OPENAI_MODEL="gpt-3.5-turbo"

# Optional Services
SENDGRID_API_KEY="SG..."
SMTPHOST="smtp.sendgrid.net"
```

## Vercel Deployment

### Step 1: Connect Repository

```bash
# Push to GitHub
git push origin feat/agent-system-v2

# Go to https://vercel.com/new
# Import the repository
```

### Step 2: Configure Environment

In Vercel Dashboard → Settings → Environment Variables, add:

```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=<generated value>
NEXTAUTH_URL=https://<your-domain>.vercel.app
OPENAI_API_KEY=sk-...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_ID=...
GITHUB_SECRET=...
```

### Step 3: Build Settings

- **Framework**: Next.js
- **Build Command**: `bun install && bun db:push && bun build`
- **Output Directory**: `.next`
- **Install Command**: `bun install`

### Step 4: Deploy

Click "Deploy" - automatically redeploys on Git push

---

## Docker Deployment

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install Bun
COPY . .
RUN npm install -g bun

# Install dependencies
RUN bun install --frozen-lockfile

# Generate Prisma
RUN bunx prisma generate

# Build
RUN bun run build

# Expose port
EXPOSE 3000

# Start
CMD ["bun", "start"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: abroadshield
      POSTGRES_PASSWORD: secure_password
      POSTGRES_DB: abroadshield
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  app:
    build: .
    environment:
      DATABASE_URL: postgresql://abroadshield:secure_password@db:5432/abroadshield
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      NEXTAUTH_URL: http://localhost:3000
      OPENAI_API_KEY: ${OPENAI_API_KEY}
    ports:
      - "3000:3000"
    depends_on:
      - db

volumes:
  postgres_data:
```

### Deploy with Docker

```bash
# Build image
docker build -t abroadshield .

# Run with Docker Compose
docker-compose up -d

# Check logs
docker-compose logs -f app
```

---

## Railway Deployment

1. **Connect Repository**: https://railway.app/new
2. **Select**: GitHub repo
3. **Add Plugin**: PostgreSQL
4. **Environment Variables**:
   - `DATABASE_URL` (auto-set by Railway)
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `OPENAI_API_KEY`
5. **Deploy Command**: `bun install && bun db:push && bun build`
6. **Start Command**: `bun start`

---

## Heroku Deployment

```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create abroadshield-ai

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev -a abroadshield-ai

# Set environment variables
heroku config:set NEXTAUTH_SECRET=<value> -a abroadshield-ai
heroku config:set NEXTAUTH_URL=https://abroadshield-ai.herokuapp.com -a abroadshield-ai
heroku config:set OPENAI_API_KEY=sk-... -a abroadshield-ai

# Deploy
git push heroku main

# View logs
heroku logs -f
```

---

## Production Checklist

### Before Going Live

- [ ] Switch from SQLite to PostgreSQL
- [ ] Use OpenAI/Claude (not Ollama)
- [ ] Generate new `NEXTAUTH_SECRET`
- [ ] Set `NEXTAUTH_URL` to production domain
- [ ] Enable HTTPS
- [ ] Setup CORS properly
- [ ] Enable logging/monitoring
- [ ] Setup backups
- [ ] Test login flow
- [ ] Test agent execution
- [ ] Load test

### Monitoring & Maintenance

```bash
# View error logs
heroku logs --tail

# Check database
heroku pg:info

# Take backup
heroku pg:backups:capture

# Restart app
heroku restart
```

### Scaling

When you need to handle more students:

1. **Dynos**: Upgrade from "Hobby" to "Standard"
2. **Database**: Upgrade PostgreSQL tier
3. **Cache**: Add Redis for session store
4. **CDN**: Use Cloudflare for static assets
5. **Queue**: Add Bull for background jobs

---

## Performance Optimization

### CDN

```bash
# Setup Cloudflare
# 1. Go to https://cloudflare.com
# 2. Add your domain
# 3. Update DNS nameservers
# 4. Enable caching rules
```

### Database Optimization

```sql
-- Add indexes
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_agent_task_user ON "AgentTask"(userId, status);
CREATE INDEX idx_applied_job_user ON "AppliedJob"(userId, status);
```

### API Caching

```typescript
// Add Cache-Control headers
export async function GET(req: NextRequest) {
  const response = NextResponse.json({ data: {} });
  response.headers.set('Cache-Control', 'public, max-age=300'); // 5 min
  return response;
}
```

---

## Disaster Recovery

### Backup Strategy

```bash
# Daily backups
# Automated via Heroku/Railway/Vercel

# Manual backup
heroku pg:backups:capture -a abroadshield-ai
```

### Restore

```bash
# List backups
heroku pg:backups -a abroadshield-ai

# Restore
heroku pg:backups:restore 'backup_id' -a abroadshield-ai
```

---

## Cost Estimates

### Monthly Costs (for 100 students)

| Service | Cost | Notes |
|---------|------|-------|
| Vercel | $0 | Free tier sufficient |
| PostgreSQL | $15 | Standard tier |
| OpenAI API | $100 | ~$1 per student |
| SendGrid (email) | $10 | 100 emails/day |
| **Total** | **$125/mo** | Can reduce with Ollama |

### Cost Reduction Tips

1. **Use Ollama instead of OpenAI**: Save $100/mo
2. **Shared hosting**: Use Railway ($5/mo per dyno)
3. **Free tier PostgreSQL**: Railway offers 20GB free
4. **Self-host**: Digital Ocean Droplet ($5-25/mo)

---

## Troubleshooting

### "Build failed"

```bash
# Clear build cache and retry
vercel env pull  # Get latest env vars
vercel build     # Rebuild locally
```

### "Database connection failed"

```bash
# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL
```

### "Out of memory"

Upgrade to larger dyno or add more workers

---

**Your platform is ready for production!** 🚀
