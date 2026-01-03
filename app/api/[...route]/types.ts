import type { PrismaClient } from "@/src/generated/prisma/client";

type AuthUser = {
  sub: string
  dni: string
  email: string
  role: string
  exp: number
}

declare module 'hono' {
  interface ContextVariableMap {
    prisma: PrismaClient
    user: AuthUser
  }
}
