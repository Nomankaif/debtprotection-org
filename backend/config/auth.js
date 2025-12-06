const { ExpressAuth } = require('@auth/express');
const GoogleProvider = require('@auth/express/providers/google').default;
const NodemailerProvider = require('@auth/express/providers/nodemailer').default;
const User = require('../models/User');
const { MongooseAdapter } = require('@brendon1555/authjs-mongoose-adapter');

const authConfig = {
  adapter: MongooseAdapter(process.env.MONGO_DB_URL),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    NodemailerProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await User.findOne({ email: user.email });
        if (dbUser) {
          token.role = dbUser.role;
          token.id = dbUser._id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  trustHost: true,
  debug: process.env.NODE_ENV === 'development',
};

module.exports = { authConfig, ExpressAuth };