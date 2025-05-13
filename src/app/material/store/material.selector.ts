import { createFeatureSelector, createSelector } from '@ngrx/store';

export const MATERIAL_STATE_NAME = 'materials';
const getMaterialState = createFeatureSelector<any>(MATERIAL_STATE_NAME);


export const getMaterialCount = createSelector(getMaterialState, (state) => state.count);

// In your selector file
export const getMaterials = createSelector(
  getMaterialState, 
  (state) => {
    console.log('Selector state:', state); // Add this for debugging
    return state.materials;
  }
);