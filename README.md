<div align="center">

# Tienda en Línea

### Proyecto Final | Temas Emergentes de Aplicaciones Web

Sistema de comercio electrónico enfocado en la venta de ropa casual.

</div>

---

## Integrantes

- Luis R. Higareda
- Alejandra Garcia
- Janeth Galván
- Angel Cortez

**Profesor:** Martin Guadalupe Bernal Lugo

---

## Video de presentación

En el siguiente video se presenta el proyecto, su dominio, las principales reglas de negocio y parte de su funcionamiento.

[Ver video del proyecto en YouTube](https://youtu.be/As3NUS-Vl9o)

---

## Descripción

El proyecto consiste en el desarrollo de una tienda en línea enfocada en la venta de ropa casual.

El sistema permitirá a los clientes consultar productos, buscar dentro del catálogo, agregar artículos a un carrito y realizar compras. Por otro lado, los administradores podrán gestionar los productos, las categorías, el inventario y las órdenes realizadas.

Uno de los puntos principales del proyecto es mantener correctamente relacionado el inventario con las compras, evitando que se puedan vender más productos de los que realmente se encuentran disponibles.

---

## Objetivo

Desarrollar una aplicación web de comercio electrónico que permita administrar un catálogo de ropa y realizar el proceso de compra de productos, manteniendo organizadas las operaciones principales de clientes y administradores.

---

## Funcionalidades principales

### Cliente

- Consultar el catálogo de productos.
- Buscar productos por nombre.
- Filtrar productos por categoría y precio.
- Ver el detalle de un producto.
- Consultar la disponibilidad de stock.
- Seleccionar talla y color.
- Agregar productos al carrito.
- Modificar cantidades dentro del carrito.
- Eliminar productos del carrito.
- Consultar el subtotal de la compra.
- Realizar el proceso de checkout.
- Consultar órdenes anteriores.
- Revisar el estado actual de una orden.

### Administrador

- Registrar productos.
- Modificar información de productos.
- Activar o desactivar productos.
- Administrar categorías.
- Ajustar el inventario.
- Consultar las órdenes realizadas.
- Revisar el detalle de una orden.
- Cambiar el estado de las órdenes.
- Consultar productos con stock bajo.
- Visualizar información general de las operaciones de la tienda.

---

## Reglas principales del negocio

Entre las reglas consideradas para el funcionamiento de la tienda se encuentran:

- Un producto debe encontrarse activo para poder agregarse a una compra.
- La cantidad solicitada debe ser de al menos una unidad.
- No se puede solicitar una cantidad mayor al stock disponible.
- Si un producto ya se encuentra en el carrito, su cantidad puede incrementarse sin superar las existencias disponibles.
- No se puede confirmar una compra con un carrito vacío.
- El stock debe verificarse nuevamente antes de confirmar una orden.
- Al completar una compra se descuenta del inventario la cantidad correspondiente.
- El subtotal de un producto se calcula utilizando su precio y cantidad.
- El total de la orden corresponde a la suma de sus productos.
- Una orden nueva comienza con estado pendiente.
- Los productos inactivos no deben mostrarse como disponibles para compra.

---

## Estados de una orden

Las órdenes pueden pasar por los siguientes estados:

```text
PENDIENTE
    ↓
PROCESANDO
    ↓
ENVIADO
    ↓
ENTREGADO
```

---
## Tecnologías

- TypeScript y Node.js
- NestJS (servicio REST)
- Prisma y MySQL (base de datos)
- JWT y bcrypt (inicio de sesión y contraseñas)
- class-validator (validación de lo que llega al servicio)
- Swagger (documentación del servicio)

---

## Cómo levantar el servicio desde cero

### Requisitos

- Node.js 22 o más nuevo y npm
- MySQL 8 corriendo en tu computadora

### Pasos

1. Clonar el repositorio y entrar a la rama del servicio:

```bash
git clone https://github.com/janethcrgq/ecommerce.git
cd ecommerce
git checkout feat-servicio
npm install
```

2. Crear el archivo `.env` copiando el de ejemplo y poner tus datos reales (usuario y contraseña de MySQL, y una llave secreta para el JWT):

```bash
cp .env.example .env
```

| Variable | Para qué sirve |
|---|---|
| `DATABASE_*` | Datos de conexión a MySQL |
| `JWT_SECRET` | Llave con la que se firman las credenciales (inventa una larga) |
| `JWT_EXPIRES_IN` | Cuánto dura la sesión, por ejemplo `1h` |
| `PORT` | Puerto del servicio (por defecto 3000) |
| `FRONTEND_ORIGIN` | Único origen que puede usar el servicio desde un navegador |
| `ALMACENAMIENTO` | `prisma` (base de datos real) o `memoria` (datos de prueba, sin base de datos) |

El archivo `.env` nunca se sube al repositorio.

3. Crear la base de datos vacía en MySQL (el nombre debe ser el mismo de `DATABASE_NAME`):

```sql
CREATE DATABASE tienda_en_linea;
```

4. Generar el cliente de Prisma, crear las tablas y cargar los datos de ejemplo:

```bash
npm run prisma:generar
npm run db:migrar
npm run db:seed
```

5. Arrancar el servicio:

```bash
npm run dev
```

El servicio queda en `http://localhost:3000` y la documentación para probar cada endpoint en `http://localhost:3000/docs`.

### Usuarios de prueba (los crea el seed)

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | admin@tienda.mx | Admin123! |
| Cliente | cliente@tienda.mx | Cliente123! |
| Cliente | maria@tienda.mx | Cliente123! |

### Probar la seguridad en Swagger

1. En `POST /auth/sesion` inicia sesión y copia el `token` de la respuesta.
2. Pulsa el botón **Authorize** (arriba a la derecha) y pega el token.
3. Prueba `POST /productos`: sin token responde **401**, con el token del cliente **403** y con el del administrador **201**.

### Otros comandos

```bash
npm run test:dominio   # prueba las reglas del negocio sin base de datos
npm run typecheck      # revisa los tipos de TypeScript
npm run build          # compila el proyecto
```

---

## Roles

| Rol | Qué puede hacer |
|---|---|
| Visitante | Ver catálogo y categorías, registrarse e iniciar sesión |
| Cliente | Lo anterior, y además carrito, direcciones, comprar, pagar y ver sus órdenes y envíos |
| Administrador | Productos, variantes, categorías, inventario, órdenes (estado, pago y envío) y dashboard |

El rol viaja dentro de la credencial (JWT) firmada. Si alguien la cambia a mano, el servicio la rechaza con 401.

---

## Respuestas del servicio

Toda respuesta correcta tiene la forma `{ "ok": true, "datos": ... }` y toda respuesta de error `{ "ok": false, "statusCode", "mensaje", "ruta", "fecha" }`.

| Código | Cuándo ocurre |
|---|---|
| 201 | Se creó algo |
| 400 | El dato que llega está mal formado |
| 401 | No hay credencial, expiró o fue alterada |
| 403 | La credencial es válida pero el rol no tiene permiso |
| 404 | No existe lo que se pidió |
| 409 | Una regla del negocio lo impide (por ejemplo stock insuficiente) |

---

## Documentación del proyecto

Antes de comenzar con la implementación se realizó la documentación general del sistema.

En ella se encuentran el análisis del dominio, las entidades, las reglas de negocio, los diagramas, la arquitectura propuesta y diferentes escenarios considerados para el funcionamiento de la tienda.

[Ver documentación completa en Google Docs](https://docs.google.com/document/d/1s9JTvyutZI3XBHyd-AjcUO9TXOKpSKf6CKpYkbBGn-8/edit?usp=sharing)

---

## Repositorio

Este repositorio será utilizado para concentrar el desarrollo del proyecto durante el curso.

Conforme avance el desarrollo se irán incorporando las diferentes partes necesarias para completar la tienda en línea.

---

<div align="center">

Temas Emergentes de Aplicaciones Web

</div>
