import { Hono } from "hono";
import auth from "@/lib/middlewares/auth-middleware";

const app = new Hono()
  .use("*", auth)

  // Obtener profesores de una materia
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
          courseSubjects: {
            where: { teacherId: user.sub },
          },
        },
      });

      if (!subject) {
        return c.json({ message: "Materia no encontrada" }, 404);
      }

      let hasAccess = false;
      if (user.role === "ADMIN") {
        hasAccess = true;
      } else if (user.role === "TEACHER") {
        hasAccess = subject.courseSubjects.length > 0;
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

      // Obtener todos los profesores
      const teacherAssignments = await prisma.courseSubject.findMany({
        where: { subjectId },
        select: {
          teacher: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Filtrar profesores únicos
      const teachers = teacherAssignments
        .map((cs) => cs.teacher)
        .filter(
          (teacher, index, self) =>
            teacher && self.findIndex((t) => t?.id === teacher.id) === index
        );

      return c.json({ teachers });
    } catch (error) {
      console.error(error);
      return c.json({ message: "Error al obtener profesores" }, 500);
    }
  });

export default app;
