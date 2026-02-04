import bcrypt from "bcryptjs";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createUserSchema, updateUserSchema } from "../schemas";
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
    const { role, search } = c.req.query();

    try {
      const where: any = {};

      if (role) where.role = role;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { dni: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ];
      }

      const users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          dni: true,
          email: true,
          name: true,
          role: true,
          isVerified: true,
          firstLogin: true,
          createdAt: true,
          studentProfile: true,
          teacherProfile: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return c.json({ users }, 200);
    } catch (error) {
      console.error(error);
      return c.json({ message: "Error al obtener los usuarios" }, 500);
    }
  })
  .get("/teachers", async (c) => {
    const prisma = c.get("prisma");
    const { levelId } = c.req.query();

    try {
      const dbTeachers = await prisma.user.findMany({
        where: {
          role: "TEACHER",
          ...(levelId && {
            courseSubjects: {
              some: {
                course: {
                  level: {
                    id: levelId
                  }
                }
              }
            }
          })
        },
        select: {
          id: true,
          dni: true,
          email: true,
          name: true,
          teacherProfile: true,
          courseSubjects: {
            include: {
              course: {
                include: { level: true },
              },
              subject: true,
            },
          },
        },
        orderBy: { name: "asc" },
      });

      const teachers = dbTeachers.map((teacher) => {
        const subjectsTaught = teacher.courseSubjects.map((cs) => ({
          id: cs.id,
          courseId: cs.course.id,
          subjectId: cs.subject.id,
          courseName: cs.course.name,
          subjectName: cs.subject.name,
        }));

        return {
          id: teacher.id,
          dni: teacher.dni,
          email: teacher.email,
          name: teacher.name,
          teacherProfile: teacher.teacherProfile,
          subjectsTaught
        };
      });

      return c.json({ teachers }, 200);
    } catch (error) {
      console.error(error);
      return c.json({ message: "Error al obtener los profesores" }, 500);
    }
  })
  .get("/students", async (c) => {
    const prisma = c.get("prisma");
    const { levelId } = c.req.query();

    const where = { role: "STUDENT" as const };
    if (levelId) {
      Object.assign(where, {
        enrollments: {
          some: {
            course: {
              levelId
            }
          }
        }
      });
    }

    try {
      const dbStudents = await prisma.user.findMany({
        where,
        select: {
          id: true,
          dni: true,
          email: true,
          name: true,
          studentProfile: true,
          enrollments: {
            include: {
              course: {
                select: {
                  id: true,
                  name: true,
                  levelId: true,
                }
              },
            },
          },
        },
        orderBy: { name: "asc" },
      });

      const students = dbStudents.map((student) => {
        // Si se solicitó un levelId, preferimos la matrícula que pertenezca a ese nivel.
        const chosenEnrollment = levelId
          ? student.enrollments.find((e) => e.course.levelId === levelId) || student.enrollments[0]
          : student.enrollments[0];

        return {
          id: student.id,
          dni: student.dni,
          email: student.email,
          name: student.name,
          studentProfile: student.studentProfile,
          courseId: chosenEnrollment?.course.id ?? null,
          courseName: chosenEnrollment?.course.name ?? null,
          levelId: chosenEnrollment?.course.levelId ?? null,
          enrollmentStatus: chosenEnrollment?.status ?? null,
        };
      });
      return c.json({ students }, 200);
    } catch (error) {
      console.error(error);
      return c.json({ message: "Error al obtener los estudiantes" }, 500);
    }
  })
  .get("/:id", async (c) => {
    const prisma = c.get("prisma");
    const id = c.req.param("id");

    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          dni: true,
          email: true,
          name: true,
          role: true,
          isVerified: true,
          firstLogin: true,
          createdAt: true,
          studentProfile: true,
          teacherProfile: true,
          enrollments: {
            include: {
              course: {
                include: {
                  level: {
                    include: {
                      studyPlan: {
                        select: { id: true, name: true, code: true },
                      },
                    },
                  },
                },
              },
            },
          },
          courseSubjects: {
            include: {
              course: true,
              subject: true,
            },
          },
          quizAttempts: {
            include: {
              quiz: {
                include: {
                  subject: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
            orderBy: { submittedAt: "desc" },
          },
          assignmentSubmissions: {
            include: {
              assignment: {
                include: {
                  assignmentCourseSubjects: {
                    include: {
                      courseSubject: {
                        include: {
                          subject: {
                            select: {
                              id: true,
                              name: true,
                            },
                          },
                          course: {
                            select: {
                              id: true,
                              name: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            orderBy: { submittedAt: "desc" },
          },
        },
      });

      if (!user) {
        return c.json({ message: "Usuario no encontrado" }, 404);
      }

      return c.json({ user }, 200);
    } catch (error) {
      console.error(error);
      return c.json({ message: "Error al obtener el usuario" }, 500);
    }
  })
  .post(
    "/",
    zValidator("json", createUserSchema, (result, c) => {
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
        // Verificar si el DNI ya existe
        const existingUser = await prisma.user.findUnique({
          where: { dni: data.dni },
        });

        if (existingUser) {
          return c.json({ message: "Ya existe un usuario con este DNI" }, 400);
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(data.password, 12);

        const user = await prisma.user.create({
          data: {
            ...data,
            password: hashedPassword,
          },
          select: {
            id: true,
            dni: true,
            email: true,
            name: true,
            role: true,
            isVerified: true,
            firstLogin: true,
          },
        });

        return c.json({ message: "Usuario creado exitosamente", user }, 201);
      } catch (error) {
        console.error(error);
        return c.json({ message: "Error al crear el usuario" }, 500);
      }
    }
  )
  .put(
    "/:id",
    zValidator("json", updateUserSchema, (result, c) => {
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
        const updateData: any = { ...data };

        // Si se actualiza la contraseña, hacer hash
        if (data.password) {
          updateData.password = await bcrypt.hash(data.password, 12);
        }

        const user = await prisma.user.findUnique({
          where: { id },
        });

        if (!user) {
          return c.json({ message: "Usuario no encontrado" }, 404);
        }

        if (data.role === "STUDENT" && user.role === "TEACHER") {
          return c.json({ message: "No se puede cambiar el rol de un profesor a ESTUDIANTE" }, 400);
        } else if (data.role === "TEACHER" && user.role === "STUDENT") {
          return c.json({ message: "No se puede cambiar el rol de un estudiante a PROFESOR" }, 400);
        }

        const updateUser = await prisma.user.update({
          where: { id: user.id },
          data: updateData,
          select: {
            id: true,
            dni: true,
            email: true,
            name: true,
            role: true,
            isVerified: true,
            firstLogin: true,
          },
        });

        return c.json(
          { message: "Usuario actualizado exitosamente", user: updateUser },
          200
        );
      } catch (error) {
        console.error(error);
        return c.json({ message: "Error al actualizar el usuario." }, 500);
      }
    }
  )
  .delete("/:id", async (c) => {
    const prisma = c.get("prisma");
    const id = c.req.param("id");

    try {
      await prisma.user.delete({
        where: { id },
      });

      return c.json({ message: "Usuario eliminado exitosamente" }, 200);
    } catch (error) {
      console.error(error);
      return c.json({ message: "Error al eliminar el usuario" }, 500);
    }
  });

export default app;
