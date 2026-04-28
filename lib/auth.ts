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
