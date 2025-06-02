import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MeterialtypeRoutingModule } from './meterialtype-routing.module';
import { MeterialtypeComponent } from './meterialtype/meterialtype.component';
import {MatButtonToggleModule} from '@angular/material/button-toggle';


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
import { MatPaginatorModule } from '@angular/material/paginator';

@NgModule({
  declarations: [MeterialtypeComponent, ProcessTypeComponent],
  imports: [
    MatButtonToggleModule,
    MatTableModule,
    MatFormFieldModule,
    MatButtonModule,
     MatInputModule,
     MatIconModule,
    MatPaginatorModule,
    CommonModule,
    MeterialtypeRoutingModule,
    FormsModule,
     StoreModule.forFeature('materialTypes', materialTypeReducer),
    EffectsModule.forFeature([MaterialTypeEffects]),
  ]
})
export class MeterialtypeModule { }
