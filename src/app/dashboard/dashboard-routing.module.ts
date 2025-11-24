import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent} from './dashboard/dashboard.component';
import { ReportComponent } from './report/report.component';
import { DashComponent} from './dash/dash.component';
import { UserManagementUpdateComponent } from './user-management-update/user-management-update.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashh', pathMatch: 'full' },
  { path: 'dashh', component: DashboardComponent },
  { path: 'report', component: ReportComponent },
  { path: 'dash', component: DashComponent },
  { path: 'user-management/update', component: UserManagementUpdateComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
