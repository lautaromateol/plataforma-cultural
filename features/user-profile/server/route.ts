import { Hono } from "hono";
import auth from "@/lib/middlewares/auth-middleware";

const app = new Hono()
  .get("/:id", auth, async (c) => {
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
          studentProfile: {
            select: {
              birthDate: true,
              phone: true,
            },
          },
        },
      });

      if (!student) {
        return c.json({ message: "Estudiante no encontrado" }, 404);
      }

      // Construir la respuesta con datos públicos
      const publicProfile = {
        id: student.id,
        name: student.name,
        email: student.email,
        dni: student.dni,
        birthDate: student.studentProfile?.birthDate || null,
        phone: student.studentProfile?.phone || null,
      };

      return c.json({ profile: publicProfile }, 200);
    } catch (error) {
      console.error(error);
      return c.json({ message: "Error al obtener el perfil" }, 500);
    }
  });

export default app;
