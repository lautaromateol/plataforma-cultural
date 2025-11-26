import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createEnrollmentSchema, updateEnrollmentSchema } from "../schemas";
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
    const { courseId, studentId } = c.req.query();

    try {
      const where: any = {};
      if (courseId) where.courseId = courseId;
      if (studentId) where.studentId = studentId;

      const enrollments = await prisma.enrollment.findMany({
        where,
        include: {
          student: {
            select: { id: true, name: true, dni: true, email: true },
          },
          course: {
            include: {
              year: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return c.json({ enrollments }, 200);
    } catch (error) {
      console.error(error);
      return c.json({ message: "Error al obtener las matrículas" }, 500);
    }
  })
  .get("/:id", async (c) => {
    const prisma = c.get("prisma");
    const id = c.req.param("id");

    try {
      const enrollment = await prisma.enrollment.findUnique({
        where: { id },
        include: {
          student: {
            select: { id: true, name: true, dni: true, email: true },
          },
          course: {
            include: {
              year: true,
              courseSubjects: {
                include: {
                  subject: true,
                  teacher: {
                    select: { name: true, email: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!enrollment) {
        return c.json({ message: "Matrícula no encontrada" }, 404);
      }

      return c.json({ enrollment }, 200);
    } catch (error) {
      console.error(error);
      return c.json({ message: "Error al obtener la matrícula" }, 500);
    }
  })
  .post(
    "/",
    zValidator("json", createEnrollmentSchema, (result, c) => {
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
        // Verificar si el estudiante ya está matriculado en este curso
        const existingEnrollment = await prisma.enrollment.findFirst({
          where: {
            studentId: data.studentId,
            courseId: data.courseId,
          },
        });

        if (existingEnrollment) {
          return c.json(
            { message: "El estudiante ya está matriculado en este curso" },
            400
          );
        }

        // Verificar capacidad del curso
        const course = await prisma.course.findUnique({
          where: { id: data.courseId },
          include: {
            _count: {
              select: { enrollments: true },
            },
          },
        });

        if (!course) {
          return c.json({ message: "Curso no encontrado" }, 404);
        }

        if (course._count.enrollments >= course.capacity) {
          return c.json(
            { message: "El curso ha alcanzado su capacidad máxima" },
            400
          );
        }

        const enrollment = await prisma.enrollment.create({
          data,
          include: {
            student: {
              select: { id: true, name: true, dni: true, email: true },
            },
            course: {
              include: { year: true },
            },
          },
        });

        return c.json(
          { message: "Estudiante matriculado exitosamente", enrollment },
          201
        );
      } catch (error) {
        console.error(error);
        return c.json({ message: "Error al matricular el estudiante" }, 500);
      }
    }
  )
  .put(
    "/:id",
    zValidator("json", updateEnrollmentSchema, (result, c) => {
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
        const enrollment = await prisma.enrollment.update({
          where: { id },
          data,
          include: {
            student: {
              select: { id: true, name: true, dni: true, email: true },
            },
            course: {
              include: { year: true },
            },
          },
        });

        return c.json(
          { message: "Matrícula actualizada exitosamente", enrollment },
          200
        );
      } catch (error) {
        console.error(error);
        return c.json({ message: "Error al actualizar la matrícula" }, 500);
      }
    }
  )
  .delete("/:id", async (c) => {
    const prisma = c.get("prisma");
    const id = c.req.param("id");

    try {
      await prisma.enrollment.delete({
        where: { id },
      });

      return c.json({ message: "Matrícula eliminada exitosamente" }, 200);
    } catch (error) {
      console.error(error);
      return c.json({ message: "Error al eliminar la matrícula" }, 500);
    }
  });

export default app;
