import { createReducer, on } from '@ngrx/store';
import { MaterialType } from '../../models/material-type.model';
import * as MaterialTypeActions from './material-type.actions';

export interface MaterialTypeState {
  materialTypes: MaterialType[];
  error: any;
}

const initialState: MaterialTypeState = {
  materialTypes: [],
  error: null,
};

export const materialTypeReducer = createReducer(
  initialState,
  on(MaterialTypeActions.loadMaterialTypesSuccess, (state, { materialTypes }) => ({ ...state, materialTypes })),
  on(MaterialTypeActions.addMaterialTypeSuccess, (state, { material }) => ({ ...state, materialTypes: [...state.materialTypes, material] })),
  on(MaterialTypeActions.updateMaterialTypeSuccess, (state, { material }) => ({
    ...state,
    materialTypes: state.materialTypes.map(mt => mt._id === material._id ? material : mt)
  })),
  on(MaterialTypeActions.deleteMaterialTypeSuccess, (state, { id }) => ({
    ...state,
    materialTypes: state.materialTypes.filter(mt => mt._id !== id)
  })),
  on(
    MaterialTypeActions.loadMaterialTypesFailure,
    MaterialTypeActions.addMaterialTypeFailure,
    MaterialTypeActions.updateMaterialTypeFailure,
    MaterialTypeActions.deleteMaterialTypeFailure,
    (state, { error }) => ({ ...state, error })
  )
);