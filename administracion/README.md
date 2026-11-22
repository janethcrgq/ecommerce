# Avance 4 - Panel administrativo

Panel independiente de la Tienda en Línea (Angular). Consume el servicio NestJS del Avance 2 y permite administrar productos, categorías, inventario y órdenes.

## Cómo ejecutarlo

1. Encender MySQL y levantar **el backend que ya está configurado**, desde la raíz del repositorio:

```powershell
npm install
npm run dev
```

El archivo `.env` del backend debe tener `PORT="3001"`, el origen `http://localhost:4200` incluido en `FRONTEND_ORIGIN` y la conexión a MySQL. 

2. En otra ventana PowerShell, desde la raíz del repositorio:

```powershell
cd .\administracion
npm install
npm run start
```

El panel abre en http://localhost:4200/entrar y se conecta a http://localhost:3001. La dirección de la API está en `src/app/api/config.ts`.

3. Cuenta de administrador creada por el seed: `admin@tienda.mx` / `Admin123!`. 
Para comprobar el rechazo por rol usar la cuenta `cliente@tienda.mx` / `Cliente123!`.

El portal del cliente (Avance 3) se ejecuta aparte desde `storefront/` (`npm install`, `npm run dev`; normalmente http://localhost:5173).

## Módulos

- **Resumen:** órdenes de hoy, ventas del periodo, stock bajo y productos más vendidos.
- **Productos:** búsqueda y filtros; alta, detalle, edición, activar/desactivar y registro de variantes.
- **Categorías:** consulta, alta, edición y eliminación con confirmación. El servicio rechaza eliminar categorías con productos.
- **Inventario:** consulta por variante, filtro de stock bajo, ajustes con confirmación e historial.
- **Órdenes:** filtros, detalle, cambio de estado, pago y registro de paquetería y guía.


## Evidencias y entrega
Rama de entrega: `feat-administracion`.
