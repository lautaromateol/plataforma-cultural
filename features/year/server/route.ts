import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createYearSchema, updateYearSchema } from "../schemas";
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

    try {
      const years = await prisma.year.findMany({
        orderBy: { level: "asc" },
        include: {
          subjects: true,
          courses: {
            include: {
              _count: {
                select: { enrollments: true },
              },
            },
          },
        },
      });

      return c.json({ years }, 200);
    } catch (error) {
      console.error(error);
      return c.json({ message: "Error al obtener los años" }, 500);
    }
  })
  .post(
    "/",
    zValidator("json", createYearSchema, (result, c) => {
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
        const existingYear = await prisma.year.findFirst({
          where: {
            OR: [{ level: data.level }, { name: data.name }],
          },
        });

        if (existingYear) {
          return c.json(
            { message: "Ya existe un año con ese nivel o nombre" },
            400
          );
        }

        const year = await prisma.year.create({
          data,
        });

        return c.json({ message: "Año creado exitosamente", year }, 201);
      } catch (error) {
        console.error(error);
        return c.json({ message: "Error al crear el año" }, 500);
      }
    }
  )
  .get("/:id", async (c) => {
    const prisma = c.get("prisma");
    const id = c.req.param("id");

    try {
      const year = await prisma.year.findUnique({
        where: { id },
        include: {
          subjects: true,
          courses: {
            include: {
              courseSubjects: {
                include: {
                  subject: true,
                  teacher: {
                    select: { name: true, email: true },
                  },
                },
              },
              _count: {
                select: { enrollments: true },
              },
            },
          },
        },
      });

      if (!year) {
        return c.json({ message: "Año no encontrado" }, 404);
      }

      return c.json({ year }, 200);
    } catch (error) {
      console.error(error);
      return c.json({ message: "Error al obtener el año" }, 500);
    }
  })
  .get("/level/:level", async (c) => {
    const prisma = c.get("prisma");
    const level = parseInt(c.req.param("level"));

    if (isNaN(level) || level < 1 || level > 6) {
      return c.json({ message: "Nivel inválido" }, 400);
    }

    try {
      const year = await prisma.year.findUnique({
        where: { level },
      });

      if (!year) {
        return c.json({ message: "Año no encontrado" }, 404);
      }

      return c.json(
        {
          year: {
            id: year.id,
            level: year.level,
            name: year.name,
            description: year.description,
          },
        },
        200
      );
    } catch (error) {
      console.error(error);
      return c.json({ message: "Error al obtener el año" }, 500);
    }
  })
  .put(
    "/:id",
    zValidator("json", updateYearSchema, (result, c) => {
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
        const year = await prisma.year.update({
          where: { id },
          data,
        });

        return c.json({ message: "Año actualizado exitosamente", year }, 200);
      } catch (error) {
        console.error(error);
        return c.json({ message: "Error al actualizar el año" }, 500);
      }
    }
  )
  .delete("/:id", async (c) => {
    const prisma = c.get("prisma");
    const id = c.req.param("id");

    try {
      await prisma.year.delete({
        where: { id },
      });

      return c.json({ message: "Año eliminado exitosamente" }, 200);
    } catch (error) {
      console.error(error);
      return c.json({ message: "Error al eliminar el año" }, 500);
    }
  });

export default app;
