import NextAuth, { Account, Profile, User, NextAuthOptions } from "next-auth"
import FacebookProvider from "next-auth/providers/facebook"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import DiscordProvider from "next-auth/providers/discord"
import TwitterProvider from "next-auth/providers/twitter"
import Auth0Provider from "next-auth/providers/auth0"
import CredentialsProvider from "next-auth/providers/credentials"
import { JWT } from "next-auth/jwt"
import { Adapter } from "next-auth/adapters"

import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/prisma"
import bcrypt from "bcryptjs"



export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Sign in",
            credentials: {
                email: {
                    label: "Email",
                    type: "text",
                },
                password: {
                    label: "Password",
                    type: "password",
                }
            },
            async authorize(credentials) {
                if(!credentials?.email  || !credentials?.password){
                    throw new Error("Email and password are required.")
                }
                
                const user = await prisma.user.findUnique({ where: { email: credentials!.email } })
                if (!user) {
                    throw new Error("These credentials do not match our record.")
                }
                const isMatch = await bcrypt.compare(credentials!.password, user.password)

                if (!isMatch) {
                    throw new Error("Password is incorrect.")
                }
                return user
            }
        }),
    ],
    session: {
        strategy: 'jwt'
    },
    pages:  {
        signIn: '/login',
    },
    callbacks: {
        session: ({ session, token }) => {
          console.log('Session Callback', { session, token })
          return {
            ...session,
            user: {
              ...session.user,
              id: token.id,
              randomKey: token.randomKey
            }
          }
        },
        jwt: ({ token, user }) => {
          console.log('JWT Callback', { token, user })
          if (user) {
            const u = user as unknown as any
            return {
              ...token,
              id: u.id,
              randomKey: u.randomKey
            }
          }
          return token
        }
      }
}


const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }


// export default NextAuth({
//     adapter: PrismaAdapter(prisma),
//     providers: [
//         CredentialsProvider({
//             name: "Credentials",
//             credentials: {
//                 email: {
//                     label: "Email",
//                     type: "text",
//                 },
//                 password: {
//                     label: "Password",
//                     type: "password",
//                 },
//             },
//             async authorize(credentials) {
//                 const user = await prisma.user.findUnique({ where: { email: credentials!.email } })
//                 if (!user) {
//                     throw new Error("These credentials do not match our record.")
//                 }
//                 const isMatch = await bcrypt.compare(credentials!.password, user.password)

//                 if (!isMatch) {
//                     throw new Error("Password is incorrect.")
//                 }
//                 return user
//             }
//         }),
//         GoogleProvider({
//             clientId: process.env.GOOGLE_CLIENT_ID as string,
//             clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
//         }),
//     ],
//     secret: process.env.NEXTAUTH_SECRET,
//     session: {
//         strategy: "jwt",
//     },
//     pages: {
//         signIn: "/login",
//     },
//     callbacks: {
//         async jwt({
//             token,
//             user,
//             account,
//             profile,
//             isNewUser
//         }: {
//             token: JWT
//             user?: User | Adapter | undefined
//             account?: Account | null | undefined
//             profile?: Profile | undefined
//             isNewUser?: boolean | undefined
//         }
//         ) {
//             if (user) {
//                 token.provider = account?.provider
//             }
//             return token
//         },
//         async session({ session, token }: { session: any; token: JWT }) {
//             if (session.user) {
//                 session.user.provider = token.provider
//             }
//             return session
//         }
//     }

// })
