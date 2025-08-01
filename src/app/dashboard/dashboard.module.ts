import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';

import { GoogleChartsModule } from 'angular-google-charts';
import { MatIconModule } from '@angular/material/icon';
import { ReportComponent } from './report/report.component';
import { DashComponent } from './dash/dash.component';
import { CompanyComponent } from './company/company.component';
import {MatTabsModule} from '@angular/material/tabs';
import { MaterialModule } from '../material/material.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';

import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import {  ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    // other modules
  ],
})
export class AppModule {}



import { ChartsModule } from 'ng2-charts';
@NgModule({
  declarations: [DashboardComponent, ReportComponent, DashComponent, CompanyComponent,],
  imports: [
    MatIconModule,
    MaterialModule,
    GoogleChartsModule,
    CommonModule,
    DashboardRoutingModule,
    MatTabsModule,
    ChartsModule,
    MatPaginatorModule,
    MatTableModule,
    FormsModule,
    MatDatepickerModule,
    MatIconModule,
    MatNativeDateModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule


  ]
})
export class DashboardModule { }
