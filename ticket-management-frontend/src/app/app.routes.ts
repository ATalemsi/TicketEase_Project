import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component')
      .then(m => m.LoginComponent),
    title: 'Login - TicketEase'
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component')
      .then(m => m.RegisterComponent),
    title: 'Register - TicketEase'
  },
  // Client Routes
  {
    path: 'client/dashboard',
    loadComponent: () => import('./features/client/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
    title: 'Client Dashboard',
    canActivate: [AuthGuard],  // Apply the guard without parameters
    data: { requiredRole: 'CLIENT' } // Pass the required role in the route data
  },
  {
    path: 'client/ticket-list',
    loadComponent: () => import('./features/tickets/components/ticket-list/ticket-list.component')
      .then(m => m.TicketListComponent),
    title: 'Client Tickets',
    canActivate: [AuthGuard],
    data: { requiredRole: 'CLIENT' }
  },
  {
    path: 'client/ticket-details/:id',
    loadComponent: () => import('./features/tickets/components/ticket-details/ticket-details.component')
      .then(m => m.TicketDetailsComponent),
    title: 'Ticket Details',
    canActivate: [AuthGuard],
    data: { requiredRole: 'CLIENT' }
  },
  {
    path: 'client/create-ticket',
    loadComponent: () => import('./features/tickets/components/ticket-form/ticket-form.component')
      .then(m => m.TicketFormComponent),
    title: 'Create Tickets',
    canActivate: [AuthGuard],
    data: { requiredRole: 'CLIENT' }
  },
  {
    path: 'client/edit-ticket/:id',
    loadComponent: () => import('./features/tickets/components/ticket-form/ticket-form.component')
      .then(m => m.TicketFormComponent),
    title: 'Create Tickets',
    canActivate: [AuthGuard],
    data: { requiredRole: 'CLIENT' }
  },
  // Agent Routes
  {
    path: 'agent/dashboard',
    loadComponent: () => import('./features/agent/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
    title: 'Agent Dashboard',
    canActivate: [AuthGuard],
    data: { requiredRole: 'AGENT' }
  },
  {
    path: 'agent/ticket-queue',
    loadComponent: () => import('./features/agent/ticket-queue/ticket-queue.component')
      .then(m => m.TicketQueueComponent),
    title: 'Ticket Queue',
    canActivate: [AuthGuard],
    data: { requiredRole: 'AGENT' }
  },
  {
    path: 'agent/ticket-response/:id',
    loadComponent: () => import('./features/agent/ticket-response/ticket-response.component')
      .then(m => m.TicketResponseComponent),
    title: 'Ticket Response',
    canActivate: [AuthGuard],
    data: { requiredRole: 'AGENT' }
  },
  // Admin Routes
  {
    path: 'admin/dashboard',
    loadComponent: () => import('./features/admin/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
    title: 'Admin Dashboard',
    canActivate: [AuthGuard],
    data: { requiredRole: 'ADMIN' }
  },
  {
    path: 'admin/statistics',
    loadComponent: () => import('./features/admin/statistics/statistics.component')
      .then(m => m.StatisticsComponent),
    title: 'Admin Statistics',
    canActivate: [AuthGuard],
    data: { requiredRole: 'ADMIN' }
  },
  {
    path: 'admin/user-management',
    loadComponent: () => import('./features/admin/user-management/user-management.component')
      .then(m => m.UserManagementComponent),
    title: 'User Management',
    canActivate: [AuthGuard],
    data: { requiredRole: 'ADMIN' }
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
