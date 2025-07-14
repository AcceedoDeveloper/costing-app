import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MaterialComponent } from './material/material.component';
import { SupplierComponent } from './supplier/supplier.component';
import {CustomerdetailsComponent} from './customerdetails/customerdetails.component';
import { ProcessComponent } from './process/process.component';
import { MaterialtypeComponent} from './materialtype/materialtype.component';
import {ProcessPowerComponent } from './process-power/process-power.component';
import { SalaryWagesComponent} from './salary-wages/salary-wages.component';

const routes: Routes = [
  { path: 'list', component: MaterialComponent },
  { path: 'suppliers', component: SupplierComponent },
  { path: 'customer-details', component: CustomerdetailsComponent },
  { path: 'process', component: ProcessComponent },
  { path: 'material/type', component: MaterialtypeComponent},
  { path : 'power-cost', component : ProcessPowerComponent},
  { path : 'salary-wages', component: SalaryWagesComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MaterialRoutingModule { }
