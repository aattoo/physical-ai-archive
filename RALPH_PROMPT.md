# Physical AI Archive — Full Production Setup

## 목표
/Users/a4121/Desktop/physical-ai-archive 프로젝트에 아래 세 가지를 완성하라:
1. Google OAuth 로그인 (NextAuth.js)
2. Supabase 데이터베이스 연결 (유저 저장 + 기사 조회 기록)
3. Vercel 웹 호스팅 배포

완료 조건: 배포된 Vercel URL에서 Google 로그인이 실제로 작동하고,
Supabase DB에 유저 데이터가 저장되면 <promise>PRODUCTION LIVE</promise> 출력.

---

## STEP 1 — 사전 준비 확인

먼저 아래를 순서대로 확인하라:

### 1-1. 필요한 CLI 도구 확인
```bash
which vercel || /Users/a4121/.bun/bin/bun x vercel --version
which gh || echo "gh not found"
```

### 1-2. .env.local 파일 존재 여부 확인
```bash
ls /Users/a4121/Desktop/physical-ai-archive/.env.local 2>/dev/null || echo "NO ENV FILE"
```

.env.local이 없으면 아래 내용으로 생성하라:
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### 1-3. 환경변수 상태 확인
.env.local의 값들이 비어있는지 확인하고, 비어있으면 README에 설정 방법을 안내하라.

---

## STEP 2 — 패키지 설치

아래 패키지를 추가 설치하라:
```bash
cd /Users/a4121/Desktop/physical-ai-archive
/Users/a4121/.bun/bin/bun add next-auth @supabase/supabase-js
/Users/a4121/.bun/bin/bun add -d @types/node
```

---

## STEP 3 — Supabase 타입 및 클라이언트 설정

### 3-1. types/database.ts 생성
```typescript
export type Database = {
  public: {
    Tables: {
      users: {
        Row: { id: string; email: string; name: string | null; avatar_url: string | null; created_at: string }
        Insert: { id: string; email: string; name?: string | null; avatar_url?: string | null }
        Update: { name?: string | null; avatar_url?: string | null }
        Relationships: []
      }
      article_views: {
        Row: { id: string; user_id: string; article_date: string; viewed_at: string }
        Insert: { user_id: string; article_date: string }
        Update: never
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
```

### 3-2. lib/supabase.ts 생성
```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export function getSupabase() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export function getSupabaseAdmin() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
```

### 3-3. supabase/schema.sql 업데이트
```sql
-- 유저 테이블
create table if not exists public.users (
  id text primary key,
  email text not null unique,
  name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- 기사 조회 기록 테이블
create table if not exists public.article_views (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users(id) on delete cascade,
  article_date text not null,
  viewed_at timestamptz not null default now()
);

-- RLS
alter table public.users enable row level security;
alter table public.article_views enable row level security;

create policy "service role full access users" on public.users for all using (true);
create policy "service role full access views" on public.article_views for all using (true);

create index if not exists article_views_user_id_idx on public.article_views(user_id);
create index if not exists article_views_article_date_idx on public.article_views(article_date);
```

---

## STEP 4 — NextAuth 설정

### 4-1. types/next-auth.d.ts 생성
```typescript
import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}
```

### 4-2. lib/auth.ts 생성
```typescript
import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false
      try {
        const { getSupabaseAdmin } = await import('@/lib/supabase')
        await getSupabaseAdmin().from('users').upsert(
          { id: user.id, email: user.email, name: user.name ?? null, avatar_url: user.image ?? null },
          { onConflict: 'id' }
        )
      } catch (e) {
        console.error('Supabase upsert error:', e)
      }
      return true
    },
    async session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub
      return session
    },
    async jwt({ token, user }) {
      if (user) token.sub = user.id
      return token
    },
  },
  pages: { signIn: '/' },
  secret: process.env.NEXTAUTH_SECRET,
}
```

### 4-3. app/api/auth/[...nextauth]/route.ts 생성
디렉토리: app/api/auth/[...nextauth]/
```typescript
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'
const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

### 4-4. components/Providers.tsx 생성
```typescript
'use client'
import { SessionProvider } from 'next-auth/react'
export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
```

---

## STEP 5 — UI 업데이트

### 5-1. app/layout.tsx 업데이트
Providers로 감싸야 함:
```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Physical AI Archive',
  description: 'Daily archive of Physical AI news — April 2026',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

### 5-2. components/Header.tsx 생성 (로그인 버튼 포함)
```typescript
'use client'
import { signIn, signOut, useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'

export function Header() {
  const { data: session, status } = useSession()
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <Link href="/" className="font-bold text-gray-900 text-lg">Physical AI Archive</Link>
      <div>
        {status === 'loading' ? (
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
        ) : session ? (
          <div className="flex items-center gap-3">
            {session.user.image && (
              <Image src={session.user.image} alt="avatar" width={32} height={32} className="rounded-full" />
            )}
            <span className="text-sm text-gray-700 hidden sm:block">{session.user.name}</span>
            <button
              onClick={() => signOut()}
              className="text-sm text-red-500 hover:text-red-700 border border-red-200 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <button
            onClick={() => signIn('google')}
            className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google로 로그인
          </button>
        )}
      </div>
    </header>
  )
}
```

### 5-3. app/page.tsx 업데이트
Header 컴포넌트를 상단에 추가하라. 기존 달력 및 기사 목록 코드는 유지.

### 5-4. app/article/[date]/page.tsx 업데이트
Header 컴포넌트를 상단에 추가하라. 기존 기사 상세 코드는 유지.

---

## STEP 6 — NEXTAUTH_SECRET 생성

.env.local에 NEXTAUTH_SECRET이 비어있으면 아래로 생성:
```bash
openssl rand -base64 32
```
생성된 값을 .env.local의 NEXTAUTH_SECRET에 저장.

---

## STEP 7 — 빌드 검증

```bash
cd /Users/a4121/Desktop/physical-ai-archive
/Users/a4121/.bun/bin/bun x tsc --noEmit
/Users/a4121/.bun/bin/bun run build
```

빌드 에러가 있으면 수정하고 다시 빌드.

---

## STEP 8 — Vercel 배포

### 8-1. Vercel CLI 설치 확인
```bash
/Users/a4121/.bun/bin/bun x vercel --version 2>/dev/null || /Users/a4121/.bun/bin/bun add -g vercel
```

### 8-2. vercel.json 생성
```json
{
  "framework": "nextjs",
  "buildCommand": "bun run build",
  "installCommand": "bun install"
}
```

### 8-3. .gitignore 확인/생성
아래 내용이 포함되어야 함:
```
.env.local
.env*.local
node_modules/
.next/
```

### 8-4. Git 초기화 및 커밋
```bash
cd /Users/a4121/Desktop/physical-ai-archive
git init
git add -A
git commit -m "feat: Physical AI Archive with Google OAuth and Supabase"
```

### 8-5. Vercel 배포
```bash
cd /Users/a4121/Desktop/physical-ai-archive
/Users/a4121/.bun/bin/bun x vercel --yes 2>&1
```

배포 성공시 URL이 출력됨. 출력된 URL을 기록하라.

### 8-6. Vercel 환경변수 설정
.env.local의 값들을 Vercel 프로젝트에 추가:
```bash
cd /Users/a4121/Desktop/physical-ai-archive
/Users/a4121/.bun/bin/bun x vercel env add NEXTAUTH_SECRET production
/Users/a4121/.bun/bin/bun x vercel env add NEXTAUTH_URL production
/Users/a4121/.bun/bin/bun x vercel env add GOOGLE_CLIENT_ID production
/Users/a4121/.bun/bin/bun x vercel env add GOOGLE_CLIENT_SECRET production
/Users/a4121/.bun/bin/bun x vercel env add NEXT_PUBLIC_SUPABASE_URL production
/Users/a4121/.bun/bin/bun x vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
/Users/a4121/.bun/bin/bun x vercel env add SUPABASE_SERVICE_ROLE_KEY production
```

### 8-7. 프로덕션 배포
```bash
cd /Users/a4121/Desktop/physical-ai-archive
/Users/a4121/.bun/bin/bun x vercel --prod --yes 2>&1
```

---

## STEP 9 — 검증

### 9-1. 로컬 테스트
```bash
cd /Users/a4121/Desktop/physical-ai-archive
/Users/a4121/.bun/bin/bun run dev &
sleep 3
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```
200이면 로컬 OK.

### 9-2. 배포 URL 테스트
Vercel 배포 URL에 curl:
```bash
curl -s -o /dev/null -w "%{http_code}" <VERCEL_URL>
```
200이면 배포 OK.

---

## 완료 조건 체크리스트

아래를 모두 확인한 후 promise 출력:
- [ ] bun run build 성공
- [ ] /Users/a4121/Desktop/physical-ai-archive/.env.local 파일 존재
- [ ] app/api/auth/[...nextauth]/route.ts 파일 존재
- [ ] components/Header.tsx (Google 로그인 버튼 포함) 존재
- [ ] lib/auth.ts 존재
- [ ] Vercel 배포 URL에서 HTTP 200 응답
- [ ] supabase/schema.sql 존재 (Supabase 대시보드에서 실행 필요 안내)

모든 조건이 충족되면:
<promise>PRODUCTION LIVE</promise>

---

## 중요 안내

환경변수 값이 비어있어서 Google 로그인이나 Supabase가 실제로 동작하지 않더라도,
코드 구조와 배포 자체가 완성되면 promise를 출력해도 됨.
실제 OAuth 키와 Supabase 키는 사용자가 직접 발급받아 .env.local에 입력해야 함.
README.md에 발급 방법을 안내하라.
