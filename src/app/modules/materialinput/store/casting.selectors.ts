
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CastingState } from './casting.reducer';



export const selectCastingState = createFeatureSelector<CastingState>('casting');




export const selectCastingError = createSelector(
  selectCastingState,
  (state) => state.error
);


export const selectCastingData = createSelector(
  selectCastingState,
  (state) => state.castingData
);


export const selectProductionCost = createSelector(
  selectCastingState,
  (state) => state.costSummary
);