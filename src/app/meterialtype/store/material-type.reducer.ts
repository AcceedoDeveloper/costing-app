import { createReducer, on } from '@ngrx/store';
import { MaterialType } from '../../models/material-type.model';
import * as MaterialTypeActions from './material-type.actions';
import {Process} from '../../models/process.model';

export interface MaterialTypeState {
  processes: Process[];
  materialTypes: MaterialType[];
  error: any;
}

const initialState: MaterialTypeState = {
  processes:[],
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
  ),
  on(MaterialTypeActions.loadProcessesSuccess, (state, { processes }) => ({ ...state, processes })),
  on(MaterialTypeActions.addProcessSuccess, (state, { process }) => ({ ...state, processes: [...state.processes, process] })),
  on(MaterialTypeActions.updateProcessSuccess, (state, { process }) => ({
    ...state,
    processes: state.processes.map(p => p._id === process._id ? process : p)
  })),
  on(MaterialTypeActions.deleteProcessSuccess, (state, { id }) => ({
    ...state,
    processes: state.processes.filter(p => p._id !== id)
  })),
  on(
    MaterialTypeActions.loadProcessesFailure,
    MaterialTypeActions.addProcessFailure,
    MaterialTypeActions.updateProcessFailure,
    MaterialTypeActions.deleteProcessFailure,
    (state, { error }) => ({ ...state, error })
  )
);