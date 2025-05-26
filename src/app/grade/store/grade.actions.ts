import { createAction, props } from '@ngrx/store';
import { Grade } from '../../models/garde.model';
import {MaterialItem} from '../../models/MaterialMap.model';



export const loadMaterialMap = createAction('[Grade] Load Material Map');
export const loadMaterialMapSuccess = createAction(
  '[Grade] Load Material Map Success',
  props<{ materialMap: { [key: string]: MaterialItem[] } }>()
);
export const loadMaterialMapFailure = createAction(
  '[Grade] Load Material Map Failure',
  props<{ error: any }>()
);

export const loadGrades = createAction('[Grade] Load Grades');
export const loadGradesSuccess = createAction('[Grade] Load Grades Success', props<{ grades: Grade[] }>());
export const loadGradesFailure = createAction('[Grade] Load Grades Failure', props<{ error: any }>());

export const deleteGrade = createAction(
  '[Grade] Delete Grade',
  props<{ gradeNo: string }>()
);

export const deleteGradeSuccess = createAction(
  '[Grade] Delete Grade Success',
  props<{ gradeNo: string }>()
);

export const deleteGradeFailure = createAction(
  '[Grade] Delete Grade Failure',
  props<{ error: any }>()
);

export const addGrade = createAction(
  '[Grade] Add Grade',
  props<{ grade: any }>()
);

export const addGradeSuccess = createAction(
  '[Grade] Add Grade Success',
  props<{ response: any }>()
);

export const addGradeFailure = createAction(
  '[Grade] Add Grade Failure',
  props<{ error: any }>()
);

export const updateGrade = createAction(
  '[Grade] Update Grade',
  props<{ id: string, grade: any }>()
);

export const updateGradeSuccess = createAction(
  '[Grade] Update Grade Success',
  props<{ updatedGrade: any }>()
);

export const updateGradeFailure = createAction(
  '[Grade] Update Grade Failure',
  props<{ error: any }>()
);
