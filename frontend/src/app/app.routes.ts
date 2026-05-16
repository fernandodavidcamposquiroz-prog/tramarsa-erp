import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./modules/auth/login/login.component').then(m => m.LoginComponent) },
  {
    path: '',
    loadComponent: () => import('./shared/components/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: 'dashboard',    loadComponent: () => import('./modules/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'ventas',       loadComponent: () => import('./modules/ventas/ventas.component').then(m => m.VentasComponent) },
      { path: 'compras',      loadComponent: () => import('./modules/compras/compras.component').then(m => m.ComprasComponent) },
      { path: 'inventarios',  loadComponent: () => import('./modules/inventarios/inventarios.component').then(m => m.InventariosComponent) },
      { path: 'cobranza',     loadComponent: () => import('./modules/cobranza/cobranza.component').then(m => m.CobranzaComponent) },
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
