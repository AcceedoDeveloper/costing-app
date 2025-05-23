import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MeterialtypeComponent } from './meterialtype/meterialtype.component';
import {ProcessTypeComponent} from './process-type/process-type.component';

const routes: Routes = [
  { path: '', component:  MeterialtypeComponent},
  { path: 'ProcessType', component: ProcessTypeComponent}

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MeterialtypeRoutingModule { }
