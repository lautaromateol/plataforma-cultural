import { Hono } from "hono";
import { handle } from "hono/vercel";
import withPrisma from "@/lib/prisma";
import auth from "@/features/auth/server/route";
import "./types.ts"

const app = new Hono().basePath("/api");

const routes = app.use("*", withPrisma).route("/auth", auth);

export type AppType = typeof routes;

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);