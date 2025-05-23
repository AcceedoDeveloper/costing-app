import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MeterialtypeRoutingModule } from './meterialtype-routing.module';
import { MeterialtypeComponent } from './meterialtype/meterialtype.component';


import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';


import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { FormsModule } from '@angular/forms';

import { materialTypeReducer } from './store/material-type.reducer';
import { MaterialTypeEffects } from './store/material-type.effects';
import { ProcessTypeComponent } from './process-type/process-type.component';

@NgModule({
  declarations: [MeterialtypeComponent, ProcessTypeComponent],
  imports: [
    MatTableModule,
    MatFormFieldModule,
    MatButtonModule,
     MatInputModule,
     MatIconModule,
    CommonModule,
    MeterialtypeRoutingModule,
    FormsModule,
     StoreModule.forFeature('materialTypes', materialTypeReducer),
    EffectsModule.forFeature([MaterialTypeEffects]),
  ]
})
export class MeterialtypeModule { }
