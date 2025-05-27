import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MasterComponent } from './master/master/master.component';
import { RoleComponent} from './master/role/role.component';
import { CustomerComponent} from './master/customer/customer.component';

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
  }
 

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MasterRoutingModule {}
