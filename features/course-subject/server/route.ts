import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import auth from "@/lib/middlewares/auth-middleware";
import {
  createCourseSubjectSchema,
  updateCourseSubjectSchema,
} from "../schemas";

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
    const { courseId } = c.req.query();

    try {
      if (!courseId) {
        // Si no se proporciona courseId, devolver todos los courseSubjects
        const courseSubjects = await prisma.courseSubject.findMany({
          include: {
            course: {
              include: { year: true },
            },
            subject: true,
            teacher: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: "desc" },
        });

        return c.json({ courseSubjects }, 200);
      }

      // Obtener el curso y su año
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: { year: true },
      });

      if (!course) {
        return c.json({ message: "Curso no encontrado" }, 404);
      }

      // Obtener todas las materias del año
      const allSubjects = await prisma.subject.findMany({
        where: { yearId: course.yearId },
      });

      // Obtener los courseSubjects existentes para este curso
      const existingCourseSubjects = await prisma.courseSubject.findMany({
        where: { courseId },
        include: {
          teacher: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      // Crear un mapa de los courseSubjects existentes para búsqueda rápida
      const courseSubjectMap = new Map(
        existingCourseSubjects.map((cs) => [cs.subjectId, cs])
      );

      // Construir la respuesta con todas las materias, asignadas o no
      const courseSubjects = allSubjects.map((subject) => {
        const existing = courseSubjectMap.get(subject.id);
        return {
          id: existing?.id || "",
          schedule: existing?.schedule || null,
          createdAt: existing?.createdAt || new Date(),
          updatedAt: existing?.updatedAt || new Date(),
          courseId,
          course: {
            id: course.id,
            name: course.name,
            academicYear: course.academicYear,
            capacity: course.capacity,
            classroom: course.classroom,
            createdAt: course.createdAt,
            updatedAt: course.updatedAt,
            yearId: course.yearId,
            year: course.year,
          },
          subject,
          teacher: existing?.teacher || null,
          subjectId: subject.id,
          teacherId: existing?.teacherId || null,
        };
      });

      return c.json({ courseSubjects }, 200);
    } catch (error) {
      console.error(error);
      return c.json({ message: "Error al obtener las asignaciones" }, 500);
    }
  })
  .post(
    "/",
    zValidator("json", createCourseSubjectSchema, (result, c) => {
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
        // Verificar si el profesor es válido (si se proporciona)
        if (data.teacherId) {
          const teacher = await prisma.user.findUnique({
            where: { id: data.teacherId },
          });
          if (!teacher || teacher.role !== "TEACHER") {
            return c.json(
              { message: "El profesor seleccionado no existe o no tiene rol de profesor" },
              400
            );
          }
        }

        // Usar upsert: crea si no existe, actualiza si existe
        const courseSubject = await prisma.courseSubject.upsert({
          where: {
            courseId_subjectId: {
              courseId: data.courseId,
              subjectId: data.subjectId,
            },
          },
          update: {
            teacherId: data.teacherId || null,
            schedule: data.schedule || null,
          },
          create: {
            courseId: data.courseId,
            subjectId: data.subjectId,
            teacherId: data.teacherId || null,
            schedule: data.schedule || null,
          },
          include: {
            course: true,
            subject: true,
            teacher: {
              select: { id: true, name: true, email: true },
            },
          },
        });

        const isNew = courseSubject.createdAt.getTime() === courseSubject.updatedAt.getTime();
        const message = isNew
          ? "Profesor asignado a la materia exitosamente"
          : "Asignación de profesor actualizada exitosamente";

        return c.json({ message, courseSubject }, 201);
      } catch (error) {
        console.error(error);
        return c.json({ message: "Error al asignar profesor a la materia" }, 500);
      }
    }
  )
  .put(
    "/:id",
    zValidator("json", updateCourseSubjectSchema, (result, c) => {
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
        const courseSubject = await prisma.courseSubject.update({
          where: { id },
          data,
          include: {
            course: true,
            subject: true,
            teacher: {
              select: { name: true, email: true },
            },
          },
        });

        return c.json(
          { message: "Asignación actualizada exitosamente", courseSubject },
          200
        );
      } catch (error) {
        console.error(error);
        return c.json({ message: "Error al actualizar la asignación" }, 500);
      }
    }
  )
  .delete("/:id", async (c) => {
    const prisma = c.get("prisma");
    const id = c.req.param("id");

    try {
      await prisma.courseSubject.delete({
        where: { id },
      });

      return c.json({ message: "Asignación eliminada exitosamente" }, 200);
    } catch (error) {
      console.error(error);
      return c.json({ message: "Error al eliminar la asignación" }, 500);
    }
  })
  // Obtener courseSubjects por subjectId (para notificaciones)
  .get("/by-subject/:subjectId", async (c) => {
    const prisma = c.get("prisma");
    const { subjectId } = c.req.param();

    try {
      // Verificar que la materia existe
      const subject = await prisma.subject.findUnique({
        where: { id: subjectId },
      });

      if (!subject) {
        return c.json({ message: "Materia no encontrada" }, 404);
      }

      // Obtener todos los courseSubjects de esta materia
      const courseSubjects = await prisma.courseSubject.findMany({
        where: { subjectId },
        select: {
          id: true,
          courseId: true,
          course: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return c.json({ courseSubjects }, 200);
    } catch (error) {
      console.error(error);
      return c.json({ message: "Error al obtener courseSubjects" }, 500);
    }
  });

export default app;
