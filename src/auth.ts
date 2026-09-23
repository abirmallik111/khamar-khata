import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { db } from '@/db';
import { profiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || '5165554ca9d91627615dee993e9b545a9f69607f406b4cead67d5f72e4b83348',
  basePath: '/khamar_khata/api/auth',
  trustHost: true,
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const emailStr = (credentials.email as string).trim();
        const passStr = credentials.password as string;

        // Find profile by email or fallback to first default profile
        let [profile] = await db.select().from(profiles).where(eq(profiles.email, emailStr)).limit(1);

        if (!profile) {
          const existingProfiles = await db.select().from(profiles).limit(1);
          if (existingProfiles.length === 0) {
            const hashedPassword = await bcrypt.hash(passStr, 10);
            const [newProfile] = await db.insert(profiles).values({
              email: emailStr,
              name: 'Farm Admin',
              currency: 'BDT',
              passwordHash: hashedPassword
            }).returning();
            profile = newProfile;
          } else {
            profile = existingProfiles[0];
          }
        }

        // Initialize email or passwordHash if missing for existing migrated profiles
        if (!profile.passwordHash || !profile.email) {
          const hashedPassword = await bcrypt.hash(passStr, 10);
          await db.update(profiles)
            .set({
              email: profile.email || emailStr,
              passwordHash: profile.passwordHash || hashedPassword
            })
            .where(eq(profiles.id, profile.id));
          profile.email = profile.email || emailStr;
          profile.passwordHash = profile.passwordHash || hashedPassword;
        } else {
          const isValid = await bcrypt.compare(passStr, profile.passwordHash);
          if (!isValid) return null;
        }

        return {
          id: profile.id,
          name: profile.name,
          email: profile.email || emailStr
        };
      }
    })
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async session({ session, token }) {
      if (token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      let cleanUrl = url.replace('/khamar_khata/khamar_khata', '/khamar_khata');

      if (cleanUrl.startsWith('/')) {
        if (cleanUrl.startsWith('/khamar_khata')) {
          return cleanUrl;
        }
        return `/khamar_khata${cleanUrl}`;
      }
      return cleanUrl;
    }
  },
  pages: {
    signIn: '/login'
  }
});
