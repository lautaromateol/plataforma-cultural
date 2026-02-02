import { Hono } from "hono";
import auth from "@/lib/middlewares/auth-middleware";
import { zValidator } from "@hono/zod-validator";
import { updateStudentProfileSchema } from "../schemas";

const app = new Hono()
  .use("*", auth)
  .get("/:id", async (c) => {
    const prisma = c.get("prisma");
    const { id } = c.req.param();

    try {
      const student = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          dni: true,
          role: true,
          studentProfile: true
        },
      });

      if (!student) {
        return c.json({ message: "Estudiante no encontrado" }, 404);
      }

      const publicProfile = {
        id: student.id,
        name: student.name,
        email: student.email,
        dni: student.dni,
        role: student.role,
        birthDate: student.studentProfile?.birthDate || null,
        phone: student.studentProfile?.phone || null,
        guardianName: student.studentProfile?.guardianName || null,
        guardianPhone: student.studentProfile?.guardianPhone || null,
      };

      return c.json({ profile: publicProfile }, 200);
    } catch (error) {
      console.error(error);
      return c.json({ message: "Error al obtener el perfil" }, 500);
    }
  })
  .patch("/:id",
    zValidator("json", updateStudentProfileSchema, (result, c) => {
      if (!result.success) {
        return c.json({ message: "Datos inválidos", errors: result.error.issues }, 400);
      }
    }),
    async (c) => {
      const user = c.get("user");
      const prisma = c.get("prisma");
      const { id } = c.req.param();

      if (user.sub !== id) {
        return c.json({ message: "No autorizado para actualizar este perfil" }, 403);
      }

      const { birthDate, phone, guardianName, guardianPhone } = c.req.valid("json");


      try {
        const updatedStudentProfile = await prisma.studentProfile.upsert({
          where: { userId: id },
          update: {
            birthDate: birthDate ? new Date(birthDate + 'T00:00:00') : null,
            phone,
            guardianName,
            guardianPhone
          },
          create: {
            userId: id,
            birthDate: birthDate ? new Date(birthDate + 'T00:00:00') : null,
            phone,
            guardianName,
            guardianPhone
          }
        });

        return c.json({ profile: updatedStudentProfile }, 200);
      } catch (error) {
        console.error(error);
        return c.json({ message: "Error al actualizar el perfil del estudiante" }, 500);
      }
    })

export default app;
