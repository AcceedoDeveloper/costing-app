import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MasterComponent } from './master/master/master.component';
import { RoleComponent} from './master/role/role.component';
import { CustomerComponent} from './master/customer/customer.component';
import { DepertmentComponent } from './master/depertment/depertment.component';
import { OverHeadsComponent} from './master/over-heads/over-heads.component';
import { PdfmakerComponent } from './master/pdfmaker/pdfmaker.component';

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
    path: 'over-heads',
    component: OverHeadsComponent
  },
  {
    path: 'pdfmaker',
    component: PdfmakerComponent
  },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MasterRoutingModule {}
