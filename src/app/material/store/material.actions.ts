import { createAction, props } from '@ngrx/store';
import { Material} from '../../models/material.model';
import {MaterialItem} from '../../models/MaterialMap.model';
import { Supplier } from '../../models/Supplier.model';
import { Customerdetails } from '../../models/Customer-details.model';
import { Process } from '../../models/process.model';
import {MaterialType } from '../../models/material-type.model';
import { CustomerProcess } from '../../models/Customer-details.model';
import { CustomerdetailsIn } from '../../models/Customer-details.model';
import { CustomerProcesss } from '../../models/Customer-details.model';


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



export const addProcess = createAction('[Process] Add Process', props<{ process: Process }>());
export const addProcessSuccess = createAction('[Process] Add Process Success', props<{ process: Process }>());
export const addProcessFailure = createAction('[Process] Add Process Failure', props<{ error: any }>());


export const loadProcesses = createAction('[Process] Load Processes');
export const loadProcessesSuccess = createAction('[Process] Load Processes Success', props<{ processes: Process[] }>());
export const loadProcessesFailure = createAction('[Process] Load Processes Failure', props<{ error: any }>());


export const loadMaterialTypes = createAction('[MaterialType] Load');
export const loadMaterialTypesSuccess = createAction('[MaterialType] Load Success', props<{ materialTypes: MaterialType[] }>());
export const loadMaterialTypesFailure = createAction('[MaterialType] Load Failure', props<{ error: any }>());

export const addMaterialType = createAction('[MaterialType] Add', props<{ material: Partial<MaterialType> }>());
export const addMaterialTypeSuccess = createAction('[MaterialType] Add Success', props<{ material: MaterialType }>());
export const addMaterialTypeFailure = createAction('[MaterialType] Add Failure', props<{ error: any }>());

export const updateMaterialType = createAction('[MaterialType] Update', props<{ id: string; material: Partial<MaterialType> }>());
export const updateMaterialTypeSuccess = createAction('[MaterialType] Update Success', props<{ material: MaterialType }>());
export const updateMaterialTypeFailure = createAction('[MaterialType] Update Failure', props<{ error: any }>());

export const deleteMaterialType = createAction('[MaterialType] Delete', props<{ id: string }>());
export const deleteMaterialTypeSuccess = createAction('[MaterialType] Delete Success', props<{ id: string }>());
export const deleteMaterialTypeFailure = createAction('[MaterialType] Delete Failure', props<{ error: any }>());


export const deleteProcess = createAction(
  '[Process] Delete Process',
  props<{ id: string }>()
);

export const deleteProcessSuccess = createAction(
  '[Process] Delete Process Success',
  props<{ id: string }>()
);

export const deleteProcessFailure = createAction(
  '[Process] Delete Process Failure',
  props<{ error: any }>()
);

export const updateProcess = createAction(
  '[Process] Update Process',
  props<{ id: string; process: Partial<Process> }>()
);

export const updateProcessSuccess = createAction(
  '[Process] Update Process Success',
  props<{ process: Process }>()
);

export const updateProcessFailure = createAction(
  '[Process] Update Process Failure',
  props<{ error: any }>()
);



export const updateCustomerDetails = createAction(
  '[Customer] Update Customer Details',
  props<{ id: string; customer: CustomerProcess }>()
);

export const updateCustomerDetailsSuccess = createAction(
  '[Customer] Update Customer Details Success',
  props<{ customer: CustomerProcess }>()
);

export const updateCustomerDetailsFailure = createAction(
  '[Customer] Update Customer Details Failure',
  props<{ error: string }>()
);


export const loadCustomerDetailsIN = createAction('[Customer] Load Customer Details');

export const loadCustomerDetailsSuccessIN = createAction(
  '[Customer] Load Customer Details Success',
  props<{ customers: CustomerdetailsIn[] }>()
);

export const loadCustomerDetailsFailureIN = createAction(
  '[Customer] Load Customer Details Failure',
  props<{ error: string }>()
);



export const deleteCustomer = createAction(
  '[Customer] Delete Customer',
  props<{ id: string }>()
);

export const deleteCustomerSuccess = createAction(
  '[Customer] Delete Customer Success',
  props<{ id: string }>()
);

export const deleteCustomerFailure = createAction(
  '[Customer] Delete Customer Failure',
  props<{ error: any }>()
);



export const addCustomerDetails = createAction(
  '[Customer] Add Customer Details',
  props<{ customer: CustomerProcesss }>()
);

export const addCustomerDetailsSuccess = createAction(
  '[Customer] Add Customer Details Success',
  props<{ customer: CustomerProcesss }>()
);

export const addCustomerDetailsFailure = createAction(
  '[Customer] Add Customer Details Failure',
  props<{ error: any }>()
);