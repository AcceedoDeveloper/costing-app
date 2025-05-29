import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { MeterialtypeRoutingModule } from './meterialinput-routing.module';
import { CastingInputComponent } from './casting-input/casting-input.component';
import { MouldingInputComponent } from './moulding-input/moulding-input.component';
import { CoreInputComponent } from './core-input/core-input.component';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { castingReducer } from './store/casting.reducer';
import { CastingEffects } from './store/casting.effects';


@NgModule({
  declarations: [CastingInputComponent, MouldingInputComponent, CoreInputComponent],
  imports: [
    MatButtonModule,
    MatIconModule,
    FormsModule,
    MatTableModule,
    MatCardModule,
    MatToolbarModule,
    CommonModule,
    MeterialtypeRoutingModule,
    StoreModule.forFeature('casting', castingReducer),
    EffectsModule.forFeature([CastingEffects])
  ]
})
export class MeterialtypeModule { }
