import { Hono } from "hono";
import auth from "@/lib/middlewares/auth-middleware";

const app = new Hono()
  .use("*", auth)

  // Obtener información de una materia con verificación de permisos
  .get("/:subjectId", async (c) => {
    const prisma = c.get("prisma");
    const user = c.get("user");
    const { subjectId } = c.req.param();

    try {
      // Obtener la materia con todas sus relaciones
      const subject = await prisma.subject.findUnique({
        where: { id: subjectId },
        include: {
          year: true,
          courseSubjects: {
            include: {
              teacher: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              course: {
                include: {
                  enrollments: {
                    where: { status: "ACTIVE" },
                    select: {
                      studentId: true,
                      student: {
                        select: {
                          id: true,
                          name: true,
                          email: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!subject) {
        return c.json({ message: "Materia no encontrada" }, 404);
      }

      // Verificar permisos
      let hasAccess = false;
      let isTeacher = false;
      let teacherIds: string[] = [];

      if (user.role === "ADMIN") {
        hasAccess = true;
        isTeacher = true; // Admin tiene permisos de profesor
      } else if (user.role === "TEACHER") {
        // Verificar si el profesor está asignado a esta materia
        const isTeacherOfSubject = subject.courseSubjects.some(
          (cs) => cs.teacherId === user.sub
        );
        hasAccess = isTeacherOfSubject;
        isTeacher = isTeacherOfSubject;
        
        // Obtener todos los profesores de esta materia
        teacherIds = subject.courseSubjects
          .filter((cs) => cs.teacherId)
          .map((cs) => cs.teacherId as string);
      } else if (user.role === "STUDENT") {
        // Verificar si el estudiante está matriculado en un curso que tiene esta materia
        const isEnrolled = subject.courseSubjects.some((cs) =>
          cs.course.enrollments.some((e) => e.studentId === user.sub)
        );
        hasAccess = isEnrolled;
        
        // Obtener todos los profesores de esta materia
        teacherIds = subject.courseSubjects
          .filter((cs) => cs.teacherId)
          .map((cs) => cs.teacherId as string);
      }

      if (!hasAccess) {
        return c.json(
          { message: "No tienes permiso para ver esta materia" },
          403
        );
      }

      // Obtener lista única de profesores
      const teachers = subject.courseSubjects
        .filter((cs) => cs.teacher)
        .map((cs) => cs.teacher)
        .filter(
          (teacher, index, self) =>
            teacher && self.findIndex((t) => t?.id === teacher.id) === index
        );

      // Obtener lista de cursos
      const courses = subject.courseSubjects.map((cs) => ({
        id: cs.course.id,
        courseSubjectId: cs.id, // Incluir el ID del CourseSubject
        name: cs.course.name,
        classroom: cs.course.classroom,
        schedule: cs.schedule,
        studentsCount: cs.course.enrollments.length,
        teacher: cs.teacher,
      }));

      return c.json({
        subject: {
          id: subject.id,
          name: subject.name,
          code: subject.code,
          description: subject.description,
          year: {
            id: subject.year.id,
            name: subject.year.name,
            level: subject.year.level,
          },
        },
        teachers,
        courses,
        permissions: {
          canEdit: isTeacher,
          canView: hasAccess,
        },
      });
    } catch (error) {
      console.error(error);
      return c.json({ message: "Error al obtener materia" }, 500);
    }
  });

export default app;

