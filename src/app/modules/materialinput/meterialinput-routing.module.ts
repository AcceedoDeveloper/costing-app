import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CastingInputComponent } from './casting-input/casting-input.component';
import { MouldingInputComponent } from './moulding-input/moulding-input.component';
import { CoreInputComponent } from './core-input/core-input.component';

const routes: Routes = [
  {
    path: '',
    component: CastingInputComponent
  },
  {
    path: 'moulding',
    component: MouldingInputComponent
  },
  {
    path: 'core',
    component: CoreInputComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MeterialtypeRoutingModule { }
