import { createAction, props } from '@ngrx/store';
import { MaterialType } from '../../models/material-type.model';

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
