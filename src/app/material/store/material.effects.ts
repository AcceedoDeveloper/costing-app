import { Injectable } from '@angular/core';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { tap } from 'rxjs/operators';

import {Material} from '../../models/material.model';
import { loadMaterials, loadMaterialsFailure, loadMaterialsSuccess
  , deleteMaterial, deleteMaterialSuccess, createMaterial, createMaterialSuccess
  , updateMaterial, updateMaterialSuccess
} from './material.actions';
import {MaterialService} from '../../services/material.service';

import { ToastrService } from 'ngx-toastr';

@Injectable()

export class MaterialEffects {
    constructor(private actions$: Actions, private materialService: MaterialService, private toastr: ToastrService) {}


 loadMaterials$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadMaterials),
      mergeMap(() =>
        this.materialService.getMaterials().pipe(
          tap(response => console.log('Materials response:', response)),
          map(response => loadMaterialsSuccess({ materials: response })), 
          catchError(error => {
            console.error('Error loading materials:', error);
            this.toastr.error('Failed to load materials.', 'Error');
            return of(loadMaterialsFailure({ error: error.message }));
          })
        )
      )
    )
  );

createMaterial$ = createEffect(() => {
  return this.actions$.pipe(
    ofType(createMaterial),
    mergeMap((action) => {
      return this.materialService.addMaterial(action.material).pipe(
        map((material) => {
          this.toastr.success('Material created successfully!', 'Success'); // ✅ Toastr for success
          return createMaterialSuccess({ material });
        }),
        catchError((error) => {
          this.toastr.error('Failed to create material.', 'Error'); // ✅ Toastr for error
          return of({ type: '[Material] Create Material Failed' });
        })
      );
    })
  );
});


  updateMaterial$ = createEffect(() => {
  return this.actions$.pipe(
    ofType(updateMaterial),
    mergeMap((action) => {
      return this.materialService.updateMaterial(action.material).pipe(
        map((material) => {
          this.toastr.success('Material updated successfully!', 'Success'); // ✅ Success toast
          return updateMaterialSuccess({ material });
        }),
        catchError((error) => {
          this.toastr.error('Failed to update material.', 'Error'); // ✅ Error toast
          return of({ type: '[Material] Update Material Failed' });
        })
      );
    })
  );
});


 deleteMaterial$ = createEffect(() => {
  return this.actions$.pipe(
    ofType(deleteMaterial),
    mergeMap((action) => {
      return this.materialService.deleteMaterial(action.id).pipe(
        map(() => {
          this.toastr.success('Material deleted successfully!', 'Success'); // ✅ Success toast
          return deleteMaterialSuccess({ id: action.id });
        }),
        catchError((error) => {
          this.toastr.error('Failed to delete material.', 'Error'); // ✅ Error toast
          return of({ type: '[Material] Delete Material Failed' });
        })
      );
    })
  );
});


}






