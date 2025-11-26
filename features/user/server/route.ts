import bcrypt from "bcryptjs";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createUserSchema, updateUserSchema } from "../schemas";
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
    const { role, search } = c.req.query();

    try {
      const where: any = {};

      if (role) where.role = role;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { dni: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ];
      }

      const users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          dni: true,
          email: true,
          name: true,
          role: true,
          isVerified: true,
          firstLogin: true,
          createdAt: true,
          studentProfile: true,
          teacherProfile: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return c.json({ users }, 200);
    } catch (error) {
      console.error(error);
      return c.json({ message: "Error al obtener los usuarios" }, 500);
    }
  })
  .get("/teachers", async (c) => {
    const prisma = c.get("prisma");

    try {
      const teachers = await prisma.user.findMany({
        where: { role: "TEACHER" },
        select: {
          id: true,
          dni: true,
          email: true,
          name: true,
          teacherProfile: true,
        },
        orderBy: { name: "asc" },
      });

      return c.json({ teachers }, 200);
    } catch (error) {
      console.error(error);
      return c.json({ message: "Error al obtener los profesores" }, 500);
    }
  })
  .get("/students", async (c) => {
    const prisma = c.get("prisma");

    try {
      const students = await prisma.user.findMany({
        where: { role: "STUDENT" },
        select: {
          id: true,
          dni: true,
          email: true,
          name: true,
          studentProfile: true,
          enrollments: {
            include: {
              course: {
                include: { year: true },
              },
            },
          },
        },
        orderBy: { name: "asc" },
      });

      return c.json({ students }, 200);
    } catch (error) {
      console.error(error);
      return c.json({ message: "Error al obtener los estudiantes" }, 500);
    }
  })
  .get("/:id", async (c) => {
    const prisma = c.get("prisma");
    const id = c.req.param("id");

    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          dni: true,
          email: true,
          name: true,
          role: true,
          isVerified: true,
          firstLogin: true,
          createdAt: true,
          studentProfile: true,
          teacherProfile: true,
          enrollments: {
            include: {
              course: {
                include: { year: true },
              },
            },
          },
          courseSubjects: {
            include: {
              course: true,
              subject: true,
            },
          },
        },
      });

      if (!user) {
        return c.json({ message: "Usuario no encontrado" }, 404);
      }

      return c.json({ user }, 200);
    } catch (error) {
      console.error(error);
      return c.json({ message: "Error al obtener el usuario" }, 500);
    }
  })
  .post(
    "/",
    zValidator("json", createUserSchema, (result, c) => {
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
        // Verificar si el DNI ya existe
        const existingUser = await prisma.user.findUnique({
          where: { dni: data.dni },
        });

        if (existingUser) {
          return c.json({ message: "Ya existe un usuario con este DNI" }, 400);
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(data.password, 12);

        const user = await prisma.user.create({
          data: {
            ...data,
            password: hashedPassword,
          },
          select: {
            id: true,
            dni: true,
            email: true,
            name: true,
            role: true,
            isVerified: true,
            firstLogin: true,
          },
        });

        return c.json({ message: "Usuario creado exitosamente", user }, 201);
      } catch (error) {
        console.error(error);
        return c.json({ message: "Error al crear el usuario" }, 500);
      }
    }
  )
  .put(
    "/:id",
    zValidator("json", updateUserSchema, (result, c) => {
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
        const updateData: any = { ...data };

        // Si se actualiza la contraseña, hacer hash
        if (data.password) {
          updateData.password = await bcrypt.hash(data.password, 12);
        }

        const user = await prisma.user.update({
          where: { id },
          data: updateData,
          select: {
            id: true,
            dni: true,
            email: true,
            name: true,
            role: true,
            isVerified: true,
            firstLogin: true,
          },
        });

        return c.json(
          { message: "Usuario actualizado exitosamente", user },
          200
        );
      } catch (error) {
        console.error(error);
        return c.json({ message: "Error al actualizar el usuario" }, 500);
      }
    }
  )
  .delete("/:id", async (c) => {
    const prisma = c.get("prisma");
    const id = c.req.param("id");

    try {
      await prisma.user.delete({
        where: { id },
      });

      return c.json({ message: "Usuario eliminado exitosamente" }, 200);
    } catch (error) {
      console.error(error);
      return c.json({ message: "Error al eliminar el usuario" }, 500);
    }
  });

export default app;
