import { createReducer, on } from '@ngrx/store';
import { loadMaterialsSuccess, loadMaterialsFailure, deleteMaterialSuccess 
  , createMaterialSuccess, updateMaterialSuccess, loadMaterialMapSuccess, 
  loadMaterialMapFailure, loadSuppliers, loadSuppliersSuccess, loadSuppliersFailure
  , addSupplier, addSupplierSuccess, addSupplierFailure
  , deleteSupplier, deleteSupplierSuccess, deleteSupplierFailure
  , updateSupplier, updateSupplierSuccess, updateSupplierFailure
} from './material.actions';
import { Material } from '../../models/material.model';
import {MaterialItem} from '../../models/MaterialMap.model';
import { Supplier } from '../../models/Supplier.model';



interface MaterialState {
  materials: Material[];
  count: number;
  error: string | null;
  materialMap: { [key: string]: MaterialItem[] };
  suppliers: Supplier[];
}


const initialState: MaterialState = {
  materials: [],
  count: 0,
  error: null,
  materialMap: {},
  suppliers: [],
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
  })),


  on(loadSuppliersSuccess, (state, action) => ({
    ...state,
    suppliers: action.suppliers,
    error: null,
  })),
  on(loadSuppliersFailure, (state, action) => ({
    ...state,
    suppliers: [],
    error: action.error,
  })),

  on(loadSuppliers, (state) => ({
    ...state,
    suppliers: [],
    error: null,
  })),


  on(addSupplier, (state) => ({
    ...state,
    error: null,
  })),
  on(addSupplierSuccess, (state, action) => ({
    ...state,
    suppliers: [...state.suppliers, action.supplier],
    error: null,
  })),
  on(addSupplierFailure, (state, action) => ({
    ...state,
    error: action.error,
  })),

  on(deleteSupplier, (state) => ({
    ...state,
    error: null,
  })),
  on(deleteSupplierSuccess, (state, action) => ({
    ...state,
    suppliers: state.suppliers.filter(supplier => supplier._id !== action.id),
    error: null,
  })),
  on(deleteSupplierFailure, (state, action) => ({
    ...state,
    error: action.error,
  })),

  on(updateSupplier, (state) => ({
    ...state,
    error: null,
  })),
  on(updateSupplierSuccess, (state, action) => ({
  ...state,
  suppliers: state.suppliers.map(supplier =>
    supplier._id === action.supplier._id ? action.supplier : supplier
  ),
  error: null,
}))
,
  on(updateSupplierFailure, (state, action) => ({
    ...state,
    error: action.error,
  }))



);

export function materialReducer(state: MaterialState | undefined, action: any) {
  return _materialReducer(state, action);
}