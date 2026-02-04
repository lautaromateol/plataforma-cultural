import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createCourseSchema, updateCourseSchema } from "../schemas";
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
    const { academicYear, levelId } = c.req.query();

    try {
      const where: Record<string, string> = {};

      if (academicYear) where.academicYear = academicYear;
      if (levelId) where.levelId = levelId;

      const dbCourses = await prisma.course.findMany({
        where,
        include: {
          level: {
            select: {
              id: true,
              name: true,
              order: true,
              studyPlan: {
                select: { id: true, name: true, code: true },
              },
              subjects: { select: { id: true } },
            },
          },
          _count: {
            select: { enrollments: true },
          },
        },
        orderBy: [{ academicYear: "desc" }, { name: "asc" }],
      });

      const courses = dbCourses.map((course) => ({
        id: course.id,
        name: course.name,
        academicYear: course.academicYear,
        level: course.level,
        classroom: course.classroom,
        shift: course.shift,
        capacity: course.capacity,
        subjectsCount: course.level.subjects.length,
        enrollmentCount: course._count.enrollments,
      }));

      return c.json({ courses }, 200);
    } catch (error) {
      console.error(error);
      return c.json({ message: "Error al obtener los cursos" }, 500);
    }
  })
  .get("/:id", async (c) => {
    const prisma = c.get("prisma");
    const id = c.req.param("id");

    try {
      const course = await prisma.course.findUnique({
        where: { id },
        include: {
          level: {
            select: {
              id: true,
              name: true,
              order: true,
              studyPlan: {
                select: { id: true, name: true, code: true },
              },
            },
          },
          _count: {
            select: { enrollments: true },
          },
        },
      });

      if (!course) {
        return c.json({ message: "Curso no encontrado" }, 404);
      }

      return c.json(
        {
          course,
        },
        200
      );
    } catch (error) {
      console.error(error);
      return c.json({ message: "Error al obtener el curso" }, 500);
    }
  })
  .post(
    "/",
    zValidator("json", createCourseSchema, (result, c) => {
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
        const existingCourse = await prisma.course.findFirst({
          where: {
            name: data.name,
            academicYear: data.academicYear,
            levelId: data.levelId,
          },
        });

        if (existingCourse) {
          return c.json(
            {
              message:
                "Ya existe un curso con ese nombre en el mismo nivel y año académico",
            },
            400
          );
        }

        const course = await prisma.course.create({
          data,
        });

        return c.json({ message: "Curso creado exitosamente", course }, 201);
      } catch (error) {
        console.error(error);
        return c.json({ message: "Error al crear el curso" }, 500);
      }
    }
  )
  .put(
    "/:id",
    zValidator("json", updateCourseSchema, (result, c) => {
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
        const course = await prisma.course.update({
          where: { id },
          data,
        });

        return c.json(
          { message: "Curso actualizado exitosamente", course },
          200
        );
      } catch (error) {
        console.error(error);
        return c.json({ message: "Error al actualizar el curso" }, 500);
      }
    }
  )
  .delete("/:id", async (c) => {
    const prisma = c.get("prisma");
    const id = c.req.param("id");

    try {
      await prisma.course.delete({
        where: { id },
      });

      return c.json({ message: "Curso eliminado exitosamente" }, 200);
    } catch (error) {
      console.error(error);
      return c.json({ message: "Error al eliminar el curso" }, 500);
    }
  });

export default app;
