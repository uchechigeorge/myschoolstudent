import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { homeRoute, settingsRoute, loginRoute, resultsRoute, paymentsRoute, notificationsRoute } from './models/app-routes';
import { AuthGuard } from './guards/auth.guard';
import { AutoLoginGuard } from './guards/auto-login.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: homeRoute,
    pathMatch: 'full'
  },
  {
    path: homeRoute,
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule),
    canLoad: [ AuthGuard ],
  },
  {
    path: settingsRoute,
    loadChildren: () => import('./pages/settings/settings.module').then( m => m.SettingsPageModule),
    canLoad: [ AuthGuard ],
  },
  {
    path: loginRoute,
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule),
    canLoad: [ AutoLoginGuard ],
  },
  {
    path: resultsRoute,
    loadChildren: () => import('./pages/results/results.module').then( m => m.ResultsPageModule),
    canLoad: [ AuthGuard ],
  },
  {
    path: notificationsRoute,
    loadChildren: () => import('./pages/notifications/notifications.module').then( m => m.NotificationsPageModule)
  },
  {
    path: paymentsRoute,
    loadChildren: () => import('./pages/payments/payments.module').then( m => m.PaymentsPageModule),
    canLoad: [ AuthGuard ],
  },
  {
    path: '**',
    redirectTo: homeRoute,
    pathMatch: 'full'
  },
  
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
