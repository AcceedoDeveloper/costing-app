
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CastingState } from './casting.reducer';


export const selectCastingState = createFeatureSelector<CastingState>('casting');


export const selectCastingInputs = createSelector(
  selectCastingState,
  (state) => state.data
);


export const selectMouldingInputs = createSelector(
  selectCastingState,
  (state) => state.mouldingData
);


export const selectCoreInputs = createSelector(
  selectCastingState,
  (state) => state.coreData
);


export const selectCastingError = createSelector(
  selectCastingState,
  (state) => state.error
);
