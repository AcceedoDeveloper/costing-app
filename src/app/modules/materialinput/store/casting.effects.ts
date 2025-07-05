// store/casting/casting.effects.ts
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { CastingInputService } from '../../../services/casting-input.service';
import { loadCastingInputs, loadCastingInputsSuccess, loadCastingInputsFailure
, updateCastingInput, updateCastingInputSuccess
, loadMouldingInputs, loadMouldingInputsSuccess, loadMouldingInputsFailure
, updateMouldingInput, updateMouldingInputSuccess, updateMouldingInputFailure
, loadCoreInputs, loadCoreInputsSuccess, loadCoreInputsFailure
, updateCoreInput, updateCoreInputSuccess, updateCoreInputFailure
, updatePowerCost, updatePowerCostSuccess, error
 } from './casting.actions';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import {PowerService } from '../../../services/power.service';
import { of } from 'rxjs';
import { ToastrService } from 'ngx-toastr';


@Injectable()
export class CastingEffects {
  constructor(private actions$: Actions, private castingService: CastingInputService, private toastr: ToastrService
, private powerService: PowerService
  ) {}

  loadCastingInputs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadCastingInputs),
      mergeMap(() =>
        this.castingService.getCastingInputs().pipe(
          map((data) => loadCastingInputsSuccess({ data })),
          catchError((error) => of(loadCastingInputsFailure({ error: error.message })))
        )
      )
    )
  );

  updateCasting$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateCastingInput),
      mergeMap(action =>
        this.castingService.updateCastingInput(action.id, action.data).pipe(
          map(
            updated => {
              this.toastr.success('Casting input updated successfully');
              return updateCastingInputSuccess({ updated });
            }
          )
        )
      )
    )
  );

  loadMouldingInputs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadMouldingInputs),
      mergeMap(() =>
        this.castingService.getMouldingInputs().pipe(
          map((data) => loadMouldingInputsSuccess({ data })),
          catchError((error) => of(loadMouldingInputsFailure({ error: error.message })))
        )
      )
    )
  );

  updateMoulding$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateMouldingInput),
      mergeMap(action =>
        this.castingService.updateMouldingInput(action.id, action.data).pipe(
          map(
            updated => {
              this.toastr.success('Moulding input updated successfully');
              return updateMouldingInputSuccess({ updated });
            }
          ),
          catchError((error) => of(

            loadMouldingInputsFailure({ error: error.message })))
        )
      )
    )
  );

  loadCoreInputs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadCoreInputs),
      mergeMap(() =>
        this.castingService.getCoreInputs().pipe(
          tap(data => console.log('Fetched core inputs:', data)),
          map((data) => loadCoreInputsSuccess({ data })),
          catchError((error) => of(loadCoreInputsFailure({ error: error.message })))
        )
      )
    )
  );

  updateCore$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateCoreInput),
      mergeMap(action =>
        this.castingService.updateCoreInput(action.id, action.data).pipe(
          map(
            updated => {
              this.toastr.success('Core input updated successfully');
              return updateCoreInputSuccess({ updated });
            }
          ),
          catchError((error) => of(updateCoreInputFailure({ error: error.message })))
        )
      )
    )
  );


updatePowerCost$ = createEffect(() =>
  this.actions$.pipe(
    ofType(updatePowerCost),
    mergeMap(action =>
      this.powerService.updatePowerCost(action.id, action.powerCost).pipe(
        map(updated => {
          this.toastr.success('Power cost updated successfully');
          return updatePowerCostSuccess({ updated });
        }),
        catchError(err => of(error({ error: err.message })))
      )
    )
  )
);



}
