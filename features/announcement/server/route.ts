import auth from "@/lib/middlewares/auth-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createAnnouncementSchema } from "../schemas";

const app = new Hono()
    .use("*", auth)
    .use("*", async (c, next) => {
        const user = c.get("user")
        if (user.role !== "TEACHER") {
            return c.json({ message: "No estas autorizado a realizar esta acción." }, 403)
        }

        await next();
    })
    .get("/:courseSubjectId", async (c) => {
        try {
            const prisma = c.get("prisma")
            const { courseSubjectId } = c.req.param()

            const courseSubject = await prisma.courseSubject.findUnique({
                where: {
                    id: courseSubjectId
                }
            })

            if (!courseSubject) {
                return c.json({ message: "No existe la relación curso-materia en la que intentas crear el anuncio." }, 404)
            }

            const announcements = await prisma.announcement.findMany({
                where: {
                    courseSubjectId
                }
            })

            return c.json({ announcements }, 200)
        } catch (error) {
            return c.json({ message: "Hubo un error al intentar obtener los avisos del curso. Intenta de nuevo mas tarde." }, 500)
        }
    })
    .post(
        "/:courseSubjectId",
        zValidator("json", createAnnouncementSchema, (result, c) => {
            if (!result.success) {
                return c.json({ message: "Datos invalidos", errors: result.error.issues }, 400)
            }
        }),
        async (c) => {
            try {
                const user = c.get("user")
                const prisma = c.get("prisma")
                const { courseSubjectId } = c.req.param()
                const { message } = c.req.valid("json")

                const teacherId = user.sub

                const dbCourseSubject = await prisma.courseSubject.findUnique({
                    where: {
                        id: courseSubjectId
                    }
                })

                if (!dbCourseSubject) {
                    return c.json({ message: "No existe la relación curso-materia en la que intentas crear el anuncio." }, 404)
                }

                if (dbCourseSubject.teacherId !== teacherId) {
                    return c.json({ message: "No eres un profesor autorizado para este curso." }, 403)
                }

                const announcement = await prisma.announcement.create({
                    data: {
                        message,
                        teacherId,
                        courseSubjectId
                    }
                })

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
            try {
                const user = c.get("user")
                const prisma = c.get("prisma")
                const { id } = c.req.param()
                const { message } = c.req.valid("json")

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
            try {
                const user = c.get("user")
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