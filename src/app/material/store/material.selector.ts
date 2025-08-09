import { createFeatureSelector, createSelector, State } from '@ngrx/store';
import { CustomerdetailsIn } from '../../models/Customer-details.model';

 

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
  (state): CustomerdetailsIn[] => state.customers
);



export const getAllProcesses = createSelector(
  getMaterialState,
  (state) => state?.processes ?? []
);


export const selectAllMaterialTypes = createSelector(
  getMaterialState,
  (state) => state.materialTypes
)

export const getCustomersProcess = createSelector(
  getMaterialState,
  (state) => state.customersProcess
);


export const getCustomerWithId = createSelector(
  getMaterialState,
  (state) => ({
    customer: state.customer,
    id: state.id
  })
);

export const getPowerCostHistory = createSelector(
  getMaterialState,
  (state) => {
    return state.powerCostHistory ?? [];
  }
);


export const getsalaryMap = createSelector (
  getMaterialState,
  (State) =>  State.salaryMap
  
);
