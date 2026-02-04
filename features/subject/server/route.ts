import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createSubjectSchema, updateSubjectSchema } from "../schemas";
import auth from "@/lib/middlewares/auth-middleware";

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
    const { levelId } = c.req.query();

    const where = {};
    if (levelId) {
      Object.assign(where, { levelId });
    }

    try {
      const subjects = await prisma.subject.findMany({
        where,
        include: {
          level: {
            include: {
              studyPlan: {
                select: { id: true, name: true, code: true },
              },
            },
          },
          courseSubjects: {
            include: {
              course: true,
              teacher: {
                select: { name: true, email: true },
              },
            },
          },
        },
        orderBy: { name: "asc" },
      });

      return c.json({ subjects }, 200);
    } catch (error) {
      console.error(error);
      return c.json({ message: "Error al obtener las materias" }, 500);
    }
  })
  .get("/:id", async (c) => {
    const prisma = c.get("prisma");
    const id = c.req.param("id");

    try {
      const subject = await prisma.subject.findUnique({
        where: { id },
        include: {
          level: {
            include: {
              studyPlan: {
                select: { id: true, name: true, code: true },
              },
            },
          },
          courseSubjects: {
            include: {
              course: true,
              teacher: {
                select: { name: true, email: true },
              },
            },
          },
        },
      });

      if (!subject) {
        return c.json({ message: "Materia no encontrada" }, 404);
      }

      return c.json({ subject }, 200);
    } catch (error) {
      console.error(error);
      return c.json({ message: "Error al obtener la materia" }, 500);
    }
  })
  .post(
    "/",
    zValidator("json", createSubjectSchema, (result, c) => {
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
      const { levelId } = c.req.query();

      if (!levelId) {
        return c.json({ message: "ID del nivel requerido" }, 400);
      }

      try {
        // Crear la materia
        const subject = await prisma.subject.create({
          data: {
            ...data,
            levelId,
          },
        });

        // Obtener todos los cursos del nivel
        const courses = await prisma.course.findMany({
          where: { levelId },
        });

        // Crear CourseSubject para cada curso del nivel
        if (courses.length > 0) {
          await prisma.courseSubject.createMany({
            data: courses.map((course) => ({
              courseId: course.id,
              subjectId: subject.id,
            })),
            skipDuplicates: true,
          });
        }

        return c.json({ message: "Materia creada exitosamente", subject }, 201);
      } catch (error) {
        console.error(error);
        return c.json({ message: "Error al crear la materia" }, 500);
      }
    }
  )
  .put(
    "/:id",
    zValidator("json", updateSubjectSchema, (result, c) => {
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
        const subject = await prisma.subject.update({
          where: { id },
          data,
        });

        return c.json(
          { message: "Materia actualizada exitosamente", subject },
          200
        );
      } catch (error) {
        console.error(error);
        return c.json({ message: "Error al actualizar la materia" }, 500);
      }
    }
  )
  .delete("/:id", async (c) => {
    const prisma = c.get("prisma");
    const id = c.req.param("id");

    try {
      await prisma.subject.delete({
        where: { id },
      });

      return c.json({ message: "Materia eliminada exitosamente" }, 200);
    } catch (error) {
      console.error(error);
      return c.json({ message: "Error al eliminar la materia" }, 500);
    }
  });

export default app;
