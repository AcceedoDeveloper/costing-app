import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MaterialComponent } from './material/material.component';
import { SupplierComponent } from './supplier/supplier.component';
import {CustomerdetailsComponent} from './customerdetails/customerdetails.component';

const routes: Routes = [
  { path: '', component: MaterialComponent },
  { path: 'suppliers', component: SupplierComponent },
  { path: 'customer-details', component: CustomerdetailsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MaterialRoutingModule { }
