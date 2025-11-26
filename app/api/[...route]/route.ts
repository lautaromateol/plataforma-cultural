import { Hono } from "hono";
import { handle } from "hono/vercel";
import withPrisma from "@/lib/prisma";
import auth from "@/features/auth/server/route";
import year from "@/features/year/server/route.js";
import subject from "@/features/subject/server/route";
import course from "@/features/course/server/route";
import courseSubject from "@/features/course-subject/server/route";
import enrollment from "@/features/enrollment/server/route";
import user from "@/features/user/server/route";
import "./types.ts";

const app = new Hono().basePath("/api");

const routes = app
  .use("*", withPrisma)
  .route("/auth", auth)
  .route("/admin/academic-year", year)
  .route("/admin/subject", subject)
  .route("/admin/course", course)
  .route("/admin/course-subject", courseSubject)
  .route("/admin/enrollment", enrollment)
  .route("/admin/users", user);

export type AppType = typeof routes;

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
