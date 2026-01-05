import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { InactiveAccountError, InvalidEmailPasswordError } from "./utils/error"
import { sendRequest } from "./utils/api"
import { IUser } from "./types/next-auth"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        username: {},
        password: {},
      },
      authorize: async (credentials) => {
        try {
          const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080').replace(/\/$/, '');
          const username = Array.isArray(credentials.username) ? credentials.username[0] : credentials.username || '';
          const password = Array.isArray(credentials.password) ? credentials.password[0] : credentials.password || '';
          
          if (!username || !password) {
            throw new InvalidEmailPasswordError()
          }
          
          const res = await sendRequest<IBackendRes<ILogin>>({
            method: "POST",
            url: `${backendUrl}/api/v1/auth/llogin`,
            body: {
              username,
              password
            }
          })
          console.log(">>> check res: ", res)
          if (res.statusCode === 201) {
            // return user object with their profile data

            return {
              _id: res.data?.user?._id,
              name: res.data?.user?.name,
              email: res.data?.user?.email,
              access_token: res.data?.access_token,
            };
          } else if (+res.statusCode === 401) {
            throw new InvalidEmailPasswordError()
          } else if (+res.statusCode === 400) {
            throw new InactiveAccountError()
          } else {
            const errorMessage = Array.isArray(res?.message) 
              ? res.message[0] 
              : (Array.isArray(res?.error) ? res.error[0] : (res?.message || res?.error || "Internal server error"))
            throw new Error(typeof errorMessage === 'string' ? errorMessage : "Internal server error")
          }
        } catch (error: any) {
          // Re-throw specific errors
          if (error instanceof InvalidEmailPasswordError || error instanceof InactiveAccountError) {
            throw error
          }
          // Handle network errors or other issues
          console.error("Auth error:", error)
          throw new Error(error?.message || "Không thể kết nối với server. Vui lòng thử lại sau.")
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) { // User is available during sign-in
        token.user = (user as IUser);
      }
      return token
    },
    session({ session, token }) {
      (session.user as IUser) = token.user;
      return session
    },
    authorized: async ({ auth }) => {
      // Logged in users are authenticated, 
      //otherwise redirect to login page
      return !!auth
    },
  },
})