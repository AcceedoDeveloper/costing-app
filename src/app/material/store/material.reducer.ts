import { createReducer, on } from '@ngrx/store';
import { loadMaterialsSuccess, loadMaterialsFailure, deleteMaterialSuccess 
  , createMaterialSuccess, updateMaterialSuccess
} from './material.actions';
import { Material } from '../../models/material.model';


interface MaterialState {
  materials: Material[];
  count: number;
  error: string | null;
}


const initialState: MaterialState = {
  materials: [],
  count: 0,
  error: null,
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
      material._id === action.material._id ? action.material : material
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
);

export function materialReducer(state: MaterialState | undefined, action: any) {
  return _materialReducer(state, action);
}