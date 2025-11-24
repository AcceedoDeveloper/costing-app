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
import { MatSelectModule } from '@angular/material/select';
import {  ReactiveFormsModule } from '@angular/forms';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DifferenceGraphDialogComponent } from './dash/difference-graph-dialog.component';
import { ReportDetailsDialogComponent } from './report/report-details-dialog/report-details-dialog.component';
import { ChartsModule } from 'ng2-charts';
import { ToastrModule } from 'ngx-toastr';
import { ReportQuotationDialogComponent } from './report/report-quotation-dialog/report-quotation-dialog.component';
import { AutoFontSizeDirective } from './dash/auto-font-size.directive';
import { UserManagementUpdateComponent } from './user-management-update/user-management-update.component';

@NgModule({
  declarations: [DashboardComponent, ReportComponent, DashComponent, CompanyComponent, DifferenceGraphDialogComponent,
     ReportDetailsDialogComponent, ReportQuotationDialogComponent, AutoFontSizeDirective, UserManagementUpdateComponent],
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
    MatSelectModule,
    ReactiveFormsModule,
    MatSortModule,
    MatButtonModule,
    MatDialogModule,
    MatTooltipModule,
    ToastrModule
  ]
})
export class DashboardModule { }
