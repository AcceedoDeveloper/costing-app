import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';



import { FormsModule } from '@angular/forms';



import { GradeRoutingModule } from './grade-routing.module';
import { GradeComponent } from './grade/grade.component';
import { AddgradeComponent } from './grade/addgrade/addgrade.component';

import { gradeReducer } from './store/grade.reducer';
import { GradeEffects } from './store/grade.effects';
import { MatExpansionModule } from '@angular/material/expansion';
import { EditGradeComponent } from './grade/edit-grade/edit-grade.component';


import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';


@NgModule({
  declarations: [GradeComponent, AddgradeComponent, EditGradeComponent],
  imports: [
    MatCardModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatSelectModule,
    MatOptionModule,
    CommonModule,
    GradeRoutingModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    HttpClientModule,
    StoreModule,
    EffectsModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatChipsModule,
    MatAutocompleteModule,
    FormsModule,
    StoreModule.forFeature('grades', gradeReducer),
    EffectsModule.forFeature([GradeEffects]),

   
  ]
})
export class GradeModule { }
