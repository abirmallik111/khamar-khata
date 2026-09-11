import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { db } from '@/db';
import { profiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export const { handlers, signIn, signOut, auth } = NextAuth({
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

        const emailStr = credentials.email as string;
        const passStr = credentials.password as string;

        // Find profile by email or fallback to first default profile for single-tenant local deploy
        let [profile] = await db.select().from(profiles).where(eq(profiles.email, emailStr)).limit(1);

        if (!profile) {
          // If no profile exists, check total profiles. If database is brand new, seed initial user profile.
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
            // For single-user farm deployment, assign existing profile
            profile = existingProfiles[0];
          }
        } else if (profile.passwordHash) {
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
    }
  },
  pages: {
    signIn: '/login'
  }
});
