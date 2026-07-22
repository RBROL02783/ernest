import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

function getUsers() {
  const raw = process.env.ERNEST_USERS ?? "";
  return raw
    .split("|")
    .filter(Boolean)
    .map((entry) => {
      const [email, hashedPassword, name] = entry.split(":");
      return { email, hashedPassword, name: name || email.split("@")[0] };
    });
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Ernest",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email@banca.ro" },
        password: { label: "Parolă", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const users = getUsers();
        const user = users.find(
          (u) => u.email.toLowerCase() === credentials.email.toLowerCase()
        );
        if (!user) return null;

        const valid = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );
        if (!valid) return null;

        return { id: user.email, email: user.email, name: user.name };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
