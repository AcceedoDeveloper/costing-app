import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';

import { GoogleChartsModule } from 'angular-google-charts';
import { MatIconModule } from '@angular/material/icon';
import { ReportComponent } from './report/report.component';
import { DashComponent } from './dash/dash.component';


@NgModule({
  declarations: [DashboardComponent, ReportComponent, DashComponent,],
  imports: [
    MatIconModule,
    GoogleChartsModule,
    CommonModule,
    DashboardRoutingModule
  ]
})
export class DashboardModule { }
