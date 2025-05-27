import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MeterialtypeRoutingModule } from './meterialinput-routing.module';
import { CastingInputComponent } from './casting-input/casting-input.component';
import { MouldingInputComponent } from './moulding-input/moulding-input.component';
import { CoreInputComponent } from './core-input/core-input.component';


@NgModule({
  declarations: [CastingInputComponent, MouldingInputComponent, CoreInputComponent],
  imports: [
    CommonModule,
    MeterialtypeRoutingModule
  ]
})
export class MeterialtypeModule { }
