// store/casting/casting.effects.ts
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { CastingInputService } from '../../../services/casting-input.service';
import { updatePowerCost, updatePowerCostSuccess, error
  ,  getCostSummarySuccess, getCostSummary
, updateProductionCost, updateProductionCostSuccess
, updateCastingData, updateCastingDataSuccess
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


getCastingDetails$ = createEffect(() =>
  this.actions$.pipe(
    ofType('[Casting] Get Casting Details'),
    mergeMap(() =>
      this.castingService.getCastingDetails().pipe(
        map(castingData => {
          return { type: '[Casting] Get Casting Details Success', castingData };
        }), tap((castingData) => {
          console.log('Casting Data:', castingData);
          
        }), catchError(err => of(error({ error: err.message })))
      )
    )
  )
);


getCostSummary$ = createEffect(() =>
  this.actions$.pipe(
    ofType(getCostSummary),
    mergeMap(() =>
      this.castingService.getCostSummary().pipe(
        map(costSummary => {
          return getCostSummarySuccess({ costSummary });
        }),
        tap((costSummary) => {
          console.log('Cost Summary:', costSummary);
        }),
        catchError(err => of(error({ error: err.message })))
      )
    )
  )
);

updateProductionCost$ = createEffect(() =>
  this.actions$.pipe(
    ofType(updateProductionCost),
    mergeMap(action =>
      this.castingService.updateProductionCost(action.costSummary).pipe(
        map(updatedCostSummary => {
          this.toastr.success('Production cost updated successfully');
          return updateProductionCostSuccess({ id: action.id, updatedCostSummary });
        }),
        catchError(err => of(error({ error: err.message })))
      )
    )
  )
);


updateCastingData$ = createEffect(() =>
  this.actions$.pipe(
    ofType(updateCastingData),
    mergeMap((action: ReturnType<typeof updateCastingData>) =>
      this.castingService.updateProductionInputs(action.castingData).pipe(
        map(updatedCastingData =>
          updateCastingDataSuccess({ id: action.id, updatedCastingData })
        ),
        catchError(err => of(error({ error: err.message })))
      )
    )
  )
);




}
