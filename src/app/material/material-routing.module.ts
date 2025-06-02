import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MaterialComponent } from './material/material.component';
import { SupplierComponent } from './supplier/supplier.component';

const routes: Routes = [
  { path: '', component: MaterialComponent },
  { path: 'suppliers', component: SupplierComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MaterialRoutingModule { }
