import type { PrismaClient } from "@/src/generated/prisma/client";

type NotificationType = "QUIZ" | "ASSIGNMENT";

interface CreateNotificationParams {
  prisma: PrismaClient;
  type: NotificationType;
  title: string;
  message: string;
  relatedId: string;
  courseSubjectId: string;
  studentIds: string[];
}

/**
 * Crea notificaciones para múltiples estudiantes
 */
export async function createNotifications({
  prisma,
  type,
  title,
  message,
  relatedId,
  courseSubjectId,
  studentIds,
}: CreateNotificationParams) {
  if (studentIds.length === 0) {
    return;
  }

  // Calcular fecha de expiración (72 horas desde ahora)
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 72);

  // Crear notificaciones para todos los estudiantes
  const notifications = studentIds.map((studentId) => ({
    type,
    title,
    message,
    relatedId,
    courseSubjectId,
    studentId,
    expiresAt,
  }));

  await prisma.notification.createMany({
    data: notifications,
  });
}
