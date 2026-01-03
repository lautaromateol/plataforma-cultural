import { Context, Next } from "hono";
import { verify } from "hono/jwt";
import { getCookie } from "hono/cookie";

type AuthUser = {
  sub: string;
  dni: string;
  email: string;
  role: string;
  exp: number;
};

const auth = async (c: Context, next: Next) => {
  const header = c.req.header("Authorization");
  let token = header?.replace("Bearer ", "");

  if (!token) {
    token = getCookie(c, "token");
  }

  if (!token) {
    return c.json(
      { message: "No estas autorizado para acceder a este recurso." },
      401
    );
  }

  try {
    const payload = await verify(token, process.env.JWT_SECRET!);
    // Verificar que el payload tenga las propiedades necesarias
    if (
      typeof payload === "object" &&
      payload !== null &&
      "sub" in payload &&
      "dni" in payload &&
      "email" in payload &&
      "role" in payload &&
      "exp" in payload
    ) {
      const user: AuthUser = {
        sub: String(payload.sub),
        dni: String(payload.dni),
        email: String(payload.email),
        role: String(payload.role),
        exp: Number(payload.exp),
      };
      c.set("user", user);
      await next();
    } else {
      return c.json({ message: "Token inválido." }, 401);
    }
  } catch {
    return c.json({ message: "Sesión invalida o expirada." }, 401);
  }
};

export default auth;
