// store/casting/casting.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CastingState } from './casting.reducer';

// 1. Select the entire casting state slice
export const selectCastingState = createFeatureSelector<CastingState>('casting');

// 2. Select casting inputs (data array)
export const selectCastingInputs = createSelector(
  selectCastingState,
  (state) => state.data
);

// 3. Select moulding inputs
export const selectMouldingInputs = createSelector(
  selectCastingState,
  (state) => state.mouldingData
);

// 4. Select core inputs
export const selectCoreInputs = createSelector(
  selectCastingState,
  (state) => state.coreData
);

// 5. Select error
export const selectCastingError = createSelector(
  selectCastingState,
  (state) => state.error
);
