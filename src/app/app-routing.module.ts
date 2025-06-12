import { SinglePostComponent } from './posts/single-post/single-post.component';
import { AuthGuard } from './services/auth.guard';

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'posts',
        loadChildren: () =>
          import('./posts/posts.module').then((m) => m.PostsModule),
      },
      {
        path: 'posts/details/:id',
        component: SinglePostComponent,
      },
      {
        path: 'master',
        loadChildren: () =>
          import('./master/master/master.module').then((m) => m.MasterModule),
      },
      {
        path: 'material',
        loadChildren: () => 
          import('./material/material.module').then(m => m.MaterialModule)
      },
      {
        path: 'grade',
        loadChildren: () => 
          import('./grade/grade.module').then(m => m.GradeModule)
      },
  
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'master/meterialinput',
        loadChildren: () =>
          import('./modules/materialinput/meterialinput.module').then(m => m.MeterialtypeModule)
      }
     

    ],
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./auth/auth.module').then((m) => m.AuthModule),
      },
    ],
  },
  { path: 'grade', loadChildren: () => import('./grade/grade.module').then(m => m.GradeModule) },
  { path: 'dashboard', loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule) },
  
  {
    path: '**',
    redirectTo: 'auth/login',
  },
];



@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
