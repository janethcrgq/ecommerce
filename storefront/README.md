# Portal del cliente - Tienda en Línea

Portal web (React + TypeScript + Vite) para que los clientes vean el catálogo, armen su carrito, compren y consulten sus órdenes. Es una aplicación independiente que se conecta al servicio (API) de la carpeta raíz del repositorio.

## Qué necesitas

- Node.js 20 o más nuevo
- El servicio de la tienda corriendo (ver el README de la raíz: MySQL, `npm run db:seed` y `npm run dev`)

## Cómo correrlo

1. Prende el servicio desde la raíz del repositorio (`npm run dev`). Debe quedar en `http://localhost:3000`.
2. En otra terminal:

```bash
cd storefront
npm install
cp .env.example .env
npm run dev
```

3. Abre `http://localhost:5173`.

## A dónde apunta (configuración)

La dirección del servicio está en el archivo `.env` del portal:

```
VITE_API_URL="http://localhost:3000"
```

Si el servicio corre en otro puerto o en otra computadora, cambia ese valor y reinicia `npm run dev`. El servicio debe permitir el origen del portal en su variable `FRONTEND_ORIGIN` (por defecto acepta `http://localhost:5173`).

## Cuentas de prueba

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Cliente | cliente@tienda.mx | Cliente123! |
| Cliente | maria@tienda.mx | Cliente123! |
| Administrador | admin@tienda.mx | Admin123! |

El administrador no compra; su panel es el Avance 4. También puedes crear tu propia cuenta desde "Crear cuenta".

## Pantallas

| Dirección | Pantalla | Requiere sesión |
| --- | --- | --- |
| `/` | Inicio con productos destacados | No |
| `/productos` | Catálogo con búsqueda, filtros y orden | No |
| `/productos/:id` | Detalle de producto (talla, cantidad, agregar al carrito) | No (para agregar sí) |
| `/entrar` | Iniciar sesión | No |
| `/registro` | Crear cuenta | No |
| `/carrito` | Carrito | Sí |
| `/compra` | Elegir dirección y pago, confirmar | Sí |
| `/ordenes` | Historial de órdenes | Sí |
| `/ordenes/:id` | Detalle de una orden (pago y envío) | Sí |
| cualquier otra | Página no encontrada (404) | No |

## Cómo está organizado

```
src/
  api/             lo que habla con el servicio: cliente http único, tipos, errores y sesión guardada
  compartido/      lo que usan todas las pantallas: layout, estados (cargando/error/vacío), avisos, formato
  caracteristicas/ una carpeta por tema: sesion, catalogo, carrito, direcciones, ordenes, inicio
```

- Toda la comunicación con el servicio pasa por `src/api/cliente.ts`; ninguna pantalla usa axios directo.
- El formato de respuesta del servicio (`{ ok, datos }` / `{ ok: false, ... }`) se interpreta en ese mismo archivo.
- Los errores del servicio se traducen a mensajes en lenguaje normal en `src/api/errores.ts`.
- Cada pantalla que pide datos muestra las 4 situaciones: cargando, error (con "Reintentar"), vacío y con datos.

## Otros comandos

```bash
npm run build     # revisa los tipos y genera la versión para publicar
npm run preview   # prueba esa versión
npm run lint
```

## Imágenes

Las fotos de los productos están en `public/productos`. 
