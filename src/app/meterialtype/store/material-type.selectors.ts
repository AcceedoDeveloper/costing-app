import { createFeatureSelector, createSelector } from '@ngrx/store';
import { MaterialTypeState } from './material-type.reducer';


export const selectMaterialTypeState = createFeatureSelector<MaterialTypeState>('materialTypes');

export const selectAllMaterialTypes = createSelector(
  selectMaterialTypeState,
  (state) => state.materialTypes
);

export const selectMaterialTypeError = createSelector(
  selectMaterialTypeState,
  (state) => state.error
);

export const selectAllProcesses = createSelector(
  selectMaterialTypeState,
  (state) => state.processes
);