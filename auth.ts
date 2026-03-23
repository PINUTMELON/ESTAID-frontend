/**
 * [Auth 설정 파일]
 * 1. 역할: 로그인 방식(Credentials), 세션 관리, 핸들러(GET/POST) 생성
 * 2. 흐름: 
 * - 사용자가 로그인 시도 -> authorize() 함수 실행
 * - fetch를 통해 백엔드(현재는 MSW)와 통신하여 유저 정보 확인
 * - 인증 성공 시 유저 객체 반환 -> 세션 쿠키 생성
 */
import NextAuth, { User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "SpringServer",
      async authorize(credentials) {
        console.log(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
          method: "POST",
          body: JSON.stringify({
            username: credentials?.username,
            password: credentials?.password
          }),
          headers: { "Content-Type": "application/json" },
        });

        const json = await res.json();

        if (res.ok && json.success) {
          // data 필드 하위의 정보를 User 객체로 리턴
          return {
            id: json.data.userId,
            username: json.data.username,
            accessToken: json.data.accessToken
          } as User;
        }
        return null;
      },
    }),
  ],
});