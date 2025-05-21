import { createAction, props } from '@ngrx/store';
import { Grade } from '../../models/garde.model';

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