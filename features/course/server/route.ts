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
    const { academicYear, yearId } = c.req.query();

    try {
      const where: any = {};

      if (academicYear) where.academicYear = academicYear;
      if (yearId) where.yearId = yearId;

      const dbCourses = await prisma.course.findMany({
        where,
        include: {
          year: {
            select: {
              name: true,
              subjects: { select: { id: true } },
            }
          },
          _count: {
            select: { enrollments: true},
          },
        },
        orderBy: [{ academicYear: "desc" }, { name: "asc" }],
      });

      const courses = dbCourses.map((course) => ({
        id: course.id,
        name: course.name,
        academicYear: course.academicYear,
        year: course.year,
        classroom: course.classroom,
        capacity: course.capacity, 
        subjectsCount: course.year.subjects.length,
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
          year: {
            include: {
              // Incluir TODAS las materias del año
              subjects: {
                orderBy: { name: "asc" },
              },
            },
          },
          courseSubjects: {
            include: {
              subject: true,
              teacher: {
                select: { 
                  id: true, 
                  name: true, 
                  dni: true, 
                  email: true,
                  teacherProfile: true,
                },
              },
            },
          },
          enrollments: {
            include: {
              student: {
                select: { 
                  id: true, 
                  name: true, 
                  dni: true, 
                  email: true,
                  role: true,
                  studentProfile: true,
                },
              },
            },
            orderBy: {
              student: {
                name: "asc",
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

      // Crear mapa de CourseSubject para acceso rápido
      const courseSubjectMap = new Map(
        course.courseSubjects.map((cs) => [cs.subjectId, cs])
      );

      // Combinar materias del año con info de CourseSubject
      const subjectsWithAssignment = course.year.subjects.map((subject) => {
        const assignment = courseSubjectMap.get(subject.id);
        return {
          id: subject.id,
          name: subject.name,
          code: subject.code,
          description: subject.description,
          courseSubjectId: assignment?.id || null,
          schedule: assignment?.schedule || null,
          teacher: assignment?.teacher || null,
        };
      });

      return c.json({ 
        course: {
          ...course,
          subjectsWithAssignment,
        }
      }, 200);
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
            yearId: data.yearId,
          },
        });

        if (existingCourse) {
          return c.json(
            {
              message:
                "Ya existe un curso con ese nombre en el mismo año académico",
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
