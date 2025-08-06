import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'registration',
    loadComponent: () => import('./register/register.page').then(m => m.RegisterPage)
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then(m => m.HomePage)
  },
  {
    path: 'bookings',
    loadComponent: () => import('./bookings/bookings.page').then(m => m.BookingsPage)
  },
  {
    path: 'availability',
    loadComponent: () => import('./availability/availability.page').then(m => m.AvailabilityPage)
  },
  {
    path: 'approvals',
    loadComponent: () => import('./approvals/approvals.page').then(m => m.ApprovalsPage)
  }
];

@NgModule({
  imports: [IonicModule, RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}