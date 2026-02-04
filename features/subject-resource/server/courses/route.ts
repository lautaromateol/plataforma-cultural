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
      // Verificar que la materia existe
      const subject = await prisma.subject.findUnique({
        where: { id: subjectId },
        include: {
          level: true,
          courseSubjects: user.role === "TEACHER" ? {
            where: { teacherId: user.sub },
          } : undefined,
        },
      });

      if (!subject) {
        return c.json({ message: "Materia no encontrada" }, 404);
      }

      let hasAccess = false;
      if (user.role === "ADMIN") {
        hasAccess = true;
      } else if (user.role === "TEACHER") {
        hasAccess = (subject.courseSubjects?.length ?? 0) > 0;
      } else if (user.role === "STUDENT") {
        // Verificar si el estudiante está inscrito en un curso del mismo nivel que la materia
        const enrollment = await prisma.enrollment.findFirst({
          where: {
            studentId: user.sub,
            status: "ACTIVE",
            course: {
              levelId: subject.level.id,
            },
          },
        });
        hasAccess = !!enrollment;
      }

      if (!hasAccess) {
        return c.json(
          { message: "No tienes permiso para ver esta materia" },
          403
        );
      }

      // Obtener cursos de la materia
      const courseSubjects = await prisma.courseSubject.findMany({
        where: { subjectId },
        include: {
          course: {
            include: {
              _count: {
                select: { enrollments: { where: { status: "ACTIVE" } } },
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

      // Mapear cursos
      const courses = courseSubjects.map((cs) => ({
        id: cs.course.id,
        courseSubjectId: cs.id,
        name: cs.course.name,
        classroom: cs.course.classroom,
        schedule: cs.schedule,
        studentsCount: cs.course._count.enrollments,
        teacher: cs.teacher,
      }));

      return c.json({ courses });
    } catch (error) {
      console.error(error);
      return c.json({ message: "Error al obtener cursos" }, 500);
    }
  });

export default app;
