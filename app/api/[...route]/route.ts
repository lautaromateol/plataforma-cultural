import { Hono } from "hono";
import { handle } from "hono/vercel";
import withPrisma from "@/lib/prisma";
import auth from "@/features/auth/server/route";
import year from "@/features/year/server/route";
import subject from "@/features/subject/server/route";
import course from "@/features/course/server/route";
import courseSubject from "@/features/course-subject/server/route";
import enrollment from "@/features/enrollment/server/route";
import user from "@/features/user/server/route";
import campus from "@/features/campus/server/route";
import subjectResource from "@/features/subject-resource/server/route";
import subjectInfo from "@/features/subject-resource/server/subject-route";
import quiz from "@/features/quiz/server/route";
import assignment from "@/features/assignment/server/route";
import notification from "@/features/notification/server/route";
import "./types.ts";

const app = new Hono().basePath("/api")
  .use("*", withPrisma)
  .route("/auth", auth)
  .route("/campus", campus)
  .route("/subject-resource", subjectResource)
  .route("/subject-info", subjectInfo)
  .route("/quiz", quiz)
  .route("/assignment", assignment)
  .route("/notification", notification)
  .route("/admin/academic-year", year)
  .route("/admin/subject", subject)
  .route("/admin/course", course)
  .route("/admin/course-subject", courseSubject)
  .route("/admin/enrollment", enrollment)
  .route("/admin/users", user);

export type AppType = typeof app;

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
