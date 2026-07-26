# Contributing to AbroadShield AI

## Code Style

- **Language**: TypeScript (strict mode)
- **Formatter**: Prettier
- **Linter**: ESLint
- **Framework**: Next.js 16 (App Router)
- **UI**: Tailwind CSS + Framer Motion
- **Database**: Prisma ORM

## Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feat/your-feature-name
```

### 2. Make Changes

Follow these patterns:

#### API Routes
```typescript
// src/app/api/[route]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  // Your logic here
  return NextResponse.json({ ok: true, data: {} });
}
```

#### Components
```typescript
// src/components/MyComponent.tsx
'use client';

import { motion } from 'framer-motion';

export default function MyComponent() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="..."
    >
      {/* Content */}
    </motion.div>
  );
}
```

#### Services
```typescript
// src/services/myService/index.ts
export class MyService {
  async doSomething() {
    // Service logic
  }
}

export const myService = new MyService();
```

### 3. Test Locally

```bash
bun dev
# Test at http://localhost:3000
```

### 4. Run Linting

```bash
bun lint
# Fix issues
bun lint -- --fix
```

### 5. Commit & Push

```bash
git add .
git commit -m "feat: description of changes"
git push origin feat/your-feature-name
```

### 6. Create Pull Request

- Describe what changed and why
- Link related issues
- Request review

---

## File Structure

```
src/
├── app/                      # Next.js app router
│   ├── (authenticated)/      # Protected routes
│   │   ├── dashboard/        # Main dashboard
│   │   └── layout.tsx        # Auth check
│   ├── api/                  # API routes
│   │   ├── agent/            # Agent endpoints
│   │   └── auth/             # Auth endpoints
│   ├── auth/                 # Auth pages
│   ├── page.tsx              # Landing page
│   └── layout.tsx            # Root layout
├── components/               # React components
│   ├── agent/                # Agent UI components
│   ├── common/               # Shared components
│   └── ...
├── services/                 # Business logic
│   ├── agent/                # Agent orchestrator & workers
│   ├── llm/                  # LLM integrations
│   └── ...
├── lib/                      # Utilities
│   ├── auth.ts               # NextAuth config
│   ├── prisma.ts             # Prisma client
│   └── ...
└── styles/                   # Global styles
```

---

## Common Tasks

### Add New API Endpoint

1. Create file: `src/app/api/your-endpoint/route.ts`
2. Export GET/POST/PATCH/DELETE functions
3. Test with curl or Postman

### Add New Database Model

1. Edit `prisma/schema.prisma`
2. Run `bun db:migrate -- --name "description"`
3. Prisma client auto-updates

### Add New Component

1. Create file: `src/components/YourComponent.tsx`
2. Use `'use client'` if it needs state/events
3. Use Framer Motion for animations
4. Import and use in your page

### Add New Worker

1. Create file: `src/services/agent/workers/yourWorker.ts`
2. Export a class with `async execute()` method
3. Register in orchestrator

---

## Testing

### Manual Testing

```bash
# 1. Start dev server
bun dev

# 2. Create test account
# Sign up at http://localhost:3000/auth/signup

# 3. Test features
# - Configure goals
# - Run agent
# - Approve/decline drafts
# - Check stats
```

### Database Testing

```bash
# Open Prisma Studio
bun db:studio

# View all data, create test records, etc.
```

### API Testing

```bash
# Get auth token from browser cookies or:
curl -X POST http://localhost:3000/api/auth/callback/credentials \
  -d '{"email": "test@example.com", "password": "testpass123"}'

# Test endpoints
curl http://localhost:3000/api/agent/drafts
curl -X POST http://localhost:3000/api/agent/run
```

---

## Performance

### Optimization Tips

1. **API calls**: Cache where possible, use React Query
2. **Database**: Add indexes on frequently queried columns
3. **LLM calls**: Batch requests, cache responses
4. **Frontend**: Lazy load components, memoize expensive renders

### Monitoring

Add to production:
- Sentry for error tracking
- LogRocket for session replay
- New Relic or DataDog for APM

---

## Security

### Best Practices

1. **Authentication**: NextAuth.js (production-ready)
2. **Secrets**: Never commit `.env.local`
3. **API**: Always verify session
4. **Database**: Use Prisma (prevents SQL injection)
5. **Passwords**: Hash with bcrypt

### Security Checklist

- [ ] No secrets in code
- [ ] HTTPS in production
- [ ] CORS configured
- [ ] Rate limiting on APIs
- [ ] Input validation
- [ ] SQL injection prevention (Prisma)
- [ ] XSS prevention (React auto-escapes)

---

## Release Process

1. **Version Bump**: Update `package.json`
2. **Changelog**: Document changes
3. **Merge**: PR → main branch
4. **Deploy**: Automatic on Vercel
5. **Monitor**: Check error rates

---

## Questions?

Open an issue or reach out to the team!
