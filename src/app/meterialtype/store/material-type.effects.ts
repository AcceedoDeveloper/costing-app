import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import * as MaterialTypeActions from './material-type.actions';
import { MaterialTypeService } from '../../services/material-type.service';


import { ToastrService } from 'ngx-toastr';

@Injectable()
export class MaterialTypeEffects {
  constructor(private actions$: Actions, private service: MaterialTypeService, private toastr: ToastrService) {}

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MaterialTypeActions.loadMaterialTypes),
      mergeMap(() =>
        this.service.getMaterialTypes().pipe(
          map(materialTypes => MaterialTypeActions.loadMaterialTypesSuccess({ materialTypes })),
          catchError(error => of(MaterialTypeActions.loadMaterialTypesFailure({ error })))
        )
      )
    )
  );

    add$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MaterialTypeActions.addMaterialType),
      mergeMap(({ material }) =>
        this.service.addMaterialType(material).pipe(
          map(material => {
            this.toastr.success('Material type added successfully!', 'Success');
            return MaterialTypeActions.addMaterialTypeSuccess({ material });
          }),
          catchError(error => {
            this.toastr.error('Failed to add material type.', 'Error');
            return of(MaterialTypeActions.addMaterialTypeFailure({ error: error.message }));
          })
        )
      )
    )
  );

  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MaterialTypeActions.updateMaterialType),
      mergeMap(({ id, material }) =>
        this.service.updateMaterialType(id, material).pipe(
          map(updated => {
            this.toastr.success('Material type updated successfully!', 'Success');
            return MaterialTypeActions.updateMaterialTypeSuccess({ material: updated });
          }),
          catchError(error => {
            this.toastr.error('Failed to update material type.', 'Error');
            return of(MaterialTypeActions.updateMaterialTypeFailure({ error: error.message }));
          })
        )
      )
    )
  );

  delete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MaterialTypeActions.deleteMaterialType),
      mergeMap(({ id }) =>
        this.service.deleteMaterialType(id).pipe(
          map(() => {
            this.toastr.success('Material type deleted successfully!', 'Success');
            return MaterialTypeActions.deleteMaterialTypeSuccess({ id });
          }),
          catchError(error => {
            this.toastr.error('Failed to delete material type.', 'Error');
            return of(MaterialTypeActions.deleteMaterialTypeFailure({ error: error.message }));
          })
        )
      )
    )
  );
}
