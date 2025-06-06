import { createAction, props } from '@ngrx/store';
import { Material} from '../../models/material.model';
import {MaterialItem} from '../../models/MaterialMap.model';
import { Supplier } from '../../models/Supplier.model';
import { Customerdetails } from '../../models/Customer-details.model';



export const LOAD_MATERIALS = '[Material page] load materials';
export const LOAD_MATERIALS_SUCCESS = '[Material page] load materials success';
export const LOAD_MATERIALS_FAILURE = '[Material page] load materials failure';

export const DELETE_MATERIAL = '[Material page] delete material';
export const DELETE_MATERIAL_SUCCESS = '[Material page] delete material success';

export const CREATE_MATERIAL = '[Material page] create material';
export const CREATE_MATERIAL_SUCCESS = '[Material page] create material success';

export const UPDATE_MATERIAL = '[Material page] update material';
export const UPDATE_MATERIAL_SUCCESS = '[Material page] update material success';


export const loadMaterials = createAction(LOAD_MATERIALS);
export const loadMaterialsSuccess = createAction(LOAD_MATERIALS_SUCCESS, props<{ materials: Material[] }>());
export const loadMaterialsFailure = createAction(LOAD_MATERIALS_FAILURE, props<{ error: string }>());

export const deleteMaterial = createAction(DELETE_MATERIAL, props<{ id: string }>());
export const deleteMaterialSuccess = createAction(DELETE_MATERIAL_SUCCESS, props<{ id: string }>());

export const createMaterial = createAction(CREATE_MATERIAL, props<{ material: Material }>());
export const createMaterialSuccess = createAction(CREATE_MATERIAL_SUCCESS, props<{ material: Material }>());

export const updateMaterial = createAction(UPDATE_MATERIAL, props<{ material: Material }>());
export const updateMaterialSuccess = createAction(UPDATE_MATERIAL_SUCCESS, props<{ material: Material }>());
export const updateMaterialFailure = createAction(
  '[Material] Update Material Failure',
  props<{ error: string }>()
);




export const loadMaterialMap = createAction('[Grade] Load Material Map');
export const loadMaterialMapSuccess = createAction(
  '[Grade] Load Material Map Success',
  props<{ materialMap: { [key: string]: MaterialItem[] } }>()
);
export const loadMaterialMapFailure = createAction(
  '[Grade] Load Material Map Failure',
  props<{ error: any }>()
);



export const loadSuppliers = createAction('[Supplier] Load Suppliers');
export const loadSuppliersSuccess = createAction(
  '[Supplier] Load Suppliers Success',
  props<{ suppliers: Supplier[] }>()
);
export const loadSuppliersFailure = createAction(
  '[Supplier] Load Suppliers Failure',
  props<{ error: string }>()
);


export const addSupplier = createAction(
  '[Supplier] Add Supplier',
  props<{ supplier: Supplier }>()
);
export const addSupplierSuccess = createAction(
  '[Supplier] Add Supplier Success',
  props<{ supplier: Supplier }>()
);
export const addSupplierFailure = createAction(
  '[Supplier] Add Supplier Failure',
  props<{ error: string }>()
);


export const deleteSupplier = createAction(
  '[Supplier] Delete Supplier', 
  props<{ id: string }>()
);
export const deleteSupplierSuccess = createAction(
  '[Supplier] Delete Supplier Success',
  props<{ id: string }>()
);

export const deleteSupplierFailure = createAction(
  '[Supplier] Delete Supplier Failure',
  props<{ error: string }>()
);


export const updateSupplier = createAction(
  '[Supplier] Update Supplier',
  props<{ supplier: Supplier }>()
);
export const updateSupplierSuccess = createAction(
  '[Supplier] Update Supplier Success',
  props<{ supplier: Supplier }>()
);
export const updateSupplierFailure = createAction(
  '[Supplier] Update Supplier Failure',
  props<{ error: string }>()
);


export const loadCustomerDetails = createAction('[Customer] Load Customer Details');
export const loadCustomerDetailsSuccess = createAction(
  '[Customer] Load Customer Details Success',
  props<{ customers: Customerdetails[] }>()
);
export const loadCustomerDetailsFailure = createAction(
  '[Customer] Load Customer Details Failure',
  props<{ error: string }>()
);