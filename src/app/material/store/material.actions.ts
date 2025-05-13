import { createAction, props } from '@ngrx/store';
import { Material} from '../../models/material.model';


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
