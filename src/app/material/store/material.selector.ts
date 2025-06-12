import { createFeatureSelector, createSelector } from '@ngrx/store';

 

export const MATERIAL_STATE_NAME = 'materials';
const getMaterialState = createFeatureSelector<any>(MATERIAL_STATE_NAME);
const getSuppliersState = createSelector(getMaterialState, (state) => state.suppliers);


export const getMaterialCount = createSelector(getMaterialState, (state) => state.count);





export const getMaterials = createSelector(
  getMaterialState, 
  (state) => {
   
    return state.materials;
  }

  
);



export const getMaterialMap = createSelector(
  getMaterialState,
  (state) => state.materialMap
);

export const getSuppliers = createSelector(
  getMaterialState,
  (state) => {
    return state.suppliers ;
  }
);

export const getCustomerDetails = createSelector(
  getMaterialState,
  (state) => state.customers
);


export const getAllProcesses = createSelector (
  getMaterialState, 
   (state) => state.processes
);