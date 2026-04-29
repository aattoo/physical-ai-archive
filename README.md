# Physical AI Archive

2026년 4월 Physical AI 뉴스 아카이브. 매일 하나의 기사, Google 로그인, Supabase DB 연동.

**배포 URL:** https://physical-ai-archive.vercel.app

---

## 환경변수 설정 방법

### 1. Google OAuth 설정

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
3. Application type: **Web application**
4. Authorized redirect URIs에 추가:
   - `http://localhost:3000/api/auth/callback/google` (로컬 개발)
   - `https://physical-ai-archive.vercel.app/api/auth/callback/google` (프로덕션)
5. 생성된 **Client ID**와 **Client Secret**을 `.env.local`에 입력

### 2. Supabase 설정

1. [Supabase](https://supabase.com) → New Project 생성
2. **Settings → API**에서 아래 값 복사:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` key → `SUPABASE_SERVICE_ROLE_KEY`
3. **SQL Editor**에서 `supabase/schema.sql` 내용 실행

### 3. .env.local 파일 작성

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<openssl rand -base64 32 으로 생성>
GOOGLE_CLIENT_ID=<Google Cloud Console에서 발급>
GOOGLE_CLIENT_SECRET=<Google Cloud Console에서 발급>
NEXT_PUBLIC_SUPABASE_URL=<Supabase Project URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Supabase anon key>
SUPABASE_SERVICE_ROLE_KEY=<Supabase service_role key>
```

### 4. Vercel 환경변수 설정

```bash
export PATH="/opt/homebrew/bin:$PATH"
vercel env add GOOGLE_CLIENT_ID production
vercel env add GOOGLE_CLIENT_SECRET production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel --prod
```

---

## 로컬 개발

```bash
bun install
bun run dev
```

http://localhost:3000 에서 확인.

---

## 기술 스택

- **Framework:** Next.js 14 (App Router)
- **Auth:** NextAuth.js v4 + Google OAuth
- **DB:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS
- **Deploy:** Vercel
- **Package Manager:** Bun
