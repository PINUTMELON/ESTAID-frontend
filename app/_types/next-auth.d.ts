import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    username?: string;
  };
  interface User {
    accessToken?: string;
    username?: string;
  };
}