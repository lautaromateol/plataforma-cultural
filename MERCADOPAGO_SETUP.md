# Configuración de Mercado Pago

Este documento explica cómo configurar la integración de Mercado Pago para el sistema de inscripción online del Centro Cultural Correntino.

## Variables de Entorno Requeridas

Agregá las siguientes variables a tu archivo `.env`:

```env
# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=tu_access_token_aqui

# URL de la aplicación (necesaria para callbacks)
NEXT_PUBLIC_APP_URL=https://tu-dominio.com

# Email (Resend) - ya deberías tenerla configurada
RESEND_API_KEY=tu_resend_api_key

# Base de datos - ya deberías tenerla configurada
DATABASE_URL=tu_database_url

# JWT - ya deberías tenerla configurada
JWT_SECRET=tu_jwt_secret
```

## Obtener las credenciales de Mercado Pago

### 1. Crear una cuenta en Mercado Pago Developers

1. Ingresá a [Mercado Pago Developers](https://www.mercadopago.com.ar/developers)
2. Iniciá sesión con tu cuenta de Mercado Pago o creá una nueva
3. Aceptá los términos y condiciones de desarrollo

### 2. Crear una aplicación

1. Andá a [Tus integraciones](https://www.mercadopago.com.ar/developers/panel/app)
2. Hacé clic en "Crear aplicación"
3. Completá los datos:
   - **Nombre**: Centro Cultural Correntino
   - **Modelo de integración**: Checkout Pro
   - **¿Sos una plataforma de e-commerce?**: No
4. Hacé clic en "Crear aplicación"

### 3. Obtener las credenciales

1. En el panel de tu aplicación, andá a "Credenciales de producción"
2. Copiá el **Access Token** (comienza con `APP_USR-`)
3. Pegalo en tu archivo `.env` como `MERCADOPAGO_ACCESS_TOKEN`

### Credenciales de prueba (Sandbox)

Para probar la integración antes de ir a producción:

1. En el panel de tu aplicación, andá a "Credenciales de prueba"
2. Usá el **Access Token de prueba** para desarrollo
3. Podés usar las [tarjetas de prueba de Mercado Pago](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/your-integrations/test/cards)

**Tarjetas de prueba:**
- **Visa**: 4509 9535 6623 3704
- **Mastercard**: 5031 7557 3453 0604
- **Amex**: 3711 803032 57522

Usá cualquier CVV y fecha de expiración futura.

## Configurar Webhooks

Para recibir notificaciones de pagos aprobados:

1. En el panel de tu aplicación, andá a "Notificaciones Webhooks"
2. Configurá la URL de notificación:
   ```
   https://tu-dominio.com/api/enrollment/webhook
   ```
3. Seleccioná el evento "Payments"
4. Guardá los cambios

## Flujo de la integración

1. **Usuario completa datos** → Se valida la información
2. **Usuario elige plan** → Se muestran planes según edad
3. **Usuario elige pagar online** → Se crea preferencia en MP
4. **Redirección a Mercado Pago** → Usuario paga
5. **Webhook recibe notificación** → Se procesa el pago
6. **Si pago aprobado**:
   - Se crea usuario en la base de datos
   - Se registra el pago
   - Se matricula al estudiante
   - Se envía email con credenciales
7. **Usuario redirigido** → A página de éxito/error/pendiente

## Monto de matrícula

El monto de la matrícula está configurado en:
```
features/enrollment/types.ts → ENROLLMENT_FEE = 80000
```

Para modificar el monto, cambiá este valor.

## Páginas de callback

Las páginas de redirección post-pago están en:
- `/inscripcion/exito` - Pago exitoso
- `/inscripcion/error` - Pago rechazado
- `/inscripcion/pendiente` - Pago pendiente

## Modelo de datos

Se agregaron los siguientes campos/modelos a la base de datos:

### StudentProfile
- `enrollmentPaid` (Boolean) - Indica si el estudiante pagó la matrícula

### Payment (nuevo modelo)
- `amount` - Monto del pago
- `currency` - Moneda (ARS por defecto)
- `status` - Estado del pago (PENDING, APPROVED, REJECTED, etc.)
- `mercadoPagoId` - ID de la transacción en MP
- `mercadoPagoStatus` - Estado devuelto por MP
- `mercadoPagoDetail` - Detalle adicional

## Ejecutar migraciones

Después de configurar las variables de entorno, ejecutá:

```bash
npx prisma generate
npx prisma db push
```

O si preferís crear una migración:

```bash
npx prisma migrate dev --name add_payment_model
```

## Solución de problemas

### El webhook no recibe notificaciones
- Verificá que la URL sea accesible públicamente (no localhost)
- Revisá que el endpoint `/api/enrollment/webhook` esté funcionando
- Verificá los logs de la aplicación

### El pago no se procesa
- Verificá que el `MERCADOPAGO_ACCESS_TOKEN` sea correcto
- Revisá los logs del servidor
- Asegurate de que el webhook esté configurado correctamente

### No llega el email
- Verificá que `RESEND_API_KEY` esté configurado
- Revisá la carpeta de spam
- Verificá los logs del servidor

## Documentación oficial

- [Checkout Pro - Mercado Pago](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/landing)
- [SDK Node.js](https://github.com/mercadopago/sdk-nodejs)
- [Webhooks](https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks)
