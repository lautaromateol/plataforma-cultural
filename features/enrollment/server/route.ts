import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import auth from "@/lib/middlewares/auth-middleware";

const enrollSchema = z.object({
  studentId: z.string(),
  courseId: z.string(),
});

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
    try {
      const prisma = c.get("prisma");
      const { courseId } = c.req.query();

      const where = {};
      if (courseId) {
        Object.assign(where, { courseId });
      }

      const enrollments = await prisma.enrollment.findMany({
        where,
        include: {
          student: {
            include: {
              studentProfile: true,
            },
          },
        },
        orderBy: { student: { name: "asc" } },
      });

      return c.json({ enrollments }, 200);
    } catch (error) {
      return c.json({ message: "Error al obtener las matriculas" }, 500);
    }
  })
  // Matricular estudiante
  .post(
    "/",
    zValidator("json", enrollSchema, (result, c) => {
      if (!result.success) {
        return c.json(
          { message: "Datos inválidos", errors: result.error.issues },
          400
        );
      }
    }),
    async (c) => {
      const prisma = c.get("prisma");
      const { studentId, courseId } = c.req.valid("json");

      try {
        // Verificar que el estudiante existe y es estudiante
        const student = await prisma.user.findUnique({
          where: { id: studentId },
        });

        if (!student) {
          return c.json({ message: "Estudiante no encontrado" }, 404);
        }

        if (student.role !== "STUDENT") {
          return c.json({ message: "El usuario no es un estudiante" }, 400);
        }

        // Verificar que el curso existe
        const course = await prisma.course.findUnique({
          where: { id: courseId },
          include: {
            _count: {
              select: { enrollments: true },
            },
          },
        });

        if (!course) {
          return c.json({ message: "Curso no encontrado" }, 404);
        }

        // Verificar capacidad
        if (course._count.enrollments >= course.capacity) {
          return c.json(
            { message: "El curso ha alcanzado su capacidad máxima" },
            400
          );
        }

        // Verificar si ya está matriculado
        const existing = await prisma.enrollment.findUnique({
          where: {
            studentId_courseId: {
              studentId,
              courseId,
            },
          },
        });

        if (existing) {
          return c.json(
            { message: "El estudiante ya está matriculado en este curso" },
            400
          );
        }

        // Crear matrícula
        const enrollment = await prisma.enrollment.create({
          data: {
            studentId,
            courseId,
            status: "ACTIVE",
          },
          include: {
            student: {
              select: {
                id: true,
                name: true,
                dni: true,
              },
            },
            course: {
              select: {
                id: true,
                name: true,
                academicYear: true,
              },
            },
          },
        });

        return c.json(
          { message: "Estudiante matriculado exitosamente", enrollment },
          201
        );
      } catch (error) {
        console.error(error);
        return c.json({ message: "Error al matricular estudiante" }, 500);
      }
    }
  )
  // Desmatricular estudiante
  .delete("/:studentId/:courseId", async (c) => {
    const prisma = c.get("prisma");
    const studentId = c.req.param("studentId");
    const courseId = c.req.param("courseId");

    try {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId,
            courseId,
          },
        },
      });

      if (!enrollment) {
        return c.json({ message: "Matrícula no encontrada" }, 404);
      }

      await prisma.enrollment.delete({
        where: {
          studentId_courseId: {
            studentId,
            courseId,
          },
        },
      });

      return c.json({ message: "Estudiante desmatriculado exitosamente" }, 200);
    } catch (error) {
      console.error(error);
      return c.json({ message: "Error al desmatricular estudiante" }, 500);
    }
  });

export default app;
