import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';

import { GoogleChartsModule } from 'angular-google-charts';
import { ReportComponent } from './report/report.component';



@NgModule({
  declarations: [DashboardComponent, ReportComponent],
  imports: [
    GoogleChartsModule,
    CommonModule,
    DashboardRoutingModule
  ]
})
export class DashboardModule { }
