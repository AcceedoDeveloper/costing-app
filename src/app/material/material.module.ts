import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialComponent } from './material/material.component';
import { MaterialRoutingModule } from './material-routing.module';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { materialReducer } from './store/material.reducer';
import { MATERIAL_STATE_NAME } from './store/material.selector';
import { EffectsModule } from '@ngrx/effects';
import { MaterialEffects } from './store/material.effects';
import { AddMaterialComponent } from './material/add-material/add-material.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { SupplierComponent } from './supplier/supplier.component';
import { AddSupplierComponent } from './supplier/add-supplier/add-supplier.component';

import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';




import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';




@NgModule({
  declarations: [MaterialComponent, AddMaterialComponent, SupplierComponent, AddSupplierComponent],
  imports: [
    FormsModule,
    MatRadioModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonToggleModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatPaginatorModule,
    CommonModule,
    MaterialRoutingModule,
    HttpClientModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    StoreModule.forFeature(MATERIAL_STATE_NAME, materialReducer),
    EffectsModule.forFeature([MaterialEffects]),
  ],
})
export class MaterialModule {}