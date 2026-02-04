import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createStudyPlanSchema, updateStudyPlanSchema } from "../schemas";
import auth from "@/lib/middlewares/auth-middleware";

const app = new Hono()
  .use("*", auth)
  .get("/", async (c) => {
    const prisma = c.get("prisma");

    try {
      const studyPlans = await prisma.studyPlan.findMany({
        orderBy: { name: "asc" },
        include: {
          levels: {
            orderBy: { order: "asc" },
          },
          _count: {
            select: { levels: true },
          },
        },
      });

      return c.json({ studyPlans }, 200);
    } catch (error) {
      console.error(error);
      return c.json({ message: "Error al obtener los planes de estudio" }, 500);
    }
  })
  .get("/:id", async (c) => {
    const prisma = c.get("prisma");
    const id = c.req.param("id");

    try {
      const studyPlan = await prisma.studyPlan.findUnique({
        where: { id },
        include: {
          levels: {
            orderBy: { order: "asc" },
            include: {
              subjects: true,
              courses: {
                include: {
                  enrollments: {
                    include: {
                      student: {
                        select: {
                          id: true,
                          name: true,
                          email: true,
                          dni: true,
                        },
                      },
                    },
                  },
                  courseSubjects: {
                    include: {
                      subject: true,
                      teacher: {
                        select: {
                          id: true,
                          name: true,
                          email: true,
                        },
                      },
                    },
                  },
                  _count: {
                    select: { enrollments: true },
                  },
                },
              },
              _count: {
                select: { subjects: true, courses: true },
              },
            },
          },
        },
      });

      if (!studyPlan) {
        return c.json({ message: "Plan de estudio no encontrado" }, 404);
      }

      return c.json({ studyPlan }, 200);
    } catch (error) {
      console.error(error);
      return c.json({ message: "Error al obtener el plan de estudio" }, 500);
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
    zValidator("json", createStudyPlanSchema, (result, c) => {
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
        const existing = await prisma.studyPlan.findFirst({
          where: {
            OR: [{ code: data.code }, { name: data.name }],
          },
        });

        if (existing) {
          return c.json(
            { message: "Ya existe un plan con ese código o nombre" },
            400
          );
        }

        const studyPlan = await prisma.studyPlan.create({
          data,
        });

        return c.json(
          { message: "Plan de estudio creado exitosamente", studyPlan },
          201
        );
      } catch (error) {
        console.error(error);
        return c.json({ message: "Error al crear el plan de estudio" }, 500);
      }
    }
  )
  .put(
    "/:id",
    zValidator("json", updateStudyPlanSchema, (result, c) => {
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
        const studyPlan = await prisma.studyPlan.update({
          where: { id },
          data,
        });

        return c.json(
          { message: "Plan de estudio actualizado exitosamente", studyPlan },
          200
        );
      } catch (error) {
        console.error(error);
        return c.json(
          { message: "Error al actualizar el plan de estudio" },
          500
        );
      }
    }
  )
  .delete("/:id", async (c) => {
    const prisma = c.get("prisma");
    const id = c.req.param("id");

    try {
      await prisma.studyPlan.delete({
        where: { id },
      });

      return c.json({ message: "Plan de estudio eliminado exitosamente" }, 200);
    } catch (error) {
      console.error(error);
      return c.json({ message: "Error al eliminar el plan de estudio" }, 500);
    }
  });

export default app;
