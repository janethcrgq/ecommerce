import { Routes } from '@angular/router';
import { adminGuard } from './sesion/admin.guard';
import { PaginaEntrar } from './sesion/pagina-entrar';
import { LayoutAdmin } from './layout/layout-admin';
import { PaginaDashboard } from './dashboard/pagina-dashboard';
import { NoEncontrado } from './compartido/no-encontrado';

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
