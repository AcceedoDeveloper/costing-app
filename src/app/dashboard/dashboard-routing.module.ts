import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent} from './dashboard/dashboard.component';
import { ReportComponent } from './report/report.component';
import { DashComponent} from './dash/dash.component';

const routes: Routes = [
  { path: 'dashh', component: DashboardComponent },
  { path: 'report', component: ReportComponent },
  { path: 'dash', component: DashComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
