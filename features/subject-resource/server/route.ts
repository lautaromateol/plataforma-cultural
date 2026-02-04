import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import auth from "@/lib/middlewares/auth-middleware";
import {
  createResourceSchema,
  updateResourceSchema,
} from "../schemas";

const app = new Hono()
  .use("*", auth)
  .get("/:subjectId", async (c) => {
    const prisma = c.get("prisma");
    const user = c.get("user");
    const { subjectId } = c.req.param();

    try {
      // Verificar que el usuario tiene acceso a esta materia
      const subject = await prisma.subject.findUnique({
        where: { id: subjectId },
        include: {
          level: true,
          courseSubjects: {
            include: {
              course: {
                include: {
                  enrollments: {
                    where: { studentId: user.sub },
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

      // Verificar permisos:
      // - Si es profesor, debe estar asignado a la materia en al menos un curso
      // - Si es estudiante, debe estar matriculado en un curso del mismo nivel que la materia
      // - Si es admin, tiene acceso total
      let hasAccess = false;

      if (user.role === "ADMIN") {
        hasAccess = true;
      } else if (user.role === "TEACHER") {
        const isTeacherOfSubject = subject.courseSubjects.some(
          (cs) => cs.teacherId === user.sub
        );
        hasAccess = isTeacherOfSubject;
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

      // Obtener los recursos
      const resources = await prisma.subjectResource.findMany({
        where: { subjectId },
        include: {
          uploadedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return c.json({ resources });
    } catch (error) {
      console.error(error);
      return c.json({ message: "Error al obtener recursos" }, 500);
    }
  })
  .post(
    "/",
    zValidator("json", createResourceSchema, (result, c) => {
      if (!result.success) {
        return c.json(
          { message: "Datos inválidos", errors: result.error.issues },
          400
        );
      }
    }),
    async (c) => {
      const prisma = c.get("prisma");
      const user = c.get("user");
      const data = c.req.valid("json");

      try {
        // Verificar que el usuario es profesor de esta materia
        if (user.role !== "TEACHER" && user.role !== "ADMIN") {
          return c.json(
            { message: "Solo los profesores pueden subir recursos" },
            403
          );
        }

        // Verificar que el profesor está asignado a esta materia
        if (user.role === "TEACHER") {
          const assignment = await prisma.courseSubject.findFirst({
            where: {
              subjectId: data.subjectId,
              teacherId: user.sub,
            },
          });

          if (!assignment) {
            return c.json(
              { message: "No estás asignado a esta materia" },
              403
            );
          }
        }

        // Crear el recurso
        const resource = await prisma.subjectResource.create({
          data: {
            title: data.title,
            description: data.description,
            fileName: data.fileName,
            fileUrl: data.fileUrl,
            fileType: data.fileType,
            fileSize: data.fileSize,
            subjectId: data.subjectId,
            uploadedById: user.sub,
          },
          include: {
            uploadedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        return c.json({ message: "Recurso creado exitosamente", resource }, 201);
      } catch (error) {
        console.error(error);
        return c.json({ message: "Error al crear recurso" }, 500);
      }
    }
  )
  .patch(
    "/:id",
    zValidator("json", updateResourceSchema, (result, c) => {
      if (!result.success) {
        return c.json(
          { message: "Datos inválidos", errors: result.error.issues },
          400
        );
      }
    }),
    async (c) => {
      const prisma = c.get("prisma");
      const user = c.get("user");
      const { id } = c.req.param();
      const data = c.req.valid("json");

      try {
        // Verificar que el recurso existe
        const resource = await prisma.subjectResource.findUnique({
          where: { id },
          include: {
            subject: {
              include: {
                courseSubjects: {
                  where: { teacherId: user.sub },
                },
              },
            },
          },
        });

        if (!resource) {
          return c.json({ message: "Recurso no encontrado" }, 404);
        }

        // Verificar permisos: solo el creador o un admin pueden editar
        if (
          user.role !== "ADMIN" &&
          resource.uploadedById !== user.sub
        ) {
          return c.json(
            { message: "No tienes permiso para editar este recurso" },
            403
          );
        }

        // Actualizar el recurso
        const updatedResource = await prisma.subjectResource.update({
          where: { id },
          data: {
            title: data.title,
            description: data.description,
          },
          include: {
            uploadedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        return c.json({
          message: "Recurso actualizado exitosamente",
          resource: updatedResource,
        });
      } catch (error) {
        console.error(error);
        return c.json({ message: "Error al actualizar recurso" }, 500);
      }
    }
  )
  .delete("/:id", async (c) => {
    const prisma = c.get("prisma");
    const user = c.get("user");
    const { id } = c.req.param();

    try {
      // Verificar que el recurso existe
      const resource = await prisma.subjectResource.findUnique({
        where: { id },
      });

      if (!resource) {
        return c.json({ message: "Recurso no encontrado" }, 404);
      }

      // Verificar permisos: solo el creador o un admin pueden eliminar
      if (
        user.role !== "ADMIN" &&
        resource.uploadedById !== user.sub
      ) {
        return c.json(
          { message: "No tienes permiso para eliminar este recurso" },
          403
        );
      }

      // Eliminar el recurso
      await prisma.subjectResource.delete({
        where: { id },
      });

      return c.json({ message: "Recurso eliminado exitosamente" });
    } catch (error) {
      console.error(error);
      return c.json({ message: "Error al eliminar recurso" }, 500);
    }
  });

export default app;

