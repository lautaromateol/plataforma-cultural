import { Hono } from "hono";
import auth from "@/lib/middlewares/auth-middleware";

const app = new Hono()
  .use("*", auth)

  // Obtener información básica de una materia
  .get("/:subjectId", async (c) => {
    const prisma = c.get("prisma");
    const user = c.get("user");
    const { subjectId } = c.req.param();

    try {
      // Obtener la materia
      const subject = await prisma.subject.findUnique({
        where: { id: subjectId },
        select: {
          id: true,
          name: true,
          code: true,
          description: true,
          level: {
            select: {
              id: true,
              name: true,
              order: true,
              studyPlan: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
        },
      });

      if (!subject) {
        return c.json({ message: "Materia no encontrada" }, 404);
      }

      // Verificar acceso
      let hasAccess = false;
      let isTeacher = false;

      if (user.role === "ADMIN") {
        hasAccess = true;
        isTeacher = true;
      } else if (user.role === "TEACHER") {
        // Verificar si es profesor de esta materia en algún curso
        const courseSubjects = await prisma.courseSubject.findMany({
          where: { subjectId, teacherId: user.sub },
        });
        const isTeacherOfSubject = courseSubjects.length > 0;
        hasAccess = isTeacherOfSubject;
        isTeacher = isTeacherOfSubject;
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

      return c.json({
        subject,
        permissions: {
          canEdit: isTeacher,
          canView: hasAccess,
        },
      });
    } catch (error) {
      console.error(error);
      return c.json({ message: "Error al obtener información de la materia" }, 500);
    }
  })

  // Obtener profesores de una materia
  .get("/teachers/:subjectId", async (c) => {
    const prisma = c.get("prisma");
    const user = c.get("user");
    const { subjectId } = c.req.param();

    try {
      // Verificar acceso a la materia
      const subject = await prisma.subject.findUnique({
        where: { id: subjectId },
      });

      if (!subject) {
        return c.json({ message: "Materia no encontrada" }, 404);
      }

      // Obtener profesores de la materia
      const courseSubjects = await prisma.courseSubject.findMany({
        where: { subjectId },
        include: {
          teacher: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        distinct: ["teacherId"],
      });

      const teachers = courseSubjects
        .map((cs) => cs.teacher)
        .filter((teacher) => teacher !== null);

      return c.json({ teachers }, 200);
    } catch (error) {
      console.error(error);
      return c.json({ message: "Error al obtener profesores" }, 500);
    }
  })

  // Obtener cursos de una materia
  .get("/courses/:subjectId", async (c) => {
    const prisma = c.get("prisma");
    const user = c.get("user");
    const { subjectId } = c.req.param();

    try {
      // Verificar acceso a la materia
      const subject = await prisma.subject.findUnique({
        where: { id: subjectId },
      });

      if (!subject) {
        return c.json({ message: "Materia no encontrada" }, 404);
      }

      // Obtener cursos de la materia
      const courseSubjects = await prisma.courseSubject.findMany({
        where: { subjectId },
        include: {
          course: {
            select: {
              id: true,
              name: true,
              classroom: true,
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

      const courses = courseSubjects.map((cs) => ({
        id: cs.course.id,
        courseSubjectId: cs.id,
        name: cs.course.name,
        classroom: cs.course.classroom,
        schedule: cs.schedule,
        studentsCount: 0, // Se llenará después
        teacher: cs.teacher,
      }));

      // Obtener cantidad de estudiantes por curso
      for (const course of courses) {
        const enrollmentCount = await prisma.enrollment.count({
          where: {
            courseId: course.id,
            status: "ACTIVE",
          },
        });
        course.studentsCount = enrollmentCount;
      }

      return c.json({ courses }, 200);
    } catch (error) {
      console.error(error);
      return c.json({ message: "Error al obtener cursos" }, 500);
    }
  });

export default app;

