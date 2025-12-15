import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcryptjs from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import UserRole from '@/models/UserRole';
import Role from '@/models/Role';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                console.log("Authorize called with:", { email: credentials?.email });
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Invalid credentials');
                }

                await dbConnect();

                const user = await User.findOne({ email: credentials.email }).select('+password');

                if (!user || !user.password) {
                    throw new Error('Invalid credentials');
                }

                const isCorrectPassword = await bcryptjs.compare(
                    credentials.password,
                    user.password
                );

                if (!isCorrectPassword) {
                    throw new Error('Invalid credentials');
                }

                // Fetch all roles for the user
                const userRoles = await UserRole.find({ userId: user._id }).populate('roleId');
                const roleNames = userRoles.length > 0
                    ? userRoles.map((ur: any) => ur.roleId.name)
                    : ['viewer'];

                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: roleNames[0], // Primary role for backward compatibility
                    roles: roleNames, // All roles
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                console.log("JWT Callback - User logged in:", user.id);
                token.role = user.role;
                token.roles = user.roles;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            // console.log("Session Callback", { sessionUser: session.user, tokenId: token.id });
            if (session.user) {
                session.user.role = token.role as string;
                session.user.roles = token.roles as string[];
                session.user.id = token.id as string;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
