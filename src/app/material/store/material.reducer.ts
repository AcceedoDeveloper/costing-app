import { createReducer, on } from '@ngrx/store';
import { loadMaterialsSuccess, loadMaterialsFailure, deleteMaterialSuccess 
  , createMaterialSuccess, updateMaterialSuccess, loadMaterialMapSuccess, 
  loadMaterialMapFailure, loadSuppliers, loadSuppliersSuccess, loadSuppliersFailure
  , addSupplier, addSupplierSuccess, addSupplierFailure
  , deleteSupplier, deleteSupplierSuccess, deleteSupplierFailure
  , updateSupplier, updateSupplierSuccess, updateSupplierFailure
  , loadCustomerDetails, loadCustomerDetailsSuccess, loadCustomerDetailsFailure,
  addProcess, addProcessFailure, addProcessSuccess
  , loadProcesses, loadProcessesFailure, loadProcessesSuccess
  , loadMaterialTypesFailure, loadMaterialTypesSuccess, updateMaterialTypeFailure
  , deleteMaterialTypeFailure, deleteMaterialTypeSuccess, updateMaterialTypeSuccess
  , addMaterialTypeFailure, addMaterialTypeSuccess
} from './material.actions';
import { Material } from '../../models/material.model';
import {MaterialItem} from '../../models/MaterialMap.model';
import { Supplier } from '../../models/Supplier.model';
import {Customerdetails} from '../../models/Customer-details.model';
import { Process } from '../../models/process.model';
import { MaterialType} from '../../models/material-type.model';



 export  interface MaterialState {
  materials: Material[];
  count: number;
  error: string | null;
  materialMap: { [key: string]: MaterialItem[] };
  suppliers: Supplier[];
  customers: Customerdetails[];
  process: Process[];
   materialTypes: MaterialType[];
}


const initialState: MaterialState = {
  materials: [],
  count: 0,
  error: null,
  materialMap: {},
  suppliers: [],
  customers: [],
  process: [],
  materialTypes: [],
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
  })),

  on(loadCustomerDetails, (state) => ({
    ...state,
    customers: [],
    error: null,
  })),
  on(loadCustomerDetailsSuccess, (state, action) => ({
    ...state,
    customers: action.customers,
    error: null,
  })),
  on(loadCustomerDetailsFailure, (state, action) => ({
    ...state,
    customers: [],
    error: action.error,
  })),

   on(addProcess, state => ({ ...state, loading: true })),
  on(addProcessSuccess, (state, { process }) => ({
    ...state,
    processes: [...state.process, process],
    loading: false
  })),
  on(addProcessFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),


   on(loadProcesses, state => ({ ...state, loading: true })),
  on(loadProcessesSuccess, (state, { processes }) => ({
    ...state,
    processes,
    loading: false
  })),
  on(loadProcessesFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),

  on(loadMaterialTypesSuccess, (state, { materialTypes }) => ({ ...state, materialTypes })),
  on(addMaterialTypeSuccess, (state, { material }) => ({ ...state, materialTypes: [...state.materialTypes, material] })),
  on(updateMaterialTypeSuccess, (state, { material }) => ({
    ...state,
    materialTypes: state.materialTypes.map(mt => mt._id === material._id ? material : mt)
  })),
  on(deleteMaterialTypeSuccess, (state, { id }) => ({
    ...state,
    materialTypes: state.materialTypes.filter(mt => mt._id !== id)
  })),
  on(
    loadMaterialTypesFailure,
    addMaterialTypeFailure,
    updateMaterialTypeFailure,
    deleteMaterialTypeFailure,
    (state, { error }) => ({ ...state, error })
  ),




);

export function materialReducer(state: MaterialState | undefined, action: any) {
  return _materialReducer(state, action);
}