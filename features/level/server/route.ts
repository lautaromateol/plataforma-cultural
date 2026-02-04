import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createLevelSchema, updateLevelSchema } from "../schemas";
import auth from "@/lib/middlewares/auth-middleware";

const app = new Hono()
  .use("*", auth)
  .get("/", async (c) => {
    const prisma = c.get("prisma");
    const { studyPlanId } = c.req.query();

    try {
      const where = studyPlanId ? { studyPlanId } : {};

      const levels = await prisma.level.findMany({
        where,
        orderBy: [{ studyPlanId: "asc" }, { order: "asc" }],
        include: {
          studyPlan: {
            select: { id: true, name: true, code: true },
          },
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

      return c.json({ levels }, 200);
    } catch (error) {
      console.error(error);
      return c.json({ message: "Error al obtener los niveles" }, 500);
    }
  })
  .get("/:id", async (c) => {
    const prisma = c.get("prisma");
    const id = c.req.param("id");

    try {
      const level = await prisma.level.findUnique({
        where: { id },
        include: {
          studyPlan: true,
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

      if (!level) {
        return c.json({ message: "Nivel no encontrado" }, 404);
      }

      return c.json({ level }, 200);
    } catch (error) {
      console.error(error);
      return c.json({ message: "Error al obtener el nivel" }, 500);
    }
  })
  .use("*", async (c, next) => {
    const user = c.get("user");
    if (user.role !== "ADMIN") {
      return c.json({ message: "No autorizado" }, 403);
    }
    await next();
  })
  .post(
    "/",
    zValidator("json", createLevelSchema, (result, c) => {
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
        const existingLevel = await prisma.level.findFirst({
          where: {
            studyPlanId: data.studyPlanId,
            OR: [{ order: data.order }, { name: data.name }],
          },
        });

        if (existingLevel) {
          return c.json(
            {
              message:
                "Ya existe un nivel con ese orden o nombre en este plan",
            },
            400
          );
        }

        const level = await prisma.level.create({
          data,
          include: {
            studyPlan: {
              select: { id: true, name: true, code: true },
            },
          },
        });

        return c.json({ message: "Nivel creado exitosamente", level }, 201);
      } catch (error) {
        console.error(error);
        return c.json({ message: "Error al crear el nivel" }, 500);
      }
    }
  )
  .put(
    "/:id",
    zValidator("json", updateLevelSchema, (result, c) => {
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
        const level = await prisma.level.update({
          where: { id },
          data,
          include: {
            studyPlan: {
              select: { id: true, name: true, code: true },
            },
          },
        });

        return c.json(
          { message: "Nivel actualizado exitosamente", level },
          200
        );
      } catch (error) {
        console.error(error);
        return c.json({ message: "Error al actualizar el nivel" }, 500);
      }
    }
  )
  .delete("/:id", async (c) => {
    const prisma = c.get("prisma");
    const id = c.req.param("id");

    try {
      await prisma.level.delete({
        where: { id },
      });

      return c.json({ message: "Nivel eliminado exitosamente" }, 200);
    } catch (error) {
      console.error(error);
      return c.json({ message: "Error al eliminar el nivel" }, 500);
    }
  });

export default app;
