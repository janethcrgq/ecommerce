import { Routes } from '@angular/router';
import { adminGuard } from './sesion/admin.guard';
import { PaginaEntrar } from './sesion/pagina-entrar';
import { LayoutAdmin } from './layout/layout-admin';
import { PaginaDashboard } from './dashboard/pagina-dashboard';
import { NoEncontrado } from './compartido/no-encontrado';
import { PaginaProductos } from './catalogo/pagina-productos';
import { FormularioProducto } from './catalogo/formulario-producto';
import { PaginaDetalleProducto } from './catalogo/pagina-detalle-producto';
import { PaginaCategorias } from './catalogo/pagina-categorias';
import { cambiosPendientesGuard } from './compartido/cambios-pendientes.guard';
import { PaginaInventario } from './inventario/pagina-inventario';
import { PaginaOrdenes } from './ordenes/pagina-ordenes';
import { PaginaDetalleOrden } from './ordenes/pagina-detalle-orden';

export const routes: Routes = [
  {
    path: 'entrar',
    component: PaginaEntrar,
  },
  {
    path: '',
    component: LayoutAdmin,
    canActivate: [adminGuard],
    children: [
      {
        path: 'dashboard',
        component: PaginaDashboard,
      },
      {
        path: 'productos',
        component: PaginaProductos,
      },
      {
        path: 'productos/nuevo',
        component: FormularioProducto,
        canDeactivate: [cambiosPendientesGuard],
      },
      {
        path: 'productos/:id/editar',
        component: FormularioProducto,
        canDeactivate: [cambiosPendientesGuard],
      },
      {
        path: 'productos/:id',
        component: PaginaDetalleProducto,
      },
      {
        path: 'categorias',
        component: PaginaCategorias,
        canDeactivate: [cambiosPendientesGuard],
      },

      {
        path: 'inventario',
        component: PaginaInventario,
      },
      {
        path: 'ordenes',
        component: PaginaOrdenes,
      },
      {
        path: 'ordenes/:id',
        component: PaginaDetalleOrden,
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
    ],
  },
  {
    path: '**',
    component: NoEncontrado,
  },
];
