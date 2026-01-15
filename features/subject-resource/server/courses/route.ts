import { Hono } from "hono";
import auth from "@/lib/middlewares/auth-middleware";

const app = new Hono()
  .use("*", auth)

  // Obtener cursos de una materia
  .get("/:subjectId", async (c) => {
    const prisma = c.get("prisma");
    const user = c.get("user");
    const { subjectId } = c.req.param();

    try {
      // Verificar que la materia existe y el usuario tiene acceso
      const courseSubjects = await prisma.courseSubject.findMany({
        where: { subjectId },
        include: {
          course: {
            include: {
              enrollments: {
                where: { status: "ACTIVE", studentId: user.sub },
              },
            },
          },
          teacher: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (courseSubjects.length === 0 && user.role !== "ADMIN") {
        const subjectExists = await prisma.subject.findUnique({
          where: { id: subjectId },
        });
        if (!subjectExists) {
          return c.json({ message: "Materia no encontrada" }, 404);
        }
      }

      let hasAccess = false;
      if (user.role === "ADMIN") {
        hasAccess = true;
      } else if (user.role === "TEACHER") {
        hasAccess = courseSubjects.some((cs) => cs.teacherId === user.sub);
      } else if (user.role === "STUDENT") {
        hasAccess = courseSubjects.some((cs) => cs.course.enrollments.length > 0);
      }

      if (!hasAccess) {
        return c.json(
          { message: "No tienes permiso para ver esta materia" },
          403
        );
      }

      // Mapear cursos
      const courses = courseSubjects.map((cs) => ({
        id: cs.course.id,
        courseSubjectId: cs.id,
        name: cs.course.name,
        classroom: cs.course.classroom,
        schedule: cs.schedule,
        studentsCount: cs.course.enrollments.length,
        teacher: cs.teacher,
      }));

      return c.json({ courses });
    } catch (error) {
      console.error(error);
      return c.json({ message: "Error al obtener cursos" }, 500);
    }
  });

export default app;
