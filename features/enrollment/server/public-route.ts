import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import { Resend } from "resend";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { createWelcomeEmail } from "@/lib/utils";

// Esquema para los datos del formulario de inscripción
const enrollmentFormSchema = z.object({
  fullName: z.string().min(3).max(100),
  birthDate: z.string(),
  dni: z.string().min(7).max(8),
  email: z.string().email(),
  phone: z.string().min(8),
  guardianName: z.string().optional(),
  guardianDni: z.string().optional(),
  guardianPhone: z.string().optional(),
  guardianEmail: z.string().email().optional(),
  selectedPlanId: z.string(),
  selectedPlanCode: z.string(),
});

const createPaymentSchema = z.object({
  formData: enrollmentFormSchema,
  amount: z.number().positive(),
});

const app = new Hono()
  // Obtener planes de estudio disponibles (público)
  .get("/plans", async (c) => {
    try {
      const prisma = c.get("prisma");

      const plans = await prisma.studyPlan.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          code: true,
          description: true,
          durationYears: true,
          targetAudience: true,
        },
        orderBy: { durationYears: "desc" },
      });

      return c.json({ plans }, 200);
    } catch (error) {
      console.error("Error fetching plans:", error);
      return c.json({ message: "Error al obtener los planes" }, 500);
    }
  })

  // Crear preferencia de pago en Mercado Pago
  .post(
    "/create-payment",
    zValidator("json", createPaymentSchema, (result, c) => {
      if (!result.success) {
        return c.json(
          { message: "Datos inválidos", errors: result.error.issues },
          400
        );
      }
    }),
    async (c) => {
      const prisma = c.get("prisma");
      const { formData, amount } = c.req.valid("json");

      try {
        // Verificar que no exista un usuario con el mismo DNI
        const existingUser = await prisma.user.findUnique({
          where: { dni: formData.dni },
        });

        if (existingUser) {
          return c.json(
            { message: "Ya existe un usuario registrado con este DNI" },
            400
          );
        }

        // Verificar que el plan existe
        const plan = await prisma.studyPlan.findUnique({
          where: { id: formData.selectedPlanId },
        });

        if (!plan) {
          return c.json({ message: "Plan no encontrado" }, 404);
        }

        // Configurar Mercado Pago
        const client = new MercadoPagoConfig({
          accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
        });

        const preference = new Preference(client);

        // Guardar los datos del formulario en metadata para usarlos en el webhook
        const externalReference = JSON.stringify({
          formData,
          planId: plan.id,
          planCode: plan.code,
        });

        // Crear preferencia de pago
        const response = await preference.create({
          body: {
            items: [
              {
                id: "enrollment-fee",
                title: `Matrícula - ${plan.name}`,
                description: `Inscripción al ${plan.name} - Centro Cultural Correntino`,
                quantity: 1,
                unit_price: amount,
                currency_id: "ARS",
              },
            ],
            payer: {
              name: formData.fullName.split(" ")[0],
              surname: formData.fullName.split(" ").slice(1).join(" ") || "",
              email: formData.email,
              phone: {
                number: formData.phone,
              },
              identification: {
                type: "DNI",
                number: formData.dni,
              },
            },
            back_urls: {
              success: `${process.env.NEXT_PUBLIC_APP_URL}/inscripcion/exito`,
              failure: `${process.env.NEXT_PUBLIC_APP_URL}/inscripcion/error`,
              pending: `${process.env.NEXT_PUBLIC_APP_URL}/inscripcion/pendiente`,
            },
            auto_return: "approved",
            external_reference: externalReference,
            notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/enrollment/webhook`,
            statement_descriptor: "CENTRO CULTURAL",
          },
        });

        return c.json({
          init_point: response.init_point,
          preference_id: response.id,
        });
      } catch (error) {
        console.error("Error creating payment preference:", error);
        return c.json(
          { message: "Error al crear la preferencia de pago" },
          500
        );
      }
    }
  )

  // Webhook de Mercado Pago
  .post("/webhook", async (c) => {
    const prisma = c.get("prisma");

    try {
      const body = await c.req.json();

      // Verificar que sea una notificación de pago
      if (body.type !== "payment") {
        return c.json({ received: true });
      }

      const paymentId = body.data?.id;
      if (!paymentId) {
        return c.json({ message: "Payment ID not found" }, 400);
      }

      // Obtener detalles del pago desde Mercado Pago
      const client = new MercadoPagoConfig({
        accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
      });

      const payment = new Payment(client);
      const paymentData = await payment.get({ id: paymentId });

      // Solo procesar pagos aprobados
      if (paymentData.status !== "approved") {
        return c.json({ received: true, status: paymentData.status });
      }

      // Obtener datos del formulario desde external_reference
      const externalData = JSON.parse(paymentData.external_reference || "{}");
      const { formData, planId } = externalData;

      if (!formData || !planId) {
        console.error("Missing form data or plan ID in external reference");
        return c.json({ message: "Invalid external reference" }, 400);
      }

      // Verificar que no exista el usuario (doble check)
      const existingUser = await prisma.user.findUnique({
        where: { dni: formData.dni },
      });

      if (existingUser) {
        console.log("User already exists:", formData.dni);
        return c.json({ received: true, message: "User already exists" });
      }

      // Generar contraseña temporal
      const tempPassword = randomBytes(4).toString("hex");
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      // Crear usuario con transacción
      const result = await prisma.$transaction(async (tx) => {
        // Crear usuario
        const user = await tx.user.create({
          data: {
            dni: formData.dni,
            email: formData.email,
            password: hashedPassword,
            name: formData.fullName,
            role: "STUDENT",
            isVerified: true,
            firstLogin: true,
            studentProfile: {
              create: {
                birthDate: new Date(formData.birthDate),
                phone: formData.phone,
                guardianName: formData.guardianName || null,
                guardianDni: formData.guardianDni || null,
                guardianPhone: formData.guardianPhone || null,
                guardianEmail: formData.guardianEmail || null,
                enrollmentPaid: true,
              },
            },
          },
          include: {
            studentProfile: true,
          },
        });

        // Registrar el pago
        await tx.payment.create({
          data: {
            amount: paymentData.transaction_amount || 80000,
            currency: "ARS",
            status: "APPROVED",
            paymentMethod: paymentData.payment_method_id || null,
            mercadoPagoId: String(paymentData.id),
            mercadoPagoStatus: paymentData.status,
            mercadoPagoDetail: paymentData.status_detail || null,
            description: `Matrícula de inscripción`,
            studentProfileId: user.studentProfile!.id,
          },
        });

        // Buscar un curso disponible del primer nivel del plan
        const level = await tx.level.findFirst({
          where: { studyPlanId: planId, order: 1 },
        });

        if (level) {
          const course = await tx.course.findFirst({
            where: {
              levelId: level.id,
              academicYear: new Date().getFullYear().toString(),
            },
            include: {
              _count: { select: { enrollments: true } },
            },
          });

          if (course && course._count.enrollments < course.capacity) {
            await tx.enrollment.create({
              data: {
                studentId: user.id,
                courseId: course.id,
                status: "ACTIVE",
              },
            });
          }
        }

        return user;
      });

      // Enviar email con credenciales
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: [formData.email],
        subject: "¡Bienvenido/a al Centro Cultural Correntino!",
        html: createWelcomeEmail({
          name: formData.fullName,
          dni: formData.dni,
          password: tempPassword,
          campusUrl: `${process.env.NEXT_PUBLIC_APP_URL}/campus`,
        }),
      });

      return c.json({ received: true, userId: result.id });
    } catch (error) {
      console.error("Webhook error:", error);
      return c.json({ message: "Error processing webhook" }, 500);
    }
  });

export default app;
