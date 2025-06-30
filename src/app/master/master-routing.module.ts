import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MasterComponent } from './master/master/master.component';
import { RoleComponent} from './master/role/role.component';
import { CustomerComponent} from './master/customer/customer.component';
import { DepertmentComponent } from './master/depertment/depertment.component';
import { PowerCostComponent} from './master/power-cost/power-cost.component';
import { OverHeadsComponent} from './master/over-heads/over-heads.component';
import {  SalaryWagesComponent} from './master/salary-wages/salary-wages.component';

const routes: Routes = [
  {
    path: '',
    component: MasterComponent,
  },
  {
    path: 'role',
    component : RoleComponent
  },
  {
    path: 'customer',
    component : CustomerComponent
  },
  {
    path: 'department',
    component: DepertmentComponent
  },
  {
    path: 'power-cost',
    component: PowerCostComponent
  },
  {
    path: 'over-heads',
    component: OverHeadsComponent
  },
  {
    path: 'salary-wages',
    component: SalaryWagesComponent
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MasterRoutingModule {}
