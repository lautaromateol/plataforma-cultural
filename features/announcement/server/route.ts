import auth from "@/lib/middlewares/auth-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createAnnouncementSchema } from "../schemas";
import { createNotifications } from "@/features/notification/api/create-notification";
import { format } from "date-fns";

const app = new Hono()
    .use("*", auth)
    .get("/:subjectId", async (c) => {
        try {
            const prisma = c.get("prisma")
            const { subjectId } = c.req.param()

            const subject = await prisma.subject.findUnique({
                where: {
                    id: subjectId
                }
            })

            if (!subject) {
                return c.json({ message: "No existe la materia." }, 404)
            }

            const announcements = await prisma.announcement.findMany({
                where: {
                    subjectId: subject.id
                },
                include: {
                    teacher: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            })

            return c.json({ announcements }, 200)
        } catch (error) {
            return c.json({ message: "Hubo un error al intentar obtener los avisos del curso. Intenta de nuevo mas tarde." }, 500)
        }
    })
    .post(
        "/:subjectId",
        zValidator("json", createAnnouncementSchema, (result, c) => {
            if (!result.success) {
                return c.json({ message: "Datos invalidos", errors: result.error.issues }, 400)
            }
        }),
        async (c) => {
            const user = c.get("user")
            if (user.role !== "TEACHER") {
                return c.json({ message: "No estas autorizado a realizar esta acción." }, 403)
            }
            try {
                const prisma = c.get("prisma")
                const { subjectId } = c.req.param()
                const { title, message } = c.req.valid("json")

                const teacherId = user.sub

                const subject = await prisma.subject.findUnique({
                    where: {
                        id: subjectId,
                    },
                    include: {
                        courseSubjects: {
                            where: {
                                teacherId
                            }
                        }
                    }
                })

                if (!subject) {
                    return c.json({ message: "No existe la materia en la que intentas crear el anuncio." }, 404)
                }

                if (!subject.courseSubjects.find(cs => cs.teacherId === teacherId)) {
                    return c.json({ message: "No estas autorizado a crear un aviso en esta materia." }, 403)
                }

                const announcement = await prisma.announcement.create({
                    data: {
                        title,
                        message,
                        teacherId,
                        subjectId
                    }
                })

                // Obtener información de los cursos-materias con enrollments para las notificaciones
                const courseSubjectsWithEnrollments = await prisma.courseSubject.findMany({
                    where: {
                        subjectId
                    },
                    include: {
                        course: {
                            include: {
                                enrollments: {
                                    where: { status: "ACTIVE" },
                                    select: {
                                        studentId: true
                                    }
                                }
                            }
                        }
                    }
                })

                // Emitir notificaciones a todos los estudiantes de los cursos seleccionados
                try {
                    const notificationsToCreate: Array<{
                        courseSubjectId: string;
                        studentIds: string[];
                    }> = [];

                    courseSubjectsWithEnrollments.forEach((cs) => {
                        const studentIds = cs.course.enrollments.map((e) => e.studentId);
                        if (studentIds.length > 0) {
                            notificationsToCreate.push({
                                courseSubjectId: cs.id,
                                studentIds,
                            });
                        }
                    });

                    // Crear notificaciones para cada curso-materia
                    for (const notif of notificationsToCreate) {
                        await createNotifications({
                            prisma,
                            type: "ANNOUNCEMENT",
                            title: `Nuevo Aviso: ${announcement.title}`,
                            message: announcement.message,
                            relatedId: announcement.id,
                            courseSubjectId: notif.courseSubjectId,
                            studentIds: notif.studentIds,
                        });
                    }
                } catch (notificationError) {
                    console.error("Error al crear notificaciones:", notificationError);
                    // No fallar la creación del aviso si falla la notificación
                }

                return c.json({ announcement }, 200)
            } catch (error) {
                return c.json({ message: "Hubo un error al crear el aviso. Intenta de nuevo mas tarde." }, 500)
            }
        }
    )
    .put(
        "/:id",
        zValidator("json", createAnnouncementSchema, (result, c) => {
            if (!result.success) {
                return c.json({ message: "Datos invalidos", errors: result.error.issues }, 400)
            }
        }),
        async (c) => {
            const user = c.get("user")
            if (user.role !== "TEACHER") {
                return c.json({ message: "No estas autorizado a realizar esta acción." }, 403)
            }
            try {
                const prisma = c.get("prisma")
                const { id } = c.req.param()
                const { title, message } = c.req.valid("json")

                const teacherId = user.sub

                const dbAnnouncement = await prisma.announcement.findUnique({
                    where: {
                        id
                    }
                })

                if (!dbAnnouncement) {
                    return c.json({ message: "Anuncio no encontrado." }, 404)
                }

                if (dbAnnouncement.teacherId !== teacherId) {
                    return c.json({ message: "No estas autorizado a modificar este aviso." }, 403)
                }

                const announcement = await prisma.announcement.update({
                    where: {
                        id
                    },
                    data: {
                        title,
                        message,
                    }
                })

                return c.json({ announcement }, 200)
            } catch (error) {
                return c.json({ message: "Hubo un error al actualizar el aviso. Intenta de nuevo mas tarde." }, 500)
            }
        }
    )
    .delete(
        "/:id",
        async (c) => {
            const user = c.get("user")
            if (user.role !== "TEACHER") {
                return c.json({ message: "No estas autorizado a realizar esta acción." }, 403)
            }
            try {
                const prisma = c.get("prisma")
                const { id } = c.req.param()

                const teacherId = user.sub

                const dbAnnouncement = await prisma.announcement.findUnique({
                    where: {
                        id
                    }
                })

                if (!dbAnnouncement) {
                    return c.json({ message: "Anuncio no encontrado." }, 404)
                }

                if (dbAnnouncement.teacherId !== teacherId) {
                    return c.json({ message: "No estas autorizado a eliminar este aviso." }, 403)
                }

                const announcement = await prisma.announcement.delete({
                    where: {
                        id
                    }
                })

                return c.json({ announcement }, 200)
            } catch (error) {
                return c.json({ message: "Hubo un error al eliminar el aviso. Intenta de nuevo mas tarde." }, 500)
            }
        }
    )

export default app;