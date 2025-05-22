import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MeterialtypeComponent } from './meterialtype/meterialtype.component';

const routes: Routes = [{ path: '', component:  MeterialtypeComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MeterialtypeRoutingModule { }
