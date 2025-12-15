import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import auth from "@/lib/middlewares/auth-middleware";
import { markAsReadSchema } from "../schemas";

const app = new Hono()
  .use("*", auth)
  // Obtener notificaciones del estudiante
  .get("/", async (c) => {
    const prisma = c.get("prisma");
    const user = c.get("user");

    try {
      // Solo estudiantes pueden ver notificaciones
      if (user.role !== "STUDENT") {
        return c.json({ message: "Solo los estudiantes pueden ver notificaciones" }, 403);
      }

      // Obtener notificaciones no expiradas y no leídas primero
      const now = new Date();
      const notifications = await prisma.notification.findMany({
        where: {
          studentId: user.sub,
          expiresAt: {
            gt: now, // Solo notificaciones no expiradas
          },
        },
        orderBy: [
          { isRead: "asc" }, // No leídas primero
          { createdAt: "desc" }, // Más recientes primero
        ],
        take: 50, // Limitar a 50 notificaciones
      });

      return c.json({ notifications }, 200);
    } catch (error) {
      console.error(error);
      return c.json({ message: "Error al obtener notificaciones" }, 500);
    }
  })
  // Marcar notificación como leída
  .post(
    "/mark-read",
    zValidator("json", markAsReadSchema, (result, c) => {
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
        // Solo estudiantes pueden marcar notificaciones como leídas
        if (user.role !== "STUDENT") {
          return c.json(
            { message: "Solo los estudiantes pueden marcar notificaciones" },
            403
          );
        }

        // Verificar que la notificación existe y pertenece al estudiante
        const notification = await prisma.notification.findUnique({
          where: { id: data.notificationId },
        });

        if (!notification) {
          return c.json({ message: "Notificación no encontrada" }, 404);
        }

        if (notification.studentId !== user.sub) {
          return c.json(
            { message: "No tienes permiso para esta notificación" },
            403
          );
        }

        // Marcar como leída
        const updatedNotification = await prisma.notification.update({
          where: { id: data.notificationId },
          data: { isRead: true },
        });

        return c.json({
          message: "Notificación marcada como leída",
          notification: updatedNotification,
        });
      } catch (error) {
        console.error(error);
        return c.json({ message: "Error al marcar notificación" }, 500);
      }
    }
  )
  // Obtener subjectId desde courseSubjectId
  .get("/subject/:courseSubjectId", async (c) => {
    const prisma = c.get("prisma");
    const { courseSubjectId } = c.req.param();

    try {
      const courseSubject = await prisma.courseSubject.findUnique({
        where: { id: courseSubjectId },
        select: {
          subjectId: true,
        },
      });

      if (!courseSubject) {
        return c.json({ message: "Curso-materia no encontrado" }, 404);
      }

      return c.json({ subjectId: courseSubject.subjectId }, 200);
    } catch (error) {
      console.error(error);
      return c.json({ message: "Error al obtener subjectId" }, 500);
    }
  })
  // Limpiar notificaciones expiradas (se puede llamar periódicamente)
  .post("/cleanup", async (c) => {
    const prisma = c.get("prisma");
    const user = c.get("user");

    try {
      // Solo admins pueden ejecutar la limpieza manualmente
      // En producción, esto debería ejecutarse automáticamente con un cron job
      if (user.role !== "ADMIN") {
        return c.json({ message: "No autorizado" }, 403);
      }

      const now = new Date();
      const result = await prisma.notification.deleteMany({
        where: {
          expiresAt: {
            lte: now, // Eliminar notificaciones expiradas
          },
        },
      });

      return c.json({
        message: "Notificaciones expiradas eliminadas",
        deletedCount: result.count,
      });
    } catch (error) {
      console.error(error);
      return c.json({ message: "Error al limpiar notificaciones" }, 500);
    }
  });

export default app;
