import { Hono } from "hono";
import auth from "@/lib/middlewares/auth-middleware";

const app = new Hono()
  .get("/", auth, async (c) => {
    const prisma = c.get("prisma");
    const user = c.get("user");

    // Obtener el usuario con sus relaciones según el rol
    const fullUser = await prisma.user.findUnique({
      where: { id: user.sub },
      select: {
        id: true,
        name: true,
        email: true,
        dni: true,
        role: true,
        studentProfile: true,
        teacherProfile: true,
        // Para estudiantes: obtener matrículas con curso y año
        enrollments: {
          where: { status: "ACTIVE" },
          include: {
            course: {
              include: {
                year: {
                  include: {
                    // Obtener TODAS las materias del año
                    subjects: {
                      orderBy: { name: "asc" },
                    },
                  },
                },
                // También obtener CourseSubjects para info de profesor/horario
                courseSubjects: {
                  include: {
                    subject: true,
                    teacher: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                      },
                    },
                  },
                },
                _count: {
                  select: { enrollments: true },
                },
              },
            },
          },
        },
        // Para profesores: obtener materias asignadas
        courseSubjects: {
          include: {
            subject: {
              include: {
                year: true,
              },
            },
            course: {
              include: {
                year: true,
                _count: {
                  select: { enrollments: true },
                },
              },
            },
          },
        },
      },
    });

    if (!fullUser) {
      return c.json({ message: "Usuario no encontrado" }, 404);
    }

    if (fullUser.role === "STUDENT") {
      // Respuesta para estudiantes
      const enrollment = fullUser.enrollments[0];

      if (!enrollment) {
        return c.json({
          user: {
            id: fullUser.id,
            name: fullUser.name,
            email: fullUser.email,
            dni: fullUser.dni,
            role: fullUser.role,
            profile: fullUser.studentProfile,
          },
          enrollment: null,
        });
      }

      // Crear un mapa de CourseSubject para acceso rápido
      const courseSubjectMap = new Map(
        enrollment.course.courseSubjects.map((cs) => [cs.subjectId, cs])
      );

      // Obtener materias del AÑO y combinar con info de CourseSubject si existe
      const subjects = enrollment.course.year.subjects.map((subject) => {
        const courseSubject = courseSubjectMap.get(subject.id);
        return {
          id: subject.id,
          name: subject.name,
          code: subject.code,
          description: subject.description,
          schedule: courseSubject?.schedule || null,
          teacher: courseSubject?.teacher
            ? {
                id: courseSubject.teacher.id,
                name: courseSubject.teacher.name,
                email: courseSubject.teacher.email,
              }
            : null,
        };
      });

      return c.json({
        user: {
          id: fullUser.id,
          name: fullUser.name,
          email: fullUser.email,
          dni: fullUser.dni,
          role: fullUser.role,
          profile: fullUser.studentProfile,
        },
        enrollment: {
          course: {
            id: enrollment.course.id,
            name: enrollment.course.name,
            classroom: enrollment.course.classroom,
            capacity: enrollment.course.capacity,
            studentsCount: enrollment.course._count.enrollments,
          },
          year: {
            id: enrollment.course.year.id,
            name: enrollment.course.year.name,
            level: enrollment.course.year.level,
          },
          subjects,
        },
      });
    }

    if (fullUser.role === "TEACHER") {
      // Agrupar materias por año para mejor organización
      const subjectsByYear = fullUser.courseSubjects.reduce(
        (acc, cs) => {
          const yearId = cs.subject.year.id;
          if (!acc[yearId]) {
            acc[yearId] = {
              year: {
                id: cs.subject.year.id,
                name: cs.subject.year.name,
                level: cs.subject.year.level,
              },
              subjects: [],
            };
          }

          // Verificar si la materia ya existe para este año
          const existingSubject = acc[yearId].subjects.find(
            (s: any) => s.id === cs.subject.id
          );

          if (existingSubject) {
            // Agregar el curso a la materia existente
            existingSubject.courses.push({
              id: cs.course.id,
              name: cs.course.name,
              classroom: cs.course.classroom,
              schedule: cs.schedule,
              studentsCount: cs.course._count.enrollments,
            });
          } else {
            // Crear nueva entrada de materia
            acc[yearId].subjects.push({
              id: cs.subject.id,
              name: cs.subject.name,
              code: cs.subject.code,
              description: cs.subject.description,
              courses: [
                {
                  id: cs.course.id,
                  name: cs.course.name,
                  classroom: cs.course.classroom,
                  schedule: cs.schedule,
                  studentsCount: cs.course._count.enrollments,
                },
              ],
            });
          }

          return acc;
        },
        {} as Record<string, any>
      );

      // Convertir a array ordenado por nivel
      const teaching = Object.values(subjectsByYear).sort(
        (a: any, b: any) => a.year.level - b.year.level
      );

      return c.json({
        user: {
          id: fullUser.id,
          name: fullUser.name,
          email: fullUser.email,
          dni: fullUser.dni,
          role: fullUser.role,
          profile: fullUser.teacherProfile,
        },
        teaching,
        stats: {
          totalSubjects: fullUser.courseSubjects.length,
          totalCourses: new Set(fullUser.courseSubjects.map((cs) => cs.course.id))
            .size,
          totalStudents: fullUser.courseSubjects.reduce(
            (sum, cs) => sum + cs.course._count.enrollments,
            0
          ),
        },
      });
    }

    // Para admin, redirigir a /admin
    return c.json({
      user: {
        id: fullUser.id,
        name: fullUser.name,
        email: fullUser.email,
        dni: fullUser.dni,
        role: fullUser.role,
      },
      redirect: "/admin",
    });
  });

export default app;

