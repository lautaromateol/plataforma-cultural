import { Context, Next } from "hono";
import { verify } from "hono/jwt";
import { getCookie } from "hono/cookie";

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
    const user = await verify(token, process.env.JWT_SECRET!);
    c.set("user", user);
    await next();
  } catch (error) {
    return c.json({ message: "Sesión invalida o expirada." }, 401);
  }
};

export default auth;
