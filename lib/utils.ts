import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createVerificationMail(verificationUrl: string) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verificación de Correo Electrónico</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f4f4;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Verificación de Correo Electrónico</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 22px; font-weight: 600;">¡Hola!</h2>
                            
                            <p style="margin: 0 0 16px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                Hemos recibido una solicitud para vincular este correo electrónico con tu DNI en nuestro sistema académico.
                            </p>
                            
                            <p style="margin: 0 0 16px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                Para completar el proceso de verificación y activar tu cuenta, por favor haz clic en el botón a continuación:
                            </p>
                            
                            <!-- Button -->
                            <table role="presentation" style="margin: 32px 0; width: 100%;">
                                <tr>
                                    <td align="center">
                                        <a href="${verificationUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                                            Verificar mi correo electrónico
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 0 0 16px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                                Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:
                            </p>
                            
                            <p style="margin: 0 0 24px 0; padding: 12px; background-color: #f8f9fa; border-radius: 4px; color: #667eea; font-size: 14px; word-break: break-all;">
                                https://tu-sitio.com/verificar?token=VERIFICATION_TOKEN
                            </p>
                            
                            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e0e0e0;">
                                <p style="margin: 0 0 8px 0; color: #999999; font-size: 13px; line-height: 1.6;">
                                    <strong>Nota importante:</strong> Este enlace expirará en 24 horas por motivos de seguridad.
                                </p>
                                <p style="margin: 0; color: #999999; font-size: 13px; line-height: 1.6;">
                                    Si no solicitaste esta verificación, por favor ignora este correo.
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px; background-color: #f8f9fa; text-align: center; border-radius: 0 0 8px 8px;">
                            <p style="margin: 0 0 8px 0; color: #999999; font-size: 14px;">
                                Sistema de Gestión Académica
                            </p>
                            <p style="margin: 0; color: #999999; font-size: 12px;">
                                © 2024 Todos los derechos reservados
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}

interface WelcomeEmailParams {
  name: string;
  dni: string;
  password: string;
  campusUrl: string;
}

export function createWelcomeEmail({ name, dni, password, campusUrl }: WelcomeEmailParams) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenido al Centro Cultural Correntino</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f4f4;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">¡Bienvenido/a!</h1>
                            <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Centro Cultural Correntino</p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 22px; font-weight: 600;">¡Hola ${name}!</h2>

                            <p style="margin: 0 0 16px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                Tu inscripción ha sido procesada exitosamente. Ya sos parte del Centro Cultural Correntino.
                            </p>

                            <p style="margin: 0 0 24px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                A continuación te enviamos tus credenciales de acceso al campus virtual:
                            </p>

                            <!-- Credentials Box -->
                            <table role="presentation" style="width: 100%; background-color: #f8f9fa; border-radius: 8px; margin-bottom: 24px;">
                                <tr>
                                    <td style="padding: 24px;">
                                        <table role="presentation" style="width: 100%;">
                                            <tr>
                                                <td style="padding-bottom: 12px;">
                                                    <span style="color: #666666; font-size: 14px;">DNI (Usuario):</span><br>
                                                    <span style="color: #333333; font-size: 18px; font-weight: 600;">${dni}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <span style="color: #666666; font-size: 14px;">Contraseña temporal:</span><br>
                                                    <span style="color: #4f46e5; font-size: 18px; font-weight: 600; font-family: monospace;">${password}</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Button -->
                            <table role="presentation" style="margin: 32px 0; width: 100%;">
                                <tr>
                                    <td align="center">
                                        <a href="${campusUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);">
                                            Ingresar al Campus Virtual
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <div style="margin-top: 32px; padding: 16px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                                    <strong>Importante:</strong> Te recomendamos cambiar tu contraseña temporal la primera vez que ingreses al campus virtual.
                                </p>
                            </div>

                            <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e0e0e0;">
                                <p style="margin: 0 0 8px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                                    Si tenés alguna consulta, podés contactarnos:
                                </p>
                                <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.6;">
                                    📍 La Rioja 1145, Ciudad de Corrientes<br>
                                    📞 +54 379 4123456<br>
                                    🕐 Lunes a Viernes de 7:00 a 21:00
                                </p>
                            </div>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px; background-color: #f8f9fa; text-align: center; border-radius: 0 0 8px 8px;">
                            <p style="margin: 0 0 8px 0; color: #999999; font-size: 14px;">
                                Centro Cultural Correntino
                            </p>
                            <p style="margin: 0; color: #999999; font-size: 12px;">
                                © ${new Date().getFullYear()} Todos los derechos reservados
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}
