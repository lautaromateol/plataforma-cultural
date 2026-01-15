import z from "zod";
import bcrypt from "bcryptjs";
import auth from "@/lib/middlewares/auth-middleware";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import { setCookie, deleteCookie } from "hono/cookie";
import { zValidator } from "@hono/zod-validator";
import { Resend } from "resend";
import { randomBytes } from "node:crypto";
import { createMailSchema, resendMailSchema, signInSchema } from "../schemas";
import { createVerificationMail } from "@/lib/utils";

const app = new Hono()
  .get("/", auth, async (c) => {
    const user = c.get("user");
    const prisma = c.get("prisma");

    const dbUser = await prisma.user.findUnique({
      where: { id: user.sub },
      select: {
        id: true,
        name: true,
        email: true,
        dni: true,
        role: true,
      },
    });

    if (!dbUser) {
      return c.json({ message: "Usuario no encontrado." }, 404);
    }

    return c.json({ message: "Usuario encontrado.", user: dbUser }, 200);
  })
  .post(
    "/login",
    zValidator("json", signInSchema, (result, c) => {
      if (!result.success) {
        return c.json({ message: "Invalid data." }, 400);
      }
    }),
    async (c) => {
      const prisma = c.get("prisma");
      const { email, password, dni } = c.req.valid("json");

      const dbUser = await prisma.user.findUnique({
        where: dni ? { dni } : { email },
      });

      if (!dbUser) {
        return c.json(
          {
            message: "Tus credenciales son incorrectas.",
          },
          401
        );
      }

      const isPassword = await bcrypt.compare(password, dbUser.password);

      if (!isPassword) {
        return c.json(
          {
            message: "Tus credenciales son incorrectas.",
          },
          401
        );
      }

      if (dbUser.firstLogin && !dbUser.isVerified) {
        return c.json(
          {
            name: dbUser.name,
            dni: dbUser.dni,
            redirect: true,
          },
          301
        );
      }

      if (!dbUser.isVerified) {
        return c.json(
          {
            message: `Debes verificar esta dirección de correo electrónico. Verifica la bandeja de entrada de ${dbUser.email}`,
          },
          403
        );
      }

      const payload = {
        sub: dbUser.id,
        dni: dbUser.dni,
        email: dbUser.email,
        role: dbUser.role,
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
      };

      const token = await sign(payload, process.env.JWT_SECRET!, "HS256");

      setCookie(c, "token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "Lax",
        path: "/",
        expires: new Date(payload.exp * 1000),
      });

      return c.json(
        {
          ok: true,
          role: dbUser.role
        },
        200
      );
    }
  )
  .patch(
    "/create-mail",
    zValidator("json", createMailSchema, (result, c) => {
      if (!result.success) {
        return c.json({ message: "Invalid data." }, 400);
      }
    }),
    async (c) => {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const prisma = c.get("prisma");
      const { email, dni, password } = c.req.valid("json");

      const dbUser = await prisma.user.findUnique({
        where: {
          dni,
        },
      });

      if (!dbUser) {
        return c.json(
          {
            message: "No existe un usuario con este DNI.",
          },
          401
        );
      }

      const isPassword = await bcrypt.compare(password, dbUser.password);

      if (!isPassword) {
        return c.json(
          {
            message: "Tus credenciales son incorrectas.",
          },
          401
        );
      }

      const verificationToken = randomBytes(32).toString("hex");

      const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verificar?token=${verificationToken}`;

      const { error } = await resend.emails.send({
        from: "onboarding@resend.dev",
        to: [email],
        subject:
          "Verifica tu correo electrónico para ingresar a la plataforma virtual del Centro Cultural.",
        html: createVerificationMail(verificationUrl),
      });

      if (error) {
        console.log(error);
        return c.json(
          {
            message: "Hubo un error para asociar el correo a tu cuenta.",
          },
          500
        );
      }

      await prisma.user.update({
        where: {
          dni: dbUser.dni,
        },
        data: {
          email,
          firstLogin: false,
          verificationToken,
        },
      });

      return c.json(
        {
          message: `Correo enviado a ${email}. Revisa tu casilla para proceder con el registro.`,
        },
        200
      );
    }
  )
  .patch(
    "/verify-email",
    zValidator("query", z.object({ token: z.string() }), (result, c) => {
      if (!result.success) {
        return c.json({ message: "Token no proporcionado." }, 400);
      }
    }),
    async (c) => {
      const { token } = c.req.valid("query");
      const prisma = c.get("prisma");

      const dbUser = await prisma.user.findFirst({
        where: {
          verificationToken: token,
        },
      });

      if (!dbUser) {
        return c.json(
          {
            message:
              "No se ha podido encontrar la dirección de correo que deseas verificar.",
          },
          404
        );
      }

      const hoursSinceUpdate =
        (new Date().getTime() - new Date(dbUser.updatedAt).getTime()) /
        (1000 * 60 * 60);
      if (hoursSinceUpdate > 24) {
        return c.json({ message: "El token ha expirado." }, 410);
      }

      await prisma.user.update({
        where: {
          id: dbUser.id,
        },
        data: {
          isVerified: true,
          verificationToken: null,
        },
      });

      return c.json(
        {
          message: "Tu correo electrónico se ha verificado exitosamente.",
        },
        200
      );
    }
  )
  .patch(
    "/resend-mail",
    zValidator("json", resendMailSchema, (result, c) => {
      if (!result.success) {
        return c.json({ message: "Email o DNI no proporcionado." }, 400);
      }
    }),
    async (c) => {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const prisma = c.get("prisma");
      const { dni, email } = c.req.valid("json");

      const dbUser = await prisma.user.findUnique({
        where: dni ? { dni } : { email },
      });

      if (!dbUser) {
        return c.json(
          {
            message:
              "El email o DNI ingresado por el usuario no corresponde a ningún alumno.",
          },
          401
        );
      }

      if (!dbUser.email) {
        return c.json(
          { message: "Esta cuenta no esta asociada a ningún correo." },
          400
        );
      }

      const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verificar?token=${dbUser.verificationToken}`;

      const { error } = await resend.emails.send({
        from: "onboarding@resend.dev",
        to: [dbUser.email],
        subject:
          "Verifica tu correo electrónico para ingresar a la plataforma virtual del Centro Cultural.",
        html: createVerificationMail(verificationUrl),
      });

      if (error) {
        console.log(error);
        return c.json(
          {
            message: "Hubo un error para reenviar el correo.",
          },
          500
        );
      }

      return c.json({ message: "Correo reenviado exitosamente." }, 200)
    }
  )
  .post("/logout", async (c) => {
    deleteCookie(c, "token", {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
    });

    return c.json({ message: "Sesión cerrada exitosamente." }, 200);
  });
export default app;
