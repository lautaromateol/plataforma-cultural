import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import auth from "@/lib/middlewares/auth-middleware";
import {
  createCourseSubjectSchema,
  updateCourseSubjectSchema,
} from "../schemas";

const app = new Hono()
  .use("*", auth)
  .use("*", async (c, next) => {
    const user = c.get("user");
    if (user.role !== "ADMIN") {
      return c.json({ message: "No autorizado" }, 403);
    }
    await next();
  })
  .get("/", async (c) => {
    const prisma = c.get("prisma");
    const { courseId } = c.req.query();

    try {
      const where: any = {};
      if (courseId) where.courseId = courseId;

      const courseSubjects = await prisma.courseSubject.findMany({
        where,
        include: {
          course: {
            include: { year: true },
          },
          subject: true,
          teacher: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return c.json({ courseSubjects }, 200);
    } catch (error) {
      console.error(error);
      return c.json({ message: "Error al obtener las asignaciones" }, 500);
    }
  })
  .post(
    "/",
    zValidator("json", createCourseSubjectSchema, (result, c) => {
      if (!result.success) {
        return c.json(
          { message: "Datos inválidos", errors: result.error.issues },
          400
        );
      }
    }),
    async (c) => {
      const prisma = c.get("prisma");
      const data = c.req.valid("json");

      try {
        const existingAssignment = await prisma.courseSubject.findFirst({
          where: {
            courseId: data.courseId,
            subjectId: data.subjectId,
          },
        });

        if (existingAssignment) {
          return c.json(
            { message: "Esta materia ya está asignada a este curso" },
            400
          );
        }

        const courseSubject = await prisma.courseSubject.create({
          data,
          include: {
            course: true,
            subject: true,
            teacher: {
              select: { name: true, email: true },
            },
          },
        });

        return c.json(
          { message: "Materia asignada al curso exitosamente", courseSubject },
          201
        );
      } catch (error) {
        console.error(error);
        return c.json({ message: "Error al asignar la materia al curso" }, 500);
      }
    }
  )
  .put(
    "/:id",
    zValidator("json", updateCourseSubjectSchema, (result, c) => {
      if (!result.success) {
        return c.json(
          { message: "Datos inválidos", errors: result.error.issues },
          400
        );
      }
    }),
    async (c) => {
      const prisma = c.get("prisma");
      const id = c.req.param("id");
      const data = c.req.valid("json");

      try {
        const courseSubject = await prisma.courseSubject.update({
          where: { id },
          data,
          include: {
            course: true,
            subject: true,
            teacher: {
              select: { name: true, email: true },
            },
          },
        });

        return c.json(
          { message: "Asignación actualizada exitosamente", courseSubject },
          200
        );
      } catch (error) {
        console.error(error);
        return c.json({ message: "Error al actualizar la asignación" }, 500);
      }
    }
  )
  .delete("/:id", async (c) => {
    const prisma = c.get("prisma");
    const id = c.req.param("id");

    try {
      await prisma.courseSubject.delete({
        where: { id },
      });

      return c.json({ message: "Asignación eliminada exitosamente" }, 200);
    } catch (error) {
      console.error(error);
      return c.json({ message: "Error al eliminar la asignación" }, 500);
    }
  });

export default app;
