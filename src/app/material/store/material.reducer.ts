import { createReducer, on } from '@ngrx/store';
import { loadMaterialsSuccess, loadMaterialsFailure, deleteMaterialSuccess 
  , createMaterialSuccess, updateMaterialSuccess, loadMaterialMapSuccess, loadMaterialMapFailure
} from './material.actions';
import { Material } from '../../models/material.model';
import {MaterialItem} from '../../models/MaterialMap.model';



interface MaterialState {
  materials: Material[];
  count: number;
  error: string | null;
  materialMap: { [key: string]: MaterialItem[] };
}


const initialState: MaterialState = {
  materials: [],
  count: 0,
  error: null,
  materialMap: {},
};

const _materialReducer = createReducer(
  initialState,
  on(loadMaterialsSuccess, (state, action) => ({
    ...state,
    materials: action.materials || [], 
    count: action.materials?.length || 0,
    error: null,
  })),
  on(loadMaterialsFailure, (state, action) => ({
    ...state,
    materials: [], 
    count: 0,
    error: action.error,
  })),
   on(updateMaterialSuccess, (state, action) => ({
    ...state,
    materials: state.materials.map((material) =>
      material.name === action.material.name ? action.material : material
    ),
    error: null,
  })),
  on(deleteMaterialSuccess, (state, action) => ({
    ...state,
    materials: state.materials.filter((material) => material.name !== action.id) || [], // Ensure array
    count: state.count > 0 ? state.count - 1 : 0,
    error: null,
  })),
  on(createMaterialSuccess, (state, action) => ({
    ...state,
    materials: [...state.materials, action.material],
    count: state.count + 1,
    error: null,
  })),
  on(loadMaterialMapSuccess, (state, action) => ({
    ...state,
    materialMap: action.materialMap,
  })),
  on(loadMaterialMapFailure, (state, action) => ({
    ...state,
    error: action.error,
  }))
);

export function materialReducer(state: MaterialState | undefined, action: any) {
  return _materialReducer(state, action);
}